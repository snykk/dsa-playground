import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { stabilizeLanes } from '../renderers/PatternLanes';
import fixtures from './__fixtures__/dynamicProgramming.json';
import { expectLanesWellFormed, rng } from './patternsMoreTestKit';
import { DOWNWARD_CODE, fillRow, parseUnboundedKnapsack, UNBOUNDED_CODE, unboundedKnapsackTrace, type RelaxCall, type UnboundedKnapsackInput } from './unboundedKnapsack';

interface Direction {
  relaxations: RelaxCall[];
  dp: number[];
  choice: number[];
}
interface Case {
  weights: number[];
  values: number[];
  capacity: number;
  up: Direction;
  down: Direction;
  value: number;
  counts: number[];
  once: number;
}

/** Every multiset that fits: up to capacity / weight copies of each item. */
function bruteUnbounded(w: number[], v: number[], capacity: number, i = 0): number {
  if (i === w.length) return 0;
  let best = 0;
  for (let k = 0; k * w[i] <= capacity; k++) best = Math.max(best, k * v[i] + bruteUnbounded(w, v, capacity - k * w[i], i + 1));
  return best;
}

/** Every subset that fits. */
function bruteZeroOne(w: number[], v: number[], capacity: number): number {
  let best = 0;
  for (let mask = 0; mask < 1 << w.length; mask++) {
    let weight = 0;
    let value = 0;
    w.forEach((wi, i) => {
      if (mask & (1 << i)) {
        weight += wi;
        value += v[i];
      }
    });
    if (weight <= capacity) best = Math.max(best, value);
  }
  return best;
}

function randomInput(r: ReturnType<typeof rng>): UnboundedKnapsackInput {
  const n = r.int(0, 5);
  const weights = Array.from({ length: n }, () => r.int(1, r.pick([4, 8, 12])));
  const values = Array.from({ length: n }, () => r.int(0, r.pick([9, 30, 99])));
  return { weights, values, capacity: r.int(0, 12) };
}

describe('unboundedKnapsackTrace (unbounded_knapsack.py)', () => {
  const cases = (fixtures as unknown as { unboundedKnapsack: Case[] }).unboundedKnapsack;

  it('reproduces every golden _relax call, row, choice, count and value in both directions', () => {
    expect(cases.length).toBeGreaterThanOrEqual(70);
    for (const c of cases) {
      const input = { weights: c.weights, values: c.values, capacity: c.capacity };
      const up = unboundedKnapsackTrace(input, true);
      expect(up.relaxations, JSON.stringify(input)).toEqual(c.up.relaxations);
      expect([up.dp, up.choice]).toEqual([c.up.dp, c.up.choice]);
      expect([up.value, up.counts]).toEqual([c.value, c.counts]);
      const down = unboundedKnapsackTrace(input, false);
      expect(down.relaxations, JSON.stringify(input)).toEqual(c.down.relaxations);
      expect([down.dp, down.choice]).toEqual([c.down.dp, c.down.choice]);
      expect(down.value).toBe(c.once);
      expect(fillRow(input, true)).toEqual({ dp: c.up.dp, choice: c.up.choice });
      expect(fillRow(input, false)).toEqual({ dp: c.down.dp, choice: c.down.choice });
    }
  });

  it('agrees with brute force going up and with the 0/1 knapsack going down', () => {
    const r = rng(1449);
    for (let t = 0; t < 400; t++) {
      const input = randomInput(r);
      const { weights, values, capacity } = input;
      const up = unboundedKnapsackTrace(input, true);
      expect(up.value).toBe(bruteUnbounded(weights, values, capacity));
      expect(up.counts.reduce((s, k, i) => s + k * values[i], 0)).toBe(up.value);
      expect(up.counts.reduce((s, k, i) => s + k * weights[i], 0)).toBeLessThanOrEqual(capacity);
      const down = unboundedKnapsackTrace(input, false);
      expect(down.value).toBe(bruteZeroOne(weights, values, capacity));
      expectLanesWellFormed(stabilizeLanes(up.frames), UNBOUNDED_CODE.length);
      expectLanesWellFormed(stabilizeLanes(down.frames), DOWNWARD_CODE.length);
    }
  });

  it('shows the item read again going up, and never going down', () => {
    const input = parseUnboundedKnapsack('W=10; 1:1, 3:4, 4:5, 5:7');
    const up = unboundedKnapsackTrace(input, true);
    const last = up.frames.find((f) => f.caption.startsWith('dp[10] = max(dp[10] = 13, dp[5] + 7 = 7 + 7 = 14)'));
    expect(last?.caption).toContain('dp[5] already holds 1 copy of item #3');
    expect(last?.caption).toContain('makes 2 copies');
    expect(up.value).toBe(14);
    expect(up.counts).toEqual([0, 0, 0, 2]);
    const down = unboundedKnapsackTrace(input, false);
    expect(down.value).toBe(13);
    expect(down.frames.some((f) => f.caption.includes('already holds'))).toBe(false);
    expect(down.frames.at(-1)?.caption).toContain('Going up on the same input gives 14');
    expect(up.frames.find((f) => f.line === 5)?.caption).toContain('Going down on the same input gives only 13');
  });

  it('writes captions whose numbers match the code, over 3000 random inputs', () => {
    const r = rng(1636);
    const relax = /^dp\[(\d+)\] = max\(dp\[(\d+)\] = (\d+), dp\[(\d+)\] \+ (\d+) = (\d+) \+ (\d+) = (\d+)\): /;
    for (let t = 0; t < 3000; t++) {
      const input = randomInput(r);
      for (const upward of [true, false]) {
        const run = unboundedKnapsackTrace(input, upward);
        const captions = run.frames.map((f) => f.caption);
        const relaxCaptions = captions.filter((c) => relax.test(c));
        expect(relaxCaptions.length).toBe(run.relaxations.length);
        relaxCaptions.forEach((c, k) => {
          const [item, w, old, cand] = run.relaxations[k];
          const m = c.match(relax)!.slice(1).map(Number);
          const weight = input.weights[item];
          const value = input.values[item];
          expect(m).toEqual([w, w, old, w - weight, value, cand - value, value, cand]);
          if (cand > old) expect(c).toContain(`taking item #${item} is better, so dp[${w}] = ${cand}`);
          else if (cand === old) expect(c).toContain('a tie');
          else expect(c).toContain(`dp[${w}] stays ${old}`);
        });
        for (const c of captions) {
          expect(c).not.toMatch(/\b1 copies\b|\b(?:[02-9]|\d\d+) copy\b|copys|undefined|NaN|\bnull\b/);
          expect(c).not.toMatch(/\s{2}|\s[.,:]/);
        }
        const done = captions.at(-1)!;
        if (upward) {
          const weightUsed = run.counts.reduce((s, k, i) => s + k * input.weights[i], 0);
          expect(done).toMatch(/^choice\[\d+\] = -1: stop\. /);
          if (run.value > 0) expect(done).toContain(`weigh ${weightUsed} of ${input.capacity} and are worth ${run.value} = dp[${input.capacity}]`);
          // The walk's frames name every copy taken.
          const walk = captions.filter((c) => /^choice\[\d+\] = #\d+: take one copy/.test(c));
          expect(walk.length).toBe(run.counts.reduce((s, k) => s + k, 0));
        } else {
          expect(done).toContain(`Done: dp[${input.capacity}] = ${run.value}`);
        }
      }
    }
  });

  it('breaks ties toward the first item that reaches the best value', () => {
    expect(unboundedKnapsackTrace(parseUnboundedKnapsack('W=4; 2:3, 4:6'), true).counts).toEqual([2, 0]);
    expect(unboundedKnapsackTrace(parseUnboundedKnapsack('W=4; 4:6, 2:3'), true).counts).toEqual([1, 0]);
    expect(unboundedKnapsackTrace(parseUnboundedKnapsack('W=9; 3:4, 3:4'), true).counts).toEqual([3, 0]);
  });

  it('handles capacity 0, no items and items that do not fit', () => {
    const zero = unboundedKnapsackTrace(parseUnboundedKnapsack('W=0; 1:1, 3:4'), true);
    expect([zero.value, zero.counts]).toEqual([0, [0, 0]]);
    const none = unboundedKnapsackTrace(parseUnboundedKnapsack('W=6'), true);
    expect([none.value, none.counts, none.relaxations]).toEqual([0, [], []]);
    const heavy = unboundedKnapsackTrace(parseUnboundedKnapsack('W=3; 4:10, 5:12'), true);
    expect(heavy.relaxations).toEqual([]);
    expect(heavy.frames.filter((f) => f.caption.includes('its range of w is empty')).length).toBe(2);
    expect(heavy.frames.at(-1)?.caption).toContain('the bag stays empty');
  });

  it('rejects what the Python code rejects, and inputs too large to draw', () => {
    const bad = ['W=5; 0:3', 'W=5; -1:3', 'W=-1; 1:1', 'W=13; 1:1', 'W=5; 1:1, 1:1, 1:1, 1:1, 1:1, 1:1', 'W=5; 13:1', 'W=5; 2:100', 'W=5; 2:-1', '5; 1:1', 'W=5; 1-1'];
    for (const text of bad) expect(() => parseUnboundedKnapsack(text), text).toThrow(InputError);
    expect(() => parseUnboundedKnapsack('W=5; 0:3')).toThrow(/ValueError/);
    expect(parseUnboundedKnapsack('W = 10; 1:1, 3:4')).toEqual({ weights: [1, 3], values: [1, 4], capacity: 10 });
  });
});
