import { describe, expect, it } from 'vitest';
import { InputError, type Frame } from '../core/types';
import type { MemoryState } from '../renderers/MemoryView';
import { complexityFixtures, rng } from './growthBoundsTestKit';
import { parseSpace, SPACE_CODE, SPACE_LIMITS, spaceFamily, traceSpace, type SpaceExample, type SpaceInput } from './spaceComplexity';

interface SpaceFixture {
  example: SpaceExample;
  arg: number | number[];
  calls: Array<[number, number]>;
  returns: Array<[number, number]>;
  peak: { depth: number; cells: number; total: number };
  result: unknown;
}

const inputOf = (c: SpaceFixture): SpaceInput =>
  Array.isArray(c.arg) ? { example: c.example, n: c.arg.length, arr: c.arg } : { example: c.example, n: c.arg, arr: [] };

const fibNumber = (k: number) => {
  let a = 0;
  let b = 1;
  for (let i = 0; i < k; i++) [a, b] = [b, a + b];
  return a;
};

/** Captions, lines, frames one per row, unique list ids, and units = frames + counted cells on the timeline. */
function expectWellFormed(frames: Array<Frame<MemoryState>>, codeLines: number) {
  frames.forEach((f, step) => {
    expect(f.caption.length).toBeGreaterThan(20);
    if (f.line !== undefined) {
      expect(f.line).toBeGreaterThanOrEqual(0);
      expect(f.line).toBeLessThan(codeLines);
    }
    const s = f.state;
    expect(s.frames.map((x) => x.row)).toEqual(s.frames.map((_, k) => k));
    expect(new Set(s.frames.map((x) => x.id)).size).toBe(s.frames.length);
    expect(new Set(s.lists.map((l) => l.id)).size).toBe(s.lists.length);
    for (const l of s.lists) expect(new Set(l.cells.map((c) => c.key)).size).toBe(l.cells.length);
    const cells = s.lists.reduce((t, l) => t + (l.input ? 0 : l.cells.length), 0);
    expect(s.now).toEqual({ frames: s.frames.length, cells });
    expect(s.timeline.length).toBe(step + 1);
    expect(s.timeline[step]).toBe(s.frames.length + cells);
    expect(s.peak.units).toBe(Math.max(...s.timeline));
    expect(s.timeline[s.peak.step]).toBe(s.peak.units);
    // The call tree: unique nodes, every edge from a node of the tree, and the frames on the stack
    // are exactly the tree's path of unreturned calls (one per depth).
    if (s.tree) {
      const ids = new Set(s.tree.nodes.map((t) => t.id));
      expect(ids.size).toBe(s.tree.nodes.length);
      for (const t of s.tree.nodes) if (t.parent !== undefined) expect(ids.has(t.parent)).toBe(true);
      const open = s.tree.nodes.filter((t) => t.role === 'active' || t.role === 'compare');
      expect(open.map((t) => t.depth).sort((a, b) => a - b)).toEqual(s.frames.filter((x) => x.role !== 'done').map((x) => x.row));
    }
    // Lists of one row never overlap.
    const rows = new Map<number, Array<[number, number]>>();
    for (const l of s.lists) {
      const span: [number, number] = [l.col, l.col + Math.max(l.cells.length, l.slots ?? 0, 1)];
      for (const o of rows.get(l.row) ?? []) expect(span[0] >= o[1] || span[1] <= o[0], `${f.caption}: ${l.name}`).toBe(true);
      rows.set(l.row, [...(rows.get(l.row) ?? []), span]);
    }
  });
}

describe('space_complexity.py: the tracer matches the Python code (golden fixture)', () => {
  it('every call, the memory at every return, the peaks and the result', () => {
    const list = complexityFixtures.space as SpaceFixture[];
    expect(list.length).toBeGreaterThanOrEqual(80);
    for (const c of list) {
      const run = traceSpace(inputOf(c));
      const name = `${c.example} ${JSON.stringify(c.arg)}`;
      expect(run.calls, name).toEqual(c.calls);
      expect(run.returns, name).toEqual(c.returns);
      expect(run.peak, name).toEqual(c.peak);
      expect(run.result, name).toEqual(c.result);
    }
  });
});

describe('spaceComplexity tracers', () => {
  it('recursion: Fibonacci makes 2F(n + 1) - 1 calls but the stack is n deep; halving is floor(log2 n) + 1 deep', () => {
    for (let n = 0; n <= SPACE_LIMITS.fib; n++) {
      const run = traceSpace({ example: 'fib', n, arr: [] });
      expect(run.calls.length).toBe(2 * fibNumber(n + 1) - 1);
      expect(run.peak).toEqual({ depth: Math.max(n, 1), cells: 0, total: Math.max(n, 1) });
      expect(run.result).toBe(fibNumber(n));
      expectWellFormed(run.frames, SPACE_CODE.stack.length);
    }
    for (let n = 1; n <= SPACE_LIMITS.log; n++) {
      const run = traceSpace({ example: 'log', n, arr: [] });
      expect(run.peak.depth).toBe(Math.floor(Math.log2(n)) + 1);
      expect(run.frames.length).toBeLessThan(2000);
    }
  });

  it('merge sort on random lists: sorted output, 2n - 1 calls, peak cells within 2n + n/2 and well-formed frames', () => {
    const rand = rng(17);
    for (let t = 0; t < 150; t++) {
      const n = Math.floor(rand() * (SPACE_LIMITS.merge + 1));
      const arr = Array.from({ length: n }, () => Math.floor(rand() * 30) - 5);
      const run = traceSpace({ example: 'merge', n, arr });
      expect(run.result).toEqual([...arr].sort((a, b) => a - b));
      expect(run.calls.length).toBe(Math.max(1, 2 * n - 1));
      expect(run.peak.depth).toBe(n <= 1 ? 1 : Math.ceil(Math.log2(n)) + 1);
      expect(run.peak.cells).toBeLessThanOrEqual(2 * n + Math.ceil(n / 2));
      expectWellFormed(run.frames, SPACE_CODE.merge.length);
    }
  });

  it('a base case returns its slice, which lives on as the caller\'s left; other slices die with their call', () => {
    const run = traceSpace({ example: 'merge', n: 2, arr: [2, 1] });
    const afterLeft = run.frames.find((f) => f.caption.startsWith('left = [2]'))!;
    expect(afterLeft.state.lists.map((l) => [l.name, l.row, l.cells.map((c) => c.value)])).toEqual([
      ['arr (input)', 0, ['2', '1']],
      ['left', 0, ['2']],
    ]);
    const done = run.frames[run.frames.length - 2];
    expect(done.line).toBe(11);
    expect(done.state.now).toEqual({ frames: 1, cells: 4 });
  });

  it('loops: constant and in-place reverse stay at one frame; linear and quadratic grow to n and n + n^2 cells', () => {
    for (let n = 0; n <= SPACE_LIMITS.constant; n++) expect(traceSpace({ example: 'constant', n, arr: [] }).peak).toEqual({ depth: 1, cells: 0, total: 1 });
    for (let n = 0; n <= SPACE_LIMITS.linear; n++) expect(traceSpace({ example: 'linear', n, arr: [] }).peak.cells).toBe(n);
    for (let n = 0; n <= SPACE_LIMITS.quadratic; n++) {
      const run = traceSpace({ example: 'quadratic', n, arr: [] });
      expect(run.peak.cells).toBe(n + n * n);
      expectWellFormed(run.frames, SPACE_CODE.loops.length);
    }
    const rand = rng(23);
    for (let t = 0; t < 40; t++) {
      const arr = Array.from({ length: Math.floor(rand() * 17) }, () => Math.floor(rand() * 50));
      const run = traceSpace({ example: 'reverse', n: arr.length, arr });
      expect(run.result).toEqual([...arr].reverse());
      expect(run.peak).toEqual({ depth: 1, cells: 0, total: 1 });
      expectWellFormed(run.frames, SPACE_CODE.loops.length);
    }
  });

  it('a swap keeps the cell keys with their values, so they glide', () => {
    const run = traceSpace({ example: 'reverse', n: 3, arr: [7, 8, 9] });
    const before = run.frames.find((f) => f.line === 12)!.state.lists[0].cells;
    const after = run.frames.find((f) => f.line === 13)!.state.lists[0].cells;
    expect(after.map((c) => c.value)).toEqual(['9', '8', '7']);
    expect(after[0].key).toBe(before[2].key);
  });
});

describe('parseSpace', () => {
  it('reads each family', () => {
    expect(parseSpace('fib 6', 'stack')).toEqual({ example: 'fib', n: 6, arr: [] });
    expect(parseSpace('logarithmic_space_example(16)', 'stack')).toEqual({ example: 'log', n: 16, arr: [] });
    expect(parseSpace('38 27 43 3 9 82 10', 'merge').arr).toEqual([38, 27, 43, 3, 9, 82, 10]);
    expect(parseSpace('[3, 1, 2]', 'merge').arr).toEqual([3, 1, 2]);
    expect(parseSpace('[]', 'merge').arr).toEqual([]);
    expect(parseSpace('reverse 1 2 3', 'loops')).toEqual({ example: 'reverse', n: 3, arr: [1, 2, 3] });
    expect(parseSpace('quadratic 4', 'loops')).toEqual({ example: 'quadratic', n: 4, arr: [] });
    expect(spaceFamily('fib')).toBe('stack');
  });

  it('gives friendly errors and explains the caps', () => {
    expect(() => parseSpace('fib 11', 'stack')).toThrow(/up to 10/);
    expect(() => parseSpace('fib 11', 'stack')).toThrow(/287 calls/);
    expect(() => parseSpace('log 65', 'stack')).toThrow(/up to 64/);
    expect(() => parseSpace('linear 5', 'stack')).toThrow(/Cannot read/);
    expect(() => parseSpace('fib', 'stack')).toThrow(/one size/);
    expect(() => parseSpace('fib -1', 'stack')).toThrow(InputError);
    expect(() => parseSpace('1 2 3 4 5 6 7 8 9', 'merge')).toThrow(/At most 8/);
    expect(() => parseSpace('1 x 3', 'merge')).toThrow(/not a whole number/);
    expect(() => parseSpace('quadratic 7', 'loops')).toThrow(/up to 6/);
    expect(() => parseSpace('reverse 1000', 'loops')).toThrow(/-99 to 999/);
  });
});
