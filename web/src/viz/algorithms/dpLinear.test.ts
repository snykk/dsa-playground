import { describe, expect, it } from 'vitest';
import { InputError, type Frame } from '../core/types';
import fixtures from './__fixtures__/dynamicProgramming.json';
import {
  coinChangeTrace,
  fibonacciTrace,
  kadaneTrace,
  lisTailsTrace,
  lisTrace,
  parseCoinChange,
  parseFibonacci,
  parseKadane,
  parseSequence,
  parseStairs,
  stairsTrace,
} from './dpLinear';

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

const answerOf = (frames: Array<Frame<unknown>>): number | undefined => {
  const v = frames[frames.length - 1].vars?.find(([k]) => k === 'answer');
  return v ? Number(v[1]) : undefined;
};

const stripTexts = (frames: Array<Frame<{ strips?: Array<{ label: string; items: Array<{ text: string }> }> }>>, label: string): string[] => {
  const strip = frames[frames.length - 1].state.strips?.find((s) => s.label.startsWith(label));
  return (strip?.items ?? []).map((i) => i.text);
};

/** Frames must be self-consistent: captions, valid pseudocode lines, role arrays as long as the array. */
function wellFormed(frames: Array<Frame<{ array: { items: unknown[]; roles: unknown[] } }>>, lines: number) {
  expect(frames.length).toBeGreaterThan(0);
  expect(frames.length).toBeLessThan(2000);
  for (const f of frames) {
    expect(f.caption.length).toBeGreaterThan(10);
    if (f.line !== undefined) {
      expect(f.line).toBeGreaterThanOrEqual(0);
      expect(f.line).toBeLessThan(lines);
    }
    expect(f.state.array.roles.length).toBe(f.state.array.items.length);
  }
}

const fibRef = (n: number): number => {
  let a = 0;
  let b = 1;
  for (let i = 0; i < n; i++) [a, b] = [b, a + b];
  return a;
};

describe('Fibonacci', () => {
  it('matches the reference for every n and the Python fixtures', () => {
    for (let n = 0; n <= 20; n++) {
      const frames = fibonacciTrace(n);
      wellFormed(frames, 5);
      expect(answerOf(frames)).toBe(fibRef(n));
    }
    for (const c of fixtures.fibonacci) expect(answerOf(fibonacciTrace(c.n))).toBe(c.value);
  });
  it('reports the naive call count and rejects bad input', () => {
    expect(stripTexts(fibonacciTrace(5) as never, 'Naive')).toEqual(['15 calls']);
    expect(() => parseFibonacci('-1')).toThrow(InputError);
    expect(() => parseFibonacci('21')).toThrow(InputError);
    expect(() => parseFibonacci('x')).toThrow(InputError);
    expect(parseFibonacci(' 7 ')).toBe(7);
  });
});

function waysRef(n: number, steps: number[]): number {
  if (n < 0) return 0;
  if (n === 0) return 1;
  return steps.reduce((s, k) => s + waysRef(n - k, steps), 0);
}

describe('Climbing stairs', () => {
  it('matches recursion on 150 random cases and the fixtures', () => {
    const rand = rng(5);
    for (let t = 0; t < 150; t++) {
      const n = Math.floor(rand() * 13);
      const steps = [1, 2, 3, 4, 5, 6].filter(() => rand() < 0.4).slice(0, 4);
      if (!steps.length) steps.push(1 + Math.floor(rand() * 3));
      const frames = stairsTrace({ n, steps });
      wellFormed(frames, 5);
      expect(answerOf(frames)).toBe(waysRef(n, steps));
    }
    for (const c of fixtures.climbing) expect(answerOf(stairsTrace({ n: c.n, steps: c.steps }))).toBe(c.ways);
  });
  it('parses and validates', () => {
    expect(parseStairs('7')).toEqual({ n: 7, steps: [1, 2] });
    expect(parseStairs('5 | 1, 3')).toEqual({ n: 5, steps: [1, 3] });
    expect(() => parseStairs('-2')).toThrow(InputError);
    expect(() => parseStairs('3 | 0')).toThrow(InputError);
    expect(() => parseStairs('3 | 2, 2')).toThrow(InputError);
    expect(answerOf(stairsTrace({ n: 0, steps: [1, 2] }))).toBe(1);
  });
});

function coinRef(amount: number, coins: number[]): number {
  // breadth-first search over remaining amounts
  let level = new Set([amount]);
  for (let d = 0; level.size; d++) {
    if (level.has(0)) return d;
    const next = new Set<number>();
    for (const r of level) for (const c of coins) if (r >= c) next.add(r - c);
    level = next;
  }
  return -1;
}

describe('Coin change', () => {
  it('matches BFS on 150 random cases and the fixtures', () => {
    const rand = rng(9);
    for (let t = 0; t < 150; t++) {
      const amount = Math.floor(rand() * 25);
      const coins = Array.from(new Set(Array.from({ length: 1 + Math.floor(rand() * 4) }, () => 1 + Math.floor(rand() * 9))));
      const frames = coinChangeTrace({ amount, coins });
      wellFormed(frames, 6);
      const expected = coinRef(amount, coins);
      expect(answerOf(frames)).toBe(expected);
      if (expected > 0) {
        const chosen = stripTexts(frames as never, 'Chosen').map(Number);
        expect(chosen.length).toBe(expected);
        expect(chosen.reduce((a, b) => a + b, 0)).toBe(amount);
      }
    }
    for (const c of fixtures.coin) expect(answerOf(coinChangeTrace({ amount: c.amount, coins: c.coins }))).toBe(c.min);
  });
  it('parses and validates', () => {
    expect(parseCoinChange('11 | 1, 2, 5')).toEqual({ amount: 11, coins: [1, 2, 5] });
    expect(() => parseCoinChange('11')).toThrow(InputError);
    expect(() => parseCoinChange('31 | 1')).toThrow(InputError);
    expect(() => parseCoinChange('5 | 1, 1')).toThrow(InputError);
    expect(() => parseCoinChange('5 | 0')).toThrow(InputError);
    expect(answerOf(coinChangeTrace({ amount: 7, coins: [2, 4] }))).toBe(-1);
  });
});

function lisRef(arr: number[]): number {
  let best = 0;
  for (let mask = 0; mask < 1 << arr.length; mask++) {
    let last = -Infinity;
    let len = 0;
    let ok = true;
    for (let i = 0; i < arr.length && ok; i++) {
      if (mask & (1 << i)) {
        if (arr[i] <= last) ok = false;
        last = arr[i];
        len++;
      }
    }
    if (ok && len > best) best = len;
  }
  return best;
}

const isStrictlyIncreasingSubsequence = (sub: number[], arr: number[]) => {
  let k = 0;
  for (const x of arr) if (k < sub.length && x === sub[k]) k++;
  return k === sub.length && sub.every((v, i) => i === 0 || v > sub[i - 1]);
};

describe('LIS', () => {
  it('both views match brute force and return a real subsequence (150 random cases)', () => {
    const rand = rng(17);
    for (let t = 0; t < 150; t++) {
      const arr = Array.from({ length: 1 + Math.floor(rand() * 10) }, () => Math.floor(rand() * 12) - 4);
      const expected = lisRef(arr);
      for (const [trace, lines] of [[lisTrace, 7], [lisTailsTrace, 6]] as const) {
        const frames = trace(arr);
        wellFormed(frames, lines);
        expect(answerOf(frames)).toBe(expected);
        const seq = stripTexts(frames as never, 'LIS').map(Number);
        expect(seq.length).toBe(expected);
        expect(isStrictlyIncreasingSubsequence(seq, arr)).toBe(true);
      }
    }
  });
  it('the table view reproduces the Python sequence (tie-breaking included)', () => {
    for (const c of fixtures.lis) {
      const frames = lisTrace(c.arr);
      expect(answerOf(frames)).toBe(c.length);
      expect(stripTexts(frames as never, 'LIS').map(Number)).toEqual(c.sequence);
      expect(answerOf(lisTailsTrace(c.arr))).toBe(c.length);
    }
  });
  it('is strict about duplicates and parses', () => {
    expect(answerOf(lisTrace([3, 3, 3]))).toBe(1);
    expect(answerOf(lisTailsTrace([3, 3, 3]))).toBe(1);
    expect(parseSequence('1, 2 3')).toEqual([1, 2, 3]);
    expect(() => parseSequence('')).toThrow(InputError);
    expect(() => parseSequence('1 a')).toThrow(InputError);
    expect(() => parseSequence(Array.from({ length: 15 }, () => '1').join(' '))).toThrow(InputError);
  });
});

function kadaneRef(arr: number[]): number {
  let best = -Infinity;
  for (let i = 0; i < arr.length; i++) {
    let s = 0;
    for (let j = i; j < arr.length; j++) {
      s += arr[j];
      best = Math.max(best, s);
    }
  }
  return best;
}

describe('Kadane', () => {
  it('matches the all-subarrays reference and the Python indices', () => {
    const rand = rng(31);
    for (let t = 0; t < 150; t++) {
      const arr = Array.from({ length: 1 + Math.floor(rand() * 14) }, () => Math.floor(rand() * 21) - 10);
      const frames = kadaneTrace(arr);
      wellFormed(frames, 7);
      expect(answerOf(frames)).toBe(kadaneRef(arr));
      const vars = Object.fromEntries(frames[frames.length - 1].vars ?? []);
      expect(arr.slice(Number(vars.start), Number(vars.end) + 1).reduce((a, b) => a + b, 0)).toBe(kadaneRef(arr));
    }
    for (const c of fixtures.kadane) {
      const vars = Object.fromEntries(kadaneTrace(c.arr).slice(-1)[0].vars ?? []);
      expect([vars.answer, vars.start, vars.end]).toEqual([c.sum, c.start, c.end]);
    }
  });
  it('handles all-negative and single inputs', () => {
    expect(answerOf(kadaneTrace([-8, -3, -6]))).toBe(-3);
    expect(answerOf(kadaneTrace([7]))).toBe(7);
    expect(() => parseKadane('')).toThrow(InputError);
    expect(parseKadane('-2 1 -3')).toEqual([-2, 1, -3]);
  });
});
