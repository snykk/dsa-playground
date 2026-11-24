import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError, type Frame } from '../core/types';
import { EULER_CODE, eulerTrace, formatLcaOp, LIFT_CODE, liftingTrace, parseLcaTree, type LcaOp, type LcaResult } from './lowestCommonAncestor';
import { expectTreeFramesWellFormed, randomTree } from './treeDecompositionTestKit';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/specializedTechniques.json', import.meta.url), 'utf8'));

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

interface Call {
  result: LcaResult;
  reads: Array<[number, number]>;
}

interface Case {
  n: number;
  edges: Array<[number, number]>;
  root: number;
  ops: Array<[string, number, number]>;
  parent: number[];
  depth: number[];
  levels: number;
  up: number[][];
  euler: number[];
  first: number[];
  sparse: number[][];
  lifting: Call[];
  tour: Call[];
}

const toOps = (ops: Array<[string, number, number]>): LcaOp[] => ops.map(([kind, a, b]) => ({ kind: kind as LcaOp['kind'], a, b }));

function expectFrames<S>(frames: Array<Frame<S>>, codeLines: number) {
  expect(frames.length).toBeGreaterThan(0);
  for (const f of frames) {
    expect(f.caption.length).toBeGreaterThan(10);
    if (f.line !== undefined) {
      expect(f.line).toBeGreaterThanOrEqual(0);
      expect(f.line).toBeLessThan(codeLines);
    }
  }
}

/** Parent, depth and the LCA by walking up one parent at a time. */
function naive(n: number, edges: Array<[number, number]>, root: number) {
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    adj[u].push(v);
    adj[v].push(u);
  }
  const parent = new Array(n).fill(-1);
  const depth = new Array(n).fill(0);
  const order = [root];
  const seen = new Set([root]);
  for (let i = 0; i < order.length; i++) {
    for (const v of adj[order[i]]) {
      if (seen.has(v)) continue;
      seen.add(v);
      parent[v] = order[i];
      depth[v] = depth[order[i]] + 1;
      order.push(v);
    }
  }
  const lca = (u: number, v: number) => {
    while (depth[u] > depth[v]) u = parent[u];
    while (depth[v] > depth[u]) v = parent[v];
    while (u !== v) [u, v] = [parent[u], parent[v]];
    return u;
  };
  const answer = (op: LcaOp): LcaResult => {
    if (op.kind === 'kth') {
      if (op.a >= n) return 'IndexError';
      let x = op.a;
      for (let i = 0; i < op.b && x !== -1; i++) x = parent[x];
      return x;
    }
    if (op.a >= n || op.b >= n) return 'IndexError';
    const w = lca(op.a, op.b);
    return op.kind === 'lca' ? w : depth[op.a] + depth[op.b] - 2 * depth[w];
  };
  return { parent, depth, answer };
}

describe('lowest_common_ancestor.py golden fixtures', () => {
  const cases = fixtures.lowestCommonAncestor as Case[];

  it('liftingTrace: parent, depth, levels, the up table, and every result with the cells it reads, in order', () => {
    expect(cases.length).toBeGreaterThanOrEqual(40);
    for (const c of cases) {
      const run = liftingTrace({ n: c.n, edges: c.edges, root: c.root, ops: toOps(c.ops) });
      const where = `${JSON.stringify(c.edges)} root ${c.root}`;
      expect(run.parent, where).toEqual(c.parent);
      expect(run.depth, where).toEqual(c.depth);
      expect(run.levels, where).toBe(c.levels);
      expect(run.up, where).toEqual(c.up);
      expect(run.results, where).toEqual(c.lifting.map((x) => x.result));
      expect(run.reads, where).toEqual(c.lifting.map((x) => x.reads));
    }
  });

  it('eulerTrace: the tour, first, the sparse table, and every result with the cells it reads, in order', () => {
    for (const c of cases) {
      const run = eulerTrace({ n: c.n, edges: c.edges, root: c.root, ops: toOps(c.ops) });
      const where = `${JSON.stringify(c.edges)} root ${c.root}`;
      expect(run.euler, where).toEqual(c.euler);
      expect(run.first, where).toEqual(c.first);
      expect(run.sparse, where).toEqual(c.sparse);
      expect(run.results, where).toEqual(c.tour.map((x) => x.result));
      expect(run.reads, where).toEqual(c.tour.map((x) => x.reads));
    }
  });

  it('the fixtures cover every kind of query and outcome', () => {
    const all = cases.flatMap((c) => c.ops.map((op, i) => [op[0], c.lifting[i].result, c.tour[i].result] as const));
    for (const kind of ['lca', 'dist', 'kth']) expect(all.some(([k]) => k === kind)).toBe(true);
    expect(all.some(([, r]) => r === 'IndexError')).toBe(true);
    expect(all.some(([k, r]) => k === 'kth' && r === -1)).toBe(true);
    expect(all.some(([k, , t]) => k === 'kth' && t === 'AttributeError')).toBe(true);
    expect(cases.some((c) => c.n === 1)).toBe(true);
  });
});

describe('both tracers against a naive LCA on random trees', () => {
  it('every lca, distance and kth_ancestor, the frames well formed', () => {
    const rand = rng(41);
    for (let t = 0; t < 150; t++) {
      const n = 1 + Math.floor(rand() * 12);
      const edges = randomTree(rand, n);
      const root = Math.floor(rand() * n);
      const ops: LcaOp[] = Array.from({ length: 6 }, (_, k) => {
        const kind = (['lca', 'dist', 'kth'] as const)[k % 3];
        const a = rand() < 0.05 ? n + Math.floor(rand() * 3) : Math.floor(rand() * n);
        const b = kind === 'kth' ? Math.floor(rand() * (n + 2)) : Math.floor(rand() * n);
        return { kind, a, b };
      });
      const ref = naive(n, edges, root);
      const lift = liftingTrace({ n, edges, root, ops });
      const tour = eulerTrace({ n, edges, root, ops });
      expect(lift.depth).toEqual(ref.depth);
      expect(lift.parent).toEqual(ref.parent);
      expect(lift.results).toEqual(ops.map(ref.answer));
      expect(tour.results).toEqual(ops.map((op) => (op.kind === 'kth' ? 'AttributeError' : ref.answer(op))));
      expect(tour.euler.length).toBe(2 * n - 1);
      // An lca query on the Euler tour reads two cells; binary lifting at most 2 + 4 per level.
      ops.forEach((op, i) => {
        if (op.kind === 'lca' && typeof tour.results[i] === 'number') expect(tour.reads[i].length).toBe(2);
        if (op.kind !== 'kth') expect(lift.reads[i].length).toBeLessThanOrEqual(lift.levels + 4 * lift.levels + 1);
      });
      expectFrames(lift.frames, LIFT_CODE.length);
      expectFrames(tour.frames, EULER_CODE.length);
      expectTreeFramesWellFormed(
        tour.frames.map((f) => ({ ...f, state: f.state.tree })),
        EULER_CODE.length,
      );
      for (const f of lift.frames) {
        expect(f.state.table.length).toBe(n);
        for (const j of f.state.jumps) {
          expect(j.from).not.toBe(j.to);
          expect(j.to).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });

  it('a query answer is the last line of the run, with a check mark when it matches the walk', () => {
    const run = liftingTrace(parseLcaTree('0-1 0-2 1-3 1-4 2-5 3-6 3-7 5-8 6-9; lca 9 4, lca 9 8, dist 9 8, kth 9 3, kth 9 5'));
    const last = run.frames[run.frames.length - 1].state.answers;
    expect(last.map((l) => l.text)).toEqual(['lca(9, 4) = 1', 'lca(9, 8) = 0', 'distance(9, 8) = 7', 'kth_ancestor(9, 3) = 1', 'kth_ancestor(9, 5) = -1']);
    expect(last.every((l) => l.role === 'good')).toBe(true);
    const tour = eulerTrace(parseLcaTree('0-1 0-2 1-3 1-4 2-5 3-6 3-7 5-8 6-9; lca 9 4, dist 9 8, kth 9 3'));
    const strips = tour.frames[tour.frames.length - 1].state.table.strips!;
    expect(strips.find((s) => s.label === 'Answers')!.items.map((i) => i.text)).toEqual(['lca(9, 4) = 1', 'distance(9, 8) = 7', 'kth_ancestor(9, 3) = AttributeError']);
  });

  it('a path of 12 rooted at 0: lifting the deepest node by 11 takes three jumps (11 = 0b1011)', () => {
    const edges = Array.from({ length: 11 }, (_, i): [number, number] => [i, i + 1]);
    const run = liftingTrace({ n: 12, edges, root: 0, ops: [{ kind: 'kth', a: 11, b: 11 }] });
    expect(run.results).toEqual([0]);
    expect(run.reads[0]).toEqual([
      [0, 11],
      [1, 10],
      [3, 8],
    ]);
  });
});

describe('parseLcaTree', () => {
  it('reads the edges, the root and the queries', () => {
    expect(parseLcaTree('0-1 0-2 1-3; root 2; lca 3 0, dist 3 2, kth 3 1')).toEqual({
      n: 4,
      edges: [
        [0, 1],
        [0, 2],
        [1, 3],
      ],
      root: 2,
      ops: [
        { kind: 'lca', a: 3, b: 0 },
        { kind: 'dist', a: 3, b: 2 },
        { kind: 'kth', a: 3, b: 1 },
      ],
    });
    expect(parseLcaTree('n 1; lca 0 0').n).toBe(1);
    expect(parseLcaTree('0-1; distance(0, 1), kth_ancestor(1, 1)').ops.map(formatLcaOp)).toEqual(['distance(0, 1)', 'kth_ancestor(1, 1)']);
  });

  it('refuses what is not a tree, too many nodes or queries, and unknown queries', () => {
    expect(() => parseLcaTree('0-1 1-2 2-0')).toThrow(InputError);
    expect(() => parseLcaTree('0-1 2-3')).toThrow(/not connected/);
    expect(() => parseLcaTree('0-1 1-2 2-3 3-4 4-5 5-6 6-7 7-8 8-9 9-10 10-11 11-12')).toThrow(/Up to 12 nodes/);
    expect(() => parseLcaTree('0-1; root 5')).toThrow(/ValueError/);
    expect(() => parseLcaTree('0-1; root 1; root 0')).toThrow(/only once/);
    expect(() => parseLcaTree('0-1; lca 0 1; root 1')).toThrow(/before the queries/);
    expect(() => parseLcaTree('0-1; path 0 1')).toThrow(/Cannot read/);
    expect(() => parseLcaTree('0-1; lca 0')).toThrow(/two numbers/);
    expect(() => parseLcaTree('0-1; lca 0 100')).toThrow(/up to 99/);
    expect(() => parseLcaTree(`0-1; ${Array.from({ length: 9 }, () => 'lca 0 1').join(', ')}`)).toThrow(/At most 8/);
  });
});
