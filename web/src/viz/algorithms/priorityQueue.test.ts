import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { priorityQueue as pqSpec } from '../specs/priorityQueue';
import fixtures from './__fixtures__/stacksQueues.json';
import { formatPqOp, parsePriorityQueue, priorityQueue, type PqOp } from './priorityQueue';

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

type Entry = [number, number, string];
const lt = (a: Entry, b: Entry) => (a[0] !== b[0] ? a[0] < b[0] : a[1] !== b[1] ? a[1] < b[1] : a[2] < b[2]);

/** Lib/heapq.py, line by line: the hole-moving _siftdown / _siftup (a second, independent port). */
function heappush(heap: Entry[], item: Entry) {
  heap.push(item);
  siftdownPy(heap, 0, heap.length - 1);
}
function heappop(heap: Entry[]): Entry {
  const lastelt = heap.pop()!;
  if (heap.length) {
    const returnitem = heap[0];
    heap[0] = lastelt;
    siftupPy(heap, 0);
    return returnitem;
  }
  return lastelt;
}
function siftdownPy(heap: Entry[], startpos: number, pos: number) {
  const newitem = heap[pos];
  while (pos > startpos) {
    const parentpos = (pos - 1) >> 1;
    const parent = heap[parentpos];
    if (lt(newitem, parent)) {
      heap[pos] = parent;
      pos = parentpos;
      continue;
    }
    break;
  }
  heap[pos] = newitem;
}
function siftupPy(heap: Entry[], pos: number) {
  const endpos = heap.length;
  const startpos = pos;
  const newitem = heap[pos];
  let childpos = 2 * pos + 1;
  while (childpos < endpos) {
    const rightpos = childpos + 1;
    if (rightpos < endpos && !lt(heap[childpos], heap[rightpos])) childpos = rightpos;
    heap[pos] = heap[childpos];
    pos = childpos;
    childpos = 2 * pos + 1;
  }
  heap[pos] = newitem;
  siftdownPy(heap, startpos, pos);
}

function randomOps(rand: () => number, length: number): PqOp[] {
  const ops: PqOp[] = [];
  for (let k = 0; k < length; k++) {
    const r = rand();
    if (r < 0.55) ops.push({ kind: 'enqueue', item: `i${k}`, priority: Math.floor(rand() * 5) - (rand() < 0.2 ? 10 : 0) });
    else if (r < 0.85) ops.push({ kind: 'dequeue' });
    else ops.push({ kind: (['peek', 'size', 'is_empty', 'clear'] as const)[Math.floor(rand() * 4)] });
  }
  return ops;
}

describe('priorityQueue', () => {
  it('reproduces Lib/heapq.py array for array, and a stable sort for the dequeue order, on random scripts', () => {
    const rand = rng(31);
    const edge: PqOp[][] = [
      [{ kind: 'dequeue' }, { kind: 'peek' }, { kind: 'size' }, { kind: 'is_empty' }],
      [{ kind: 'enqueue', item: 'a', priority: 1 }, { kind: 'dequeue' }, { kind: 'dequeue' }],
      Array.from({ length: 10 }, (_, k): PqOp => ({ kind: 'enqueue', item: `t${k}`, priority: 1 })),
    ];
    for (const ops of [...edge, ...Array.from({ length: 200 }, () => randomOps(rand, 1 + Math.floor(rand() * 26)))]) {
      const run = priorityQueue(ops);
      const heap: Entry[] = [];
      let count = 0;
      ops.forEach((op, i) => {
        const step = run.steps[i];
        if (op.kind === 'enqueue') {
          heappush(heap, [op.priority, count, op.item]);
          count++;
          expect(step.result).toBeNull();
        } else if (op.kind === 'dequeue' || op.kind === 'peek') {
          if (heap.length === 0) {
            expect(step.error).toBe('IndexError');
          } else {
            // The smallest (priority, counter) pair: lowest priority first, then arrival order.
            const best = [...heap].sort((a, b) => (lt(a, b) ? -1 : 1))[0];
            const got = op.kind === 'dequeue' ? heappop(heap) : heap[0];
            expect(got).toEqual(best);
            expect(step.result).toBe(got[2]);
          }
        } else if (op.kind === 'clear') {
          heap.length = 0;
          count = 0;
        } else expect(step.result).toBe(op.kind === 'size' ? heap.length : heap.length === 0);
        expect(step.heap).toEqual(heap);
        expect(step.count).toBe(count);
        for (let c = 1; c < step.heap.length; c++) expect(lt(step.heap[c], step.heap[(c - 1) >> 1])).toBe(false);
      });
      expect(run.frames.length).toBeLessThan(2000);
      for (const f of run.frames) {
        expect(f.caption.length).toBeGreaterThan(10);
        // A frame that reports an exception shows it with the bad role.
        if (/raises \w+Error\("/.test(f.caption)) expect((f.state.markers ?? []).map((m) => m.role)).toContain('bad');
        if (f.line !== undefined) expect(f.line).toBeLessThan(pqSpec.pseudocode.length);
        const ids = f.state.slots.map((s) => s!.id);
        expect(new Set(ids).size).toBe(ids.length);
        for (const fl of f.state.floating ?? []) expect(ids).not.toContain(fl.node.id);
        for (const k of Object.keys(f.state.edgeRoles ?? {})) {
          expect(Number(k)).toBeGreaterThan(0);
          expect(Number(k)).toBeLessThan(f.state.slots.length);
        }
      }
      expect(run.frames[run.frames.length - 1].caption).toMatch(/^Done: /);
    }
  });

  it('matches the Python PriorityQueue (golden fixtures): heap array, counter and every result', () => {
    const cases = fixtures.priorityQueue as unknown as Array<{ ops: Array<[string, string?, number?]>; steps: Array<Record<string, unknown>> }>;
    expect(cases.length).toBeGreaterThanOrEqual(40);
    for (const c of cases) {
      const ops = c.ops.map(([kind, item, priority]): PqOp => (kind === 'enqueue' ? { kind, item: item!, priority: priority! } : ({ kind } as PqOp)));
      const run = priorityQueue(ops);
      expect(run.steps.map(({ result, error, heap, count }) => ({ result, error, heap, count }))).toEqual(c.steps);
    }
  });

  it('dequeues equal priorities in insertion order (the counter breaks ties)', () => {
    const run = priorityQueue(parsePriorityQueue('enqueue rep 3, enqueue fix 1, enqueue eml 3, enqueue dep 2, enqueue rev 1, dequeue, dequeue, dequeue, dequeue, dequeue'));
    expect(run.steps.slice(5).map((s) => s.result)).toEqual(['fix', 'rev', 'dep', 'rep', 'eml']);
    expect(run.steps[4].heap).toEqual([
      [1, 1, 'fix'],
      [1, 4, 'rev'],
      [3, 2, 'eml'],
      [3, 0, 'rep'],
      [2, 3, 'dep'],
    ]);
  });

  it('animates a dequeue: the root leaves, the last entry sinks to a leaf, then rises', () => {
    const run = priorityQueue(parsePriorityQueue('A:1, B:2, C:3, D:4, E:5, F:6, G:7, dequeue'));
    const deq = run.frames.filter((f) => f.vars?.some(([k, v]) => k === 'op' && v === 'dequeue()'));
    expect(deq.map((f) => f.line)).toEqual([7, 8, 8, 9, 6]);
    expect(deq[0].state.floating?.[0].node.sub).toBe('A');
    // G (7) moved to the root, then down two levels: always the smaller child came up.
    const where = (k: number) => deq[k].state.slots.findIndex((s) => s!.sub === 'G');
    expect([where(0), where(1), where(2), where(3)]).toEqual([0, 1, 3, 3]);
    expect(run.steps[7].heap.map((e) => e[2])).toEqual(['B', 'D', 'C', 'G', 'E', 'F']);
  });

  it('animates an enqueue that rises to the root, one swap per level', () => {
    const run = priorityQueue(parsePriorityQueue('A:5, B:6, C:7, D:8, E:0'));
    const enq = run.frames.filter((f) => f.vars?.some(([k, v]) => k === 'op' && v === "enqueue('E', 0)"));
    expect(enq.map((f) => f.state.slots.findIndex((s) => s!.sub === 'E'))).toEqual([4, 1, 0]);
    expect(enq[enq.length - 1].caption).toMatch(/root/);
  });
});

describe('parsePriorityQueue', () => {
  it('reads long and short forms', () => {
    const ops = parsePriorityQueue('enqueue A 3, enqueue(B, -2), C:0, enq 7 1, dequeue, deq, peek, size, is_empty, clear');
    expect(ops.map(formatPqOp)).toEqual([
      "enqueue('A', 3)",
      "enqueue('B', -2)",
      "enqueue('C', 0)",
      'enqueue(7, 1)',
      'dequeue()',
      'dequeue()',
      'peek()',
      'size()',
      'is_empty()',
      'clear()',
    ]);
  });

  it('gives friendly errors', () => {
    expect(() => parsePriorityQueue('')).toThrow(InputError);
    expect(() => parsePriorityQueue('enqueue A')).toThrow(/item and a priority/);
    expect(() => parsePriorityQueue('enqueue A x')).toThrow(/not a priority/);
    expect(() => parsePriorityQueue('enqueue A 100')).toThrow(/not a priority/);
    expect(() => parsePriorityQueue('A')).toThrow(/Cannot read/);
    expect(() => parsePriorityQueue(Array.from({ length: 11 }, (_, i) => `x${i}:1`).join(', '))).toThrow(/At most 10 entries/);
    expect(parsePriorityQueue([...Array.from({ length: 10 }, (_, i) => `x${i}:1`), 'clear', 'y:1'].join(', '))).toHaveLength(12);
  });
});
