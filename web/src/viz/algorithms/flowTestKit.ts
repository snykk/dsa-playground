/**
 * Shared by the Ford-Fulkerson and Edmonds-Karp tests: a seeded generator, random networks,
 * a brute-force minimum cut, the checks every flow run must pass, the frame checks, and the
 * golden fixture cases written by web/scripts/gen_advancedGraph_fixtures.py.
 */
import { readFileSync } from 'node:fs';
import { expect } from 'vitest';
import { FlowNet, parseFlow, type FlowFrame, type FlowInput, type FlowRun, type Residual } from './flowNetwork';

export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

export interface FlowFixture {
  edges: Array<[number, number, number]>;
  source: number;
  sink: number;
  ff: {
    max_flow: number;
    paths: Array<[number[], number]>;
    searches: number[][];
    residual: Array<[number, Array<[number, number]>]>;
    cut: [number, number[], number[]];
  };
  ek: {
    max_flow: number;
    paths: Array<[number[], number]>;
    searches: number[][];
    residual: Array<[number, Array<[number, number]>]>;
  };
}

export const flowFixtures: FlowFixture[] = JSON.parse(readFileSync(new URL('./__fixtures__/advancedGraph.json', import.meta.url), 'utf8')).flow;

export const fixtureText = (c: FlowFixture) => `${c.edges.map(([u, v, w]) => `${u}->${v} ${w}`).join(', ')}; source ${c.source}, sink ${c.sink}`;

/** The run's values as numbers, shaped like the fixture. */
export function asNumbers(run: FlowRun) {
  const num = (xs: string[]) => xs.map(Number);
  return {
    max_flow: run.maxFlow,
    paths: run.paths.map(([p, b]) => [num(p), b]),
    searches: run.searches.map(num),
    residual: run.residual.map(([u, row]) => [Number(u), row.map(([v, c]) => [Number(v), c])]),
    cut: [run.cut.value, num(run.cut.source).sort((a, b) => a - b), num(run.cut.sink).sort((a, b) => a - b)],
  };
}

/** Random networks: 2 to 7 vertices, up to 12 edges in random order, some anti-parallel, some of capacity 0. */
export function randomNetworks(count: number, seed: number): FlowInput[] {
  const rand = rng(seed);
  const out: FlowInput[] = [];
  while (out.length < count) {
    const n = 2 + Math.floor(rand() * 6);
    const seen = new Set<string>();
    const parts: string[] = [];
    for (let k = 0; k < 1 + Math.floor(rand() * 12); k++) {
      const u = Math.floor(rand() * n);
      const v = Math.floor(rand() * n);
      if (u === v || seen.has(`${u}>${v}`)) continue;
      seen.add(`${u}>${v}`);
      parts.push(`${u}->${v} ${rand() < 0.1 ? 0 : 1 + Math.floor(rand() * 12)}`);
    }
    if (parts.length === 0) continue;
    const input = parseFlow(parts.join(', '));
    const source = input.nodes[Math.floor(rand() * input.nodes.length)];
    const others = input.nodes.filter((v) => v !== source);
    out.push({ ...input, source, sink: others[Math.floor(rand() * others.length)] });
  }
  return out;
}

/** The smallest capacity of an s-t cut, over every vertex set that holds s and not t. */
export function bruteMinCut(input: FlowInput): number {
  const free = input.nodes.filter((v) => v !== input.source && v !== input.sink);
  let best = Infinity;
  for (let mask = 0; mask < 1 << free.length; mask++) {
    const side = new Set([input.source, ...free.filter((_, i) => mask & (1 << i))]);
    const cap = input.edges.reduce((s, e) => s + (side.has(e.from) && !side.has(e.to) ? e.cap : 0), 0);
    best = Math.min(best, cap);
  }
  return best;
}

/** Rebuild the residual dict a run ended with. */
export function residualOf(run: FlowRun): Residual {
  return new Map(run.residual.map(([u, row]) => [u, new Map(row)]));
}

/**
 * A finished run is a maximum flow: within capacity, conserved at every inner vertex, worth the
 * brute-force minimum cut, with augmenting paths that add up, and a cut whose capacity matches.
 */
export function expectMaxFlow(input: FlowInput, run: FlowRun) {
  const want = input.source === input.sink ? 0 : bruteMinCut(input);
  expect(run.maxFlow).toBe(want);
  expect(run.paths.reduce((s, [, b]) => s + b, 0)).toBe(run.maxFlow);
  for (const [path, b] of run.paths) {
    expect(path[0]).toBe(input.source);
    expect(path[path.length - 1]).toBe(input.sink);
    expect(new Set(path).size).toBe(path.length);
    expect(b).toBeGreaterThan(0);
  }
  if (input.source === input.sink) return;
  const net = new FlowNet(input);
  const res = residualOf(run);
  const balance = new Map(input.nodes.map((v) => [v, 0]));
  input.edges.forEach((e, i) => {
    const f = net.flow(res, i);
    expect(f).toBeGreaterThanOrEqual(0);
    expect(f).toBeLessThanOrEqual(e.cap);
    balance.set(e.from, balance.get(e.from)! - f);
    balance.set(e.to, balance.get(e.to)! + f);
  });
  for (const v of input.nodes) if (v !== input.source && v !== input.sink) expect(balance.get(v), v).toBe(0);
  expect(balance.get(input.sink)).toBe(run.maxFlow);
  const side = new Set(run.cut.source);
  expect(side.has(input.source)).toBe(true);
  expect(side.has(input.sink)).toBe(false);
  expect([...run.cut.source, ...run.cut.sink].sort()).toEqual([...input.nodes].sort());
  const cutCap = input.edges.reduce((s, e) => s + (side.has(e.from) && !side.has(e.to) ? e.cap : 0), 0);
  expect(cutCap).toBe(run.maxFlow);
}

/** Every frame: a caption that explains, a line in range, unique ids, edges between drawn vertices, a fill in [0, 1]. */
export function expectWellFormedFlow(frames: FlowFrame[], codeLines: number) {
  expect(frames.length).toBeGreaterThan(0);
  for (const f of frames) {
    expect(f.caption.length, f.caption).toBeGreaterThan(20);
    if (f.line !== undefined) {
      expect(f.line).toBeGreaterThanOrEqual(0);
      expect(f.line).toBeLessThan(codeLines);
    }
    const nodes = f.state.nodes.map((n) => n.id);
    expect(new Set(nodes).size).toBe(nodes.length);
    const ids = f.state.edges.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
    const drawn = new Set(nodes);
    for (const e of f.state.edges) {
      expect(drawn.has(e.from) && drawn.has(e.to), e.id).toBe(true);
      expect(e.fill).toBeGreaterThanOrEqual(0);
      expect(e.fill).toBeLessThanOrEqual(1);
    }
    for (const n of f.state.nodes) {
      expect(n.x).toBeGreaterThanOrEqual(20);
      expect(n.x).toBeLessThanOrEqual(f.state.width - 20);
      expect(n.y).toBeGreaterThanOrEqual(20);
      expect(n.y).toBeLessThanOrEqual(f.state.height - 20);
    }
  }
}
