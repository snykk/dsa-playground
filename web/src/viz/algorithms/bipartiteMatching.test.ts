import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  HOPCROFT_KARP_CODE,
  hopcroftKarpTrace,
  KUHN_CODE,
  kuhnTrace,
  parseMatching,
  type HkPhase,
  type KuhnRoot,
  type MatchingFrame,
  type MatchingInput,
} from './bipartiteMatching';
import { rng } from './flowTestKit';

interface MatchingFixture {
  n_left: number;
  n_right: number;
  edges: Array<[number, number]>;
  kuhn: { size: number; match_left: number[]; roots: KuhnRoot[] };
  hk: { size: number; match_left: number[]; phases: HkPhase[] };
  cover: [number[], number[]];
}

const fixtures: MatchingFixture[] = JSON.parse(readFileSync(new URL('./__fixtures__/advancedGraph.json', import.meta.url), 'utf8')).matching;

const EXAMPLE = '0-1, 0-2, 0-3, 1-0, 1-1, 2-0, 3-1';

/** The size of a maximum matching, trying every choice for each left vertex in turn. */
function bruteMaxMatching(input: MatchingInput): number {
  const best = (u: number, used: number): number => {
    if (u === input.nLeft) return 0;
    let result = best(u + 1, used);
    for (const [a, v] of input.edges) if (a === u && !(used & (1 << v))) result = Math.max(result, 1 + best(u + 1, used | (1 << v)));
    return result;
  };
  return best(0, 0);
}

function randomInputs(count: number, seed: number): MatchingInput[] {
  const rand = rng(seed);
  const out: MatchingInput[] = [];
  while (out.length < count) {
    const nLeft = 1 + Math.floor(rand() * 7);
    const nRight = 1 + Math.floor(rand() * 7);
    const seen = new Set<string>();
    const edges: Array<[number, number]> = [];
    for (let k = 0; k < Math.floor(rand() * 21); k++) {
      const u = Math.floor(rand() * nLeft);
      const v = Math.floor(rand() * nRight);
      if (!seen.has(`${u}-${v}`)) {
        seen.add(`${u}-${v}`);
        edges.push([u, v]);
      }
    }
    out.push({ nLeft, nRight, edges });
  }
  return out;
}

/** What is wrong with a matching, as readable lines; empty when it is a valid one of this size. */
function matchingProblems(input: MatchingInput, size: number, matchLeft: number[]): string[] {
  const out: string[] = [];
  if (matchLeft.length !== input.nLeft) out.push(`match_left has ${matchLeft.length} entries`);
  const pairs = matchLeft.map((v, u) => [u, v]).filter(([, v]) => v !== -1);
  if (pairs.length !== size) out.push(`${pairs.length} pairs for size ${size}`);
  if (new Set(pairs.map(([, v]) => v)).size !== pairs.length) out.push('a right vertex is used twice');
  for (const [u, v] of pairs) if (!input.edges.some(([a, b]) => a === u && b === v)) out.push(`L${u}-R${v} is not an edge`);
  return out;
}

/** What is wrong with the frames: short captions, lines out of range, repeated ids, vertices off the picture. */
function frameProblems(frames: MatchingFrame[], codeLines: number): string[] {
  const out: string[] = [];
  if (frames.length === 0) out.push('no frames');
  for (const f of frames) {
    if (f.caption.length <= 20) out.push(`short caption: ${f.caption}`);
    if (f.line === undefined || f.line < 0 || f.line >= codeLines) out.push(`line ${f.line}: ${f.caption}`);
    const ids = f.state.nodes.map((n) => n.id);
    if (new Set(ids).size !== ids.length) out.push(`repeated vertex ids: ${ids}`);
    for (const n of f.state.nodes) if (n.x < 20 || n.x > 580 || n.y < 20 || n.y > 360) out.push(`${n.id} at (${n.x}, ${n.y})`);
    for (const e of f.state.edges) if (!ids.includes(e.from) || !ids.includes(e.to)) out.push(`edge ${e.from}-${e.to} without its vertices`);
  }
  return out;
}

describe('bipartite matching input', () => {
  it('reads edges as u-v or Lu-Rv, with optional side sizes', () => {
    expect(parseMatching(EXAMPLE)).toEqual({
      nLeft: 4,
      nRight: 4,
      edges: [[0, 1], [0, 2], [0, 3], [1, 0], [1, 1], [2, 0], [3, 1]],
    });
    expect(parseMatching('L0-R1; l2 - r0; left 5, right 3')).toEqual({ nLeft: 5, nRight: 3, edges: [[0, 1], [2, 0]] });
    expect(parseMatching('left 2, right 2').edges).toEqual([]);
  });

  it('refuses what the picture cannot show or the code would not take', () => {
    for (const bad of ['0-1, 0-1', '0-8', '0-1; left 0', '0-1; left 9', '2-1; left 2', '0-3; right 3', 'left 2', '0>1', '0-1; left 2; left 3']) {
      expect(() => parseMatching(bad), bad).toThrow();
    }
    const many = Array.from({ length: 21 }, (_, k) => `${k % 7}-${Math.floor(k / 7)}`).join(', ');
    expect(() => parseMatching(many)).toThrow(/At most 20 edges/);
  });
});

describe('Kuhn tracer', () => {
  it('follows the worked example: L2 moves L1 and L0 along, L3 finds nothing', () => {
    const run = kuhnTrace(parseMatching(EXAMPLE));
    expect(run.size).toBe(3);
    expect(run.matchLeft).toEqual([2, 1, 0, -1]);
    expect(run.roots).toEqual([
      { root: 0, path: [0, 1], seen: [1] },
      { root: 1, path: [1, 0], seen: [0] },
      { root: 2, path: [2, 0, 1, 1, 0, 2], seen: [0, 1, 2] },
      { root: 3, path: null, seen: [0, 1] },
    ]);
  });

  it('reproduces the golden fixture from the Python code: every path, every seen set, the matching', () => {
    expect(fixtures.length).toBeGreaterThan(150);
    for (const c of fixtures) {
      const run = kuhnTrace({ nLeft: c.n_left, nRight: c.n_right, edges: c.edges });
      expect({ size: run.size, match_left: run.matchLeft, roots: run.roots }, JSON.stringify(c.edges)).toEqual(c.kuhn);
    }
  });
});

describe('Hopcroft-Karp tracer', () => {
  it('follows the worked example: two phases, a dead end at L2, the cover {L0, R0, R1}', () => {
    const run = hopcroftKarpTrace(parseMatching(EXAMPLE));
    expect(run.matchLeft).toEqual([2, 0, -1, 1]);
    expect(run.phases.map((p) => [p.last, p.dist])).toEqual([
      [0, [0, 0, 0, 0]],
      [1, [1, 1, 0, 0]],
      [-1, [-1, 1, 0, 2]],
    ]);
    expect(run.phases[1].augments).toEqual([
      { root: 2, path: null, dist: [1, -1, -1, 0] },
      { root: 3, path: [3, 1, 0, 2], dist: [1, -1, -1, 0] },
    ]);
    expect(run.cover).toEqual([[0], [0, 1]]);
    const last = run.frames[run.frames.length - 1];
    expect(last.state.nodes.filter((n) => n.role === 'good').map((n) => n.id)).toEqual(['L0', 'R0', 'R1']);
  });

  it('shows each vertex layer as a badge during a phase', () => {
    const run = hopcroftKarpTrace(parseMatching(EXAMPLE));
    const stop = run.frames.find((f) => f.caption.includes('the BFS stops'))!;
    const badge = (id: string) => stop.state.nodes.find((n) => n.id === id)!.badge;
    expect(['L0', 'L1', 'L2', 'L3'].map(badge)).toEqual(['d=0', 'd=0', 'd=0', 'd=0']);
    const second = run.frames.filter((f) => f.caption.includes('the BFS stops'))[1];
    expect(['L0', 'L1', 'L2', 'L3'].map((id) => second.state.nodes.find((n) => n.id === id)!.badge)).toEqual(['d=1', 'd=1', 'd=0', 'd=0']);
  });

  it('reproduces the golden fixture from the Python code: layers, paths, dist after every search, the cover', () => {
    for (const c of fixtures) {
      const run = hopcroftKarpTrace({ nLeft: c.n_left, nRight: c.n_right, edges: c.edges });
      expect({ size: run.size, match_left: run.matchLeft, phases: run.phases }, JSON.stringify(c.edges)).toEqual(c.hk);
      expect(run.cover, JSON.stringify(c.edges)).toEqual(c.cover);
    }
  });

  it('takes vertex-disjoint shortest augmenting paths that grow from phase to phase', () => {
    for (const c of fixtures) {
      const run = hopcroftKarpTrace({ nLeft: c.n_left, nRight: c.n_right, edges: c.edges });
      const working = run.phases.slice(0, -1);
      expect(run.phases[run.phases.length - 1].last).toBe(-1);
      working.forEach((p, k) => {
        if (k > 0) expect(p.last).toBeGreaterThan(working[k - 1].last);
        const paths = p.augments.filter((a) => a.path).map((a) => a.path!);
        expect(paths.length).toBeGreaterThan(0);
        for (const path of paths) expect(path.length).toBe(2 * (p.last + 1));
        const lefts = paths.flatMap((path) => path.filter((_, i) => i % 2 === 0));
        expect(new Set(lefts).size).toBe(lefts.length);
      });
    }
  });
});

describe('both tracers', () => {
  it('find a maximum matching on random graphs, valid and as large as brute force, in well-formed frames', () => {
    const problems: string[] = [];
    for (const input of randomInputs(300, 1696)) {
      const name = JSON.stringify(input);
      const want = bruteMaxMatching(input);
      const k = kuhnTrace(input);
      const h = hopcroftKarpTrace(input);
      if (k.size !== want || h.size !== want) problems.push(`${name}: Kuhn ${k.size}, Hopcroft-Karp ${h.size}, brute force ${want}`);
      for (const p of [...matchingProblems(input, k.size, k.matchLeft), ...matchingProblems(input, h.size, h.matchLeft)]) problems.push(`${name}: ${p}`);
      const [left, right] = h.cover;
      if (left.length + right.length !== want) problems.push(`${name}: cover of ${left.length + right.length}`);
      for (const [u, v] of input.edges) if (!left.includes(u) && !right.includes(v)) problems.push(`${name}: L${u}-R${v} not covered`);
      for (const p of [...frameProblems(k.frames, KUHN_CODE.length), ...frameProblems(h.frames, HOPCROFT_KARP_CODE.length)]) problems.push(`${name}: ${p}`);
    }
    expect(problems).toEqual([]);
  });

  it('keep a matched edge drawn as matched unless the step highlights it', () => {
    const run = kuhnTrace(parseMatching(EXAMPLE));
    const end = run.frames[run.frames.length - 1].state;
    expect(end.edges.filter((e) => e.role === 'done').map((e) => `${e.from}-${e.to}`)).toEqual(['L0-R2', 'L1-R1', 'L2-R0']);
    expect(end.nodes.filter((n) => n.role === 'idle').map((n) => n.id)).toEqual(['L3', 'R3']);
  });
});
