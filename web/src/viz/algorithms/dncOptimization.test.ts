import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import fixtures from './__fixtures__/dynamicProgramming.json';
import { DNC_CODE, dncTrace, parseDnc, partitionPlain, prefixOf, type DncInput } from './dncOptimization';
import { framesProblems, rng } from './patternsMoreTestKit';

interface Case {
  values: number[];
  k: number;
  calls: number[][];
  splits: number[][];
  evaluations: number[][];
  cost: number;
  bounds: number[];
  plainCost: number;
  plainBounds: number[];
}

/** Every split into k groups: the best cost and, among the best, the one whose last cut is smallest, then the one before. */
function bruteForce(values: number[], k: number): { cost: number; bounds: number[] } {
  const n = values.length;
  const p = prefixOf(values);
  let best: { cost: number; bounds: number[] } | null = null;
  const bounds = Array.from({ length: k + 1 }, () => 0);
  bounds[k] = n;
  const key = (b: number[]) => [...b].reverse();
  const less = (a: number[], b: number[]) => {
    for (let t = 0; t < a.length; t++) if (a[t] !== b[t]) return a[t] < b[t];
    return false;
  };
  const rec = (g: number, from: number) => {
    if (g === k) {
      const cost = bounds.slice(0, k).reduce((s, b, t) => s + (p[bounds[t + 1]] - p[b]) ** 2, 0);
      if (!best || cost < best.cost || (cost === best.cost && less(key(bounds), key(best.bounds)))) best = { cost, bounds: [...bounds] };
      return;
    }
    for (let cut = from; cut <= n - (k - g); cut++) {
      bounds[g] = cut;
      rec(g + 1, cut + 1);
    }
  };
  rec(1, 1);
  return best!;
}

function randomInput(r: ReturnType<typeof rng>, negative = false): DncInput {
  const n = r.int(1, 12);
  const high = r.pick([3, 9, 30]);
  const values = Array.from({ length: n }, () => r.int(negative ? -high : 0, high));
  return { values, k: r.int(1, Math.min(n, 5)) };
}

const plainCount = (n: number, k: number) => {
  let c = n;
  for (let g = 2; g <= k; g++) c += ((n - g + 1) * (n - g + 2)) / 2;
  return c;
};

describe('dncTrace (divide_and_conquer_optimization.py)', () => {
  const cases = (fixtures as unknown as { dncOptimization: Case[] }).dncOptimization;

  it('reproduces every golden call, cell, cost evaluation and answer', () => {
    expect(cases.length).toBeGreaterThanOrEqual(60);
    for (const c of cases) {
      const run = dncTrace({ values: c.values, k: c.k });
      const where = JSON.stringify([c.values, c.k]);
      expect(run.calls, where).toEqual(c.calls);
      expect(run.splits, where).toEqual(c.splits);
      expect(run.evaluations, where).toEqual(c.evaluations);
      expect([run.cost, run.bounds], where).toEqual([c.cost, c.bounds]);
      expect([run.plainCost, run.plainBounds], where).toEqual([c.plainCost, c.plainBounds]);
      const plain = partitionPlain(c.values, c.k);
      expect([plain.cost, plain.bounds]).toEqual([c.plainCost, c.plainBounds]);
    }
    // Some fixtures have a negative value where the recursion misses the best split.
    expect(cases.filter((c) => c.cost !== c.plainCost).length).toBeGreaterThan(0);
  });

  it('agrees with every split, tie rule included, when no value is negative', () => {
    const r = rng(2086);
    for (let t = 0; t < 400; t++) {
      const input = randomInput(r);
      const run = dncTrace(input);
      const want = bruteForce(input.values, input.k);
      expect([run.cost, run.bounds], JSON.stringify(input)).toEqual([want.cost, want.bounds]);
      expect([run.plainCost, run.plainBounds]).toEqual([want.cost, want.bounds]);
      expect(framesProblems(run.frames, DNC_CODE.length)).toEqual([]);
    }
  });

  it('stays within m (log2 m + 2) cost evaluations per layer', () => {
    const r = rng(868);
    for (let t = 0; t < 300; t++) {
      const input = randomInput(r);
      const { values, k } = input;
      const n = values.length;
      const run = dncTrace(input);
      let bound = n;
      for (let g = 2; g <= k; g++) bound += (n - g + 1) * (Math.floor(Math.log2(n - g + 1)) + 2);
      expect(run.evaluations.length).toBeLessThanOrEqual(bound);
      expect(run.evaluations.length).toBeLessThanOrEqual(plainCount(n, k));
    }
    const pi = dncTrace(parseDnc('k=3; 3 1 4 1 5 9 2 6'));
    expect([pi.cost, pi.bounds, pi.evaluations.length, plainCount(8, 3)]).toEqual([341, [0, 4, 6, 8], 41, 57]);
  });

  it('shows the article example: the middle cell first, a tie kept at the smaller j, and the counts', () => {
    const run = dncTrace(parseDnc('k=3; 3 1 4 1 5 9 2 6'));
    const captions = run.frames.map((f) => f.caption);
    expect(captions).toContain('The whole layer: cells 2 to 8 with j from 1 to 7. The middle cell is mid = (2 + 8) // 2 = 5, solved first: it tries j from 1 to 4, because j stops at mid - 1 = 4 so that the last group is not empty.');
    expect(captions).toContain('j = 5: dp[1][5] + (P[6] - P[5])^2 = 196 + 9^2 = 196 + 81 = 277, equal to 277: a tie, and the smaller j = 4 stays.');
    expect(captions).toContain('dp[2][5] = 100 at j = 3, so opt(2, 5) = 3. On the left, the cells 2 to 4 need only j <= 3; on the right, the cells 6 to 8 need only j >= 3.');
    expect(captions).toContain('Layer 2 is done with 19 cost evaluations, where trying every j for every cell costs 28. opt(2, i) for i = 2..8 is 1, 2, 2, 3, 4, 5, 5, and trying every j gives each cell the same minimum: the best j never moves left.');
    expect(captions.at(-1)).toBe('bounds = [0, 4, 6, 8]: the groups sum to 9, 14, 8 and cost 81 + 196 + 64 = 341. The recursion evaluated 41 costs; the plain DP evaluates 57.');
  });

  it('shows where a negative value makes the recursion miss', () => {
    const run = dncTrace(parseDnc('k=2; 1 2 4 -5'));
    expect([run.cost, run.bounds, run.plainCost, run.plainBounds]).toEqual([10, [0, 2, 4], 2, [0, 1, 4]]);
    const captions = run.frames.map((f) => f.caption);
    expect(captions.some((c) => c.includes('Trying every j would give 2 at j = 1, outside the range 2..3 this cell was given'))).toBe(true);
    expect(captions.some((c) => c.includes('but only because the ranges forced it: trying every j, cell 4 would take j = 1 for 2'))).toBe(true);
    expect(captions.at(-1)).toContain('But the plain DP returns 2 with bounds [0, 1, 4]: the narrowing first cut off the best j at dp[2][4], where j = 1 lay outside 2..3.');
  });

  it('writes captions whose numbers match the code, over 3000 random inputs', () => {
    const r = rng(1603);
    const evalRe = /^j = (\d+): dp\[(\d+)\]\[(\d+)\] \+ \(P\[(\d+)\] - P\[(\d+)\]\)\^2 = (-?\d+) \+ \(?(-?\d+)\)?\^2 = (-?\d+) \+ (\d+) = (-?\d+), /;
    for (let t = 0; t < 3000; t++) {
      const input = randomInput(r, t % 3 === 0);
      const p = prefixOf(input.values);
      const run = dncTrace(input);
      const captions = run.frames.map((f) => f.caption);
      const evalCaptions = captions.filter((c) => evalRe.test(c));
      // One caption per cost evaluation after layer 1.
      expect(evalCaptions.length).toBe(run.evaluations.length - input.values.length);
      evalCaptions.forEach((c, idx) => {
        const [j, i, cost] = run.evaluations[input.values.length + idx];
        const [cj, gPrev, cj2, ci, cj3, prev, diff, prev2, c2, cand] = c.match(evalRe)!.slice(1).map(Number);
        expect([cj, cj2, cj3, ci, diff, c2, prev2]).toEqual([j, j, j, i, p[i] - p[j], cost, prev]);
        expect(cand).toBe(prev + cost);
        expect(gPrev).toBeGreaterThanOrEqual(1);
      });
      for (const c of captions) {
        expect(c).not.toMatch(/\b1 (?:cost evaluations|costs|cells|values)\b/);
        expect(c).not.toMatch(/\b(?:[02-9]|\d\d+) (?:cost evaluation(?!s)|cost(?! evaluation)(?!s)|cell(?!s)|value(?!s))/);
        expect(c).not.toMatch(/undefined|NaN|\bnull\b|Infinity|\s{2}|\s[.,:;]/);
      }
      if (!input.values.some((v) => v < 0)) expect(captions.some((c) => c.includes('Trying every j would give') || c.includes('only because the ranges forced it'))).toBe(false);
      const last = captions.at(-1)!;
      expect(last).toMatch(new RegExp(`^bounds = \\[${run.bounds.join(', ')}\\]: `));
      if (run.cost !== run.plainCost || run.bounds.join() !== run.plainBounds.join()) {
        expect(input.values.some((v) => v < 0)).toBe(true);
        expect(last).toContain(`But the plain DP returns ${run.plainCost} with bounds [${run.plainBounds.join(', ')}]`);
      }
      // The work lines count what the code counts.
      const finalWork = run.frames.at(-1)!.state.work.map((l) => l.text).join(' | ');
      expect(finalWork).toContain(`all layers: ${run.evaluations.length} cost evaluation`);
      expect(finalWork).toContain(`the plain DP costs ${plainCount(input.values.length, input.k)}`);
    }
  });

  it('keeps one picture size through a run and draws only cells that exist', () => {
    const r = rng(321);
    for (let t = 0; t < 200; t++) {
      const input = randomInput(r, t % 4 === 0);
      const n = input.values.length;
      const run = dncTrace(input);
      const first = run.frames[0].state;
      for (const f of run.frames) {
        const s = f.state;
        expect([s.n, s.depthRows, s.workChars, s.values.length, s.prefix.length, s.prev.length, s.cur.length, s.opt.length]).toEqual([n, first.depthRows, first.workChars, n, n + 1, n + 1, n + 1, n + 1]);
        for (const c of s.calls) expect(c.depth).toBeLessThan(s.depthRows);
        for (const g of s.groups) expect(0 <= g.from && g.from <= g.to && g.to < n).toBe(true);
        if (s.jRange) expect(0 <= s.jRange.from && s.jRange.from <= s.jRange.to && s.jRange.to < n).toBe(true);
        if (s.arrow) expect(s.prev[s.arrow.from] !== null && s.cur[s.arrow.to] !== null).toBe(true);
        for (const l of s.work) expect(l.text.length).toBeLessThan(s.workChars);
      }
    }
  });

  it('handles one group, one value per group and equal values', () => {
    const one = dncTrace(parseDnc('k=1; 3 1 4 1 5 9 2 6'));
    expect([one.cost, one.bounds, one.evaluations.length, one.calls]).toEqual([961, [0, 8], 8, []]);
    const each = dncTrace(parseDnc('k=4; 4 0 7 2'));
    expect([each.cost, each.bounds]).toEqual([69, [0, 1, 2, 3, 4]]);
    const ties = dncTrace(parseDnc('k=3; 1 1 1 1 1 1 1'));
    expect([ties.cost, ties.bounds]).toEqual([17, [0, 2, 4, 7]]);
    const single = dncTrace(parseDnc('k=1; 7'));
    expect([single.cost, single.bounds]).toEqual([49, [0, 1]]);
  });

  it('rejects what the Python code rejects, and inputs too large to draw', () => {
    const bad = ['k=0; 1 2', 'k=3; 1 2', 'k=1', 'k=1;', 'k=-1; 4', 'k=2; 1 2 x', 'k=2; 31 1', 'k=2; 1 -31', 'k=6; 1 2 3 4 5 6 7', 'k=2; 1 2 3 4 5 6 7 8 9 10 11 12 13', '3; 1 2 3'];
    for (const text of bad) expect(() => parseDnc(text), text).toThrow(InputError);
    expect(() => parseDnc('k=3; 1 2')).toThrow(/ValueError/);
    expect(() => parseDnc('k=0; 1 2')).toThrow(/ValueError/);
    expect(() => parseDnc('k=1')).toThrow(/ValueError/);
    expect(parseDnc('K = 2; 3, 1 4')).toEqual({ values: [3, 1, 4], k: 2 });
    expect(parseDnc('k=2; 1 -5 30')).toEqual({ values: [1, -5, 30], k: 2 });
  });
});
