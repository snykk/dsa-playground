import { describe, expect, it } from 'vitest';
import { InputError, type Frame } from '../core/types';
import { stabilizeBoard, type BoardState } from '../renderers/BoardView';
import type { GraphState } from '../renderers/GraphView';
import { bfsShortestPathSpec, dfsExplicitStackSpec, topologicalSortEdgesSpec } from '../specs/patternsMore';
import {
  BFS_CODE,
  edgeNodeCollisions,
  bfsShortestTrace,
  DFS_CODE,
  dfsStackTrace,
  ISLANDS_CODE,
  islandsTrace,
  parseAdjGraph,
  parseGrid,
  parseTopo,
  TOPO_CODE,
  topoTrace,
  type AdjGraph,
} from './graphTraversalProblems';
import { expectFramesWellFormed, FIXTURES, rng } from './patternsMoreTestKit';

function expectGraphWellFormed(frames: Array<Frame<GraphState>>, codeLines: number) {
  expectFramesWellFormed(frames, codeLines);
  for (const f of frames) {
    const ids = new Set(f.state.nodes.map((n) => n.id));
    expect(ids.size, f.caption).toBe(f.state.nodes.length);
    for (const e of f.state.edges) {
      expect(ids.has(e.from), f.caption).toBe(true);
      expect(ids.has(e.to), f.caption).toBe(true);
    }
  }
}

function expectBoardWellFormed(frames: Array<Frame<BoardState>>, codeLines: number) {
  expectFramesWellFormed(frames, codeLines);
  for (const f of stabilizeBoard(frames)) {
    expect(f.state.cells.length).toBe(f.state.rows);
    for (const row of f.state.cells) expect(row.length).toBe(f.state.cols);
    expect(f.state.stack.length, f.caption).toBeLessThanOrEqual(11);
    if (f.state.cursor) {
      expect(f.state.cursor.r).toBeLessThan(f.state.rows);
      expect(f.state.cursor.c).toBeLessThan(f.state.cols);
    }
  }
}

/** Reference: islands by union of 4-neighbours, counted with a plain recursive flood fill. */
function countIslands(rows: string[]): number {
  const seen = rows.map((r) => r.split('').map(() => false));
  const fill = (r: number, c: number): void => {
    if (r < 0 || c < 0 || r >= rows.length || c >= rows[0].length || seen[r][c] || rows[r][c] !== '1') return;
    seen[r][c] = true;
    fill(r + 1, c);
    fill(r - 1, c);
    fill(r, c + 1);
    fill(r, c - 1);
  };
  let k = 0;
  rows.forEach((row, r) =>
    row.split('').forEach((ch, c) => {
      if (ch === '1' && !seen[r][c]) {
        k += 1;
        fill(r, c);
      }
    }),
  );
  return k;
}

/** Reference distances: Bellman-Ford style relaxation with unit weights. */
function hopDistance(g: AdjGraph, s: number, t: number): number {
  const keys = new Map(g.adj);
  if (!keys.has(s)) return -1;
  const dist = new Map<number, number>([[s, 0]]);
  for (let round = 0; round < 12; round++) {
    for (const [u, vs] of g.adj) {
      if (!dist.has(u)) continue;
      for (const v of vs) if (!dist.has(v) || dist.get(v)! > dist.get(u)! + 1) dist.set(v, dist.get(u)! + 1);
    }
  }
  return dist.get(t) ?? -1;
}

/** Reference: Python's dfs_recursive. */
function dfsRecursive(g: AdjGraph, s: number): number[] {
  const keys = new Map(g.adj);
  const seen = new Set<number>();
  const out: number[] = [];
  const go = (u: number) => {
    seen.add(u);
    out.push(u);
    for (const v of keys.get(u) ?? []) if (!seen.has(v)) go(v);
  };
  if (keys.has(s)) go(s);
  return out;
}

function randomGraph(r: ReturnType<typeof rng>): AdjGraph {
  const ids = Array.from({ length: r.int(2, 8) }, () => r.int(0, 20)).filter((v, i, a) => a.indexOf(v) === i);
  const adj: Array<[number, number[]]> = ids.slice(0, Math.max(1, ids.length - r.int(0, 2))).map((u) => [u, ids.filter((v) => v !== u && r() < 0.4)]);
  return { adj, start: r.pick(adj)[0], target: r.pick(ids) };
}

describe('islandsTrace (num_islands)', () => {
  it('reproduces every golden island start, every stack before a pop, the count and the sunk grid', () => {
    const cases = FIXTURES.islands as Array<{ grid: string[]; starts: Array<[number, number]>; stacks: Array<Array<[number, number]>>; result: number; after: string[] }>;
    expect(cases.length).toBeGreaterThanOrEqual(40);
    for (const c of cases) {
      const run = islandsTrace(c.grid);
      expect(run.starts, c.grid.join('/')).toEqual(c.starts);
      expect(run.stacks).toEqual(c.stacks);
      expect(run.result).toBe(c.result);
      expect(run.after).toEqual(c.after);
    }
  });

  it('agrees with a recursive flood fill on random grids, within the frame budget', () => {
    const r = rng(71);
    for (let t = 0; t < 120; t++) {
      const rows = Array.from({ length: r.int(1, 8) }, () => '');
      const cols = r.int(1, 10);
      const p = r.pick([0.3, 0.55, 0.8]);
      for (let i = 0; i < rows.length; i++) rows[i] = Array.from({ length: cols }, () => (r() < p ? '1' : '0')).join('');
      const run = islandsTrace(rows);
      expect(run.result).toBe(countIslands(rows));
      expectBoardWellFormed(run.frames, ISLANDS_CODE.length);
      expect(run.frames.length).toBeLessThan(2000);
    }
    expect(islandsTrace([]).result).toBe(0);
    expect(islandsTrace(Array.from({ length: 8 }, () => '1111111111')).frames.length).toBeLessThan(400);
  });
});

describe('bfsShortestTrace (bfs_shortest_path)', () => {
  it('reproduces every golden dequeue and result', () => {
    const cases = FIXTURES.bfs as Array<{ graph: Array<[number, number[]]>; start: number; target: number; pops: Array<[number, number]>; result: number }>;
    expect(cases.length).toBeGreaterThanOrEqual(50);
    for (const c of cases) {
      const run = bfsShortestTrace({ adj: c.graph, start: c.start, target: c.target });
      expect(run.pops, JSON.stringify(c)).toEqual(c.pops);
      expect(run.result).toBe(c.result);
    }
  });

  it('finds the fewest hops on random graphs (sinks included)', () => {
    const r = rng(72);
    for (let t = 0; t < 200; t++) {
      const g = randomGraph(r);
      const run = bfsShortestTrace(g);
      expect(run.result, JSON.stringify(g)).toBe(g.start === g.target ? 0 : hopDistance(g, g.start, g.target!));
      expectGraphWellFormed(run.frames, BFS_CODE.length);
    }
  });
});

describe('dfsStackTrace (get_dfs_traversal)', () => {
  it('reproduces every golden stack and order, which equals dfs_recursive', () => {
    const cases = FIXTURES.dfs as Array<{ graph: Array<[number, number[]]>; start: number; stacks: number[][]; result: number[]; recursive?: number[] }>;
    expect(cases.length).toBeGreaterThanOrEqual(50);
    for (const c of cases) {
      const run = dfsStackTrace({ adj: c.graph, start: c.start });
      expect(run.stacks, JSON.stringify(c)).toEqual(c.stacks);
      expect(run.result).toEqual(c.result);
      if (c.recursive) expect(run.result).toEqual(c.recursive);
    }
  });

  it('matches the recursive DFS on random graphs', () => {
    const r = rng(73);
    for (let t = 0; t < 200; t++) {
      const g = randomGraph(r);
      const run = dfsStackTrace(g);
      expect(run.result).toEqual(dfsRecursive(g, g.start));
      expectGraphWellFormed(run.frames, DFS_CODE.length);
    }
  });
});

describe('topoTrace (topological_sort)', () => {
  it('reproduces every golden in-degree list, order, result and KeyError', () => {
    const cases = FIXTURES.topo as Array<{ n: number; edges: Array<[number, number]>; indegree?: number[]; taken?: number[]; result?: number[]; error?: string }>;
    expect(cases.length).toBeGreaterThanOrEqual(50);
    for (const c of cases) {
      const run = topoTrace({ n: c.n, edges: c.edges });
      const label = JSON.stringify(c);
      expect(run.error, label).toBe(c.error);
      expect(run.result, label).toEqual(c.result);
      expect(run.indegree, label).toEqual(c.indegree);
      expect(run.taken.length ? run.taken : undefined, label).toEqual(c.taken);
    }
  });

  it('returns an order that respects every edge, or [] exactly when there is a cycle', () => {
    const r = rng(74);
    for (let t = 0; t < 200; t++) {
      const n = r.int(1, 10);
      const edges: Array<[number, number]> = [];
      for (let k = r.int(0, 14); k > 0; k--) {
        const u = r.int(0, n - 1);
        const v = r.int(0, n - 1);
        if (u !== v) edges.push(r() < 0.8 ? [Math.min(u, v), Math.max(u, v)] : [u, v]);
      }
      const run = topoTrace({ n, edges });
      // Reference cycle test: repeatedly remove nodes without incoming edges.
      const alive = new Set(Array.from({ length: n }, (_, v) => v));
      let changed = true;
      while (changed) {
        changed = false;
        for (const v of [...alive]) {
          if (!edges.some(([a, b]) => b === v && alive.has(a))) {
            alive.delete(v);
            changed = true;
          }
        }
      }
      if (alive.size) expect(run.result).toEqual([]);
      else {
        const at = new Map(run.result!.map((v, i) => [v, i]));
        expect(run.result!.length).toBe(n);
        for (const [u, v] of edges) expect(at.get(u)!).toBeLessThan(at.get(v)!);
      }
      expectGraphWellFormed(run.frames, TOPO_CODE.length);
    }
  });
});

describe('graph layouts', () => {
  it('draw the BFS and DFS examples without an edge crossing a node it does not touch', () => {
    for (const spec of [bfsShortestPathSpec, dfsExplicitStackSpec]) {
      for (const ex of spec.examples) {
        const state = spec.trace(spec.parse(ex.value))[0].state;
        const pos = new Map(state.nodes.map((nd) => [nd.id, { x: nd.x, y: nd.y }]));
        const edges = state.edges.map((e) => [Number(e.from), Number(e.to)] as [number, number]);
        expect(edgeNodeCollisions(pos, edges), `${spec.id}: ${ex.label}`).toBe(0);
      }
    }
  });

  it('draw every Kahn example without an edge crossing a node it does not touch', () => {
    for (const ex of topologicalSortEdgesSpec.examples) {
      const input = parseTopo(ex.value);
      const state = topoTrace(input).frames[0].state;
      const pos = new Map(state.nodes.map((nd) => [nd.id, { x: nd.x, y: nd.y }]));
      const edges = state.edges.map((e) => [Number(e.from), Number(e.to)] as [number, number]);
      expect(edgeNodeCollisions(pos, edges), ex.label).toBe(0);
      for (const p of pos.values()) {
        expect(p.x >= 20 && p.x <= 580 && p.y >= 20 && p.y <= 360, ex.label).toBe(true);
      }
    }
  });
});

describe('parsers', () => {
  it('read grids, adjacency dicts and edge lists', () => {
    expect(parseGrid('11000, 11000\n00100')).toEqual(['11000', '11000', '00100']);
    expect(parseGrid('')).toEqual([]);
    expect(parseAdjGraph('0: 1 2; 1: [0, 3]; 3:; start 0; target 3', true)).toEqual({
      adj: [
        [0, [1, 2]],
        [1, [0, 3]],
        [3, []],
      ],
      start: 0,
      target: 3,
    });
    expect(parseTopo('n 4; 1->0, 2->0, 3 1')).toEqual({ n: 4, edges: [[1, 0], [2, 0], [3, 1]] });
    expect(parseTopo('n 0')).toEqual({ n: 0, edges: [] });
  });

  it('give friendly errors', () => {
    expect(() => parseGrid('1102')).toThrow(InputError);
    expect(() => parseGrid('110, 11')).toThrow(/same length/);
    expect(() => parseGrid(Array.from({ length: 9 }, () => '1').join(','))).toThrow(/At most 8 rows/);
    expect(() => parseGrid('11111111111')).toThrow(/At most 10 columns/);
    expect(() => parseAdjGraph('0: 1; start 0', true)).toThrow(/target/);
    expect(() => parseAdjGraph('0: 1; target 1', true)).toThrow(/start/);
    expect(() => parseAdjGraph('0: 1; 0: 2; start 0', false)).toThrow(/twice/);
    expect(() => parseAdjGraph('0: 0; start 0', false)).toThrow(/self-loop/);
    expect(() => parseAdjGraph('0 1; start 0', false)).toThrow(/Cannot read/);
    expect(() => parseAdjGraph('0: 100; start 0', false)).toThrow(/0 to 99/);
    expect(() => parseTopo('1->0')).toThrow(/number of nodes/);
    expect(() => parseTopo('n 3; 1->1')).toThrow(/self-loop/);
    expect(() => parseTopo('n 11')).toThrow(/-3 to 10/);
  });
});
