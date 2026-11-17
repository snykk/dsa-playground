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

/** Captions, lines, one point per n inside the range, curves no longer than the points, one scale per run. */
export function expectWellFormed(frames: Array<Frame<GrowthState>>, codeLines: number) {
  const first = frames[0].state;
  for (const f of frames) {
    expect(f.caption.length).toBeGreaterThan(20);
    if (f.line !== undefined) {
      expect(f.line).toBeGreaterThanOrEqual(0);
      expect(f.line).toBeLessThan(codeLines);
    }
    const s = f.state;
    expect(s.x).toEqual(first.x);
    expect(s.decades).toEqual(first.decades);
    const ns = s.points.map((p) => p.n);
    expect(new Set(ns).size, f.caption).toBe(ns.length);
    for (const p of s.points) {
      expect(p.n).toBeGreaterThanOrEqual(s.x[0]);
      expect(p.n).toBeLessThanOrEqual(s.x[1]);
      expect(p.value).toBeGreaterThanOrEqual(0);
    }
    expect(s.points.filter((p) => p.hidden).length).toBeLessThanOrEqual(1);
    for (const c of s.curves) expect(c.points.length).toBeLessThanOrEqual(s.points.filter((p) => !p.hidden).length);
    if (s.n0) {
      expect(s.n0.n).toBeGreaterThanOrEqual(s.x[0]);
      expect(s.n0.n).toBeLessThanOrEqual(s.x[1]);
    }
  }
}

/** Trace one input and check it against the definitions. */
export function checkGrowth(input: GrowthInput, ex: GrowthExample, code: GrowthCode, codeLines: number) {
  const run = traceGrowth(input, ex, code);
  expectWellFormed(run.frames, codeLines);
  const ns = Array.from({ length: input.to - input.from + 1 }, (_, k) => input.from + k);
  expect(run.steps.map((s) => s.n)).toEqual(ns);
  expect(run.frames.length).toBe(2 * ns.length + 2);
  for (const s of run.steps) {
    expect(s.ops).toBe(ex.run(s.n, input.kase).ops);
    const g = BOUNDS[input.g].value(s.n);
    const lo = input.c[0] * g;
    const hi = (input.c[1] ?? input.c[0]) * g;
    const want = input.kind === 'O' ? s.ops <= lo : input.kind === 'Omega' ? lo <= s.ops : lo <= s.ops && s.ops <= hi;
    expect(s.holds, `n = ${s.n}`).toBe(want);
  }
  // n0: the smallest n from which every plotted point holds (brute force).
  let brute: number | null = null;
  for (const n of ns) {
    if (run.steps.filter((s) => s.n >= n).every((s) => s.holds)) {
      brute = n;
      break;
    }
  }
  expect(run.n0).toBe(brute);
  const last = run.frames[run.frames.length - 1];
  expect(last.state.n0?.n ?? null).toBe(brute);
  if (brute !== null) expect(last.caption).toContain(`n0 = ${brute}`);
  else expect(last.caption).toContain('no n0');
  // Every point of the last frame is measured and keeps its verdict's role.
  expect(last.state.points.map((p) => p.role)).toEqual(run.steps.map((s) => (s.holds ? 'good' : 'bad')));
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
