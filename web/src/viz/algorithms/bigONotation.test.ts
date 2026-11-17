import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import {
  BIG_O_CODE,
  BIG_O_EXAMPLES,
  BIG_O_GROWTH,
  cubicTimeExample,
  exponentialTimeExample,
  factorialTimeExample,
  logarithmicTimeExample,
  mergeSortWrites,
  quadraticTimeExample,
  type Tally,
} from './bigONotation';
import { asymptotics, decadesFor, factorial, fmt, log2, parseBound, parseGrowth, traceGrowth } from './growthBounds';
import { checkGrowth, expectFixture, randomInputs, rng } from './growthBoundsTestKit';

const ex = (key: string) => BIG_O_EXAMPLES.find((e) => e.key === key)!;
const count = (fn: (t: Tally) => unknown) => {
  const t: Tally = { ops: 0 };
  fn(t);
  return t.ops;
};
const fibNumber = (k: number) => {
  let a = 0;
  let b = 1;
  for (let i = 0; i < k; i++) [a, b] = [b, a + b];
  return a;
};

describe('big_o_notation.py ports match the Python code (golden fixture)', () => {
  it('every count of the basic operation and every return value, for every n the chart allows', () => {
    expectFixture('bigO', BIG_O_EXAMPLES);
  });
});

describe('the counts follow their closed forms', () => {
  it('logarithmic: floor(log2 n) halvings', () => {
    for (let n = 1; n <= 1000; n++) expect(count((t) => logarithmicTimeExample(n, t))).toBe(Math.floor(Math.log2(n)));
  });

  it('merge sort: n ceil(log2 n) + n - 2^ceil(log2 n) writes, whatever the input order, and a sorted result', () => {
    const rand = rng(7);
    for (let n = 1; n <= 64; n++) {
      const k = Math.ceil(Math.log2(n));
      const want = n === 1 ? 0 : n * k + n - 2 ** k;
      for (let t = 0; t < 3; t++) {
        const arr = Array.from({ length: n }, () => Math.floor(rand() * 20));
        const tally: Tally = { ops: 0 };
        const out = mergeSortWrites(arr, tally);
        expect(tally.ops, `n = ${n}`).toBe(want);
        expect(out).toEqual([...arr].sort((a, b) => a - b));
      }
    }
  });

  it('quadratic, cubic, Fibonacci calls and permutation writes', () => {
    for (let n = 0; n <= 30; n++) {
      expect(count((t) => quadraticTimeExample(Array.from({ length: n }, (_, i) => i), t))).toBe(n < 2 ? 0 : (n * (n - 1)) / 2);
      expect(count((t) => cubicTimeExample(n, t))).toBe(n ** 3);
    }
    for (let n = 0; n <= 25; n++) expect(count((t) => exponentialTimeExample(n, t))).toBe(2 * fibNumber(n + 1) - 1);
    for (let n = 0; n <= 8; n++) {
      const t: Tally = { ops: 0 };
      const perms = factorialTimeExample(n, t);
      expect(t.ops).toBe(factorial(n + 1) - 1);
      expect(perms.length).toBe(factorial(n));
      expect(new Set(perms.map((p) => p.join(','))).size).toBe(perms.length);
    }
  });
});

describe('growth chart (Big-O)', () => {
  it('agrees with the definition and a brute-force n0 on random inputs', () => {
    for (const input of randomInputs('O', BIG_O_EXAMPLES, 120, 11)) checkGrowth(input, ex(input.example), BIG_O_GROWTH, BIG_O_CODE.lines.length);
  });

  it('finds n0 = 13 for Fibonacci calls against 0.1 * 2^n (the first example)', () => {
    const input = parseGrowth('exponential, g 2^n, c 0.1, n 20', 'O', BIG_O_EXAMPLES);
    const run = checkGrowth(input, ex('exponential'), BIG_O_GROWTH, BIG_O_CODE.lines.length);
    expect(run.n0).toBe(13);
    expect(run.steps.filter((s) => !s.holds).map((s) => s.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
    expect(run.frames[run.frames.length - 1].caption).toContain('every c > 0 holds');
  });

  it('shows that n^2 is not O(n): the bound holds up to n = 9, then fails for good', () => {
    const run = checkGrowth(parseGrowth('quadratic, g n, c 4, n 16', 'O', BIG_O_EXAMPLES), ex('quadratic'), BIG_O_GROWTH, BIG_O_CODE.lines.length);
    expect(run.n0).toBeNull();
    expect(run.steps.filter((s) => s.holds).map((s) => s.n)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(run.frames[run.frames.length - 1].caption).toContain('f(n) is not O(n)');
  });

  it('merge sort writes break n log2 n at every n that is not a power of two', () => {
    const run = checkGrowth(parseGrowth('linearithmic, g n log n, c 1, n 24', 'O', BIG_O_EXAMPLES), ex('linearithmic'), BIG_O_GROWTH, BIG_O_CODE.lines.length);
    expect(run.steps.filter((s) => s.holds).map((s) => s.n)).toEqual([1, 2, 4, 8, 16]);
    expect(run.frames[run.frames.length - 1].caption).toContain('tends to 1');
  });

  it('factorial_time_example is not O(n!) but is O(n * n!)', () => {
    const bad = traceGrowth(parseGrowth('factorial, g n!, c 5, n 8', 'O', BIG_O_EXAMPLES), ex('factorial'), BIG_O_GROWTH);
    expect(bad.steps.filter((s) => s.holds).map((s) => s.n)).toEqual([1, 2, 3, 4]);
    expect(bad.frames[bad.frames.length - 1].caption).toContain('not O(n!)');
    const good = traceGrowth(parseGrowth('factorial, n 8', 'O', BIG_O_EXAMPLES), ex('factorial'), BIG_O_GROWTH);
    expect(good.n0).toBe(1);
  });

  it('measures, then checks, each n: the next point waits hidden at 0 so it rises', () => {
    const run = traceGrowth(parseGrowth('cubic, n 5', 'O', BIG_O_EXAMPLES), ex('cubic'), BIG_O_GROWTH);
    const measure = run.frames[1].state;
    expect(measure.points.map((p) => [p.n, p.value, p.role, !!p.hidden])).toEqual([
      [1, 1, 'active', false],
      [2, 0, 'active', true],
    ]);
    expect(run.frames[1].line).toBe(ex('cubic').line);
    const check = run.frames[2];
    expect(check.line).toBe(BIG_O_GROWTH.check);
    expect(check.state.points[0].role).toBe('good');
    expect(check.state.probe).toEqual({ n: 1, lo: 1, hi: 1, role: 'good' });
    expect(run.frames[run.frames.length - 1].line).toBe(BIG_O_GROWTH.verdict);
  });
});

describe('growthBounds helpers', () => {
  it('log2 is exact on powers of two; the bounds are the textbook functions', () => {
    for (let k = 0; k < 31; k++) expect(log2(2 ** k)).toBe(k);
    expect(factorial(5)).toBe(120);
    expect(parseBound('n log n')).toBe('n log n');
    expect(parseBound('n*log2(n)')).toBe('n log n');
    expect(parseBound('2**n')).toBe('2^n');
    expect(parseBound('n*n!')).toBe('n n!');
    expect(parseBound('lg n')).toBe('log n');
    expect(parseBound('n^4')).toBeUndefined();
  });

  it('keeps the axis at most 4 decades above f and at least 2 decades tall', () => {
    expect(decadesFor([1, 1, 1], [2, 4, 1e12])).toEqual([0, 4]);
    expect(decadesFor([0, 1, 3], [0, 0.5, 1])).toEqual([-1, 1]);
    expect(decadesFor([5, 50, 500], [0.2, 2, 20])).toEqual([-1, 3]);
  });

  it('formats numbers for captions', () => {
    expect(fmt(242785)).toBe('242,785');
    expect(fmt(3.2)).toBe('3.2');
    expect(fmt(5 * Math.log2(5))).toBe('11.6');
    expect(fmt(2.43e18)).toBe('2.43e18');
  });

  it('states what the growth rates say past the plotted range', () => {
    expect(asymptotics('O', 'n^2', { rank: 2, form: 'n', limit: 1 }, { n: 10, ops: 10 })).toContain('every c > 0 holds');
    expect(asymptotics('O', 'n', { rank: 4, form: 'n^2' }, { n: 10, ops: 100 })).toContain('not O(n)');
    expect(asymptotics('Omega', 'n', { rank: 2, form: 'n - 1', limit: 1 }, { n: 10, ops: 9 })).toContain('Every c < 1 holds');
  });
});

describe('parseGrowth (Big-O)', () => {
  it('reads the example, the bound, the constant and the range in any order, with Python names', () => {
    expect(parseGrowth('exponential, g 2^n, c 0.1, n 20', 'O', BIG_O_EXAMPLES)).toEqual({ kind: 'O', example: 'exponential', kase: null, g: '2^n', c: [0.1], from: 1, to: 20 });
    expect(parseGrowth('n 3..12; c = 1/4; g = n^2; f = quadratic_time_example', 'O', BIG_O_EXAMPLES)).toMatchObject({ example: 'quadratic', g: 'n^2', c: [0.25], from: 3, to: 12 });
    expect(parseGrowth('cubic', 'O', BIG_O_EXAMPLES)).toMatchObject({ g: 'n^3', c: [1], from: 1, to: 12 });
    expect(parseGrowth('factorial', 'O', BIG_O_EXAMPLES)).toMatchObject({ g: 'n n!', c: [2], to: 8 });
  });

  it('gives friendly errors, and says why exponential and factorial are capped', () => {
    expect(() => parseGrowth('', 'O', BIG_O_EXAMPLES)).toThrow(InputError);
    expect(() => parseGrowth('sorting', 'O', BIG_O_EXAMPLES)).toThrow(/Cannot read/);
    expect(() => parseGrowth('cubic, g n^4', 'O', BIG_O_EXAMPLES)).toThrow(/Unknown bound/);
    expect(() => parseGrowth('cubic, c 0', 'O', BIG_O_EXAMPLES)).toThrow(/positive/);
    expect(() => parseGrowth('cubic, c -1', 'O', BIG_O_EXAMPLES)).toThrow(/positive number/);
    expect(() => parseGrowth('cubic, c1 1', 'O', BIG_O_EXAMPLES)).toThrow(/one constant/);
    expect(() => parseGrowth('cubic, n 41', 'O', BIG_O_EXAMPLES)).toThrow(/up to 40/);
    expect(() => parseGrowth('exponential, n 26', 'O', BIG_O_EXAMPLES)).toThrow(/242,785 calls/);
    expect(() => parseGrowth('factorial, n 9', 'O', BIG_O_EXAMPLES)).toThrow(/40,320 permutations/);
    expect(() => parseGrowth('cubic, n 5..5', 'O', BIG_O_EXAMPLES)).toThrow(/two values/);
    expect(() => parseGrowth('cubic, n 0..5', 'O', BIG_O_EXAMPLES)).toThrow(/starts at 1/);
    expect(() => parseGrowth('cubic best', 'O', BIG_O_EXAMPLES)).toThrow(/no cases/);
    expect(() => parseGrowth('cubic, quadratic', 'O', BIG_O_EXAMPLES)).toThrow(/one example/);
  });
});
