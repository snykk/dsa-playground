import { describe, expect, it } from 'vitest';
import { InputError, type Frame } from '../core/types';
import type { FibHeapState, FibNodeView } from '../renderers/FibonacciHeapView';
import { fibGeometry, stabilizeFib } from '../renderers/FibonacciHeapView';
import fixtures from './__fixtures__/heapsGraphs.json';
import { FIB_CODE, fibKeys, fibTrace, parseFibScript, type FibDump, type FibOp } from './fibonacciHeap';

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

type FixtureOp = [string, (number | number[])?];
interface FixtureCase {
  ops: FixtureOp[];
  steps: Array<{ result: string | null; error: string | null; roots: FibDump[]; count: number }>;
}

const toOp = ([kind, arg]: FixtureOp): FibOp =>
  kind === 'insert' ? { kind: 'insert', key: arg as number } : kind === 'build' ? { kind: 'build', keys: arg as number[] } : ({ kind } as FibOp);

/** Heap order, degree == children, binomial sizes (no cuts), no marks; returns the node count. */
function checkTree(t: FibDump): number {
  const [key, degree, marked, children] = t;
  expect(marked).toBe(false);
  expect(degree).toBe(children.length);
  let size = 1;
  for (const c of children) {
    expect(c[0]).toBeGreaterThanOrEqual(key);
    size += checkTree(c);
  }
  expect(size).toBe(2 ** degree);
  return size;
}

function nodesOf(views: FibNodeView[]): FibNodeView[] {
  return views.flatMap((v) => [v, ...nodesOf(v.children)]);
}

function expectWellFormed(frames: Array<Frame<FibHeapState>>) {
  for (const f of frames) {
    expect(f.caption.length).toBeGreaterThan(10);
    if (f.line !== undefined) {
      expect(f.line).toBeGreaterThanOrEqual(0);
      expect(f.line).toBeLessThan(FIB_CODE.length);
    }
    const all = [...nodesOf(f.state.roots), ...(f.state.floating ?? []).map((x) => x.node)];
    const ids = all.map((n) => n.id);
    expect(new Set(ids).size, f.caption).toBe(ids.length);
    for (const p of f.state.pointers ?? []) expect(ids, `${p.name}: ${f.caption}`).toContain(p.target);
    for (const c of f.state.table ?? []) if (c.id !== null) expect(ids).toContain(c.id);
  }
}

function randomOps(rand: () => number, count: number): FibOp[] {
  const ops: FibOp[] = [];
  let live = 0;
  for (let i = 0; i < count; i++) {
    const r = rand();
    if ((r < 0.6 && live < 15) || (live === 0 && r < 0.85)) {
      ops.push({ kind: 'insert', key: Math.floor(rand() * 16) - 3 });
      live += 1;
    } else if (r < 0.9) {
      ops.push({ kind: 'extract' });
      live = Math.max(0, live - 1);
    } else if (r < 0.95) ops.push({ kind: 'peek' });
    else if (r < 0.98) ops.push({ kind: 'size' });
    else {
      ops.push({ kind: 'clear' });
      live = 0;
    }
  }
  return ops;
}

describe('fibTrace', () => {
  const cases = fixtures.fibonacciHeap as unknown as FixtureCase[];

  it('reproduces every tree, root order, count and return value of the Python fixture', () => {
    expect(cases.length).toBeGreaterThanOrEqual(50);
    for (const c of cases) {
      const run = fibTrace(c.ops.map(toOp));
      expect(run.steps.map((s) => ({ result: s.result, error: s.error, roots: s.roots, count: s.count })), JSON.stringify(c.ops)).toEqual(c.steps);
    }
  });

  it('agrees with a sorted-array model on random scripts, and every invariant holds after every operation', () => {
    const rand = rng(7);
    for (let t = 0; t < 150; t++) {
      const ops = randomOps(rand, 1 + Math.floor(rand() * 30));
      const run = fibTrace(ops);
      const model: number[] = [];
      ops.forEach((op, i) => {
        const step = run.steps[i];
        model.sort((a, b) => a - b);
        if (op.kind === 'insert') model.push(op.key);
        else if (op.kind === 'extract' || op.kind === 'peek') {
          if (model.length === 0) expect(step.error).toBe('IndexError');
          else expect(step.result).toBe(String(op.kind === 'extract' ? model.shift() : model[0]));
        } else if (op.kind === 'size') expect(step.result).toBe(String(model.length));
        else if (op.kind === 'clear') model.length = 0;
        expect(step.count).toBe(model.length);
        expect(fibKeys(step.roots).sort((a, b) => a - b)).toEqual([...model].sort((a, b) => a - b));
        expect(step.roots.reduce((s, r) => s + checkTree(r), 0)).toBe(model.length);
        // min_node (the first root of the dump) holds the smallest key.
        if (model.length) expect(step.roots[0][0]).toBe(Math.min(...model));
        // After a consolidation every root has its own degree.
        if (op.kind === 'extract' && step.roots.length) {
          const degrees = step.roots.map((r) => r[1]);
          expect(new Set(degrees).size).toBe(degrees.length);
        }
      });
      expectWellFormed(run.frames);
    }
  });

  it('gives the article forest: 5 3 7 1 9 2 8, then extract leaves 2 (8, 7 (9)) and 3 (5)', () => {
    const run = fibTrace(parseFibScript('insert 5, insert 3, insert 7, insert 1, insert 9, insert 2, insert 8, extract, extract'));
    const leaf = (k: number): FibDump => [k, 0, false, []];
    expect(run.steps[7].roots).toEqual([
      [2, 2, false, [leaf(8), [7, 1, false, [leaf(9)]]]],
      [3, 1, false, [leaf(5)]],
    ]);
    // Extracting 2 links 3 and 7 (both degree 1) into 3 (5, 7 (9)); 8 stays a root.
    expect(run.steps[8].result).toBe('2');
    expect(run.steps[8].roots).toEqual([
      [3, 2, false, [leaf(5), [7, 1, false, [leaf(9)]]]],
      leaf(8),
    ]);
  });

  it('splices an insert right after min_node and keeps the earlier of equal minimums', () => {
    const run = fibTrace(parseFibScript('insert 4, insert 6, insert 5, insert 4'));
    // Root list from min_node: 4, then the latest insert (4), then 5, then 6.
    expect(run.steps[3].roots.map((r) => r[0])).toEqual([4, 4, 5, 6]);
    expect(run.frames.some((f) => f.caption.includes('equal keys keep the earlier minimum'))).toBe(true);
  });

  it('traces build as the TypeError the constructor raises, then goes on with an empty heap', () => {
    const run = fibTrace(parseFibScript('build 3 1 2, insert 2, extract'));
    expect(run.steps.map((s) => s.error)).toEqual(['TypeError', null, null]);
    expect(run.steps[2].result).toBe('2');
  });

  it('keeps the root row in place while min_node moves', () => {
    const run = fibTrace(parseFibScript('insert 5, insert 3, insert 1'));
    const firsts = run.frames.filter((f) => f.state.roots.length).map((f) => f.state.roots[0].label);
    expect(new Set(firsts)).toEqual(new Set([5]));
  });

  it('keeps one picture size for a whole run', () => {
    const frames = stabilizeFib(fibTrace(parseFibScript('1, 2, 3, 4, 5, 6, 7, 8, extract, extract')).frames);
    const ext = frames[0].state.extent!;
    for (const f of frames) expect(f.state.extent).toEqual(ext);
    expect(ext.table).toBeGreaterThanOrEqual(3);
    const g = fibGeometry(ext);
    expect(g.height).toBeLessThanOrEqual(440);
    // The largest input: 15 single roots fit, and a degree-3 tree is 4 levels deep.
    const big = stabilizeFib(fibTrace(parseFibScript(Array.from({ length: 15 }, (_, i) => `insert ${i}`).join(', ') + ', extract')).frames);
    expect(fibGeometry(big[0].state.extent!).height).toBeLessThanOrEqual(440);
  });
});

describe('parseFibScript', () => {
  it('reads the heap script', () => {
    expect(parseFibScript('insert(4), 3, extract_min, peek, size, is_empty, clear')).toEqual([
      { kind: 'insert', key: 4 },
      { kind: 'insert', key: 3 },
      { kind: 'extract' },
      { kind: 'peek' },
      { kind: 'size' },
      { kind: 'is_empty' },
      { kind: 'clear' },
    ]);
  });

  it('rejects what the class or the picture cannot take', () => {
    expect(() => parseFibScript('extract_max')).toThrow(/extract_min only/);
    expect(() => parseFibScript('insert 1, build 2')).toThrow(InputError);
    expect(() => parseFibScript(Array.from({ length: 16 }, (_, i) => `insert ${i}`).join(', '))).toThrow(/At most 15/);
    expect(() => parseFibScript('decrease_key 3 1')).toThrow(/Cannot read/);
  });
});
