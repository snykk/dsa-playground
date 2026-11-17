import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import type { Tally } from './bigONotation';
import { BIG_OMEGA_CODE, BIG_OMEGA_EXAMPLES, BIG_OMEGA_GROWTH, bubbleSortBestCase, linearSearchBestCase, quickSortBestCase } from './bigOmega';
import { parseGrowth, traceGrowth } from './growthBounds';
import { checkGrowth, expectFixture, randomInputs, rng } from './growthBoundsTestKit';

const ex = (key: string) => BIG_OMEGA_EXAMPLES.find((e) => e.key === key)!;

describe('big_omega.py ports match the Python code (golden fixture)', () => {
  it('every comparison and addition count and every return value, for every case and n', () => {
    expectFixture('bigOmega', BIG_OMEGA_EXAMPLES);
  });
});

describe('the ports against reference models', () => {
  it('linear search finds the first match like indexOf; bubble and quick sort sort like the built-in sort', () => {
    const rand = rng(3);
    for (let t = 0; t < 150; t++) {
      const n = Math.floor(rand() * 25);
      const arr = Array.from({ length: n }, () => Math.floor(rand() * 12) - 3);
      const target = Math.floor(rand() * 12) - 3;
      const tally: Tally = { ops: 0 };
      const found = linearSearchBestCase(arr, target, tally);
      expect(found).toBe(arr.indexOf(target));
      expect(tally.ops).toBe(found === -1 ? n : found + 1);
      const sorted = [...arr].sort((a, b) => a - b);
      expect(bubbleSortBestCase([...arr], { ops: 0 })).toEqual(sorted);
      expect(quickSortBestCase([...arr], { ops: 0 })).toEqual(sorted);
    }
  });

  it('bubble sort stops after the first pass on sorted input, and makes n(n - 1)/2 comparisons on reversed input', () => {
    for (let n = 2; n <= 40; n++) {
      const passes: number[] = [];
      const t: Tally = { ops: 0 };
      bubbleSortBestCase(Array.from({ length: n }, (_, i) => i), t, passes);
      expect(passes).toEqual([n - 1]);
      const w: Tally = { ops: 0 };
      bubbleSortBestCase(Array.from({ length: n }, (_, i) => n - i), w);
      expect(w.ops).toBe((n * (n - 1)) / 2);
    }
  });

  it('quick sort on equal keys makes one partition: 3n comparisons and two empty calls', () => {
    for (let n = 2; n <= 40; n++) {
      const calls: number[] = [];
      const t: Tally = { ops: 0 };
      quickSortBestCase(new Array(n).fill(7), t, calls);
      expect(t.ops).toBe(3 * n);
      expect(calls).toEqual([n, 0, 0]);
    }
  });
});

describe('growth chart (Big-Omega)', () => {
  it('agrees with the definition and a brute-force n0 on random inputs', () => {
    for (const input of randomInputs('Omega', BIG_OMEGA_EXAMPLES, 120, 21)) checkGrowth(input, ex(input.example), BIG_OMEGA_GROWTH, BIG_OMEGA_CODE.lines.length);
  });

  it('bubble sort on sorted input is Omega(n) from n0 = 2 with c = 1/2', () => {
    const run = checkGrowth(parseGrowth('bubble best, g n, c 0.5, n 16', 'Omega', BIG_OMEGA_EXAMPLES), ex('bubble'), BIG_OMEGA_GROWTH, BIG_OMEGA_CODE.lines.length);
    expect(run.n0).toBe(2);
    expect(run.frames[run.frames.length - 1].caption).toContain('Every c < 1 holds');
  });

  it('quick sort on equal keys is not Omega(n log n): 3n falls under n log2 n from n = 9 on', () => {
    const run = checkGrowth(parseGrowth('quick best, g n log n, c 1, n 24', 'Omega', BIG_OMEGA_EXAMPLES), ex('quick'), BIG_OMEGA_GROWTH, BIG_OMEGA_CODE.lines.length);
    expect(run.n0).toBeNull();
    // n = 1: 0 comparisons against 1 * log2(1) = 0 holds; n = 8: 24 = 8 log2 8 holds; from n = 9 on 3n < n log2 n.
    expect(run.steps.filter((s) => !s.holds).map((s) => s.n)).toEqual(Array.from({ length: 16 }, (_, k) => k + 9));
    expect(run.frames[run.frames.length - 1].caption).toContain('not Omega(n log n)');
  });

  it('the point under the lower bound is a cross, and the probe spans f(n) and c * g(n)', () => {
    const run = traceGrowth(parseGrowth('quick best, g n, c 3, n 4', 'Omega', BIG_OMEGA_EXAMPLES), ex('quick'), BIG_OMEGA_GROWTH);
    const check = run.frames[2];
    expect(check.state.points[0]).toMatchObject({ n: 1, value: 0, role: 'bad' });
    expect(check.state.probe).toEqual({ n: 1, lo: 0, hi: 3, role: 'bad' });
    expect(check.caption).toContain('n0 must be larger than 1');
  });
});

describe('parseGrowth (Big-Omega)', () => {
  it('reads a case after the example or as "case worst", and a case picks its own default bound', () => {
    expect(parseGrowth('bubble', 'Omega', BIG_OMEGA_EXAMPLES)).toMatchObject({ example: 'bubble', kase: 'best', g: 'n', c: [0.5] });
    expect(parseGrowth('bubble sort worst', 'Omega', BIG_OMEGA_EXAMPLES)).toMatchObject({ kase: 'worst', g: 'n^2', c: [0.25] });
    expect(parseGrowth('quick_sort_best_case, case distinct', 'Omega', BIG_OMEGA_EXAMPLES)).toMatchObject({ example: 'quick', kase: 'distinct', g: 'n log n' });
    expect(parseGrowth('linear search worst, n 10', 'Omega', BIG_OMEGA_EXAMPLES)).toMatchObject({ example: 'search', kase: 'worst', to: 10 });
  });

  it('gives friendly errors', () => {
    expect(() => parseGrowth('bubble average', 'Omega', BIG_OMEGA_EXAMPLES)).toThrow(/has the cases best and worst/);
    expect(() => parseGrowth('matrix best', 'Omega', BIG_OMEGA_EXAMPLES)).toThrow(/no cases/);
    expect(() => parseGrowth('quick, c1 1, c2 2', 'Omega', BIG_OMEGA_EXAMPLES)).toThrow(/one constant/);
    expect(() => parseGrowth('heap sort', 'Omega', BIG_OMEGA_EXAMPLES)).toThrow(InputError);
  });
});
