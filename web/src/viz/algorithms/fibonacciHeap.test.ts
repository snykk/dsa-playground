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

type FixtureOp = [string, ...unknown[]];
interface FixtureCase {
  ops: FixtureOp[];
  steps: Array<{ result: string | null; error: string | null; roots: FibDump[]; count: number }>;
}

const toOp = ([kind, a, b]: FixtureOp): FibOp => {
  if (kind === 'insert') return { kind: 'insert', key: a as number };
  if (kind === 'build') return { kind: 'build', keys: a as number[] };
  if (kind === 'decrease_key') return { kind: 'decrease', handle: a as number, key: b as number };
  if (kind === 'delete') return { kind: 'delete', handle: a as number };
  if (kind === 'merge') return { kind: 'merge', keys: a as number[] };
  return { kind } as FibOp;
};

const fib = (n: number): number => (n < 2 ? n : fib(n - 1) + fib(n - 2));

/** Heap order, degree == children, at least F(degree + 2) nodes, no marked root; returns the node count. */
function checkTree(t: FibDump, root = true): number {
  const [key, degree, marked, children] = t;
  if (root) expect(marked, 'a root is never marked').toBe(false);
  expect(degree).toBe(children.length);
  let size = 1;
  for (const c of children) {
    expect(c[0]).toBeGreaterThanOrEqual(key);
    size += checkTree(c, false);
  }
  expect(size).toBeGreaterThanOrEqual(fib(degree + 2));
  return size;
}

/** Without cuts every tree is binomial: degree d means exactly 2^d nodes, and nothing is marked. */
function checkBinomial(t: FibDump): number {
  const [, degree, marked, children] = t;
  expect(marked).toBe(false);
  const size = 1 + children.reduce((s, c) => s + checkBinomial(c), 0);
  expect(size).toBe(2 ** degree);
  return size;
}

function marks(roots: FibDump[]): number {
  const walk = (t: FibDump): number => (t[2] ? 1 : 0) + t[3].reduce((s, c) => s + walk(c), 0);
  return roots.reduce((s, r) => s + walk(r), 0);
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
    // A mark is never drawn on a root.
    for (const r of f.state.roots) expect(r.marked, f.caption).toBeFalsy();
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

  it('reproduces every tree, root order, mark, count and return value of the Python fixture', () => {
    expect(cases.length).toBeGreaterThanOrEqual(150);
    expect(cases.some((c) => c.ops.some((o) => o[0] === 'decrease_key'))).toBe(true);
    expect(cases.some((c) => c.steps.some((s) => marks(s.roots) > 0))).toBe(true);
    for (const c of cases) {
      const run = fibTrace(c.ops.map(toOp));
      expect(run.steps.map((s) => ({ result: s.result, error: s.error, roots: s.roots, count: s.count })), JSON.stringify(c.ops)).toEqual(c.steps);
    }
  });

  it('agrees with a sorted-array model on random insert / extract scripts, whose trees stay binomial', () => {
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
        expect(step.roots.reduce((s, r) => s + checkBinomial(r), 0)).toBe(model.length);
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

  it('agrees with a handle model on random scripts with decrease_key, delete and merge, and keeps every invariant', () => {
    const rand = rng(11);
    const int = (lo: number, hi: number) => lo + Math.floor(rand() * (hi - lo + 1));
    for (let t = 0; t < 200; t++) {
      // Distinct keys, so the model knows which handle extract_min removes.
      const taken = new Set<number>();
      const fresh = (lo: number, hi: number): number | null => {
        for (let tries = 0; tries < 50; tries++) {
          const k = int(lo, hi);
          if (!taken.has(k)) {
            taken.add(k);
            return k;
          }
        }
        return null;
      };
      const live = new Map<number, number>(); // handle -> key
      let handles = 0;
      const ops: FibOp[] = [];
      const expected: Array<{ error: string | null; result: string | null }> = [];
      const n = int(1, 30);
      for (let i = 0; i < n; i++) {
        const r = rand();
        if (r < 0.35 && live.size < 15) {
          const k = fresh(-50, 99);
          if (k === null) continue;
          ops.push({ kind: 'insert', key: k });
          live.set(handles++, k);
          expected.push({ error: null, result: `FibonacciHeapNode(key=${k})` });
        } else if (r < 0.6 && handles > 0) {
          const h = int(0, handles - 1);
          const cur = live.get(h);
          if (cur !== undefined && rand() < 0.1) {
            ops.push({ kind: 'decrease', handle: h, key: cur + 1 });
            expected.push({ error: 'ValueError', result: null });
            continue;
          }
          const k = fresh(-99, cur === undefined ? 99 : cur - 1);
          if (k === null) continue;
          ops.push({ kind: 'decrease', handle: h, key: k });
          if (cur === undefined) expected.push({ error: 'ValueError', result: null });
          else {
            live.set(h, k);
            expected.push({ error: null, result: 'None' });
          }
        } else if (r < 0.7 && handles > 0) {
          const h = int(0, handles - 1);
          ops.push({ kind: 'delete', handle: h });
          expected.push(live.delete(h) ? { error: null, result: 'None' } : { error: 'ValueError', result: null });
        } else if (r < 0.8 && live.size < 12) {
          const keys: number[] = [];
          for (let j = int(0, 3); j > 0; j--) {
            const k = fresh(-50, 99);
            if (k !== null) keys.push(k);
          }
          ops.push({ kind: 'merge', keys });
          for (const k of keys) live.set(handles++, k);
          expected.push({ error: null, result: 'None' });
        } else {
          ops.push({ kind: 'extract' });
          if (live.size === 0) expected.push({ error: 'IndexError', result: null });
          else {
            const [h, k] = [...live.entries()].reduce((a, b) => (b[1] < a[1] ? b : a));
            live.delete(h);
            expected.push({ error: null, result: String(k) });
          }
        }
        const run = fibTrace(ops);
        const step = run.steps[ops.length - 1];
        const op = ops[ops.length - 1];
        expect({ error: step.error, result: step.result }, JSON.stringify(ops)).toEqual(expected[expected.length - 1]);
        expect(step.count).toBe(live.size);
        expect(fibKeys(step.roots).sort((a, b) => a - b)).toEqual([...live.values()].sort((a, b) => a - b));
        expect(step.roots.reduce((s, root) => s + checkTree(root), 0)).toBe(live.size);
        if (live.size) expect(step.roots[0][0]).toBe(Math.min(...live.values()));
        if (ops.length > 1) {
          // One operation marks at most one node.
          expect(marks(step.roots)).toBeLessThanOrEqual(marks(run.steps[ops.length - 2].roots) + 1);
        }
        if ((op.kind === 'extract' || (op.kind === 'delete' && !step.error)) && step.roots.length) {
          const degrees = step.roots.map((root) => root[1]);
          expect(new Set(degrees).size).toBe(degrees.length);
        }
        if (i === n - 1) expectWellFormed(run.frames);
      }
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

  it('gives the cascading cut of the README: 7 -> 1 cuts 7, then its marked parent 5', () => {
    const run = fibTrace(parseFibScript('0, 1, 2, 3, 4, 5, 6, 7, 8, extract, decrease_key 8 0, decrease_key 6 3, decrease_key 7 1'));
    const leaf = (k: number): FibDump => [k, 0, false, []];
    expect(run.steps[9].roots).toEqual([[1, 3, false, [leaf(2), [5, 2, false, [leaf(6), [7, 1, false, [leaf(8)]]]], [3, 1, false, [leaf(4)]]]]]);
    expect(run.steps[10].roots).toEqual([leaf(0), [1, 3, false, [leaf(2), [5, 2, false, [leaf(6), [7, 0, true, []]]], [3, 1, false, [leaf(4)]]]]]);
    expect(run.steps[11].roots).toEqual([leaf(0), leaf(3), [1, 3, false, [leaf(2), [5, 1, true, [[7, 0, true, []]]], [3, 1, false, [leaf(4)]]]]]);
    expect(run.steps[12].roots).toEqual([leaf(0), leaf(5), leaf(1), leaf(3), [1, 2, false, [leaf(2), [3, 1, false, [leaf(4)]]]]]);
    const captions = run.frames.map((f) => f.caption).join('\n');
    expect(captions).toContain('it is marked (dashed outline and a *)');
    expect(captions).toContain('was already marked, so this is its second lost child');
    // The marked 7 is drawn as marked, and its handle is named in the operations strip.
    const markedFrame = run.frames.find((f) => nodesOf(f.state.roots).some((n) => n.label === 7 && n.marked));
    expect(markedFrame).toBeDefined();
    expect(run.frames[run.frames.length - 1].state.strips![0].items.map((i) => i.text)).toContain('h7 = insert(7)');
    expect(run.frames.some((f) => f.line === 33)).toBe(true);
  });

  it('deletes without a sentinel key, and the deleted node goes to no result strip', () => {
    const run = fibTrace(parseFibScript('0, 1, 2, 3, 4, 5, 6, 7, 8, extract, decrease_key 6 0, delete 7'));
    expect(run.steps[11].result).toBe('None');
    expect(fibKeys(run.steps[11].roots).sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 8]);
    const last = run.frames[run.frames.length - 1];
    expect(last.state.strips!.find((s) => s.label === 'Extracted')!.items.map((i) => i.text)).toEqual(['0']);
    expect(run.frames.some((f) => f.caption.includes('as if its key were minus infinity'))).toBe(true);
    expect(run.frames.some((f) => f.state.floating?.some((x) => x.tag === 'deleted'))).toBe(true);
  });

  it('merges in O(1): the other heap floats, then its ring is spliced in right after min_node', () => {
    const run = fibTrace(parseFibScript('insert 5, insert 3, insert 7, merge 4 1 6'));
    expect(run.steps[3].roots.map((r) => r[0])).toEqual([1, 6, 4, 7, 5, 3]);
    const floating = run.frames.find((f) => (f.state.floating?.length ?? 0) === 3)!;
    expect(floating.state.floating!.map((x) => x.node.label)).toEqual([1, 6, 4]);
    expect(floating.state.pointers!.some((p) => p.name === 'other.min_node')).toBe(true);
    expect(run.frames.some((f) => f.caption.includes('four pointer writes'))).toBe(true);
    // Into an empty heap, and with an empty other.
    const empty = fibTrace(parseFibScript('merge, merge 2 1, merge'));
    expect(empty.steps.map((s) => s.count)).toEqual([0, 2, 2]);
    expect(empty.steps[1].roots.map((r) => r[0])).toEqual([1, 2]);
  });

  it('rejects a stale handle and a larger key with ValueError, and changes nothing', () => {
    const run = fibTrace(parseFibScript('insert 4, insert 9, extract, decrease_key 4 1, decrease_key 9 12, delete 9, delete 9, insert 6, clear, decrease_key 6 0'));
    expect(run.steps.map((s) => s.error)).toEqual([null, null, null, 'ValueError', 'ValueError', null, 'ValueError', null, null, 'ValueError']);
    expect(run.steps[3].roots).toEqual(run.steps[2].roots);
    const captions = run.frames.map((f) => f.caption);
    expect(captions.some((c) => c.includes('h4 is a stale handle') && c.includes('extract_min returned it'))).toBe(true);
    expect(captions.some((c) => c.includes('h9 is a stale handle') && c.includes('delete removed it'))).toBe(true);
    expect(captions.some((c) => c.includes('h6 is a stale handle') && c.includes('clear emptied the heap'))).toBe(true);
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
    // A merge keeps room for the other heap after the row.
    const merged = stabilizeFib(fibTrace(parseFibScript('insert 5, merge 4 1 6')).frames);
    expect(merged[0].state.extent!.floating).toBe(3);
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

  it('names a handle after the key it was inserted with, the latest insert of that key winning', () => {
    expect(parseFibScript('insert 9, decrease_key(9, 2), merge [4, 9], delete h9, dec 4 1, merge')).toEqual([
      { kind: 'insert', key: 9 },
      { kind: 'decrease', handle: 0, key: 2 },
      { kind: 'merge', keys: [4, 9] },
      { kind: 'delete', handle: 2 },
      { kind: 'decrease', handle: 1, key: 1 },
      { kind: 'merge', keys: [] },
    ]);
  });

  it('rejects what the class or the picture cannot take', () => {
    expect(() => parseFibScript('extract_max')).toThrow(/extract_min only/);
    expect(() => parseFibScript('insert 1, build 2')).toThrow(InputError);
    expect(() => parseFibScript(Array.from({ length: 16 }, (_, i) => `insert ${i}`).join(', '))).toThrow(/At most 15/);
    expect(() => parseFibScript('decrease_key 3 1')).toThrow(/no handle h3/);
    expect(() => parseFibScript('insert 3, decrease_key 3')).toThrow(/a handle and a new key/);
    expect(() => parseFibScript('insert 3, delete x')).toThrow(InputError);
    expect(() => parseFibScript('insert 1, merge ' + Array.from({ length: 15 }, (_, i) => i).join(' '))).toThrow(/operation 2 would make 16/);
  });

  it('counts the keys by running the heap, so a delete makes room', () => {
    const fifteen = Array.from({ length: 15 }, (_, i) => `insert ${i}`).join(', ');
    expect(parseFibScript(`${fifteen}, delete 3, insert 20`)).toHaveLength(17);
    expect(() => parseFibScript(`${fifteen}, extract, delete 0, insert 20, insert 21`)).toThrow(/would make 16/);
  });
});
