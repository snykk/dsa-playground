import { describe, expect, it } from 'vitest';
import type { Tally } from './bigONotation';
import { BIG_THETA_CODE, BIG_THETA_EXAMPLES, BIG_THETA_GROWTH, binarySearchExample, matrixMultiplicationNaive } from './bigTheta';
import { parseGrowth, traceGrowth } from './growthBounds';
import { checkGrowth, expectFixture, randomInputs, rng } from './growthBoundsTestKit';

const ex = (key: string) => BIG_THETA_EXAMPLES.find((e) => e.key === key)!;

describe('big_theta.py ports match the Python code (golden fixture)', () => {
  it('every count and every return value, for every case and n', () => {
    expectFixture('bigTheta', BIG_THETA_EXAMPLES);
  });
});

describe('the ports against reference models', () => {
  it('binary search returns an index of the target (or -1) and makes at most 2(floor(log2 n) + 1) comparisons', () => {
    const rand = rng(5);
    for (let t = 0; t < 200; t++) {
      const n = Math.floor(rand() * 40);
      const arr = Array.from({ length: n }, (_, i) => 2 * i);
      const target = Math.floor(rand() * (2 * n + 2)) - 1;
      const tally: Tally = { ops: 0 };
      const at = binarySearchExample(arr, target, tally);
      if (arr.includes(target)) expect(arr[at]).toBe(target);
      else expect(at).toBe(-1);
      expect(tally.ops).toBeLessThanOrEqual(n === 0 ? 0 : 2 * (Math.floor(Math.log2(n)) + 1));
    }
  });

  it('the naive product equals a reference product', () => {
    const rand = rng(9);
    for (let t = 0; t < 30; t++) {
      const n = 1 + Math.floor(rand() * 6);
      const A = Array.from({ length: n }, () => Array.from({ length: n }, () => Math.floor(rand() * 9) - 4));
      const B = Array.from({ length: n }, () => Array.from({ length: n }, () => Math.floor(rand() * 9) - 4));
      const tally: Tally = { ops: 0 };
      const C = matrixMultiplicationNaive(A, B, tally);
      expect(tally.ops).toBe(n ** 3);
      for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) expect(C[i][j]).toBe(A[i].reduce((s, a, k) => s + a * B[k][j], 0));
    }
  });
});

describe('growth chart (Big-Theta)', () => {
  it('agrees with the definition and a brute-force n0 on random inputs', () => {
    for (const input of randomInputs('Theta', BIG_THETA_EXAMPLES, 120, 31)) checkGrowth(input, ex(input.example), BIG_THETA_GROWTH, BIG_THETA_CODE.lines.length);
  });

  it('merge sort stays between n log2 n and 2 n log2 n for every n', () => {
    const run = checkGrowth(parseGrowth('merge, g n log n, c1 1, c2 2, n 24', 'Theta', BIG_THETA_EXAMPLES), ex('merge'), BIG_THETA_GROWTH, BIG_THETA_CODE.lines.length);
    expect(run.n0).toBe(1);
    expect(run.frames[run.frames.length - 1].caption).toContain('f(n) = Theta(n log n)');
  });

  it('the worst case of binary search is Theta(log n) from n0 = 2; at n = 1, log2(1) = 0 leaves no room', () => {
    const run = checkGrowth(parseGrowth('binary worst, g log n, c1 2, c2 4, n 32', 'Theta', BIG_THETA_EXAMPLES), ex('binary'), BIG_THETA_GROWTH, BIG_THETA_CODE.lines.length);
    expect(run.n0).toBe(2);
    expect(run.frames[2].caption).toContain('over the band');
  });

  it('the best case of binary search is not Theta(log n): the lower bound overtakes it', () => {
    const run = checkGrowth(parseGrowth('binary best, g log n, c1 0.5, c2 4, n 32', 'Theta', BIG_THETA_EXAMPLES), ex('binary'), BIG_THETA_GROWTH, BIG_THETA_CODE.lines.length);
    expect(run.n0).toBeNull();
    const last = run.frames[run.frames.length - 1].caption;
    expect(last).toContain('not Theta(log n)');
    expect(run.steps.find((s) => s.n === 8)?.holds).toBe(false);
  });

  it('draws the band from the two curves, the lower one dashed', () => {
    const run = traceGrowth(parseGrowth('sum, n 6', 'Theta', BIG_THETA_EXAMPLES), ex('sum'), BIG_THETA_GROWTH);
    const s = run.frames[3].state;
    expect(s.band).toEqual(['lo', 'hi']);
    expect(s.curves.map((c) => [c.id, c.dashed, c.points.length])).toEqual([
      ['lo', true, 2],
      ['hi', false, 2],
    ]);
  });
});

describe('parseGrowth (Big-Theta)', () => {
  it('reads two constants, and the default case of binary search is the worst', () => {
    expect(parseGrowth('binary', 'Theta', BIG_THETA_EXAMPLES)).toMatchObject({ kase: 'worst', g: 'log n', c: [2, 4] });
    expect(parseGrowth('binary search best', 'Theta', BIG_THETA_EXAMPLES)).toMatchObject({ kase: 'best', g: '1', c: [0.5, 2] });
    expect(parseGrowth('matmul, c1 0.5, c2 2', 'Theta', BIG_THETA_EXAMPLES)).toMatchObject({ example: 'matmul', c: [0.5, 2] });
  });

  it('gives friendly errors', () => {
    expect(() => parseGrowth('merge, c 2', 'Theta', BIG_THETA_EXAMPLES)).toThrow(/two constants/);
    expect(() => parseGrowth('merge, c1 3, c2 2', 'Theta', BIG_THETA_EXAMPLES)).toThrow(/would be empty/);
    expect(() => parseGrowth('merge, c1 1, c1 2', 'Theta', BIG_THETA_EXAMPLES)).toThrow(/only once/);
  });
});
