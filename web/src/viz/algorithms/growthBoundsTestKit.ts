/**
 * Shared checks for the growth-chart tests (bigONotation, bigOmega, bigTheta): the fixture
 * comparison, well-formed frames, and a brute-force check of every bound and of n0.
 */
import { readFileSync } from 'node:fs';
import { expect } from 'vitest';
import type { Frame } from '../core/types';
import type { GrowthState } from '../renderers/GrowthChart';
import { BOUND_IDS, BOUNDS, parseGrowth, traceGrowth, type BoundKind, type GrowthCode, type GrowthExample, type GrowthInput } from './growthBounds';

export const complexityFixtures = JSON.parse(readFileSync(new URL('./__fixtures__/complexity.json', import.meta.url), 'utf8'));

export function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

interface GrowthFixture {
  fn: string;
  case?: string;
  n: [number, number];
  ops: number[];
  results: unknown[];
}

/** Every count and return value the generator measured on the Python code. */
export function expectFixture(section: string, examples: GrowthExample[]) {
  const list = complexityFixtures[section] as GrowthFixture[];
  const covered = new Set<string>();
  for (const c of list) {
    const ex = examples.find((e) => e.python === c.fn);
    expect(ex, c.fn).toBeDefined();
    covered.add(`${c.fn}:${c.case ?? ''}`);
    expect(ex!.maxN, `${c.fn}: the fixture covers every n the chart allows`).toBe(c.n[1]);
    for (let n = c.n[0]; n <= c.n[1]; n++) {
      const m = ex!.run(n, c.case ?? null);
      expect(m.ops, `${c.fn} ${c.case ?? ''} n = ${n}`).toBe(c.ops[n - c.n[0]]);
      expect(m.result, `${c.fn} ${c.case ?? ''} n = ${n}: result`).toEqual(c.results[n - c.n[0]]);
    }
  }
  // Every example and case of the chart is pinned.
  for (const ex of examples) {
    for (const kase of ex.cases ? Object.keys(ex.cases) : ['']) expect(covered.has(`${ex.python}:${kase}`), `${ex.python} ${kase}`).toBe(true);
  }
}

const samePair = (a: readonly number[], b: readonly number[]) => a.length === b.length && a.every((x, i) => Object.is(x, b[i]));

/**
 * Captions, lines, one point per n inside the range, curves no longer than the points, one scale
 * per run. Returns one readable line per problem, so a run is asserted once instead of per point.
 */
export function growthFrameProblems(frames: Array<Frame<GrowthState>>, codeLines: number): string[] {
  const out: string[] = [];
  const first = frames[0].state;
  for (const f of frames) {
    if (f.caption.length <= 20) out.push(`caption too short: "${f.caption}"`);
    if (f.line !== undefined && (f.line < 0 || f.line >= codeLines)) out.push(`line ${f.line} outside 0..${codeLines - 1}: ${f.caption}`);
    const s = f.state;
    if (!samePair(s.x, first.x)) out.push(`the n range changed from [${first.x}] to [${s.x}]: ${f.caption}`);
    if (!samePair(s.decades, first.decades)) out.push(`the y scale changed from [${first.decades}] to [${s.decades}]: ${f.caption}`);
    const ns = s.points.map((p) => p.n);
    if (new Set(ns).size !== ns.length) out.push(`two points share an n in [${ns}]: ${f.caption}`);
    for (const p of s.points) {
      if (!(p.n >= s.x[0] && p.n <= s.x[1])) out.push(`point n = ${p.n} outside [${s.x}]: ${f.caption}`);
      if (!(p.value >= 0)) out.push(`point n = ${p.n} has the negative value ${p.value}: ${f.caption}`);
    }
    const hidden = s.points.filter((p) => p.hidden).length;
    if (!(hidden <= 1)) out.push(`${hidden} hidden points, at most 1: ${f.caption}`);
    const shown = s.points.filter((p) => !p.hidden).length;
    for (const c of s.curves) if (!(c.points.length <= shown)) out.push(`curve ${c.id} has ${c.points.length} points, more than the ${shown} shown: ${f.caption}`);
    if (s.n0 && !(s.n0.n >= s.x[0] && s.n0.n <= s.x[1])) out.push(`n0 = ${s.n0.n} outside [${s.x}]: ${f.caption}`);
  }
  return out;
}

/** Trace one input and check it against the definitions; one assertion for the whole run. */
export function checkGrowth(input: GrowthInput, ex: GrowthExample, code: GrowthCode, codeLines: number) {
  const run = traceGrowth(input, ex, code);
  const problems = growthFrameProblems(run.frames, codeLines);
  const ns = Array.from({ length: input.to - input.from + 1 }, (_, k) => input.from + k);
  const stepNs = run.steps.map((s) => s.n);
  if (!samePair(stepNs, ns)) problems.push(`steps at n = [${stepNs}], want [${ns}]`);
  if (run.frames.length !== 2 * ns.length + 2) problems.push(`${run.frames.length} frames, want ${2 * ns.length + 2}`);
  for (const s of run.steps) {
    const ops = ex.run(s.n, input.kase).ops;
    if (!Object.is(s.ops, ops)) problems.push(`n = ${s.n}: ${s.ops} operations, the example counts ${ops}`);
    const g = BOUNDS[input.g].value(s.n);
    const lo = input.c[0] * g;
    const hi = (input.c[1] ?? input.c[0]) * g;
    const want = input.kind === 'O' ? s.ops <= lo : input.kind === 'Omega' ? lo <= s.ops : lo <= s.ops && s.ops <= hi;
    if (s.holds !== want) problems.push(`n = ${s.n}: holds is ${s.holds}, the definition says ${want}`);
  }
  // n0: the smallest n from which every plotted point holds (brute force).
  let brute: number | null = null;
  for (const n of ns) {
    if (run.steps.filter((s) => s.n >= n).every((s) => s.holds)) {
      brute = n;
      break;
    }
  }
  if (!Object.is(run.n0, brute)) problems.push(`n0 = ${run.n0}, brute force ${brute}`);
  const last = run.frames[run.frames.length - 1];
  if (!Object.is(last.state.n0?.n ?? null, brute)) problems.push(`the last frame marks n0 = ${last.state.n0?.n ?? null}, brute force ${brute}`);
  const verdict = brute !== null ? `n0 = ${brute}` : 'no n0';
  if (!last.caption.includes(verdict)) problems.push(`the last caption does not say "${verdict}": ${last.caption}`);
  // Every point of the last frame is measured and keeps its verdict's role.
  const roles = last.state.points.map((p) => p.role);
  const wantRoles = run.steps.map((s) => (s.holds ? 'good' : 'bad'));
  if (!(roles.length === wantRoles.length && roles.every((r, i) => r === wantRoles[i]))) problems.push(`last frame roles [${roles}], want [${wantRoles}]`);
  expect(problems, JSON.stringify(input)).toEqual([]);
  return run;
}

/** Random inputs: an example, its case, a bound, constants and a range. */
export function randomInputs(kind: BoundKind, examples: GrowthExample[], count: number, seed: number): GrowthInput[] {
  const rand = rng(seed);
  const pickOne = <T>(xs: readonly T[]) => xs[Math.floor(rand() * xs.length)];
  const out: GrowthInput[] = [];
  for (let t = 0; t < count; t++) {
    const ex = pickOne(examples);
    const kase = ex.cases ? pickOne(Object.keys(ex.cases)) : null;
    const to = 2 + Math.floor(rand() * (ex.maxN - 1));
    const from = 1 + Math.floor(rand() * Math.min(5, to - 1));
    const c1 = pickOne([0.1, 0.25, 0.5, 1, 1.5, 2, 3, 4, 10]);
    const c2 = c1 * pickOne([1, 2, 4, 8]);
    out.push({ kind, example: ex.key, kase, g: pickOne(BOUND_IDS), c: kind === 'Theta' ? [c1, c2] : [c1], from, to });
  }
  return out;
}

/** Each example string of a spec parses, and the parser keeps the Python defaults when nothing is given. */
export function expectParses(kind: BoundKind, examples: GrowthExample[], texts: string[]) {
  for (const t of texts) expect(() => parseGrowth(t, kind, examples), t).not.toThrow();
}
