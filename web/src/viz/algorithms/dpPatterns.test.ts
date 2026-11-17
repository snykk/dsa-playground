import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { stabilizeLanes } from '../renderers/PatternLanes';
import { KNAPSACK_CODE, knapsack1dTrace, LCS_CODE, lcsRowsTrace, parseKnapsack1d, parseLcsRows, type KnapsackUpdate } from './dpPatterns';
import { lisTailsTrace } from './dpLinear';
import { expectLanesWellFormed, FIXTURES, rng } from './patternsMoreTestKit';

/** Brute force: the best value over all subsets of items that fit. */
function knapsackBrute(weights: number[], values: number[], capacity: number): number {
  let best = 0;
  for (let mask = 0; mask < 1 << weights.length; mask++) {
    let w = 0;
    let v = 0;
    weights.forEach((wi, i) => {
      if (mask & (1 << i)) {
        w += wi;
        v += values[i];
      }
    });
    if (w <= capacity) best = Math.max(best, v);
  }
  return best;
}

/** Reference LCS: the full (m + 1) x (n + 1) table, no space tricks. */
function lcsTable(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, () => Array.from({ length: b.length + 1 }, () => 0));
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);
  return dp[a.length][b.length];
}

describe('knapsack1dTrace (knapsack_01)', () => {
  it('reproduces every golden dp update and result', () => {
    const cases = FIXTURES.knapsack as Array<{ weights: number[]; values: number[]; capacity: number; updates: KnapsackUpdate[]; result: number }>;
    expect(cases.length).toBeGreaterThanOrEqual(60);
    for (const c of cases) {
      const run = knapsack1dTrace({ weights: c.weights, values: c.values, capacity: c.capacity });
      expect(run.updates, JSON.stringify(c)).toEqual(c.updates);
      expect(run.result).toBe(c.result);
    }
  });

  it('agrees with a brute force over all subsets, and reads dp[w - weight] before it is rewritten', () => {
    const r = rng(51);
    for (let t = 0; t < 200; t++) {
      const k = r.int(0, 6);
      const weights = Array.from({ length: k }, () => r.int(0, r.pick([4, 9, 20])));
      const values = Array.from({ length: k }, () => r.int(0, r.pick([9, 999])));
      const capacity = r.int(0, 15);
      const run = knapsack1dTrace({ weights, values, capacity });
      expect(run.result).toBe(knapsackBrute(weights, values, capacity));
      expectLanesWellFormed(stabilizeLanes(run.frames), KNAPSACK_CODE.length);
    }
  });

  it('counts an item once going down, which going up would not (the classic trap)', () => {
    const run = knapsack1dTrace(parseKnapsack1d('W=2; 1:1'));
    expect(run.result).toBe(1);
    expect(knapsack1dTrace(parseKnapsack1d('W=7; 1:1, 3:4, 4:5, 5:7')).result).toBe(9);
    // A zero-weight item fits capacity 0 (the Go version used to return 0 there).
    expect(knapsack1dTrace(parseKnapsack1d('W=0; 0:5')).result).toBe(5);
  });
});

describe('lcsRowsTrace (lcs)', () => {
  it('reproduces the golden swap, every curr row and the result', () => {
    const cases = FIXTURES.lcs as Array<{ a: string; b: string; text1: string; text2: string; rows: number[][]; result: number }>;
    expect(cases.length).toBeGreaterThanOrEqual(60);
    for (const c of cases) {
      const run = lcsRowsTrace({ a: c.a, b: c.b });
      expect([run.text1, run.text2], JSON.stringify(c)).toEqual([c.text1, c.text2]);
      expect(run.rows).toEqual(c.rows);
      expect(run.result).toBe(c.result);
    }
  });

  it('agrees with the full table on random strings, and the copy glides curr up into prev', () => {
    const r = rng(52);
    for (let t = 0; t < 200; t++) {
      const alpha = r.pick(['ab', 'abc', 'acgt']);
      const word = () => Array.from({ length: r.int(0, 10) }, () => r.pick(alpha.split(''))).join('');
      const [a, b] = [word(), word()];
      const run = lcsRowsTrace({ a, b });
      expect(run.result).toBe(lcsTable(a, b));
      expectLanesWellFormed(stabilizeLanes(run.frames), LCS_CODE.length);
    }
    const run = lcsRowsTrace(parseLcsRows('abcde | ace'));
    const copy = run.frames.findIndex((f) => f.line === 8);
    const before = run.frames[copy - 1].state.cells.filter((c) => c.lane === 1).map((c) => c.id);
    const after = run.frames[copy].state.cells.filter((c) => c.lane === 0).map((c) => c.id);
    expect(after).toEqual(before);
  });
});

describe("lis reuses the 'lis-tails' visualization", () => {
  it('the tails tracer gives the tails and the length of dp_patterns.lis on every golden case', () => {
    const cases = FIXTURES.lis as Array<{ nums: number[]; tails: number[][]; result: number }>;
    expect(cases.length).toBeGreaterThanOrEqual(50);
    for (const c of cases) {
      const frames = lisTailsTrace(c.nums);
      // One frame per number ends its placement (append: line 4, replace: line 5).
      const after = frames.filter((f) => f.line === 4 || f.line === 5).map((f) => f.state.rows![0].cells.map((cell) => Number(cell.value)));
      expect(after.length).toBe(c.nums.length);
      // The fixture records tails before each number: after number k is before number k + 1.
      expect([[], ...after.slice(0, -1)], JSON.stringify(c.nums)).toEqual(c.tails);
      expect(after.at(-1)!.length).toBe(c.result);
    }
  });
});

describe('parsers', () => {
  it('read the knapsack and the two strings', () => {
    expect(parseKnapsack1d('W=7; 1:1, 3:4')).toEqual({ capacity: 7, weights: [1, 3], values: [1, 4] });
    expect(parseKnapsack1d('capacity 5')).toEqual({ capacity: 5, weights: [], values: [] });
    expect(parseLcsRows('abcde | ace')).toEqual({ a: 'abcde', b: 'ace' });
    expect(parseLcsRows(' | abc')).toEqual({ a: '', b: 'abc' });
  });

  it('give friendly errors', () => {
    expect(() => parseKnapsack1d('7; 1:1')).toThrow(InputError);
    expect(() => parseKnapsack1d('W=-1; 1:1')).toThrow(/IndexError/);
    expect(() => parseKnapsack1d('W=16; 1:1')).toThrow(/up to 15/);
    expect(() => parseKnapsack1d('W=5; -1:3')).toThrow(/negative index/);
    expect(() => parseKnapsack1d('W=5; 1-3')).toThrow(/weight:value/);
    expect(() => parseKnapsack1d(`W=5; ${Array.from({ length: 7 }, () => '1:1').join(', ')}`)).toThrow(/At most 6/);
    expect(() => parseLcsRows('abc')).toThrow(/separated/);
    expect(() => parseLcsRows('abcdefghijk | a')).toThrow(/10 characters/);
    expect(() => parseLcsRows('a-b | a')).toThrow(/letters and digits/);
  });
});
