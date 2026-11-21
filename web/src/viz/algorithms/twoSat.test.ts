import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { formatTwoSat, litName, litValue, parseTwoSat, TWO_SAT_CODE, twoSatTrace, type SatFrame, type TwoSatInput } from './twoSat';

interface SatFixture {
  n: number;
  clauses: Array<[number, number]>;
  raised: number[];
  solve_raised: boolean;
  ok: boolean | null;
  assignment: boolean[] | null;
  comp: number[];
}

const fixtures: SatFixture[] = JSON.parse(readFileSync(new URL('./__fixtures__/advancedGraph.json', import.meta.url), 'utf8')).twosat;

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

const textOf = (n: number, clauses: Array<[number, number]>) => [`n ${n}`, ...clauses.map(([a, b]) => `${litName(a)} or ${litName(b)}`)].join(', ');

function randomFormulas(count: number, seed: number): TwoSatInput[] {
  const rand = rng(seed);
  return Array.from({ length: count }, () => {
    const n = 1 + Math.floor(rand() * 6);
    const clauses: Array<[number, number]> = Array.from({ length: Math.floor(rand() * 17) }, () => {
      const a = Math.floor(rand() * 2 * n);
      const r = rand();
      return [a, r < 0.06 ? a : r < 0.1 ? a ^ 1 : Math.floor(rand() * 2 * n)];
    });
    return parseTwoSat(textOf(n, clauses));
  });
}

/** Is there any assignment satisfying every clause? Brute force over all 2^n. */
function bruteSat(input: TwoSatInput): boolean {
  for (let mask = 0; mask < 1 << input.n; mask++) {
    const a = Array.from({ length: input.n }, (_, x) => Boolean(mask & (1 << x)));
    if (input.clauses.every((c) => litValue(c.a, a) || litValue(c.b, a))) return true;
  }
  return false;
}

function reach(graph: number[][]): boolean[][] {
  const N = graph.length;
  const r = Array.from({ length: N }, (_, i) => Array.from({ length: N }, (_, j) => i === j));
  graph.forEach((list, u) => list.forEach((v) => (r[u][v] = true)));
  for (let k = 0; k < N; k++) for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) if (r[i][k] && r[k][j]) r[i][j] = true;
  return r;
}

/** What is wrong with the frames of a run, one readable line per problem. */
function frameProblems(frames: SatFrame[]): string[] {
  const out: string[] = [];
  if (frames.length === 0) out.push('no frames');
  for (const f of frames) {
    if (f.caption.length <= 20) out.push(`caption too short: "${f.caption}"`);
    if (f.line !== undefined && (f.line < 0 || f.line >= TWO_SAT_CODE.length)) out.push(`line ${f.line} out of range: ${f.caption}`);
    const ids = f.state.literals.map((l) => l.id);
    if (new Set(ids).size !== ids.length) out.push(`repeated literal ids [${ids}]: ${f.caption}`);
    if (ids.length !== 2 * f.state.n) out.push(`${ids.length} literals for n = ${f.state.n}: ${f.caption}`);
    const edgeIds = f.state.edges.map((e) => e.id);
    if (new Set(edgeIds).size !== edgeIds.length) out.push(`repeated edge ids [${edgeIds}]: ${f.caption}`);
    const drawn = new Set(ids);
    for (const e of f.state.edges) if (!(drawn.has(e.from) && drawn.has(e.to))) out.push(`edge ${e.id} has an end that is not drawn: ${f.caption}`);
    if (f.state.values.length !== f.state.n) out.push(`${f.state.values.length} values for n = ${f.state.n}: ${f.caption}`);
  }
  return out;
}

function expectWellFormed(frames: SatFrame[]) {
  expect(frameProblems(frames)).toEqual([]);
}

describe('parseTwoSat', () => {
  it('reads or-clauses, implications and lone literals as the add_clause calls they make', () => {
    const f = parseTwoSat('(x0 or not x1) and ~x0 | x2; !x1 v -x2\nx0 -> x2, x1 => not x0, x3');
    expect(f.clauses.map((c) => [c.a, c.b, c.kind])).toEqual([
      [0, 3, 'or'],
      [1, 4, 'or'],
      [3, 5, 'or'],
      [1, 4, 'implies'],
      [3, 1, 'implies'],
      [6, 6, 'force'],
    ]);
    expect(f.n).toBe(4);
    expect(parseTwoSat('n 5').n).toBe(5);
    expect(parseTwoSat(formatTwoSat(f))).toEqual(f);
  });

  it('rejects malformed input with a friendly message', () => {
    const bad = [
      ['x0 or y1', 'not a literal'],
      ['x0 or x6', 'x0 to x5'],
      ['n 0', 'from 1 to 6'],
      ['n 7', 'from 1 to 6'],
      ['n 2, n 3', 'only once'],
      ['', 'at least one clause'],
      [Array.from({ length: 17 }, () => 'x0 or x1').join(', '), 'At most 16'],
    ];
    for (const [text, msg] of bad) {
      expect(() => parseTwoSat(text), text).toThrow(InputError);
      expect(() => parseTwoSat(text), text).toThrow(msg);
    }
  });
});

describe('2-SAT tracer', () => {
  it('solves the textbook formula as the Python code does: x0 = False, x1 = True', () => {
    const run = twoSatTrace(parseTwoSat('x0 or x1, not x0 or x1, not x0 or not x1'));
    expect([run.ok, run.assignment, run.comp]).toEqual([true, [false, true], [1, 0, 0, 1]]);
    const last = run.frames[run.frames.length - 1];
    expect(last.state.clauses.every((c) => c.mark === 'ok')).toBe(true);
    expect(last.state.values.map((v) => v.label)).toEqual(['x0 = F', 'x1 = T']);
  });

  it('adds two mirrored edges per clause, and explains the contrapositive', () => {
    const run = twoSatTrace(parseTwoSat('x0 or x1'));
    const added = run.frames[1];
    expect(added.state.edges.map((e) => `${e.from}>${e.to}:${e.role}`)).toEqual(['~x0>x1:active', '~x1>x0:active']);
    expect(added.caption).toContain('contrapositive');
  });

  it('shows x and ~x in one component as the reason for UNSAT, and stops at that variable', () => {
    const run = twoSatTrace(parseTwoSat('x0 or x1, x0 or not x1, not x0 or x1, not x0 or not x1'));
    expect([run.ok, run.assignment]).toEqual([false, null]);
    const last = run.frames[run.frames.length - 1];
    expect(last.line).toBe(12);
    expect(last.state.literals.filter((l) => l.role === 'bad').map((l) => l.id)).toEqual(['x0', '~x0']);
    expect(last.state.edges.some((e) => e.role === 'active')).toBe(true);
  });

  it('draws a tautology as two self-loops and a forced literal as a doubled edge', () => {
    const run = twoSatTrace(parseTwoSat('x0 or not x0, not x1'));
    const edges = run.frames[run.frames.length - 1].state.edges.map((e) => `${e.from}>${e.to}`);
    expect(edges).toEqual(['x0>x0', '~x0>~x0', 'x1>~x1', 'x1>~x1']);
    expect(run.assignment).toEqual([true, false]);
  });

  it('raises IndexError like Python for a literal past 2n, in add_clause and then in solve()', () => {
    const dangling = twoSatTrace(parseTwoSat('n 2, x0 or x1, x0 or x3, x1'));
    expect([dangling.raised, dangling.solveRaised, dangling.ok]).toEqual([[1], true, null]);
    expect(dangling.frames[dangling.frames.length - 1].caption).toContain('IndexError');
    const clean = twoSatTrace(parseTwoSat('n 1, x3 or x0, x0'));
    expect([clean.raised, clean.solveRaised, clean.ok, clean.assignment]).toEqual([[0], false, true, [true]]);
  });

  it('reproduces the golden fixture from the Python code: answer, assignment, comp of every node, errors', () => {
    expect(fixtures.length).toBeGreaterThan(100);
    for (const c of fixtures) {
      const run = twoSatTrace(parseTwoSat(textOf(c.n, c.clauses)));
      const text = textOf(c.n, c.clauses);
      expect({ ok: run.ok, assignment: run.assignment, comp: run.comp, raised: run.raised, solve_raised: run.solveRaised }, text).toEqual({
        ok: c.ok,
        assignment: c.assignment,
        comp: c.comp,
        raised: c.raised,
        solve_raised: c.solve_raised,
      });
    }
  });

  it('agrees with brute force on random formulas, numbers components in reverse topological order, and satisfies every clause', () => {
    for (const input of randomFormulas(200, 5)) {
      const run = twoSatTrace(input);
      const problems = frameProblems(run.frames);
      const sat = bruteSat(input);
      if (run.ok !== sat) problems.push(`ok = ${run.ok}, brute force says ${sat}`);
      const r = reach(run.graph);
      const N = 2 * input.n;
      for (let u = 0; u < N; u++) {
        for (let v = 0; v < N; v++) {
          if ((run.comp[u] === run.comp[v]) !== (r[u][v] && r[v][u])) problems.push(`${litName(u)} and ${litName(v)}: same component ${run.comp[u] === run.comp[v]}, mutually reachable ${r[u][v] && r[v][u]}`);
        }
        for (const v of run.graph[u]) if (!(run.comp[u] >= run.comp[v])) problems.push(`edge ${litName(u)} -> ${litName(v)} goes from component ${run.comp[u]} up to ${run.comp[v]}`);
      }
      if (run.ok) {
        for (const c of input.clauses) if (!(litValue(c.a, run.assignment!) || litValue(c.b, run.assignment!))) problems.push(`clause ${litName(c.a)} or ${litName(c.b)} is false`);
      }
      if (run.frames.length >= 2000) problems.push(`${run.frames.length} frames, want fewer than 2000`);
      expect(problems, formatTwoSat(input)).toEqual([]);
    }
  });

  it('keeps the largest formula well under the frame budget', () => {
    const big = Array.from({ length: 16 }, (_, i) => `x${i % 6} or not x${(i * 5 + 1) % 6}`).join(', ');
    const run = twoSatTrace(parseTwoSat(big));
    expectWellFormed(run.frames);
    expect(run.frames.length).toBeLessThan(400);
  });
});
