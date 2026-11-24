import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { EULER_CODE, eulerTrace, parseEuler, type EulerFrame, type EulerInput, type EulerKind } from './eulerianPath';
import { rng } from './flowTestKit';

interface EulerFixture {
  n: number;
  directed: boolean;
  edges: Array<[number, number]>;
  degrees: { kind: EulerKind; start: number };
  walked: { vertices: number[]; edge_ids: number[] } | null;
  kind: EulerKind;
  walk: { vertices: number[]; edge_ids: number[] } | null;
}

const fixtures: EulerFixture[] = JSON.parse(readFileSync(new URL('./__fixtures__/advancedGraph.json', import.meta.url), 'utf8')).euler;

const EXAMPLE = '0-3, 0-1, 1-2, 2-0, 3-4, 4-5, 5-3';
const DIRECTED = '0->1, 1->4, 1->2, 2->3, 3->1';

const lists = (w: { vertices: number[]; edgeIds: number[] } | null) => (w ? { vertices: w.vertices, edge_ids: w.edgeIds } : null);

/** The kind by trying every trail from every vertex. */
function bruteKind({ n, directed, edges }: EulerInput): EulerKind {
  if (edges.length === 0) return 'circuit';
  const used = edges.map(() => false);
  let path = false;
  let circuit = false;
  const extend = (start: number, v: number, depth: number) => {
    if (depth === edges.length) {
      path = true;
      if (v === start) circuit = true;
      return;
    }
    edges.forEach(([a, b], e) => {
      if (used[e]) return;
      const next = a === v ? b : !directed && b === v ? a : -1;
      if (next === -1) return;
      used[e] = true;
      extend(start, next, depth + 1);
      used[e] = false;
    });
  };
  for (let s = 0; s < n; s++) extend(s, s, 0);
  return circuit ? 'circuit' : path ? 'path' : 'none';
}

/** Random inputs the parser would take: no loops, no repeated pair; some built from one walk. */
function randomInputs(count: number, seed: number): EulerInput[] {
  const rand = rng(seed);
  const pick = (k: number) => Math.floor(rand() * k);
  const out: EulerInput[] = [];
  while (out.length < count) {
    const directed = rand() < 0.5;
    const n = 2 + pick(5);
    const seen = new Set<string>();
    const edges: Array<[number, number]> = [];
    const add = (u: number, v: number) => {
      const key = directed ? `${u}>${v}` : `${Math.min(u, v)}-${Math.max(u, v)}`;
      if (u !== v && !seen.has(key)) {
        seen.add(key);
        edges.push([u, v]);
      }
    };
    if (rand() < 0.6) {
      let v = pick(n);
      for (let k = 0; k < 1 + pick(9); k++) {
        const w = pick(n);
        if (w !== v) {
          add(v, w);
          v = w;
        }
      }
    } else {
      for (let k = 0; k < 1 + pick(8); k++) add(pick(n), pick(n));
    }
    if (edges.length) out.push({ n, directed, edges });
  }
  return out;
}

/** What is wrong with the frames: short captions, lines out of range, vertices off the picture. */
function frameProblems(frames: EulerFrame[]): string[] {
  const out: string[] = [];
  if (frames.length === 0) out.push('no frames');
  for (const f of frames) {
    if (f.caption.length <= 20) out.push(`short caption: ${f.caption}`);
    if (f.line === undefined || f.line < 0 || f.line >= EULER_CODE.length) out.push(`line ${f.line}: ${f.caption}`);
    const ids = f.state.nodes.map((n) => n.id);
    if (new Set(ids).size !== ids.length) out.push(`repeated vertex ids: ${ids}`);
    for (const n of f.state.nodes) if (n.x < 20 || n.x > 580 || n.y < 20 || n.y > 360) out.push(`${n.id} at (${n.x}, ${n.y})`);
    for (const e of f.state.edges) if (!ids.includes(e.from) || !ids.includes(e.to)) out.push(`edge ${e.from}-${e.to} without its vertices`);
  }
  return out;
}

describe('Eulerian path input', () => {
  it('reads undirected or directed edges, with an optional number of vertices', () => {
    expect(parseEuler(EXAMPLE)).toEqual({
      n: 6,
      directed: false,
      edges: [[0, 3], [0, 1], [1, 2], [2, 0], [3, 4], [4, 5], [5, 3]],
    });
    expect(parseEuler('0->1; 1 -> 0, n 4')).toEqual({ n: 4, directed: true, edges: [[0, 1], [1, 0]] });
  });

  it('refuses what the picture cannot draw or the code would not take', () => {
    for (const bad of ['', '1-1', '0-1, 1-0', '0->1, 0->1', '0-1, 1->2', '0-8', '0-5; n 3', 'n 4', '0-1; n 2; n 3', '0-1; n 9', '0>1', 'a-b']) {
      expect(() => parseEuler(bad), bad).toThrow();
    }
    const many = Array.from({ length: 17 }, (_, k) => `${k % 8}-${(k + 1 + Math.floor(k / 8)) % 8}`).join(', ');
    expect(() => parseEuler(many)).toThrow(/At most 16 edges/);
  });
});

describe('Hierholzer tracer', () => {
  it('follows the worked example: stuck at 3, then the triangle at 0 is spliced in front', () => {
    const run = eulerTrace(parseEuler(EXAMPLE));
    expect(run.degrees).toEqual({ kind: 'path', start: 0 });
    expect(run.walk).toEqual({ vertices: [0, 1, 2, 0, 3, 4, 5, 3], edgeIds: [1, 2, 3, 0, 4, 5, 6] });
    const captions = run.frames.map((f) => f.caption);
    expect(captions.some((c) => c.includes('The walk is stuck at 3, the end the degrees named'))).toBe(true);
    expect(captions.some((c) => c.includes('The detour is stuck at 0, where it started: 0 -> 1 -> 2 -> 0 is a closed circuit'))).toBe(true);
    const last = run.frames[run.frames.length - 1];
    expect(last.state.strips!.find((s) => s.label === 'Path')!.items.map((t) => t.text)).toEqual(['0', '1', '2', '0', '3', '4', '5', '3']);
    expect(last.state.edges.every((e) => e.role === 'done')).toBe(true);
  });

  it('follows the directed example: the cycle 1 -> 2 -> 3 -> 1 is spliced in at 1', () => {
    const run = eulerTrace(parseEuler(DIRECTED));
    expect(run.kind).toBe('path');
    expect(run.walk).toEqual({ vertices: [0, 1, 2, 3, 1, 4], edgeIds: [0, 2, 3, 4, 1] });
    expect(run.frames.some((f) => f.caption.includes('1 -> 2 -> 3 -> 1 is a closed circuit'))).toBe(true);
  });

  it('stops at the degree test, or after a walk that missed a component', () => {
    const k4 = eulerTrace(parseEuler('0-1, 0-2, 0-3, 1-2, 1-3, 2-3'));
    expect([k4.kind, k4.walked, k4.walk]).toEqual(['none', null, null]);
    expect(k4.frames[k4.frames.length - 2].state.nodes.filter((n) => n.role === 'bad').map((n) => n.id)).toEqual(['0', '1', '2', '3']);
    const two = eulerTrace(parseEuler('0-1, 1-2, 2-0, 3-4, 4-5, 5-3'));
    expect(two.degrees).toEqual({ kind: 'circuit', start: 0 });
    expect(two.walked).toEqual({ vertices: [0, 1, 2, 0], edgeIds: [0, 1, 2] });
    expect(two.walk).toBeNull();
    expect(two.frames[two.frames.length - 1].caption).toContain('used only 3 of the 6 edges');
  });

  it('reproduces the golden fixture from the Python code: degree check, walk, answer', () => {
    expect(fixtures.length).toBeGreaterThan(150);
    for (const c of fixtures) {
      const run = eulerTrace({ n: c.n, directed: c.directed, edges: c.edges });
      const name = JSON.stringify([c.n, c.directed, c.edges]);
      expect(run.degrees, name).toEqual(c.degrees);
      expect(lists(run.walked), name).toEqual(c.walked);
      expect(run.kind, name).toBe(c.kind);
      expect(lists(run.walk), name).toEqual(c.walk);
    }
  });

  it('agrees with brute force on random inputs, in well-formed frames', () => {
    const problems: string[] = [];
    for (const input of randomInputs(400, 1691)) {
      const name = JSON.stringify(input);
      const run = eulerTrace(input);
      const want = bruteKind(input);
      if (run.kind !== want) problems.push(`${name}: ${run.kind}, brute force ${want}`);
      for (const p of frameProblems(run.frames)) problems.push(`${name}: ${p}`);
    }
    expect(problems).toEqual([]);
  });

  it('marks every edge it takes, and every detour it reports is closed', () => {
    const problems: string[] = [];
    for (const input of randomInputs(400, 1693)) {
      const name = JSON.stringify(input);
      const run = eulerTrace(input);
      let usedBefore = 0;
      for (const f of run.frames) {
        const marked = f.state.edges.filter((e) => e.role !== 'idle').length;
        const used = f.vars?.find(([k]) => k === 'used')?.[1];
        if (typeof used === 'string' && f.line !== 10 && f.line !== 11) {
          const count = Number(used.split('/')[0]);
          if (marked !== count) problems.push(`${name}: ${marked} edges marked, ${count} used: ${f.caption}`);
          if (f.line === 8 && count !== usedBefore + 1) problems.push(`${name}: a push used ${count - usedBefore} edges`);
          usedBefore = count;
        }
        const loop = f.caption.match(/The detour is stuck at (\d+), where it started: ([\d >-]+) is a closed circuit/);
        if (loop) {
          const walk = loop[2].split(' -> ');
          if (walk[0] !== loop[1] || walk[walk.length - 1] !== loop[1]) problems.push(`${name}: open detour ${loop[2]}`);
        }
      }
      if (run.walk) {
        const first = run.frames.find((f) => f.caption.includes('The walk is stuck at'))!;
        const at = Number(first.caption.match(/stuck at (\d+)/)![1]);
        if (at !== run.walk.vertices[run.walk.vertices.length - 1]) problems.push(`${name}: first stuck at ${at}`);
      }
    }
    expect(problems).toEqual([]);
  });
});
