import { describe, expect, it } from 'vitest';
import { InputError, type Frame } from '../core/types';
import { stabilizeVenn, type VennState } from '../renderers/VennView';
import {
  DIVISIBLE_CODE,
  divisibleTrace,
  gcd,
  parseDivisible,
  parseUnionSets,
  UNION_CODE,
  unionTrace,
  type DivisibleTerm,
  type UnionTerm,
} from './inclusionExclusion';
import { expectFramesWellFormed, FIXTURES, rng } from './patternsMoreTestKit';

function expectVennWellFormed(frames: Array<Frame<VennState>>, codeLines: number) {
  expectFramesWellFormed(frames, codeLines);
  for (const f of stabilizeVenn(frames)) {
    const k = f.state.sets.length;
    expect(k).toBeGreaterThanOrEqual(1);
    expect(k).toBeLessThanOrEqual(3);
    expect(f.state.rows.length).toBeLessThanOrEqual(f.state.rowSlots!);
    for (const r of f.state.rows) expect(r.cells.length).toBe(f.state.columns.length);
    for (const a of f.state.atoms) expect(a.mask >= 1 && a.mask < 2 ** k).toBe(true);
    for (const e of f.state.elements ?? []) expect(e.mask >= 1 && e.mask < 2 ** k).toBe(true);
    if (f.state.focus) expect(f.state.focus.mask >= 1 && f.state.focus.mask < 2 ** k).toBe(true);
  }
}

/** Direct count: every number in 1..n tested against every divisor. */
function directCount(n: number, divisors: number[]): number {
  let c = 0;
  for (let x = 1; x <= n; x++) if (divisors.some((d) => x % d === 0)) c++;
  return c;
}

describe('divisibleTrace (count_divisible)', () => {
  it('reproduces every golden term (mask, subset size, lcm) and result', () => {
    const cases = FIXTURES.divisible as Array<{ n: number; divisors: number[]; terms: DivisibleTerm[]; result: number }>;
    expect(cases.length).toBeGreaterThanOrEqual(60);
    for (const c of cases) {
      const run = divisibleTrace({ n: c.n, divisors: c.divisors });
      expect(run.terms, JSON.stringify([c.n, c.divisors])).toEqual(c.terms);
      expect(run.result).toBe(c.result);
    }
  });

  it('agrees with a direct count on random inputs, and ends with every region counted once', () => {
    const r = rng(81);
    for (let t = 0; t < 200; t++) {
      const divisors = Array.from({ length: r.int(1, 3) }, () => r.int(1, r.pick([6, 15, 60])));
      const n = r.int(-20, 400);
      const run = divisibleTrace({ n, divisors });
      expect(run.result, JSON.stringify([n, divisors])).toBe(Math.max(0, directCount(n, divisors)));
      expectVennWellFormed(run.frames, DIVISIBLE_CODE.length);
      if (n >= 1) {
        const last = run.frames.at(-1)!.state;
        // Region sizes add up to the answer, and every region ends counted exactly once.
        expect(last.atoms.reduce((s, a) => s + Number(a.main), 0)).toBe(run.result);
        for (const a of last.atoms) expect(a.role).toBe('good');
      }
    }
  });

  it('builds the lcm one divisor at a time, as lcm * d // gcd(lcm, d)', () => {
    const run = divisibleTrace(parseDivisible('n 30; divisors 4, 6'));
    expect(run.terms).toEqual([
      [1, 1, 4],
      [2, 1, 6],
      [3, 2, 12],
    ]);
    expect(run.result).toBe(10);
    expect(run.frames.some((f) => f.caption.includes('lcm = 4 * 6 // gcd(4, 6) = 24 // 2 = 12'))).toBe(true);
  });

  it('returns 0 for n below 1 (the fixed bug: floor division gave negative counts)', () => {
    expect(divisibleTrace({ n: -10, divisors: [3] }).result).toBe(0);
    expect(divisibleTrace({ n: 0, divisors: [2, 3] }).result).toBe(0);
  });
});

describe('unionTrace (count_union_sets)', () => {
  it('reproduces every golden term (mask, subset size, intersection size) and result', () => {
    const cases = FIXTURES.union as Array<{ sets: number[][]; terms: UnionTerm[]; result: number }>;
    expect(cases.length).toBeGreaterThanOrEqual(50);
    for (const c of cases) {
      const run = unionTrace(c.sets);
      expect(run.terms, JSON.stringify(c.sets)).toEqual(c.terms);
      expect(run.result).toBe(c.result);
    }
  });

  it('counts the union on random sets, every element ending counted once', () => {
    const r = rng(82);
    for (let t = 0; t < 200; t++) {
      const sets = Array.from({ length: r.int(1, 3) }, () => Array.from({ length: r.int(0, 6) }, () => r.int(0, r.pick([5, 20, 99]))));
      const run = unionTrace(sets);
      expect(run.result).toBe(new Set(sets.flat()).size);
      expectVennWellFormed(run.frames, UNION_CODE.length);
      for (const e of run.frames.at(-1)!.state.elements!) expect(e.count).toBe(1);
    }
  });

  it('starts each intersection from the first set in the subset (the README example gives 5)', () => {
    const run = unionTrace(parseUnionSets('1 2 3 | 2 3 4 | 3 4 5'));
    expect(run.result).toBe(5);
    const mid = run.frames.find((f) => f.caption.startsWith('mask 110'))!;
    expect(mid.caption).toContain('set(sets[1])');
  });
});

describe('helpers and parsers', () => {
  it('gcd is Euclid with Python semantics on positive numbers', () => {
    expect(gcd(12, 18)).toBe(6);
    expect(gcd(7, 5)).toBe(1);
    expect(gcd(5, 0)).toBe(5);
  });

  it('read inputs, with friendly errors', () => {
    expect(parseDivisible('n 100; divisors 2, 3, 5')).toEqual({ n: 100, divisors: [2, 3, 5] });
    expect(parseDivisible('100; 2 3')).toEqual({ n: 100, divisors: [2, 3] });
    expect(parseUnionSets('1 2 3 | | 3')).toEqual([[1, 2, 3], [], [3]]);
    expect(() => parseDivisible('100')).toThrow(InputError);
    expect(() => parseDivisible('n 100; divisors')).toThrow(/at least one/);
    expect(() => parseDivisible('n 100; divisors 0')).toThrow(/ZeroDivisionError/);
    expect(() => parseDivisible('n 100; divisors -2')).toThrow(/1 to 999/);
    expect(() => parseDivisible('n 100; divisors 2 3 5 7')).toThrow(/At most 3/);
    expect(() => parseDivisible('n 2000000000; divisors 2')).toThrow(/10\^9/);
    expect(() => parseUnionSets('1 | 2 | 3 | 4')).toThrow(/At most 3/);
    expect(() => parseUnionSets('1 2 3 4 5 6 7')).toThrow(/At most 6/);
    expect(() => parseUnionSets('1 x')).toThrow(/whole numbers/);
  });
});
