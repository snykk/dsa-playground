import { describe, expect, it } from 'vitest';
import { InputError, type Frame } from '../core/types';
import type { ArrayTrackState } from '../renderers/ArrayTrack';
import type { ChainState } from '../renderers/ChainView';
import { dynamicArrayStack, linkedListStack, staticArrayStack } from '../specs/stack';
import fixtures from './__fixtures__/stacksQueues.json';
import {
  dynamicStack,
  formatStackOp,
  linkedStack,
  listResize,
  parseDynamicStack,
  parseLinkedStack,
  parseStack,
  parseStaticStack,
  staticStack,
  type PyResult,
  type StackOp,
} from './stack';

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

type RawOp = [string, string?];
const toOp = ([kind, value]: RawOp): StackOp => (kind === 'push' ? { kind: 'push', value: value! } : { kind: kind as 'pop' | 'peek' | 'size' | 'is_empty' });

function randomOps(rand: () => number, length: number): StackOp[] {
  const ops: StackOp[] = [];
  for (let k = 0; k < length; k++) {
    const r = rand();
    if (r < 0.5) ops.push({ kind: 'push', value: String(Math.floor(rand() * 200) - 50) });
    else if (r < 0.8) ops.push({ kind: 'pop' });
    else ops.push({ kind: (['peek', 'size', 'is_empty'] as const)[Math.floor(rand() * 3)] });
  }
  return ops;
}

/** The reference: a plain array, with the same results and exceptions as the Python classes. */
function model(ops: StackOp[], capacity = Infinity) {
  const items: string[] = [];
  return ops.map((op) => {
    let result: PyResult = null;
    let error: string | null = null;
    if (op.kind === 'push') {
      if (items.length === capacity) error = 'OverflowError';
      else items.push(op.value);
    } else if (op.kind === 'pop' || op.kind === 'peek') {
      if (items.length === 0) error = 'IndexError';
      else result = op.kind === 'pop' ? items.pop()! : items[items.length - 1];
    } else result = op.kind === 'size' ? items.length : items.length === 0;
    return { result, error, items: [...items] };
  });
}

const EDGE: StackOp[][] = [
  [{ kind: 'pop' }, { kind: 'peek' }, { kind: 'is_empty' }, { kind: 'size' }],
  [{ kind: 'push', value: '1' }, { kind: 'pop' }, { kind: 'pop' }, { kind: 'push', value: '2' }],
  Array.from({ length: 12 }, (_, i): StackOp => ({ kind: 'push', value: String(i) })),
  [...Array.from({ length: 9 }, (_, i): StackOp => ({ kind: 'push', value: String(i) })), ...Array.from({ length: 10 }, (): StackOp => ({ kind: 'pop' }))],
];

function scripts(seed: number, count: number): StackOp[][] {
  const rand = rng(seed);
  return [...EDGE, ...Array.from({ length: count }, () => randomOps(rand, 1 + Math.floor(rand() * 20)))];
}

/** A frame that reports an exception ('raises IndexError("...")') must show it with the bad role. */
const RAISES = /raises \w+Error\("/;

function checkTrackFrames(frames: Array<Frame<ArrayTrackState>>, lines: number) {
  expect(frames.length).toBeLessThan(2000);
  for (const f of frames) {
    expect(f.caption.length).toBeGreaterThan(10);
    if (RAISES.test(f.caption)) {
      const roles = [...f.state.items.map((it) => it.role), ...(f.state.pointers ?? []).map((p) => p.role)];
      expect(roles, f.caption).toContain('bad');
    }
    if (f.line !== undefined) {
      expect(f.line).toBeGreaterThanOrEqual(0);
      expect(f.line).toBeLessThan(lines);
    }
    const s = f.state;
    const ids = s.items.map((it) => it.id);
    expect(new Set(ids).size).toBe(ids.length);
    const names = (s.pointers ?? []).map((p) => p.name);
    expect(new Set(names).size).toBe(names.length);
    const blockIds = s.blocks.map((b) => b.id);
    expect(new Set(blockIds).size).toBe(blockIds.length);
    // Every item in a block row sits on a slot of that block.
    for (const it of s.items) {
      const row = it.row ?? 0;
      if (row === -1) continue;
      const block = s.blocks.find((b) => b.row === row);
      expect(block, `row ${row} has a block`).toBeDefined();
      expect(it.slot).toBeGreaterThanOrEqual(0);
      expect(it.slot).toBeLessThan(block!.slots);
    }
  }
}

function checkChainFrames(frames: Array<Frame<ChainState>>, lines: number) {
  for (const f of frames) {
    expect(f.caption.length).toBeGreaterThan(10);
    if (RAISES.test(f.caption)) expect([...f.state.nodes.map((n) => n.role), ...(f.state.pointers ?? []).map((p) => p.role)], f.caption).toContain('bad');
    if (f.line !== undefined) expect(f.line).toBeLessThan(lines);
    const ids = new Set(f.state.nodes.map((n) => n.id));
    expect(ids.size).toBe(f.state.nodes.length);
    for (const l of f.state.links) {
      expect(ids.has(l.from)).toBe(true);
      if (l.to !== null) expect(ids.has(l.to)).toBe(true);
    }
    for (const p of f.state.pointers ?? []) if (p.target !== null) expect(ids.has(p.target)).toBe(true);
  }
}

describe('staticStack', () => {
  it('agrees with a bounded array on random scripts and edge cases, after every operation', () => {
    const rand = rng(11);
    for (const ops of scripts(1, 150)) {
      const capacity = 1 + Math.floor(rand() * 6);
      const run = staticStack({ capacity, ops });
      const want = model(ops, capacity);
      expect(run.steps.length).toBe(ops.length);
      run.steps.forEach((step, i) => {
        expect(step.result).toEqual(want[i].result);
        expect(step.error).toBe(want[i].error);
        expect(step.top).toBe(want[i].items.length - 1);
        expect(step.stack).toEqual([...want[i].items, ...new Array(capacity - want[i].items.length).fill(null)]);
      });
      checkTrackFrames(run.frames, staticArrayStack.pseudocode.length);
      expect(run.frames[run.frames.length - 1].caption).toMatch(/^Done: /);
    }
  });

  it('matches the Python ArrayStack (golden fixtures): array, top and every result', () => {
    const cases = fixtures.staticStack as unknown as Array<{ capacity: number; ops: RawOp[]; steps: Array<Record<string, unknown>> }>;
    expect(cases.length).toBeGreaterThanOrEqual(30);
    for (const c of cases) {
      const run = staticStack({ capacity: c.capacity, ops: c.ops.map(toOp) });
      expect(run.steps.map(({ result, error, stack, top }) => ({ result, error, stack, top }))).toEqual(c.steps);
    }
  });

  it('shows an overflow as its own frame and keeps going', () => {
    const run = staticStack(parseStaticStack('capacity 2; push 1, push 2, push 3, pop, push 4'));
    const overflow = run.frames.find((f) => f.line === 2);
    expect(overflow?.caption).toMatch(/raises OverflowError\("Stack overflow"\)/);
    expect(overflow?.state.items.find((it) => it.row === -1)?.role).toBe('bad');
    expect(run.steps.map((s) => s.error)).toEqual([null, null, 'OverflowError', null, null]);
    expect(run.steps[4].stack).toEqual(['1', '4']);
  });

  it('moves the top pointer one slot per push and pop', () => {
    const run = staticStack(parseStaticStack('capacity 3; push 5, pop'));
    const tops = run.frames.map((f) => f.state.pointers![0].slot);
    expect(tops[0]).toBe(-1);
    expect(Math.max(...tops)).toBe(0);
    expect(tops[tops.length - 1]).toBe(-1);
  });
});

describe('listResize (CPython list_resize)', () => {
  it('grows 0, 4, 8, 16, 24, 32, 40, 52, 64, 76 on appends', () => {
    let allocated = 0;
    const seen = [0];
    for (let n = 0; n < 70; n++) {
      allocated = listResize(allocated, n, n + 1);
      if (allocated !== seen[seen.length - 1]) seen.push(allocated);
    }
    expect(seen).toEqual([0, 4, 8, 16, 24, 32, 40, 52, 64, 76]);
  });

  it('shrinks only below half full, and to nothing when empty', () => {
    expect(listResize(24, 12, 11)).toBe(16);
    expect(listResize(16, 9, 8)).toBe(16);
    expect(listResize(16, 8, 7)).toBe(12);
    expect(listResize(8, 4, 3)).toBe(8);
    expect(listResize(4, 1, 0)).toBe(0);
  });
});

describe('dynamicStack', () => {
  it('agrees with a plain array on random scripts, and keeps the allocation sane', () => {
    for (const ops of scripts(2, 150)) {
      const run = dynamicStack({ ops });
      const want = model(ops);
      run.steps.forEach((step, i) => {
        expect(step.result).toEqual(want[i].result);
        expect(step.error).toBe(want[i].error);
        expect(step.stack).toEqual(want[i].items);
        expect(step.allocated).toBeGreaterThanOrEqual(step.stack.length);
        expect(step.allocated % 4).toBe(0);
        if (step.stack.length === 0) expect(step.allocated).toBe(0);
        else expect(step.allocated).toBeLessThan(2 * step.stack.length + 8);
      });
      checkTrackFrames(run.frames, dynamicArrayStack.pseudocode.length);
    }
  });

  it('matches the Python list (golden fixtures): contents and CPython allocation after every operation', () => {
    const cases = fixtures.dynamicStack as unknown as Array<{ ops: RawOp[]; steps: Array<Record<string, unknown>> }>;
    expect(cases.length).toBeGreaterThanOrEqual(30);
    for (const c of cases) {
      const run = dynamicStack({ ops: c.ops.map(toOp) });
      expect(run.steps.map(({ result, error, stack, allocated }) => ({ result, error, stack, allocated }))).toEqual(c.steps);
    }
  });

  it('animates a growth: a second block appears, the items move into it, then it replaces the old one', () => {
    const run = dynamicStack(parseDynamicStack('push 1, push 2, push 3, push 4, push 5'));
    const copy = run.frames.findIndex((f) => f.state.items.some((it) => it.row === 1));
    expect(copy).toBeGreaterThan(0);
    expect(run.frames[copy - 1].state.blocks.map((b) => b.slots)).toEqual([4, 8]);
    expect(run.frames[copy + 1].state.blocks.map((b) => b.slots)).toEqual([8]);
    expect(run.steps.map((s) => s.allocated)).toEqual([4, 4, 4, 4, 8]);
    const last = run.frames[run.frames.length - 1];
    expect(last.vars).toContainEqual(['copies so far', 4]);
  });
});

describe('linkedStack', () => {
  it('agrees with a plain array on random scripts, after every operation', () => {
    for (const ops of scripts(3, 150)) {
      const run = linkedStack({ ops });
      const want = model(ops);
      run.steps.forEach((step, i) => {
        expect(step.result).toEqual(want[i].result);
        expect(step.error).toBe(want[i].error);
        expect(step.items).toEqual([...want[i].items].reverse());
        expect(step.size).toBe(want[i].items.length);
      });
      checkChainFrames(run.frames, linkedListStack.pseudocode.length);
    }
  });

  it('matches the Python LinkedListStack (golden fixtures): the chain from top and every result', () => {
    const cases = fixtures.linkedStack as unknown as Array<{ ops: RawOp[]; steps: Array<Record<string, unknown>> }>;
    expect(cases.length).toBeGreaterThanOrEqual(25);
    for (const c of cases) {
      const run = linkedStack({ ops: c.ops.map(toOp) });
      expect(run.steps.map(({ result, error, items, size }) => ({ result, error, items, size }))).toEqual(c.steps);
    }
  });

  it('links the new node before moving top, then lets it settle into the row', () => {
    const run = linkedStack(parseLinkedStack('push 1, push 2'));
    const push2 = run.frames.filter((f) => f.vars?.some(([k, v]) => k === 'op' && v === 'push(2)'));
    expect(push2.map((f) => f.line)).toEqual([1, 2, 3, 4]);
    const linked = push2[1].state;
    expect(linked.links.find((l) => l.from === 1)?.to).toBe(0);
    expect(linked.pointers!.find((p) => p.name === 'top')?.target).toBe(0);
    expect(push2[2].state.pointers!.find((p) => p.name === 'top')?.target).toBe(1);
    expect(push2[3].state.nodes.every((n) => (n.row ?? 0) === 0)).toBe(true);
  });

  it('shows the unlinked node as a ghost for one step on pop', () => {
    const run = linkedStack(parseLinkedStack('push 1, push 2, pop'));
    const ghost = run.frames.find((f) => f.state.nodes.some((n) => n.ghost));
    expect(ghost?.line).toBe(8);
    expect(ghost?.state.pointers!.find((p) => p.name === 'top')?.target).toBe(0);
  });
});

describe('parseStack', () => {
  it('reads the operations, short forms and the capacity clause', () => {
    const input = parseStack('capacity 3; push 5, push(-7), A, pop(), peek, size, is_empty()');
    expect(input.capacity).toBe(3);
    expect(input.ops.map(formatStackOp)).toEqual(["push(5)", 'push(-7)', "push('A')", 'pop()', 'peek()', 'size()', 'is_empty()']);
    expect(parseStack('push 007').ops).toEqual([{ kind: 'push', value: '7' }]);
  });

  it('gives friendly errors', () => {
    expect(() => parseStack('')).toThrow(InputError);
    expect(() => parseStack('push')).toThrow(/one value/);
    expect(() => parseStack('push 1234')).toThrow(/not a value/);
    expect(() => parseStack('shove 3')).toThrow(/Cannot read/);
    expect(() => parseStack('capacity 2; capacity 3; push 1')).toThrow(/only once/);
    expect(() => parseStaticStack('capacity 0; push 1')).toThrow(/ValueError/);
    expect(() => parseStaticStack('capacity 9; push 1')).toThrow(/At most 8/);
    expect(() => parseLinkedStack(Array.from({ length: 9 }, (_, i) => `push ${i}`).join(', '))).toThrow(/At most 8 nodes/);
    expect(() => parseDynamicStack(Array.from({ length: 13 }, (_, i) => `push ${i}`).join(', '))).toThrow(/At most 12 items/);
  });

  it('defaults the static capacity to 5 and lets the other stacks ignore it', () => {
    expect(parseStaticStack('push 1').capacity).toBe(5);
    const run = dynamicStack(parseDynamicStack('capacity 3; push 1, push 2, push 3, push 4'));
    expect(run.steps[3].error).toBeNull();
    expect(run.frames[0].caption).toMatch(/ignored/);
  });
});
