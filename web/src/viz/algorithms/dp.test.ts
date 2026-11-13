import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { knapsackTrace, lcsTrace, parseKnapsack, parseLcs } from './dp';

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

const isSubsequence = (sub: string, s: string) => {
  let k = 0;
  for (const c of s) if (c === sub[k]) k++;
  return k === sub.length;
};

function bruteLcsLength(a: string, b: string): number {
  let best = 0;
  for (let mask = 0; mask < 1 << a.length; mask++) {
    const sub = [...a].filter((_, i) => mask & (1 << i)).join('');
    if (sub.length > best && isSubsequence(sub, b)) best = sub.length;
  }
  return best;
}

describe('LCS', () => {
  it('matches brute force and returns a real common subsequence', () => {
    const rand = rng(21);
    for (let t = 0; t < 150; t++) {
      const pick = (n: number) => Array.from({ length: n }, () => 'ABC'[Math.floor(rand() * 3)]).join('');
      const a = pick(1 + Math.floor(rand() * 9));
      const b = pick(1 + Math.floor(rand() * 9));
      const frames = lcsTrace(parseLcs(`${a} | ${b}`));
      const last = frames[frames.length - 1].state;
      const lcs = (last.strips?.[0].items ?? []).map((i) => i.text).join('').replace('(not traced yet)', '');
      expect(lcs.length).toBe(bruteLcsLength(a, b));
      expect(isSubsequence(lcs, a) && isSubsequence(lcs, b)).toBe(true);
      expect(last.cells[a.length][b.length]).toBe(lcs.length);
    }
  });
  it('rejects malformed input', () => {
    for (const bad of ['ABC', 'A | B | C', ' | B', `${'A'.repeat(13)} | B`]) expect(() => parseLcs(bad)).toThrow(InputError);
  });
});

describe('0/1 knapsack', () => {
  it('finds the brute-force optimum and a feasible packing', () => {
    const rand = rng(5);
    for (let t = 0; t < 150; t++) {
      const n = 1 + Math.floor(rand() * 6);
      const items = Array.from({ length: n }, () => ({ weight: 1 + Math.floor(rand() * 8), value: Math.floor(rand() * 30) }));
      const W = 1 + Math.floor(rand() * 15);
      let best = 0;
      for (let mask = 0; mask < 1 << n; mask++) {
        let w = 0;
        let v = 0;
        items.forEach((it, i) => {
          if (mask & (1 << i)) {
            w += it.weight;
            v += it.value;
          }
        });
        if (w <= W) best = Math.max(best, v);
      }
      const frames = knapsackTrace({ capacity: W, items });
      const last = frames[frames.length - 1].state;
      expect(last.cells[n][W]).toBe(best);
      const packed = (last.strips?.[0].items ?? []).filter((i) => i.text.startsWith('#')).map((i) => Number(i.text.slice(1)));
      const weight = packed.reduce((s, i) => s + items[i - 1].weight, 0);
      const value = packed.reduce((s, i) => s + items[i - 1].value, 0);
      expect(weight).toBeLessThanOrEqual(W);
      expect(value).toBe(best);
    }
  });
  it('parses capacity and items', () => {
    expect(parseKnapsack('W=7; 1:1, 3:4')).toEqual({ capacity: 7, items: [{ weight: 1, value: 1 }, { weight: 3, value: 4 }] });
    for (const bad of ['7; 1:1', 'W=0; 1:1', 'W=5;', 'W=5; 3-4']) expect(() => parseKnapsack(bad)).toThrow(InputError);
  });
});
