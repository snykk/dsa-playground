import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { SYM } from '../ui/symbols';
import fixtures from './__fixtures__/patterns.json';
import {
  daysNeeded,
  differenceArrayTrace,
  kDistinctTrace,
  nextGreaterTrace,
  parseKDistinct,
  parseRangeQueries,
  parseRangeUpdates,
  parseShip,
  parseTwoPointers,
  parseValues,
  parseWindow,
  prefixSumTrace,
  shipCapacityTrace,
  twoPointersTrace,
  windowMaxTrace,
  type PatternFrame,
} from './patterns';

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}
const ri = (r: () => number, lo: number, hi: number) => lo + Math.floor(r() * (hi - lo + 1));
const last = (frames: PatternFrame[]) => frames[frames.length - 1];
const varOf = (f: PatternFrame, name: string) => f.vars?.find(([k]) => k === name)?.[1];

function checkFrames(frames: PatternFrame[], lines: number) {
  expect(frames.length).toBeGreaterThan(1);
  for (const f of frames) {
    expect(f.caption.length).toBeGreaterThan(0);
    if (f.line !== undefined) {
      expect(f.line).toBeGreaterThanOrEqual(0);
      expect(f.line).toBeLessThan(lines);
    }
  }
}

describe('two pointers', () => {
  const cases = fixtures['two-pointers'] as Array<{ values: number[]; target: number; result: number[] | null }>;
  it('returns exactly the Python indices on every golden case', () => {
    expect(cases.length).toBeGreaterThanOrEqual(60);
    for (const c of cases) {
      const frames = twoPointersTrace({ values: c.values, target: c.target, sortedByUs: false });
      checkFrames(frames, 7);
      const pair = varOf(last(frames), 'pair');
      expect(pair ?? null, JSON.stringify(c)).toEqual(c.result ? `(${c.result[0]}, ${c.result[1]})` : null);
    }
  });
  it('agrees with a brute-force search on 200 random sorted arrays and needs at most n - 1 checks', () => {
    const r = rng(11);
    for (let t = 0; t < 200; t++) {
      const values = Array.from({ length: ri(r, 2, 16) }, () => ri(r, -20, 20)).sort((x, y) => x - y);
      const target = ri(r, -40, 40);
      let exists = false;
      for (let i = 0; i < values.length; i++) for (let j = i + 1; j < values.length; j++) if (values[i] + values[j] === target) exists = true;
      const frames = twoPointersTrace({ values, target, sortedByUs: false });
      expect(varOf(last(frames), 'pair') !== undefined).toBe(exists);
      expect(Number(varOf(last(frames), 'steps'))).toBeLessThanOrEqual(values.length - 1);
    }
  });
  it('parses, sorts and rejects bad input', () => {
    expect(parseTwoPointers('11, 2, 15, 7; target 9')).toEqual({ values: [2, 7, 11, 15], target: 9, sortedByUs: true });
    expect(() => parseTwoPointers('1, 2, 3')).toThrow(InputError);
    expect(() => parseTwoPointers('5; target 5')).toThrow(InputError);
    expect(() => parseTwoPointers('1, 2; target x')).toThrow(InputError);
  });
});

describe('sliding window (at most k distinct)', () => {
  const cases = fixtures['sliding-window'] as Array<{ s: string; k: number; result: number }>;
  it('finds the Python length on every golden case', () => {
    expect(cases.length).toBeGreaterThanOrEqual(60);
    for (const c of cases) {
      const frames = kDistinctTrace({ s: c.s, k: c.k });
      checkFrames(frames, 7);
      expect(varOf(last(frames), 'best'), JSON.stringify(c)).toBe(c.result);
    }
  });
  it('matches brute force on 200 random strings and the window is valid whenever it is scored', () => {
    const r = rng(5);
    for (let t = 0; t < 200; t++) {
      const s = Array.from({ length: ri(r, 1, 20) }, () => 'abcd'[ri(r, 0, 3)]).join('');
      const k = ri(r, 1, 4);
      let best = 0;
      for (let i = 0; i < s.length; i++) for (let j = i; j < s.length; j++) if (new Set(s.slice(i, j + 1)).size <= k) best = Math.max(best, j - i + 1);
      const frames = kDistinctTrace({ s, k });
      expect(varOf(last(frames), 'best')).toBe(best);
      for (const f of frames.filter((f) => f.line === 5)) expect(Number(varOf(f, 'distinct in window'))).toBeLessThanOrEqual(k);
    }
  });
  it('parses and rejects bad input', () => {
    expect(parseKDistinct('eceba; k 2')).toEqual({ s: 'eceba', k: 2 });
    expect(() => parseKDistinct('eceba')).toThrow(InputError);
    expect(() => parseKDistinct('a b; k 2')).toThrow(InputError);
    expect(() => parseKDistinct('abc; k 0')).toThrow(InputError);
  });
});

describe('prefix sums', () => {
  const cases = fixtures['prefix-sum'] as Array<{ values: number[]; queries: Array<[number, number]>; result: number[] }>;
  const answers = (f: PatternFrame) => f.state.strips![0].items.map((it) => Number(it.text.split('= ')[1]));
  it('answers every query like the Python PrefixSum on all golden cases', () => {
    expect(cases.length).toBeGreaterThanOrEqual(60);
    for (const c of cases) {
      const frames = prefixSumTrace({ values: c.values, queries: c.queries });
      checkFrames(frames, 4);
      expect(answers(last(frames))).toEqual(c.result);
    }
  });
  it('builds P as the running total on 100 random arrays', () => {
    const r = rng(2);
    for (let t = 0; t < 100; t++) {
      const values = Array.from({ length: ri(r, 1, 16) }, () => ri(r, -99, 99));
      const frames = prefixSumTrace({ values, queries: [[0, values.length - 1]] });
      const P = last(frames).state.rows![1].cells.map((c) => c.value);
      let run = 0;
      expect(P).toEqual([0, ...values.map((v) => (run += v))]);
    }
  });
  it('parses and rejects bad input', () => {
    expect(parseRangeQueries('3, 1, 4, 1, 5; queries 1-3, 0-4').queries).toEqual([[1, 3], [0, 4]]);
    expect(() => parseRangeQueries('1, 2, 3; queries 2-5')).toThrow(InputError);
    expect(() => parseRangeQueries('1, 2, 3; queries 2-1')).toThrow(InputError);
    expect(() => parseRangeQueries('1, 2, 3')).toThrow(InputError);
  });
});

describe('difference array', () => {
  const cases = fixtures['difference-array'] as Array<{ values: number[]; updates: Array<[number, number, number]>; result: number[] }>;
  const finalArray = (f: PatternFrame) => f.state.array.items.map((b) => b.value);
  it('produces the Python result on all golden cases', () => {
    expect(cases.length).toBeGreaterThanOrEqual(60);
    for (const c of cases) {
      const frames = differenceArrayTrace({ values: c.values, updates: c.updates.map(([l, r, v]) => ({ l, r, v })) });
      checkFrames(frames, 6);
      expect(finalArray(last(frames)), JSON.stringify(c)).toEqual(c.result);
    }
  });
  it('matches applying every update cell by cell on 100 random inputs', () => {
    const r = rng(9);
    for (let t = 0; t < 100; t++) {
      const values = Array.from({ length: ri(r, 1, 12) }, () => ri(r, -9, 9));
      const updates = Array.from({ length: ri(r, 1, 5) }, () => {
        const l = ri(r, 0, values.length - 1);
        return { l, r: ri(r, l, values.length - 1), v: ri(r, -9, 9) };
      });
      const expected = [...values];
      for (const u of updates) for (let i = u.l; i <= u.r; i++) expected[i] += u.v;
      expect(finalArray(last(differenceArrayTrace({ values, updates })))).toEqual(expected);
    }
  });
  it('parses and rejects bad input', () => {
    expect(parseRangeUpdates('0, 0, 0; add 0-1 +5, 1-2 -3').updates).toEqual([{ l: 0, r: 1, v: 5 }, { l: 1, r: 2, v: -3 }]);
    expect(() => parseRangeUpdates('0, 0; add 0-1')).toThrow(InputError);
    expect(() => parseRangeUpdates('0, 0; add 0-5 +1')).toThrow(InputError);
    expect(() => parseRangeUpdates('0, 0; add 0-1 +99')).toThrow(InputError);
  });
});

describe('monotonic stack (next greater element)', () => {
  const cases = fixtures['monotonic-stack'] as Array<{ values: number[]; result: number[] }>;
  const answers = (f: PatternFrame) => f.state.rows![1].cells.map((c) => (typeof c.value === 'number' ? c.value : -1));
  it('gives the Python answers on all golden cases', () => {
    expect(cases.length).toBeGreaterThanOrEqual(60);
    for (const c of cases) {
      const frames = nextGreaterTrace(c.values);
      checkFrames(frames, 6);
      expect(answers(last(frames)), JSON.stringify(c)).toEqual(c.result);
    }
  });
  it('keeps the stack non-increasing and pushes and pops each index at most once on 200 random arrays', () => {
    const r = rng(4);
    for (let t = 0; t < 200; t++) {
      const a = Array.from({ length: ri(r, 1, 16) }, () => ri(r, -5, 5));
      const frames = nextGreaterTrace(a);
      for (const f of frames) {
        const items = f.state.strips![0].items.filter((it) => it.text.startsWith('a['));
        const vals = items.map((it) => Number(it.text.split('=')[1]));
        for (let i = 1; i < vals.length; i++) expect(vals[i]).toBeLessThanOrEqual(vals[i - 1]);
      }
      expect(frames.filter((f) => f.line === 4).length).toBe(a.length);
      expect(frames.filter((f) => f.line === 3).length).toBeLessThanOrEqual(a.length);
    }
  });
  it('shows unanswered indices as an empty set at the end', () => {
    expect(last(nextGreaterTrace([3, 1])).state.rows![1].cells.map((c) => c.value)).toEqual([SYM.emptySet, SYM.emptySet]);
  });
  it('parses and rejects bad input', () => {
    expect(parseValues('2, 1, 2')).toEqual([2, 1, 2]);
    expect(() => parseValues('')).toThrow(InputError);
    expect(() => parseValues('1, x')).toThrow(InputError);
  });
});

describe('monotonic queue (sliding window maximum)', () => {
  const cases = fixtures['monotonic-queue'] as Array<{ values: number[]; k: number; result: number[] }>;
  const maxima = (f: PatternFrame) => f.state.rows![1].cells.map((c) => c.value);
  it('gives the Python maxima on all golden cases, duplicates included', () => {
    expect(cases.length).toBeGreaterThanOrEqual(60);
    for (const c of cases) {
      const frames = windowMaxTrace({ values: c.values, k: c.k });
      checkFrames(frames, 6);
      expect(maxima(last(frames)), JSON.stringify(c)).toEqual(c.result);
    }
  });
  it('matches brute force on 200 random inputs, with the front always the window maximum', () => {
    const r = rng(6);
    for (let t = 0; t < 200; t++) {
      const a = Array.from({ length: ri(r, 1, 16) }, () => ri(r, -4, 4));
      const k = ri(r, 1, a.length);
      const frames = windowMaxTrace({ values: a, k });
      const expected = Array.from({ length: a.length - k + 1 }, (_, i) => Math.max(...a.slice(i, i + k)));
      expect(maxima(last(frames))).toEqual(expected);
      for (const f of frames.filter((f) => f.line === 5)) {
        const i = Number(varOf(f, 'i'));
        const front = Number(f.state.strips![0].items[0].text.split('=')[1]);
        expect(front).toBe(Math.max(...a.slice(i - k + 1, i + 1)));
      }
    }
  });
  it('parses and rejects bad input', () => {
    expect(parseWindow('1, 3, -1; k 2')).toEqual({ values: [1, 3, -1], k: 2 });
    expect(() => parseWindow('1, 2, 3; k 4')).toThrow(InputError);
    expect(() => parseWindow('1, 2, 3; k 0')).toThrow(InputError);
    expect(() => parseWindow('1, 2, 3')).toThrow(InputError);
  });
});

describe('binary search on the answer (ship capacity)', () => {
  const cases = fixtures['binary-search-on-answer'] as Array<{ weights: number[]; days: number; result: number }>;
  it('finds the Python capacity on all golden cases, including infeasible ones', () => {
    expect(cases.length).toBeGreaterThanOrEqual(60);
    for (const c of cases) {
      const frames = shipCapacityTrace({ weights: c.weights, days: c.days });
      checkFrames(frames, 10);
      expect(varOf(last(frames), 'answer'), JSON.stringify(c)).toBe(c.result);
    }
  });
  it('matches a linear scan over capacities on 200 random inputs, in at most ceil(log2(range + 1)) probes', () => {
    const r = rng(13);
    for (let t = 0; t < 200; t++) {
      const weights = Array.from({ length: ri(r, 1, 10) }, () => ri(r, 1, 30));
      const days = ri(r, 1, 8);
      const lo = Math.max(...weights);
      const hi = weights.reduce((s, x) => s + x, 0);
      let expected = -1;
      for (let c = lo; c <= hi; c++) if (daysNeeded(weights, c) <= days) { expected = c; break; }
      const frames = shipCapacityTrace({ weights, days });
      expect(varOf(last(frames), 'answer')).toBe(expected);
      expect(frames.filter((f) => f.line === 2).length).toBeLessThanOrEqual(Math.ceil(Math.log2(hi - lo + 2)));
    }
  });
  it('parses and rejects bad input', () => {
    expect(parseShip('1, 2, 3; days 2')).toEqual({ weights: [1, 2, 3], days: 2 });
    expect(() => parseShip('1, 2, 3')).toThrow(InputError);
    expect(() => parseShip('1, 0; days 2')).toThrow(InputError);
    expect(() => parseShip('1, 2; days 99')).toThrow(InputError);
  });
});
