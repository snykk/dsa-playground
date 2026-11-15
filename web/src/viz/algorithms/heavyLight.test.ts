import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { adjacency, HLD_CODE, hldTrace, parseHld, parseTreeShape, type HldOp, type HldResult } from './heavyLight';
import { expectTreeFramesWellFormed, randomTree } from './treeDecompositionTestKit';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/specializedTechniques.json', import.meta.url), 'utf8'));

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

/** Naive tree facts: parent and depth from the root, and the u-v path. */
function naive(n: number, edges: Array<[number, number]>, root: number) {
  const adj = adjacency(n, edges);
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
  const ancestors = (x: number) => {
    const out = [x];
    while (parent[x] !== -1) out.push((x = parent[x]));
    return out;
  };
  const lca = (u: number, v: number) => {
    const av = new Set(ancestors(v));
    return ancestors(u).find((a) => av.has(a))!;
  };
  const path = (u: number, v: number) => {
    const w = lca(u, v);
    const up = (x: number) => {
      const out: number[] = [];
      for (; x !== w; x = parent[x]) out.push(x);
      return out;
    };
    return new Set([...up(u), ...up(v), w]);
  };
  const subtree = (u: number) => order.filter((x) => ancestors(x).includes(u));
  return { parent, depth, lca, path, subtree, adj };
}

describe('hldTrace matches heavy_light_decomposition.py (golden fixtures)', () => {
  const cases = fixtures.heavyLight as Array<{
    n: number;
    edges: Array<[number, number]>;
    root: number;
    parent: number[];
    depth: number[];
    size: number[];
    heavy: number[];
    head: number[];
    pos: number[];
    sizeWrites: Array<[number, number]>;
    posOrder: number[];
    ops: Array<[string, number, number]>;
    results: HldResult[];
  }>;

  it('every array after build, the order of the size writes and positions, and every lca and query_path result', () => {
    expect(cases.length).toBeGreaterThanOrEqual(40);
    for (const c of cases) {
      const ops: HldOp[] = c.ops.map(([kind, u, v]) => ({ kind: kind as HldOp['kind'], u, v }));
      const run = hldTrace({ n: c.n, edges: c.edges, root: c.root, ops });
      const where = `${JSON.stringify(c.edges)} root ${c.root}`;
      expect(run.parent, where).toEqual(c.parent);
      expect(run.depth, where).toEqual(c.depth);
      expect(run.size, where).toEqual(c.size);
      expect(run.heavy, where).toEqual(c.heavy);
      expect(run.head, where).toEqual(c.head);
      expect(run.pos, where).toEqual(c.pos);
      expect(run.sizeWrites, where).toEqual(c.sizeWrites);
      expect(run.posOrder, where).toEqual(c.posOrder);
      expect(run.results, where).toEqual(c.results);
    }
  });
});

describe('hldTrace against a naive tree', () => {
  it('lca, path segments, heavy children, contiguous chains and subtrees on random trees', () => {
    const rand = rng(23);
    for (let t = 0; t < 150; t++) {
      const n = 1 + Math.floor(rand() * 16);
      const edges = randomTree(rand, n);
      const root = Math.floor(rand() * n);
      const ops: HldOp[] = Array.from({ length: 6 }, (_, k) => ({ kind: k % 2 ? 'path' : 'lca', u: Math.floor(rand() * n), v: Math.floor(rand() * n) }));
      const run = hldTrace({ n, edges, root, ops });
      const ref = naive(n, edges, root);
      expect(run.parent).toEqual(ref.parent);
      expect(run.depth).toEqual(ref.depth);
      expect([...run.pos].sort((a, b) => a - b)).toEqual(Array.from({ length: n }, (_, i) => i));
      for (let u = 0; u < n; u++) {
        const sub = ref.subtree(u);
        expect(run.size[u]).toBe(sub.length);
        // Heavy-first numbering: the subtree of u is pos[u] .. pos[u] + size[u] - 1.
        expect(sub.map((x) => run.pos[x]).sort((a, b) => a - b)).toEqual(Array.from({ length: sub.length }, (_, i) => run.pos[u] + i));
        const kids = ref.adj[u].filter((v) => v !== ref.parent[u]);
        if (kids.length === 0) expect(run.heavy[u]).toBe(-1);
        else {
          const best = Math.max(...kids.map((v) => run.size[v]));
          expect(run.heavy[u]).toBe(kids.find((v) => run.size[v] === best));
          expect(run.head[run.heavy[u]]).toBe(run.head[u]);
          expect(run.pos[run.heavy[u]]).toBe(run.pos[u] + 1);
        }
      }
      ops.forEach((op, i) => {
        const res = run.results[i];
        if (op.kind === 'lca') expect(res).toBe(ref.lca(op.u, op.v));
        else {
          const covered = new Set<number>();
          for (const [lo, hi] of res as Array<[number, number]>) {
            expect(lo).toBeLessThanOrEqual(hi);
            for (let p = lo; p <= hi; p++) covered.add(p);
          }
          expect(covered).toEqual(new Set([...ref.path(op.u, op.v)].map((x) => run.pos[x])));
          // At most one segment per chain on each side, and a path to the root crosses at most floor(log2 n) + 1 chains.
          expect((res as unknown[]).length).toBeLessThanOrEqual(2 * (Math.floor(Math.log2(n)) + 1));
        }
      });
      expectTreeFramesWellFormed(run.frames, HLD_CODE.length);
    }
  });
});

describe('hldTrace scenarios', () => {
  it('the article tree: heads, positions, lca(3, 6) = 1 and query_path(3, 6) = [(4, 4), (1, 3)]', () => {
    const run = hldTrace(parseHld('0-1 0-2 1-3 1-4 2-5 4-6; lca 3 6, path 3 6'));
    expect(run.head).toEqual([0, 0, 2, 3, 0, 2, 0]);
    expect(run.pos).toEqual([0, 1, 5, 4, 2, 6, 3]);
    expect(run.results).toEqual([
      1,
      [
        [4, 4],
        [1, 3],
      ],
    ]);
    const last = run.frames[run.frames.length - 1].state;
    expect(last.trees[0].chains!.map((c) => c.nodes)).toEqual([['0', '1', '4', '6'], ['3'], ['2', '5']]);
    expect(last.row!.groups!.map((g) => [g.lo, g.hi, g.label])).toEqual([
      [0, 3, 'h0'],
      [4, 4, 'h3'],
      [5, 6, 'h2'],
    ]);
  });

  it('the pointer u glides up one chain per jump', () => {
    const run = hldTrace(parseHld('0-1 0-2 1-3 1-4 2-5 4-6; lca 3 6'));
    const spots = run.frames.filter((f) => f.state.pills?.length).map((f) => f.state.pills!.find((p) => p.name === 'u')!.at);
    expect(spots[0]).toBe('t/3');
    expect(spots).toContain('t/1');
  });

  it('a node that does not exist raises IndexError and the run continues', () => {
    const run = hldTrace(parseHld('0-1 0-2 0-3; lca 2 9, path 1 3'));
    expect(run.results).toEqual([
      'IndexError',
      [
        [3, 3],
        [0, 1],
      ],
    ]);
    expect(run.frames.some((f) => f.caption.includes('raises IndexError'))).toBe(true);
  });

  it('a single node', () => {
    const run = hldTrace(parseHld('n 1; lca 0 0, path 0 0'));
    expect(run.results).toEqual([0, [[0, 0]]]);
  });

  it('stays well under 2000 frames on the largest input', () => {
    const path = Array.from({ length: 15 }, (_, i) => `${i}-${i + 1}`).join(' ');
    const run = hldTrace(parseHld(`${path}; root 7; ${Array.from({ length: 8 }, () => 'path 0 15').join(', ')}`));
    expect(run.frames.length).toBeLessThan(400);
  });
});

describe('parseHld and parseTreeShape', () => {
  it('reads the edges, the root and the operations', () => {
    expect(parseHld('0-1, 1 - 2; root 2; lca 0 2, query_path 1 0')).toEqual({
      n: 3,
      edges: [
        [0, 1],
        [1, 2],
      ],
      root: 2,
      ops: [
        { kind: 'lca', u: 0, v: 2 },
        { kind: 'path', u: 1, v: 0 },
      ],
    });
    expect(parseTreeShape('n 1')).toEqual({ n: 1, edges: [] });
  });

  it('gives friendly errors', () => {
    expect(() => parseTreeShape('')).toThrow(InputError);
    expect(() => parseTreeShape('n 3')).toThrow(/not a tree/);
    expect(() => parseTreeShape('0-1 1-1')).toThrow(/itself/);
    expect(() => parseTreeShape('0-1 1-0')).toThrow(/twice/);
    expect(() => parseTreeShape('0-1 1-2 2-0')).toThrow(/cycle/);
    expect(() => parseTreeShape('0-1 2-3')).toThrow(/not connected/);
    expect(() => parseTreeShape('0-1 1-3')).toThrow(/not connected/);
    expect(() => parseTreeShape('0-16')).toThrow(/0 to 15/);
    expect(() => parseTreeShape('0:1')).toThrow(/dash/);
    expect(() => parseHld('0-1; root 2')).toThrow(/IndexError/);
    expect(() => parseHld('0-1; lca 0 1, root 1')).toThrow(/first/);
    expect(() => parseHld('0-1; lca 0')).toThrow(/two nodes/);
    expect(() => parseHld('0-1; up 0 1')).toThrow(/Cannot read/);
  });
});
