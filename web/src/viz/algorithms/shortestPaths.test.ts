import { describe, expect, it } from 'vitest';
import type { Frame } from '../core/types';
import { InputError } from '../core/types';
import { parseGraph } from './graph';
import { SYM } from '../ui/symbols';
import fixtures from './__fixtures__/shortestPaths.json';
import { astarRun, bellmanFordRun, floydWarshallRun, formatMap, parseMap, type AStarMap } from './shortestPaths';

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

const letter = (i: number) => String.fromCharCode(65 + i);

function digraphText(edges: number[][], start = 0): string {
  return `${edges.map(([u, v, w]) => `${letter(u)}->${letter(v)} ${w}`).join(', ')}; start ${letter(start)}`;
}

function randomDigraph(rand: () => number): { text: string; n: number; edges: number[][]; start: number } {
  const n = 2 + Math.floor(rand() * 6);
  const edges: number[][] = [];
  const m = 1 + Math.floor(rand() * 2 * n);
  for (let k = 0; k < m; k++) {
    const u = Math.floor(rand() * n);
    const v = Math.floor(rand() * n);
    if (u === v) continue;
    const w = rand() < 0.3 ? -1 - Math.floor(rand() * 3) : Math.floor(rand() * 10);
    edges.push([u, v, w]);
  }
  if (!edges.length) edges.push([0, 1, 1]);
  const used = [...new Set(edges.flatMap((e) => [e[0], e[1]]))].sort((a, b) => a - b);
  const re = new Map(used.map((o, i) => [o, i]));
  const ren = edges.map(([u, v, w]) => [re.get(u)!, re.get(v)!, w]);
  const start = Math.floor(rand() * used.length);
  return { text: digraphText(ren, start), n: used.length, edges: ren, start };
}

/** Brute-force reference: V rounds of relaxation on the arc list. */
function refBellman(n: number, edges: number[][], start: number): number[] | null {
  const d = Array(n).fill(Infinity);
  d[start] = 0;
  for (let r = 0; r < n - 1; r++) for (const [u, v, w] of edges) if (d[u] + w < d[v]) d[v] = d[u] + w;
  for (const [u, v, w] of edges) if (d[u] + w < d[v]) return null;
  return d;
}

function refFloyd(n: number, edges: number[][]): number[][] | null {
  const d = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : Infinity)));
  for (const [u, v, w] of edges) d[u][v] = Math.min(d[u][v], w);
  for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (d[i][k] + d[k][j] < d[i][j]) d[i][j] = d[i][k] + d[k][j];
  return d.some((row, i) => row[i] < 0) ? null : d;
}

const nullInf = (x: number | null) => (x === null ? Infinity : x);

function wellFormed<S>(frames: Array<Frame<S>>, lines: number) {
  expect(frames.length).toBeGreaterThan(0);
  expect(frames.length).toBeLessThanOrEqual(2000);
  for (const f of frames) {
    expect(f.caption.length).toBeGreaterThan(8);
    if (f.line !== undefined) {
      expect(f.line).toBeGreaterThanOrEqual(0);
      expect(f.line).toBeLessThan(lines);
    }
  }
}

describe('Bellman-Ford tracer', () => {
  it('matches a brute-force reference on 200 random digraphs', () => {
    const rand = rng(11);
    for (let t = 0; t < 200; t++) {
      const { text, n, edges, start } = randomDigraph(rand);
      const g = parseGraph(text, { maxNodes: 8, maxEdges: 40 });
      const run = bellmanFordRun(g);
      const ref = refBellman(n, edges, start);
      expect(run.dist, text).toEqual(ref);
      wellFormed(run.frames, 7);
      const last = run.frames[run.frames.length - 1].state;
      if (ref) expect(last.nodes.map((nd) => nd.badge)).toEqual(ref.map((d) => (d === Infinity ? SYM.infinity : String(d))));
      else expect(last.nodes.some((nd) => nd.role === 'bad')).toBe(true);
    }
  });

  it('matches the Python reference (golden fixtures)', () => {
    const cases = fixtures.bellman as unknown as Array<{ n: number; edges: number[][]; start: number; dist: Array<number | null> | null }>;
    expect(cases.length).toBeGreaterThanOrEqual(100);
    for (const c of cases) {
      const g = parseGraph(digraphText(c.edges, c.start), { maxNodes: 8, maxEdges: 40 });
      expect(bellmanFordRun(g).dist).toEqual(c.dist === null ? null : c.dist.map(nullInf));
    }
  });

  it('detects the textbook negative cycle and shows the extra round', () => {
    const run = bellmanFordRun(parseGraph('A->B 1, B->C -3, C->B 1, C->D 2; start A'));
    expect(run.dist).toBeNull();
    expect(run.frames.some((f) => f.caption.includes('extra round'))).toBe(true);
  });

  it('treats a negative undirected edge as a negative cycle and unreachable nodes as infinity', () => {
    expect(bellmanFordRun(parseGraph('A-B -2; start A')).dist).toBeNull();
    expect(bellmanFordRun(parseGraph('A->B 2, C->D 1; start A')).dist).toEqual([0, 2, Infinity, Infinity]);
  });
});

describe('Floyd-Warshall tracer', () => {
  const toNum = (cells: Array<Array<number | string | null>>) => cells.map((row) => row.map((c) => (c === SYM.infinity ? Infinity : Number(c))));

  it('matches a brute-force reference on 200 random digraphs (parallel edges included)', () => {
    const rand = rng(23);
    for (let t = 0; t < 200; t++) {
      const { text, n, edges } = randomDigraph(rand);
      if (n > 6) continue;
      const run = floydWarshallRun(parseGraph(text, { maxNodes: 8, maxEdges: 40 }));
      expect(run.dist, text).toEqual(refFloyd(n, edges));
      wellFormed(run.frames, 6);
      if (run.dist) expect(toNum(run.frames[run.frames.length - 1].state.cells)).toEqual(run.dist);
    }
  });

  it('matches the Python reference (golden fixtures)', () => {
    const cases = fixtures.floyd as unknown as Array<{ n: number; edges: number[][]; dist: Array<Array<number | null>> | null }>;
    expect(cases.length).toBeGreaterThanOrEqual(100);
    for (const c of cases) {
      const g = parseGraph(digraphText(c.edges), { maxNodes: 8, maxEdges: 40 });
      const run = floydWarshallRun(g);
      expect(run.dist).toEqual(c.dist === null ? null : c.dist.map((row) => row.map(nullInf)));
    }
  });

  it('keeps the cheapest of parallel edges and flags a negative cycle', () => {
    expect(floydWarshallRun(parseGraph('A->B 7, A->B 3; start A')).dist).toEqual([[0, 3], [Infinity, 0]]);
    const run = floydWarshallRun(parseGraph('A->B 1, B->C -3, C->B 1, C->D 2; start A'));
    expect(run.dist).toBeNull();
  });

  it('highlights row k and column k at the start of each round', () => {
    const run = floydWarshallRun(parseGraph('A->B 1, B->C 2; start A'));
    const header = run.frames.find((f) => f.caption.startsWith('Round k = B'))!;
    expect(header.state.roles['1,0']).toBe('compare');
    expect(header.state.roles['0,1']).toBe('compare');
  });
});

describe('A* tracer', () => {
  /** Reference: Dijkstra on the grid by repeated relaxation. */
  function refCost(m: AStarMap): number | null {
    const d = Array(m.rows * m.cols).fill(Infinity);
    d[m.start] = 0;
    let moved = true;
    while (moved) {
      moved = false;
      for (let i = 0; i < d.length; i++) {
        if (d[i] === Infinity) continue;
        const r = Math.floor(i / m.cols);
        const c = i % m.cols;
        for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
          const r1 = r + dr;
          const c1 = c + dc;
          if (r1 < 0 || r1 >= m.rows || c1 < 0 || c1 >= m.cols) continue;
          const v = r1 * m.cols + c1;
          if (!m.wall[v] && d[i] + m.cost[v] < d[v]) {
            d[v] = d[i] + m.cost[v];
            moved = true;
          }
        }
      }
    }
    return d[m.goal] === Infinity ? null : d[m.goal];
  }

  function randomMap(rand: () => number): string {
    const rows = 2 + Math.floor(rand() * 7);
    const cols = 2 + Math.floor(rand() * 9);
    const cells = Array.from({ length: rows }, () => Array.from({ length: cols }, () => (rand() < 0.3 ? '#' : rand() < 0.2 ? String(2 + Math.floor(rand() * 8)) : '.')));
    const s = Math.floor(rand() * rows * cols);
    let gl = Math.floor(rand() * rows * cols);
    if (gl === s) gl = (s + 1) % (rows * cols);
    cells[Math.floor(s / cols)][s % cols] = 'S';
    cells[Math.floor(gl / cols)][gl % cols] = 'G';
    return cells.map((r) => r.join('')).join('/');
  }

  it('finds an optimal path on 200 random maps and every path is valid', () => {
    const rand = rng(31);
    for (let t = 0; t < 200; t++) {
      const text = randomMap(rand);
      const m = parseMap(text);
      const run = astarRun(m);
      expect(run.result?.cost ?? null, text).toBe(refCost(m));
      wellFormed(run.frames, 8);
      if (run.result) {
        const { path, cost } = run.result;
        expect(path[0]).toBe(m.start);
        expect(path[path.length - 1]).toBe(m.goal);
        let sum = 0;
        for (let k = 1; k < path.length; k++) {
          const dr = Math.abs(Math.floor(path[k] / m.cols) - Math.floor(path[k - 1] / m.cols));
          const dc = Math.abs((path[k] % m.cols) - (path[k - 1] % m.cols));
          expect(dr + dc).toBe(1);
          expect(m.wall[path[k]]).toBe(false);
          sum += m.cost[path[k]];
        }
        expect(sum).toBe(cost);
        const last = run.frames[run.frames.length - 1].state.cells;
        expect(last.filter((c) => c.role === 'done').length).toBe(path.length);
      }
    }
  });

  it('matches the Python reference, path included (golden fixtures)', () => {
    const cases = fixtures.astar as unknown as Array<{ map: string; result: { cost: number; path: number[] } | null }>;
    expect(cases.length).toBeGreaterThanOrEqual(100);
    for (const c of cases) {
      expect(astarRun(parseMap(c.map)).result, c.map).toEqual(c.result);
    }
  });

  it('reports a walled-off goal and parses / formats maps', () => {
    const run = astarRun(parseMap('S.#../..#../..#.G'));
    expect(run.result).toBeNull();
    expect(run.frames[run.frames.length - 1].caption).toContain('no path');
    expect(formatMap(parseMap('S.2/#.G'))).toBe('S.2/#.G');
  });

  it('rejects bad maps with friendly messages', () => {
    for (const bad of ['', 'S..', 'G..', 'S.G/..', 'SSG', 'S?G', 'S.G/S.G']) expect(() => parseMap(bad)).toThrow(InputError);
    expect(() => parseMap(Array(11).fill('S.G').join('/'))).toThrow(InputError);
  });
});


