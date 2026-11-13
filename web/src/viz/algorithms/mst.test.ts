import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import fixtures from './__fixtures__/greedy.json';
import type { Graph } from './graph';
import { kruskalRun, parseMstGraph, primRun, type MstRun } from './mst';

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

/** Random undirected graphs (one edge per pair), sometimes disconnected, weights -5..12 so ties are common. */
function randomGraphs(count: number, seed: number): Graph[] {
  const rand = rng(seed);
  const out: Graph[] = [];
  for (let t = 0; t < count; t++) {
    const n = 2 + Math.floor(rand() * 6);
    const names = Array.from({ length: n }, (_, i) => String.fromCharCode(65 + i));
    const pairs = new Set<string>();
    const parts: string[] = [];
    const m = 1 + Math.floor(rand() * 10);
    for (let k = 0; k < m; k++) {
      const a = names[Math.floor(rand() * n)];
      const b = names[Math.floor(rand() * n)];
      const key = [a, b].sort().join('');
      if (a === b || pairs.has(key)) continue;
      pairs.add(key);
      parts.push(`${a}-${b} ${Math.floor(rand() * 18) - 5}`);
    }
    if (parts.length === 0) parts.push('A-B 1');
    const g = parseMstGraph(parts.join(', '));
    const start = g.nodes[Math.floor(rand() * g.nodes.length)];
    out.push(parseMstGraph(`${parts.join(', ')}; start ${start}`));
  }
  return out;
}

class Dsu {
  parent: number[];
  constructor(n: number) {
    this.parent = Array.from({ length: n }, (_, i) => i);
  }
  find(x: number): number {
    while (this.parent[x] !== x) x = this.parent[x];
    return x;
  }
  union(a: number, b: number): boolean {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra === rb) return false;
    this.parent[ra] = rb;
    return true;
  }
}

/** Exhaustive minimum spanning forest weight over the vertices in `keep` (all by default). */
function bruteForceForest(g: Graph, keep?: Set<string>): { weight: number; edges: number } {
  const idx = new Map(g.nodes.map((v, i) => [v, i]));
  const edges = g.edges.filter((e) => !keep || (keep.has(e.from) && keep.has(e.to)));
  const verts = keep ? keep.size : g.nodes.length;
  const comp = new Dsu(g.nodes.length);
  for (const e of edges) comp.union(idx.get(e.from)!, idx.get(e.to)!);
  const components = new Set(g.nodes.filter((v) => !keep || keep.has(v)).map((v) => comp.find(idx.get(v)!))).size;
  const need = verts - components;
  let best = Infinity;
  for (let mask = 0; mask < 1 << edges.length; mask++) {
    let bits = 0;
    for (let k = mask; k; k &= k - 1) bits++;
    if (bits !== need) continue;
    const dsu = new Dsu(g.nodes.length);
    let weight = 0;
    let acyclic = true;
    edges.forEach((e, k) => {
      if (!(mask & (1 << k))) return;
      if (!dsu.union(idx.get(e.from)!, idx.get(e.to)!)) acyclic = false;
      weight += e.weight;
    });
    if (acyclic) best = Math.min(best, weight);
  }
  return { weight: best, edges: need };
}

function reachable(g: Graph): Set<string> {
  const seen = new Set([g.start]);
  const stack = [g.start];
  while (stack.length) {
    const u = stack.pop()!;
    for (const e of g.edges) {
      const v = e.from === u ? e.to : e.to === u ? e.from : null;
      if (v && !seen.has(v)) {
        seen.add(v);
        stack.push(v);
      }
    }
  }
  return seen;
}

function expectAcyclicSubset(g: Graph, run: MstRun) {
  const idx = new Map(g.nodes.map((v, i) => [v, i]));
  const dsu = new Dsu(g.nodes.length);
  for (const e of run.mst) {
    expect(g.edges.some((x) => x.weight === e.weight && [x.from, x.to].sort().join() === [e.from, e.to].sort().join())).toBe(true);
    expect(dsu.union(idx.get(e.from)!, idx.get(e.to)!)).toBe(true);
  }
  expect(run.total).toBe(run.mst.reduce((s, e) => s + e.weight, 0));
}

function expectWellFormed(run: MstRun, pseudocodeLines: number) {
  expect(run.frames.length).toBeGreaterThan(2);
  expect(run.frames.length).toBeLessThan(2000);
  for (const f of run.frames) {
    expect(f.caption.length).toBeGreaterThan(0);
    if (f.line !== undefined) expect(f.line).toBeLessThan(pseudocodeLines);
  }
  // The last frame draws exactly the tree edges as "done".
  const last = run.frames[run.frames.length - 1].state;
  const drawn = last.edges.filter((e) => e.role === 'done').map((e) => [e.from, e.to].sort().join('-')).sort();
  expect(drawn).toEqual(run.mst.map((e) => [e.from, e.to].sort().join('-')).sort());
}

describe('parseMstGraph', () => {
  it('reads an undirected weighted graph with a start vertex', () => {
    const g = parseMstGraph('A-B 4, B-C -2, C-A 3; start B');
    expect(g.nodes).toEqual(['A', 'B', 'C']);
    expect(g.start).toBe('B');
    expect(g.edges[1]).toMatchObject({ from: 'B', to: 'C', weight: -2, directed: false });
  });
  it.each(['A->B 3', 'A-B 1, B-A 2', 'A-B 1000', '', 'A-A 1'])('rejects %j with a friendly message', (bad) => {
    expect(() => parseMstGraph(bad)).toThrow(InputError);
  });
});

describe('Kruskal', () => {
  const graphs = randomGraphs(300, 11);
  it('finds a minimum spanning forest (exhaustive search on 300 random graphs, negative weights and ties included)', () => {
    for (const g of graphs) {
      const run = kruskalRun(g);
      const best = bruteForceForest(g);
      expect(run.total).toBe(best.weight);
      expect(run.mst.length).toBe(best.edges);
      expectAcyclicSubset(g, run);
      expectWellFormed(run, 7);
    }
  });
  it('stops as soon as the tree has V-1 edges', () => {
    const run = kruskalRun(parseMstGraph('A-B 1, B-C 2, A-C 3, C-D 9'));
    expect(run.mst.map((e) => `${e.from}${e.to}`)).toEqual(['AB', 'BC', 'CD']);
    expect(run.frames.some((f) => f.line === 5)).toBe(true);
    expect(run.frames.filter((f) => f.line === 6).length).toBe(1); // A-C rejected, nothing after C-D
  });
  it('solves the CLRS example (weight 37)', () => {
    const g = parseMstGraph('A-B 4, A-H 8, B-C 8, B-H 11, C-D 7, C-F 4, C-I 2, D-E 9, D-F 14, E-F 10, F-G 2, G-H 1, G-I 6, H-I 7');
    expect(kruskalRun(g).total).toBe(37);
    expect(primRun(g).total).toBe(37);
  });
});

describe('Prim', () => {
  const graphs = randomGraphs(300, 23);
  it("finds a minimum spanning tree of the start vertex's component (exhaustive search)", () => {
    for (const g of graphs) {
      const run = primRun(g);
      const comp = reachable(g);
      const best = bruteForceForest(g, comp);
      expect(run.total).toBe(best.weight);
      expect(run.mst.length).toBe(comp.size - 1);
      expectAcyclicSubset(g, run);
      expectWellFormed(run, 7);
    }
  });
  it('agrees with Kruskal on connected graphs', () => {
    for (const g of graphs) {
      if (reachable(g).size === g.nodes.length) expect(primRun(g).total).toBe(kruskalRun(g).total);
    }
  });
  it('keeps negative edges (the bug fixed in prim_mst_adjacency_matrix)', () => {
    const run = primRun(parseMstGraph('A-B -4'));
    expect(run.mst).toEqual([{ from: 'A', to: 'B', weight: -4 }]);
    expect(run.total).toBe(-4);
  });
});

interface MstCase {
  n: number;
  edges: Array<[number, number, number]>;
  start: number;
  kruskal: Array<[number, number, number]>;
  kruskal_total: number;
  prim: Array<[number, number, number]>;
  prim_total: number;
}

describe('MST tracers match the Python reference (golden fixtures)', () => {
  const cases = fixtures.mst as unknown as MstCase[];
  const asTuples = (run: MstRun) => run.mst.map((e) => [Number(e.from), Number(e.to), e.weight]);
  it('has fixtures to check', () => expect(cases.length).toBeGreaterThanOrEqual(100));
  it('reproduces kruskal_mst and prim_mst_edge_list exactly, edge order and orientation included', () => {
    for (const c of cases) {
      const g = parseMstGraph(`${c.edges.map(([u, v, w]) => `${u}-${v} ${w}`).join(', ')}; start ${c.start}`);
      expect(g.nodes).toEqual(Array.from({ length: c.n }, (_, i) => String(i)));
      const k = kruskalRun(g);
      expect(asTuples(k)).toEqual(c.kruskal);
      expect(k.total).toBe(c.kruskal_total);
      const p = primRun(g);
      expect(asTuples(p)).toEqual(c.prim);
      expect(p.total).toBe(c.prim_total);
    }
  });
});
