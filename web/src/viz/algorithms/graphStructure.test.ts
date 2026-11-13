import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import fixtures from './__fixtures__/graphStructure.json';
import type { Graph } from './graph';
import { bridgesAndCutVertices, kosaraju, parseDigraph, parseUndirected, tarjanScc, topologicalSort, type GraphFrame } from './graphStructure';

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

const name = (i: number) => String.fromCharCode(65 + i);
const id = (v: string) => v.charCodeAt(0) - 65;

interface DiCase {
  n: number;
  edges: number[][];
  kahn: number[] | null;
  kosaraju: number[][];
  tarjan: number[][];
}
interface UnCase {
  n: number;
  edges: number[][];
  bridges: number[][];
  cuts: number[];
}
const digraphText = (edges: number[][]) => edges.map(([u, v]) => `${name(u)}->${name(v)}`).join(', ');
const undirectedText = (edges: number[][]) => edges.map(([u, v]) => `${name(u)}-${name(v)}`).join(', ');

function randomDigraphs(count: number, seed: number): number[][][] {
  const rand = rng(seed);
  const out: number[][][] = [];
  for (let t = 0; t < count; t++) {
    const n = 2 + Math.floor(rand() * 6);
    const pairs = new Set<string>();
    const dag = rand() < 0.5;
    for (let k = 0; k < 1 + Math.floor(rand() * 2 * n); k++) {
      let u = Math.floor(rand() * n);
      let v = Math.floor(rand() * n);
      if (u === v) continue;
      if (dag && u > v) [u, v] = [v, u];
      pairs.add(`${u},${v}`);
    }
    if (pairs.size === 0) pairs.add('0,1');
    out.push([...pairs].map((p) => p.split(',').map(Number)));
  }
  return out;
}

function randomMultigraphs(count: number, seed: number): number[][][] {
  const rand = rng(seed);
  const out: number[][][] = [];
  for (let t = 0; t < count; t++) {
    const n = 2 + Math.floor(rand() * 6);
    const edges: number[][] = [];
    for (let k = 0; k < 1 + Math.floor(rand() * 2 * n); k++) {
      const u = Math.floor(rand() * n);
      const v = Math.floor(rand() * n);
      if (u !== v) edges.push([u, v]);
    }
    if (edges.length === 0) edges.push([0, 1]);
    out.push(edges);
  }
  return out;
}

/** reach[u][v]: v reachable from u by a (possibly empty) directed path. */
function reachability(g: Graph): boolean[][] {
  const n = g.nodes.length;
  const r = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i === j));
  for (const e of g.edges) r[g.nodes.indexOf(e.from)][g.nodes.indexOf(e.to)] = true;
  for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (r[i][k] && r[k][j]) r[i][j] = true;
  return r;
}

function componentCount(n: number, edges: number[][], skipEdge = -1, skipVertex = -1): number {
  const label = Array.from({ length: n }, (_, i) => i);
  const find = (x: number): number => (label[x] === x ? x : (label[x] = find(label[x])));
  edges.forEach(([u, v], i) => {
    if (i === skipEdge || u === skipVertex || v === skipVertex) return;
    label[find(u)] = find(v);
  });
  const roots = new Set<number>();
  for (let v = 0; v < n; v++) if (v !== skipVertex) roots.add(find(v));
  return roots.size;
}

function checkFrames(frames: GraphFrame[]) {
  expect(frames.length).toBeGreaterThan(1);
  expect(frames.length).toBeLessThan(2000);
  for (const f of frames) {
    expect(f.caption.length).toBeGreaterThan(10);
    expect(f.state.nodes.length).toBeGreaterThan(0);
    if (f.line !== undefined) expect(f.line).toBeGreaterThanOrEqual(0);
  }
}

describe('topologicalSort (Kahn)', () => {
  it('matches brute force on random graphs', () => {
    for (const edges of randomDigraphs(150, 11)) {
      const g = parseDigraph(digraphText(edges));
      const run = topologicalSort(g);
      const reach = reachability(g);
      const n = g.nodes.length;
      let cyclic = false;
      for (const e of g.edges) if (reach[g.nodes.indexOf(e.to)][g.nodes.indexOf(e.from)]) cyclic = true;
      expect(run.cyclic).toBe(cyclic);
      checkFrames(run.frames);
      if (!cyclic) {
        expect([...run.order].sort()).toEqual([...g.nodes].sort());
        const pos = new Map(run.order.map((v, i) => [v, i]));
        for (const e of g.edges) expect(pos.get(e.from)!).toBeLessThan(pos.get(e.to)!);
        expect(run.stuck).toEqual([]);
      } else {
        // Placed vertices come first, the stuck ones are never placed, and the cycle is real.
        expect(run.order.length + run.stuck.length).toBe(n);
        expect(run.cycle.length).toBeGreaterThanOrEqual(3);
        expect(run.cycle[0]).toBe(run.cycle[run.cycle.length - 1]);
        for (let i = 0; i + 1 < run.cycle.length; i++) {
          expect(g.edges.some((e) => e.from === run.cycle[i] && e.to === run.cycle[i + 1])).toBe(true);
        }
      }
    }
  });

  it('handles the textbook DAG and a two-cycle', () => {
    expect(topologicalSort(parseDigraph('A->B, A->C, B->D, C->D')).order).toEqual(['A', 'B', 'C', 'D']);
    const run = topologicalSort(parseDigraph('A->B, B->A, B->C'));
    expect(run.cyclic).toBe(true);
    expect(run.order).toEqual([]);
    expect(run.stuck).toEqual(['A', 'B', 'C']);
  });

  it('rejects undirected edges with a friendly message', () => {
    expect(() => parseDigraph('A-B')).toThrow(InputError);
    expect(() => parseUndirected('A->B')).toThrow(InputError);
  });
});

describe('strongly connected components', () => {
  it('both algorithms equal the mutual-reachability partition', () => {
    for (const edges of randomDigraphs(150, 23).concat(randomMultigraphs(60, 5))) {
      const g = parseDigraph(digraphText(edges));
      const reach = reachability(g);
      const key = (comps: string[][]) => comps.map((c) => [...c].sort().join('')).sort();
      const expected = new Map<number, string[]>();
      g.nodes.forEach((v, i) => {
        const rep = g.nodes.findIndex((_w, j) => reach[i][j] && reach[j][i]);
        expected.set(rep, [...(expected.get(rep) ?? []), v]);
      });
      const want = key([...expected.values()]);
      const kos = kosaraju(g);
      const tar = tarjanScc(g);
      expect(key(kos.components)).toEqual(want);
      expect(key(tar.components)).toEqual(want);
      checkFrames(kos.frames);
      checkFrames(tar.frames);
      // Tarjan emits sinks first, Kosaraju sources first: no edge goes "backwards" between components.
      const idxOf = (comps: string[][]) => new Map(comps.flatMap((c, i) => c.map((v) => [v, i] as const)));
      const ti = idxOf(tar.components);
      const ki = idxOf(kos.components);
      for (const e of g.edges) {
        expect(ti.get(e.from)!).toBeGreaterThanOrEqual(ti.get(e.to)!);
        expect(ki.get(e.from)!).toBeLessThanOrEqual(ki.get(e.to)!);
      }
    }
  });

  it('textbook graph has three components', () => {
    const g = parseDigraph('A->B, B->C, C->A, B->D, D->E, E->F, F->D');
    expect(kosaraju(g).components.length).toBe(2);
    expect(tarjanScc(parseDigraph('A->B, B->C, C->A, C->D')).components).toEqual([['D'], ['C', 'B', 'A']]);
  });
});

describe('bridgesAndCutVertices', () => {
  it('matches brute-force edge and vertex deletion on random multigraphs', () => {
    for (const edges of randomMultigraphs(200, 31)) {
      const g = parseUndirected(undirectedText(edges));
      const run = bridgesAndCutVertices(g);
      const n = g.nodes.length;
      const ge = g.edges.map((e) => [g.nodes.indexOf(e.from), g.nodes.indexOf(e.to)]);
      const base = componentCount(n, ge);
      const bridges: string[] = [];
      ge.forEach(([u, v], i) => {
        if (componentCount(n, ge, i) > base) bridges.push([g.nodes[u], g.nodes[v]].sort().join('-'));
      });
      const cuts: string[] = [];
      for (let v = 0; v < n; v++) {
        const isolated = ge.every(([a, b]) => a !== v && b !== v);
        if (isolated) continue;
        if (componentCount(n, ge, -1, v) > base) cuts.push(g.nodes[v]);
      }
      expect(run.bridges.map((b) => b.join('-')).sort()).toEqual(bridges.sort());
      expect(run.cutVertices).toEqual(cuts);
      checkFrames(run.frames);
    }
  });

  it('a doubled edge is not a bridge, a single edge is', () => {
    expect(bridgesAndCutVertices(parseUndirected('A-B, A-B')).bridges).toEqual([]);
    expect(bridgesAndCutVertices(parseUndirected('A-B')).bridges).toEqual([['A', 'B']]);
    const run = bridgesAndCutVertices(parseUndirected('A-B, B-C, C-A, C-D'));
    expect(run.bridges).toEqual([['C', 'D']]);
    expect(run.cutVertices).toEqual(['C']);
  });
});

describe('golden fixtures (Python reference)', () => {
  const di = fixtures.digraph as unknown as DiCase[];
  const un = fixtures.undirected as unknown as UnCase[];

  it('has enough cases', () => {
    expect(di.length).toBeGreaterThanOrEqual(100);
    expect(un.length).toBeGreaterThanOrEqual(100);
  });

  it("Kahn's order, Kosaraju and Tarjan components match step for step", () => {
    for (const c of di) {
      const g = parseDigraph(digraphText(c.edges));
      const topo = topologicalSort(g);
      if (c.kahn === null) expect(topo.cyclic).toBe(true);
      else expect(topo.order.map(id)).toEqual(c.kahn);
      expect(kosaraju(g).components.map((comp) => comp.map(id))).toEqual(c.kosaraju);
      expect(tarjanScc(g).components.map((comp) => comp.map(id))).toEqual(c.tarjan);
    }
  });

  it('bridges and cut vertices match', () => {
    for (const c of un) {
      const run = bridgesAndCutVertices(parseUndirected(undirectedText(c.edges)));
      expect(run.bridges.map((b) => b.map(id))).toEqual(c.bridges);
      expect(run.cutVertices.map(id)).toEqual(c.cuts);
    }
  });
});
