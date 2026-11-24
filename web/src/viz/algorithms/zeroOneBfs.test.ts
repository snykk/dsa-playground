import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { SYM } from '../ui/symbols';
import fixtures from './__fixtures__/shortestPaths.json';
import type { Graph } from './graph';
import { parseZeroOneGraph, zeroOneBfsRun, type DequeEvent } from './zeroOneBfs';

interface Bfs01Fixture {
  n: number;
  edges: number[][];
  start: number;
  dist: number[];
  parent: number[];
  events: DequeEvent[];
}

const cases = (fixtures as unknown as { bfs01: Bfs01Fixture[] }).bfs01;

const WORKED = 'A->B 1, A->C 0, C->B 0, B->D 1, C->E 1, E->D 0, E->F 1, D->F 1, G->A 1; start A';
const PSEUDOCODE_LINES = 9;

const letter = (i: number) => String.fromCharCode(65 + i);

/** A graph over vertices A.. built directly, so self-loops and vertices without edges stay in. */
function directGraph(n: number, edges: number[][], start: number): Graph {
  return {
    nodes: Array.from({ length: n }, (_, i) => letter(i)),
    edges: edges.map(([u, v, w]) => ({ from: letter(u), to: letter(v), weight: w, directed: true, weighted: true })),
    start: letter(start),
  };
}

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

/** Dijkstra by repeated relaxation over the arcs (undirected edges both ways); -1 when unreachable. */
function reference(g: Graph): number[] {
  const idx = new Map(g.nodes.map((id, i) => [id, i]));
  const d = g.nodes.map(() => Infinity);
  d[idx.get(g.start)!] = 0;
  const arcs = g.edges.flatMap((e) => {
    const a = idx.get(e.from)!;
    const b = idx.get(e.to)!;
    return e.directed ? [[a, b, e.weight]] : [[a, b, e.weight], [b, a, e.weight]];
  });
  for (let round = 0; round < g.nodes.length; round++) for (const [a, b, w] of arcs) if (d[a] + w < d[b]) d[b] = d[a] + w;
  return d.map((x) => (x === Infinity ? -1 : x));
}

/** A random graph text: up to 8 vertices, directed and undirected edges of weight 0 or 1, no self-loops. */
function randomText(rand: () => number): string {
  const n = 2 + Math.floor(rand() * 7);
  const edges: string[] = [];
  const used: number[] = [];
  const m = 1 + Math.floor(rand() * 14);
  for (let k = 0; k < m; k++) {
    const u = Math.floor(rand() * n);
    let v = Math.floor(rand() * n);
    if (v === u) v = (u + 1) % n;
    used.push(u, v);
    edges.push(`${letter(u)}${rand() < 0.7 ? '->' : '-'}${letter(v)} ${rand() < 0.5 ? 0 : 1}`);
  }
  return `${edges.join(', ')}; start ${letter(used[Math.floor(rand() * used.length)])}`;
}

describe('0-1 BFS input', () => {
  it('takes weights 0 and 1, and an edge without a weight as 1', () => {
    const g = parseZeroOneGraph('A-B, B->C 0; start A');
    expect(g.edges.map((e) => e.weight)).toEqual([1, 0]);
  });

  it('refuses other weights with a message that names the edge', () => {
    for (const bad of ['A->B 2', 'A-B -1', 'A->B 0, B->C 7']) {
      expect(() => parseZeroOneGraph(`${bad}; start A`), bad).toThrow(InputError);
    }
    expect(() => parseZeroOneGraph('A->B 0, B->C 7; start A')).toThrow(/B->C weighs 7/);
  });
});

describe('0-1 BFS tracer', () => {
  it('follows the worked example: front and back pushes, one stale entry, G unreachable', () => {
    const run = zeroOneBfsRun(parseZeroOneGraph(WORKED));
    expect(run.dist).toEqual([0, 0, 0, 1, 1, 2, -1]);
    expect(run.parent).toEqual([-1, 2, 0, 1, 2, 4, -1]);
    expect(run.events).toEqual(cases[0].events);
    const stale = run.frames.filter((f) => f.line === 3);
    expect(stale.map((f) => f.caption.slice(0, 13))).toEqual(['Pop (1, B) fr']);
    const last = run.frames[run.frames.length - 1];
    expect(last.caption).toContain('7 pops, 1 of them stale');
    expect(last.caption).toContain('Unreachable: G');
    expect(last.state.nodes.map((n) => n.badge)).toEqual(['0', '0', '0', '1', '1', '2', SYM.infinity]);
    // The shortest-path tree: the parent edges A->C, C->B, B->D, C->E, E->F.
    expect(last.state.edges.filter((e) => e.role === 'done').map((e) => `${e.from}${e.to}`)).toEqual(['AC', 'CB', 'BD', 'CE', 'EF']);
  });

  it('shows the deque front first, the new entry highlighted and stale entries marked', () => {
    const run = zeroOneBfsRun(parseZeroOneGraph(WORKED));
    const afterCB = run.frames.find((f) => f.caption.startsWith(`Edge C${SYM.rightArrow}B`))!;
    expect(afterCB.state.strips![0].items).toEqual([
      { text: 'B:0', role: 'active' },
      { text: 'B:1 stale', role: undefined },
    ]);
    expect(afterCB.line).toBe(7);
    const afterCE = run.frames.find((f) => f.caption.startsWith(`Edge C${SYM.rightArrow}E`))!;
    expect(afterCE.line).toBe(8);
    expect(afterCE.state.strips![0].items.map((it) => it.text)).toEqual(['B:0', 'B:1 stale', 'E:1']);
    expect(afterCE.state.strips![0].items[2].role).toBe('active');
  });

  it('reproduces the golden fixtures from the Python code: dist, parent and every push and pop', () => {
    expect(cases.length).toBeGreaterThanOrEqual(150);
    for (const c of cases) {
      const run = zeroOneBfsRun(directGraph(c.n, c.edges, c.start));
      expect({ dist: run.dist, parent: run.parent, events: run.events }, JSON.stringify(c.edges)).toEqual({ dist: c.dist, parent: c.parent, events: c.events });
    }
  });

  it('keeps the invariant: the deque holds distances d and d + 1 in order at every step', () => {
    for (const c of cases) {
      const deque: number[] = [];
      for (const [kind, d] of c.events) {
        if (kind === 'pop') deque.shift();
        else if (kind === 'front') deque.unshift(d);
        else deque.push(d);
        for (let k = 1; k < deque.length; k++) expect(deque[k]).toBeGreaterThanOrEqual(deque[k - 1]);
        if (deque.length) expect(deque[deque.length - 1] - deque[0]).toBeLessThanOrEqual(1);
      }
    }
  });

  it('matches a shortest-path reference on 400 random graphs, directed and undirected, in well-formed frames', () => {
    const rand = rng(1124);
    const problems: string[] = [];
    for (let t = 0; t < 400; t++) {
      const text = randomText(rand);
      const g = parseZeroOneGraph(text);
      const run = zeroOneBfsRun(g);
      if (JSON.stringify(run.dist) !== JSON.stringify(reference(g))) problems.push(`${text}: ${run.dist} vs ${reference(g)}`);
      const pops = run.events.filter(([k]) => k === 'pop').length;
      const arcs = g.edges.reduce((s, e) => s + (e.directed ? 1 : 2), 0);
      if (pops > 2 * g.nodes.length - 1 || pops > arcs + 1) problems.push(`${text}: ${pops} pops`);
      for (const f of run.frames) {
        if (f.caption.length < 30) problems.push(`${text}: short caption ${f.caption}`);
        if (f.line !== undefined && (f.line < 0 || f.line >= PSEUDOCODE_LINES)) problems.push(`${text}: line ${f.line}`);
      }
      const last = run.frames[run.frames.length - 1].state;
      const badges = last.nodes.map((n) => n.badge);
      if (JSON.stringify(badges) !== JSON.stringify(run.dist.map((d) => (d === -1 ? SYM.infinity : String(d))))) problems.push(`${text}: badges ${badges}`);
    }
    expect(problems).toEqual([]);
  });

  it('is plain BFS when every weight is 1: only back pushes', () => {
    const run = zeroOneBfsRun(parseZeroOneGraph('A-B, A-C, B-D, C-D, D-E; start A'));
    expect(run.dist).toEqual([0, 1, 1, 2, 3]);
    expect(run.events.some(([k]) => k === 'front')).toBe(false);
  });
});
