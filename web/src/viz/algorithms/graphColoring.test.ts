import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { expectGraphFrames, fixtures, rng } from './backtrackingTestKit';
import { COLORING_CODE, adjacencyMatrix, coloringTrace, formatColoring, parseColoring, type ColoringEvent, type ColoringInput } from './graphColoring';

/** The first proper coloring with colors 1..m in lexicographic order (what index-order backtracking returns), or null. */
function bruteForce(n: number, edges: Array<[number, number]>, m: number): number[] | null {
  const color = Array<number>(n).fill(1);
  if (n === 0) return [];
  for (;;) {
    if (edges.every(([a, b]) => color[a] !== color[b])) return [...color];
    let i = n - 1;
    while (i >= 0 && color[i] === m) color[i--] = 1;
    if (i < 0) return null;
    color[i] += 1;
  }
}

function randomGraph(rand: () => number): { n: number; edges: Array<[number, number]> } {
  const n = 1 + Math.floor(rand() * 7);
  const p = 0.2 + rand() * 0.6;
  const edges: Array<[number, number]> = [];
  for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) if (rand() < p) edges.push([a, b]);
  return { n, edges };
}

describe('coloringTrace matches graph_coloring.py (golden fixtures)', () => {
  it('replays every is_safe call with the color array it saw, and the coloring', () => {
    const cases = fixtures.coloring as Array<{ n: number; edges: Array<[number, number]>; m: number; result: number[] | null; events: ColoringEvent[] }>;
    expect(cases.length).toBe(50);
    expect(cases.filter((c) => c.result === null).length).toBeGreaterThan(5);
    for (const c of cases) {
      const run = coloringTrace({ n: c.n, edges: c.edges, m: c.m });
      expect(run.events, JSON.stringify(c.edges)).toEqual(c.events);
      expect(run.result).toEqual(c.result);
    }
  });

  it('replays chromatic_number: every m it tried and the answer', () => {
    const cases = fixtures.chromatic as Array<{ n: number; edges: Array<[number, number]>; result: number; events: ColoringEvent[] }>;
    expect(cases.length).toBe(25);
    for (const c of cases) {
      const run = coloringTrace({ n: c.n, edges: c.edges, m: 'chromatic' });
      expect(run.events).toEqual(c.events);
      expect(run.result).toBe(c.result);
    }
  });
});

describe('coloringTrace', () => {
  it('agrees with brute force on random graphs: the same coloring, None exactly when none exists, the chromatic number', () => {
    const rand = rng(23);
    for (let t = 0; t < 150; t++) {
      const { n, edges } = randomGraph(rand);
      const m = 1 + Math.floor(rand() * 4);
      const run = coloringTrace({ n, edges, m });
      expect(run.result, `${JSON.stringify(edges)} m ${m}`).toEqual(bruteForce(n, edges, m));
      if (t % 3 === 0) {
        let chi = 1;
        while (bruteForce(n, edges, chi) === null) chi++;
        expect(coloringTrace({ n, edges, m: 'chromatic' }).result).toBe(chi);
      }
    }
  });

  it('only ever shows a proper partial coloring, and every frame is well formed', () => {
    const rand = rng(5);
    for (let t = 0; t < 60; t++) {
      const { n, edges } = randomGraph(rand);
      const input: ColoringInput = { n, edges, m: t % 4 === 0 ? 'chromatic' : 1 + (t % 4) };
      const { frames } = coloringTrace(input);
      expectGraphFrames(frames, COLORING_CODE.length);
      for (const f of frames) {
        // A badge "cK" is a written color; "cK?" is only being tried.
        const color = new Map(f.state.nodes.filter((v) => v.badge && !v.badge.endsWith('?')).map((v) => [v.id, v.badge]));
        for (const e of f.state.edges) if (color.has(e.from) && color.has(e.to)) expect(color.get(e.from), f.caption).not.toBe(color.get(e.to));
      }
    }
  });

  it('the article graph: [1, 2, 3, 2] with m = 3, None with m = 2, chromatic number 3', () => {
    const edges: Array<[number, number]> = [
      [0, 1],
      [0, 2],
      [0, 3],
      [1, 2],
      [2, 3],
    ];
    expect(coloringTrace({ n: 4, edges, m: 3 }).result).toEqual([1, 2, 3, 2]);
    const two = coloringTrace({ n: 4, edges, m: 2 });
    expect(two.result).toBeNull();
    // Vertex 3 is never reached: the triangle 0-1-2 fails first.
    expect(two.events.every((e) => e[0] !== 'check' || e[1] < 3)).toBe(true);
    expect(two.events.filter((e) => e[0] === 'check').length).toBe(10);
    expect(coloringTrace({ n: 4, edges, m: 'chromatic' }).result).toBe(3);
  });

  it('is_safe reports the first clashing neighbor by index', () => {
    const run = coloringTrace(parseColoring('0-2, 1-2; m 1'));
    const clash = run.frames.find((f) => f.caption.startsWith('Try color 1 for vertex 2'))!;
    expect(clash.caption).toContain('neighbor 0 already has color 1');
    expect(clash.state.nodes.find((v) => v.id === '0')!.role).toBe('bad');
    // The scan stopped at 0, so neighbor 1 was not looked at.
    expect(clash.state.nodes.find((v) => v.id === '1')!.role).toBe('done');
  });
});

describe('parseColoring', () => {
  it('reads edges, m, chromatic and n, and builds the symmetric matrix', () => {
    const input = parseColoring('0-1, 2-1, 1-0; m 2');
    expect(input).toEqual({ n: 3, edges: [[0, 1], [1, 2]], m: 2 });
    expect(adjacencyMatrix(input)).toEqual([
      [0, 1, 0],
      [1, 0, 1],
      [0, 1, 0],
    ]);
    expect(parseColoring('n 5; 0-1; chromatic')).toEqual({ n: 5, edges: [[0, 1]], m: 'chromatic' });
    expect(parseColoring('n 3; m 1')).toEqual({ n: 3, edges: [], m: 1 });
    expect(parseColoring(formatColoring({ n: 6, edges: [[0, 1]], m: 'chromatic' }))).toEqual({ n: 6, edges: [[0, 1]], m: 'chromatic' });
  });

  it('gives friendly errors', () => {
    expect(() => parseColoring('')).toThrow(InputError);
    expect(() => parseColoring('0-1')).toThrow(/how many colors/);
    expect(() => parseColoring('0-0; m 2')).toThrow(/self-loop/);
    expect(() => parseColoring('0-1; m 0')).toThrow(/1 to 6/);
    expect(() => parseColoring('0-8; m 2')).toThrow(/At most 8 vertices/);
    expect(() => parseColoring('n 2; 0-3; m 2')).toThrow(/not below n/);
    expect(() => parseColoring('a-b; m 2')).toThrow(/Cannot read/);
    expect(() => parseColoring('0-1; m 2; m 3')).toThrow(/only once/);
  });

  it('refuses a search that would take more than 2,000 steps', () => {
    // Vertices 0..3 have no edges, so all 3^4 colorings of them are tried before K4 on 4..7 fails.
    expect(() => parseColoring('4-5, 4-6, 4-7, 5-6, 5-7, 6-7; n 8; m 3')).toThrow(/more than the 2,000/);
  });
});
