import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import fixtures from './__fixtures__/greedy.json';
import {
  activityRun,
  bestWholeItems,
  fractionalRun,
  parseActivities,
  parseFractional,
  type Activity,
  type FractionalInput,
} from './greedy';

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

const toActs = (pairs: number[][]): Activity[] => pairs.map(([start, finish], id) => ({ id, start, finish }));

/** Maximum number of pairwise compatible activities, by trying every subset (n <= 12). */
function bruteActivities(acts: Activity[]): number {
  let best = 0;
  for (let mask = 0; mask < 1 << acts.length; mask++) {
    const chosen = acts.filter((_, k) => mask & (1 << k)).sort((a, b) => a.start - b.start);
    let ok = true;
    for (let k = 1; k < chosen.length && ok; k++) ok = chosen[k].start >= chosen[k - 1].finish;
    if (ok) best = Math.max(best, chosen.length);
  }
  return best;
}

/** Optimal fractional value by a fine independent method: exact LP via ratio order on a separate sort. */
function referenceFractional({ capacity, items }: FractionalInput): number {
  let total = 0;
  let room = capacity;
  const sorted = [...items].sort((a, b) => b.value * (a.weight || 1e-12) - a.value * (b.weight || 1e-12));
  for (const it of sorted.filter((i) => i.weight === 0)) total += it.value;
  for (const it of sorted.filter((i) => i.weight > 0).sort((a, b) => b.value / b.weight - a.value / a.weight)) {
    const take = Math.min(1, room / it.weight);
    if (take <= 0) break;
    total += it.value * take;
    room -= it.weight * take;
  }
  return total;
}

describe('parseActivities', () => {
  it('reads start-finish pairs', () => {
    expect(parseActivities('1-4, 3-5; 0-6')).toEqual([
      { id: 0, start: 1, finish: 4 },
      { id: 1, start: 3, finish: 5 },
      { id: 2, start: 0, finish: 6 },
    ]);
  });
  it('reads negative times', () => {
    expect(parseActivities('-4--2')).toEqual([{ id: 0, start: -4, finish: -2 }]);
  });
  it('rejects bad input', () => {
    expect(() => parseActivities('')).toThrow(InputError);
    expect(() => parseActivities('abc')).toThrow(InputError);
    expect(() => parseActivities('5-5')).toThrow(InputError);
    expect(() => parseActivities('6-2')).toThrow(InputError);
    expect(() => parseActivities('1-2000')).toThrow(InputError);
    expect(() => parseActivities(Array.from({ length: 15 }, (_, i) => `${i}-${i + 1}`).join(','))).toThrow(InputError);
  });
});

describe('activity selection tracer', () => {
  it('handles the textbook example', () => {
    const run = activityRun(toActs([[1, 4], [3, 5], [0, 6], [5, 7], [3, 9], [5, 9], [6, 10], [8, 11], [8, 12], [2, 14], [12, 16]]));
    expect(run.selected).toEqual([0, 3, 7, 10]);
  });
  it('a single activity is selected', () => {
    expect(activityRun(toActs([[-4, -2]])).selected).toEqual([0]);
  });
  it('allows back-to-back activities and keeps input order on equal finish times', () => {
    expect(activityRun(toActs([[0, 2], [2, 4]])).selected).toEqual([0, 1]);
    expect(activityRun(toActs([[0, 5], [3, 5]])).selected).toEqual([0]);
  });
  it('matches brute force on 200 random instances and selects a compatible set', () => {
    const rand = rng(11);
    for (let t = 0; t < 200; t++) {
      const n = 1 + Math.floor(rand() * 10);
      const pairs = Array.from({ length: n }, () => {
        const s = Math.floor(rand() * 21) - 6;
        return [s, s + 1 + Math.floor(rand() * 6)];
      });
      const acts = toActs(pairs);
      const run = activityRun(acts);
      expect(run.selected.length).toBe(bruteActivities(acts));
      const chosen = run.selected.map((id) => acts[id]);
      for (let k = 1; k < chosen.length; k++) expect(chosen[k].start).toBeGreaterThanOrEqual(chosen[k - 1].finish);
      expect(run.frames.length).toBeGreaterThan(2);
    }
  });
});

describe('activity selection matches the Python reference (golden fixtures)', () => {
  const cases = fixtures.activity as unknown as Array<{ activities: number[][]; selected: number[] }>;
  it('has fixtures to check', () => expect(cases.length).toBeGreaterThanOrEqual(100));
  it('reproduces activity_selection exactly', () => {
    for (const c of cases) expect(activityRun(toActs(c.activities)).selected).toEqual(c.selected);
  });
});

describe('parseFractional', () => {
  it('reads capacity and weight:value pairs', () => {
    expect(parseFractional('W=50; 10:60, 20:100')).toEqual({
      capacity: 50,
      items: [
        { id: 0, weight: 10, value: 60 },
        { id: 1, weight: 20, value: 100 },
      ],
    });
  });
  it('rejects bad input', () => {
    expect(() => parseFractional('10:60')).toThrow(InputError);
    expect(() => parseFractional('W=0; 1:1')).toThrow(InputError);
    expect(() => parseFractional('W=5;')).toThrow(InputError);
    expect(() => parseFractional('W=5; x')).toThrow(InputError);
    expect(() => parseFractional('W=5; 999:1')).toThrow(InputError);
  });
});

describe('fractional knapsack tracer', () => {
  it('solves the classic example (240)', () => {
    const run = fractionalRun(parseFractional('W=50; 10:60, 20:100, 30:120'));
    expect(run.total).toBeCloseTo(240, 9);
    expect(run.selected.map((s) => s.fraction)).toEqual([1, 1, 2 / 3]);
  });
  it('takes a zero-weight item for free', () => {
    const run = fractionalRun({ capacity: 5, items: [{ id: 0, weight: 0, value: 10 }, { id: 1, weight: 10, value: 60 }] });
    expect(run.total).toBeCloseTo(40, 9);
  });
  it('whole-item brute force shows greedy-by-ratio can lose', () => {
    const items = parseFractional('W=10; 6:7, 5:5, 5:5').items;
    expect(bestWholeItems(items, 10).value).toBe(10);
  });
  it('matches the reference optimum on 200 random instances and never overfills', () => {
    const rand = rng(23);
    for (let t = 0; t < 200; t++) {
      const n = 1 + Math.floor(rand() * 7);
      const items = Array.from({ length: n }, (_, id) => ({
        id,
        weight: rand() < 0.15 ? 0 : 1 + Math.floor(rand() * 15),
        value: Math.floor(rand() * 60),
      }));
      const input = { capacity: 1 + Math.floor(rand() * 40), items };
      const run = fractionalRun(input);
      expect(run.total).toBeCloseTo(referenceFractional(input), 6);
      const used = run.selected.reduce((s, x) => s + x.weight * x.fraction, 0);
      expect(used).toBeLessThanOrEqual(input.capacity + 1e-9);
      expect(run.total).toBeGreaterThanOrEqual(bestWholeItems(items, input.capacity).value - 1e-9);
    }
  });
});

describe('fractional knapsack matches the Python reference (golden fixtures)', () => {
  const cases = fixtures.knapsack as unknown as Array<{
    capacity: number;
    items: number[][];
    total: number;
    selected: number[][];
  }>;
  it('has fixtures to check', () => expect(cases.length).toBeGreaterThanOrEqual(100));
  it('reproduces fractional_knapsack: total, packing order and fractions', () => {
    for (const c of cases) {
      const items = c.items.map(([value, weight], id) => ({ id, value, weight }));
      const run = fractionalRun({ capacity: c.capacity, items });
      expect(run.total).toBeCloseTo(c.total, 9);
      expect(run.selected.map((s) => [s.value, s.weight, s.fraction])).toEqual(
        c.selected.map(([v, w, f]) => [v, w, expect.closeTo(f, 9)]),
      );
    }
  });
});
