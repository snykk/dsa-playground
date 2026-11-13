import { describe, expect, it } from 'vitest';
import { InputError, type Frame } from '../core/types';
import type { ArrayTrackState } from '../renderers/ArrayTrack';
import type { RingBufferState } from '../renderers/RingBuffer';
import { circularQueue as circularSpec, deque as dequeSpec, simpleQueue as simpleSpec } from '../specs/queue';
import fixtures from './__fixtures__/stacksQueues.json';
import {
  circularQueue,
  dequeTrace,
  formatDequeOp,
  formatQueueOp,
  parseCircularQueue,
  parseDeque,
  parseQueue,
  parseSimpleQueue,
  simpleQueue,
  type DequeOp,
  type QueueOp,
} from './queue';
import type { PyResult } from './stack';

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

type RawOp = [string, string?];
const toQueueOp = ([kind, value]: RawOp): QueueOp => (kind === 'enqueue' ? { kind: 'enqueue', value: value! } : ({ kind } as QueueOp));
const toDequeOp = ([kind, value]: RawOp): DequeOp => (value !== undefined ? ({ kind, value } as DequeOp) : ({ kind } as DequeOp));

function randomQueueOps(rand: () => number, length: number, full: boolean): QueueOp[] {
  const ops: QueueOp[] = [];
  for (let k = 0; k < length; k++) {
    const r = rand();
    if (r < 0.5) ops.push({ kind: 'enqueue', value: String(Math.floor(rand() * 300) - 99) });
    else if (r < 0.8) ops.push({ kind: 'dequeue' });
    else ops.push({ kind: (full ? (['peek', 'size', 'is_empty', 'is_full'] as const) : (['peek', 'size', 'is_empty'] as const))[Math.floor(rand() * (full ? 4 : 3))] });
  }
  return ops;
}

/** The reference: a plain array with an optional bound, and the Python results and exceptions. */
function queueModel(ops: QueueOp[], capacity = Infinity) {
  const items: string[] = [];
  return ops.map((op) => {
    let result: PyResult = null;
    let error: string | null = null;
    if (op.kind === 'enqueue') {
      if (items.length === capacity) error = 'OverflowError';
      else items.push(op.value);
    } else if (op.kind === 'dequeue' || op.kind === 'peek') {
      if (items.length === 0) error = 'IndexError';
      else result = op.kind === 'dequeue' ? items.shift()! : items[0];
    } else if (op.kind === 'size') result = items.length;
    else if (op.kind === 'is_empty') result = items.length === 0;
    else result = items.length === capacity;
    return { result, error, items: [...items] };
  });
}

/** A frame that reports an exception ('raises IndexError("...")') must show it with the bad role. */
const RAISES = /raises \w+Error\("/;

function checkTrackFrames(frames: Array<Frame<ArrayTrackState>>, lines: number) {
  expect(frames.length).toBeLessThan(2000);
  for (const f of frames) {
    expect(f.caption.length).toBeGreaterThan(10);
    if (RAISES.test(f.caption)) expect([...f.state.items.map((it) => it.role), ...(f.state.pointers ?? []).map((p) => p.role)], f.caption).toContain('bad');
    if (f.line !== undefined) {
      expect(f.line).toBeGreaterThanOrEqual(0);
      expect(f.line).toBeLessThan(lines);
    }
    const ids = f.state.items.map((it) => it.id);
    expect(new Set(ids).size).toBe(ids.length);
    const block = f.state.blocks[0];
    for (const it of f.state.items) {
      if ((it.row ?? 0) === -1) continue;
      expect(it.slot).toBeGreaterThanOrEqual(0);
      expect(it.slot).toBeLessThan(block.slots);
    }
    // Slots hold at most one item each.
    const slots = f.state.items.filter((it) => (it.row ?? 0) === 0).map((it) => it.slot);
    expect(new Set(slots).size).toBe(slots.length);
    for (const p of f.state.pointers ?? []) expect(p.slot).toBeLessThan(Math.max(1, block.slots));
  }
}

function checkRingFrames(frames: Array<Frame<RingBufferState>>, lines: number) {
  for (const f of frames) {
    expect(f.caption.length).toBeGreaterThan(10);
    if (RAISES.test(f.caption)) expect([...f.state.items.map((it) => it.role), ...f.state.pointers.map((p) => p.role)], f.caption).toContain('bad');
    if (f.line !== undefined) expect(f.line).toBeLessThan(lines);
    const s = f.state;
    const ids = s.items.map((it) => it.id);
    expect(new Set(ids).size).toBe(ids.length);
    const slots = s.items.filter((it) => it.slot >= 0).map((it) => it.slot);
    expect(new Set(slots).size).toBe(slots.length);
    for (const it of s.items) expect(it.slot).toBeLessThan(s.capacity);
    for (const p of s.pointers) {
      expect(p.slot).toBeGreaterThanOrEqual(-1);
      expect(p.slot).toBeLessThan(s.capacity);
    }
  }
}

describe('simpleQueue', () => {
  it('agrees with a plain array on random scripts and edge cases, after every operation', () => {
    const rand = rng(21);
    const edge: QueueOp[][] = [
      [{ kind: 'dequeue' }, { kind: 'peek' }, { kind: 'size' }, { kind: 'is_empty' }],
      [{ kind: 'enqueue', value: '1' }, { kind: 'dequeue' }, { kind: 'dequeue' }],
    ];
    for (const ops of [...edge, ...Array.from({ length: 150 }, () => randomQueueOps(rand, 1 + Math.floor(rand() * 20), false))]) {
      const run = simpleQueue({ ops });
      const want = queueModel(ops);
      run.steps.forEach((step, i) => {
        expect(step.result).toEqual(want[i].result);
        expect(step.error).toBe(want[i].error);
        expect(step.queue).toEqual(want[i].items);
      });
      checkTrackFrames(run.frames, simpleSpec.pseudocode.length);
      expect(run.frames[run.frames.length - 1].caption).toMatch(/^Done: /);
    }
  });

  it('matches the Python SimpleQueue (golden fixtures)', () => {
    const cases = fixtures.simpleQueue as unknown as Array<{ ops: RawOp[]; steps: Array<Record<string, unknown>> }>;
    expect(cases.length).toBeGreaterThanOrEqual(25);
    for (const c of cases) {
      const run = simpleQueue({ ops: c.ops.map(toQueueOp) });
      expect(run.steps.map(({ result, error, queue }) => ({ result, error, queue }))).toEqual(c.steps);
    }
  });

  it('shifts every remaining item one slot left on dequeue', () => {
    const run = simpleQueue(parseSimpleQueue('enqueue 10, enqueue 20, enqueue 30, dequeue'));
    const [lift, shift] = run.frames.filter((f) => f.vars?.some(([k, v]) => k === 'op' && v === 'dequeue()'));
    const slotOf = (f: Frame<ArrayTrackState>, v: string) => f.state.items.find((it) => it.value === v && (it.row ?? 0) === 0)?.slot;
    expect(lift.state.items.find((it) => it.row === -1)?.value).toBe('10');
    expect([slotOf(lift, '20'), slotOf(lift, '30')]).toEqual([1, 2]);
    expect([slotOf(shift, '20'), slotOf(shift, '30')]).toEqual([0, 1]);
    expect(shift.vars).toContainEqual(['moves this op', 2]);
  });
});

describe('circularQueue', () => {
  it('agrees with a bounded FIFO on random scripts: contents, results and the index invariants', () => {
    const rand = rng(22);
    for (let t = 0; t < 200; t++) {
      const capacity = 1 + Math.floor(rand() * 7);
      const ops = randomQueueOps(rand, 1 + Math.floor(rand() * 24), true);
      const run = circularQueue({ capacity, ops });
      const want = queueModel(ops, capacity);
      run.steps.forEach((step, i) => {
        expect(step.result).toEqual(want[i].result);
        expect(step.error).toBe(want[i].error);
        const n = want[i].items.length;
        if (n === 0) {
          expect([step.front, step.rear]).toEqual([-1, -1]);
          expect(step.queue.every((v) => v === null)).toBe(true);
        } else {
          // Reading n slots from front, wrapping with % capacity, gives the queue in order and ends at rear.
          const read = Array.from({ length: n }, (_, k) => step.queue[(step.front + k) % capacity]);
          expect(read).toEqual(want[i].items);
          expect((step.front + n - 1) % capacity).toBe(step.rear);
          expect(step.queue.filter((v) => v !== null).length).toBe(n);
        }
      });
      checkRingFrames(run.frames, circularSpec.pseudocode.length);
    }
  });

  it('matches the Python CircularQueue (golden fixtures): slots, front and rear after every operation', () => {
    const cases = fixtures.circularQueue as unknown as Array<{ capacity: number; ops: RawOp[]; steps: Array<Record<string, unknown>> }>;
    expect(cases.length).toBeGreaterThanOrEqual(30);
    for (const c of cases) {
      const run = circularQueue({ capacity: c.capacity, ops: c.ops.map(toQueueOp) });
      expect(run.steps.map(({ result, error, queue, front, rear }) => ({ result, error, queue, front, rear }))).toEqual(c.steps);
    }
  });

  it('wraps rear around to slot 0 and rejects an enqueue on a full ring', () => {
    const run = circularQueue(parseCircularQueue('capacity 3; enqueue A, enqueue B, enqueue C, enqueue D, dequeue, enqueue D'));
    expect(run.steps.map((s) => s.error)).toEqual([null, null, null, 'OverflowError', null, null]);
    expect(run.steps[5]).toMatchObject({ queue: ['D', 'B', 'C'], front: 1, rear: 0 });
    expect(run.frames.some((f) => f.line === 3 && /wraps around to slot 0/.test(f.caption))).toBe(true);
    const full = run.frames.find((f) => f.line === 1 && /OverflowError/.test(f.caption))!;
    expect(full.state.items.find((it) => it.slot === -1)?.role).toBe('bad');
  });

  it('resets both indices to the -1 sentinel when the last item leaves', () => {
    const run = circularQueue(parseCircularQueue('capacity 2; enqueue 1, dequeue, enqueue 2'));
    expect(run.steps.map((s) => [s.front, s.rear])).toEqual([
      [0, 0],
      [-1, -1],
      [0, 0],
    ]);
    const reset = run.frames.find((f) => f.line === 8)!;
    expect(reset.state.pointers.map((p) => p.slot)).toEqual([-1, -1]);
  });
});

describe('deque', () => {
  const KINDS: DequeOp['kind'][] = ['push_front', 'push_back', 'pop_front', 'pop_back', 'peek_front', 'peek_back', 'size', 'is_empty', 'display'];

  it('agrees with a plain array on random scripts, after every operation', () => {
    const rand = rng(23);
    for (let t = 0; t < 200; t++) {
      const ops: DequeOp[] = Array.from({ length: 1 + Math.floor(rand() * 20) }, () => {
        const kind = KINDS[Math.floor(rand() * (rand() < 0.5 ? 2 : KINDS.length))];
        return kind === 'push_front' || kind === 'push_back' ? { kind, value: String(Math.floor(rand() * 100)) } : ({ kind } as DequeOp);
      });
      const run = dequeTrace(ops);
      const items: string[] = [];
      ops.forEach((op, i) => {
        const step = run.steps[i];
        let result: PyResult | string[] = null;
        let error: string | null = null;
        if (op.kind === 'push_front') items.unshift(op.value);
        else if (op.kind === 'push_back') items.push(op.value);
        else if (op.kind === 'size') result = items.length;
        else if (op.kind === 'is_empty') result = items.length === 0;
        else if (op.kind === 'display') result = [...items];
        else if (items.length === 0) error = 'IndexError';
        else if (op.kind === 'pop_front') result = items.shift()!;
        else if (op.kind === 'pop_back') result = items.pop()!;
        else result = op.kind === 'peek_front' ? items[0] : items[items.length - 1];
        expect(step.result).toEqual(result);
        expect(step.error).toBe(error);
        expect(step.deque).toEqual(items);
      });
      checkTrackFrames(run.frames, dequeSpec.pseudocode.length);
    }
  });

  it('matches the Python Deque (golden fixtures)', () => {
    const cases = fixtures.deque as unknown as Array<{ ops: RawOp[]; steps: Array<Record<string, unknown>> }>;
    expect(cases.length).toBeGreaterThanOrEqual(25);
    for (const c of cases) {
      const run = dequeTrace(c.ops.map(toDequeOp));
      expect(run.steps.map(({ result, error, deque }) => ({ result, error, deque }))).toEqual(c.steps);
    }
  });

  it('push_front grows the list, moves every item right, then stores at index 0', () => {
    const run = dequeTrace(parseDeque('push_back 1, push_back 2, push_front 3'));
    const pf = run.frames.filter((f) => f.vars?.some(([k, v]) => k === 'op' && v === 'push_front(3)'));
    expect(pf).toHaveLength(3);
    const slots = (f: Frame<ArrayTrackState>) => f.state.items.filter((it) => (it.row ?? 0) === 0).map((it) => `${it.value}@${it.slot}`);
    expect(slots(pf[0])).toEqual(['1@0', '2@1']);
    expect(pf[0].state.blocks[0].slots).toBe(3);
    expect(slots(pf[1])).toEqual(['1@1', '2@2']);
    expect(slots(pf[2])).toEqual(['3@0', '1@1', '2@2']);
  });
});

describe('queue parsers', () => {
  it('read operations, short forms and the capacity clause', () => {
    const input = parseQueue('capacity 4; enqueue 5, enq(B), 7, deq, dequeue(), peek, size, is_empty, is_full');
    expect(input.capacity).toBe(4);
    expect(input.ops.map(formatQueueOp)).toEqual([
      'enqueue(5)',
      "enqueue('B')",
      'enqueue(7)',
      'dequeue()',
      'dequeue()',
      'peek()',
      'size()',
      'is_empty()',
      'is_full()',
    ]);
    expect(parseDeque('pf 1, pb(2), popf, popb, peekf, peekb, display').map(formatDequeOp)).toEqual([
      'push_front(1)',
      'push_back(2)',
      'pop_front()',
      'pop_back()',
      'peek_front()',
      'peek_back()',
      'display()',
    ]);
  });

  it('give friendly errors', () => {
    expect(() => parseQueue('')).toThrow(InputError);
    expect(() => parseQueue('enqueue')).toThrow(/one value/);
    expect(() => parseQueue('serve 1')).toThrow(/Cannot read/);
    expect(() => parseSimpleQueue('enqueue 1, is_full')).toThrow(/no is_full/);
    expect(() => parseCircularQueue('capacity 0; enqueue 1')).toThrow(/ValueError/);
    expect(() => parseCircularQueue('capacity 12; enqueue 1')).toThrow(/At most 8/);
    expect(() => parseDeque('5')).toThrow(/Which end/);
    expect(() => parseDeque('push_front')).toThrow(/one value/);
    expect(() => parseSimpleQueue(Array.from({ length: 11 }, (_, i) => `enqueue ${i}`).join(', '))).toThrow(/At most 10 items/);
  });

  it('defaults the circular capacity to 5', () => {
    expect(parseCircularQueue('enqueue 1').capacity).toBe(5);
  });
});
