import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError, type Frame } from '../core/types';
import {
  FIB_MATRIX,
  hasMod,
  identity,
  MATPOW_CODE,
  matMul,
  matPowTrace,
  parseMatPow,
  pmod,
  stabilizeMatPow,
  type BMat,
  type MatPowInput,
  type MatPowMode,
  type MatPowState,
} from './matrixPower';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/mathAndProblemTypes.json', import.meta.url), 'utf8'));

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

/** Reference: k plain multiplications, reducing every entry at the end (Python's % semantics). */
function naivePower(A: BMat, k: number, mod: bigint | null): BMat {
  const n = A.length;
  let R: BMat = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1n : 0n)));
  for (let t = 0; t < k; t++) {
    const next: BMat = Array.from({ length: n }, () => Array<bigint>(n).fill(0n));
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) for (let x = 0; x < n; x++) next[i][j] += R[i][x] * A[x][j];
    R = next;
  }
  return hasMod(mod) ? R.map((r) => r.map((v) => pmod(v, mod))) : R;
}

function fibRef(n: number): bigint {
  let a = 0n;
  let b = 1n;
  for (let i = 0; i < n; i++) [a, b] = [b, a + b];
  return a;
}

function expectWellFormed(frames: Array<Frame<MatPowState>>, mode: MatPowMode) {
  expect(frames.length).toBeGreaterThan(0);
  for (const f of frames) {
    expect(f.caption.length).toBeGreaterThan(10);
    if (f.line !== undefined) {
      expect(f.line).toBeGreaterThanOrEqual(0);
      expect(f.line).toBeLessThan(MATPOW_CODE[mode].length);
    }
    const keys = f.state.slots.flatMap((p) => (p ? [p.key] : []));
    expect(new Set(keys).size, f.caption).toBe(keys.length);
    expect(f.state.ops.length).toBe(f.state.slots.length - 1);
  }
}

function randomMatrix(rand: () => number, n: number): BMat {
  return Array.from({ length: n }, () => Array.from({ length: n }, () => BigInt(Math.floor(rand() * 11) - 4)));
}

const MODS: Array<bigint | null> = [null, 0n, -7n, 1n, 2n, 5n, 97n, 1000n, 1000000007n];

describe('Python arithmetic', () => {
  it('reduces into [0, mod) and treats 0, None and negatives as no modulus', () => {
    expect(pmod(-1n, 5n)).toBe(4n);
    expect(hasMod(0n)).toBe(false);
    expect(hasMod(-3n)).toBe(false);
    expect(hasMod(null)).toBe(false);
    expect(identity(2, 1n)).toEqual([
      [0n, 0n],
      [0n, 0n],
    ]);
    expect(matMul([[1n, 2n], [3n, 4n]], [[5n, 6n], [7n, 8n]], 10n)).toEqual([
      [9n, 2n],
      [3n, 0n],
    ]);
  });
});

describe.each(['iterative', 'recursive'] as const)('matPowTrace (%s)', (mode) => {
  it('equals repeated multiplication on random matrices, exponents and moduli', () => {
    const rand = rng(mode === 'iterative' ? 31 : 32);
    for (let t = 0; t < 150; t++) {
      const n = 1 + Math.floor(rand() * 4);
      const A = randomMatrix(rand, n);
      const k = Math.floor(rand() * 40);
      const mod = MODS[Math.floor(rand() * MODS.length)];
      const run = matPowTrace({ kind: 'power', A, k: BigInt(k), mod }, mode);
      expect(run.error).toBeNull();
      expect(run.result, `${JSON.stringify(A.map((r) => r.map(String)))} ^ ${k} mod ${mod}`).toEqual(naivePower(A, k, mod));
      expectWellFormed(run.frames, mode);
      // Every product the frames claim is a real matrix product of its two factors.
      for (const [X, Y, Z] of run.mults) expect(Z).toEqual(matMul(X, Y, mod));
    }
  });

  it('uses about log2(k) products, the same count for any matrix', () => {
    for (const k of [1, 2, 3, 7, 8, 11, 13, 64, 100, 1000, 123456789]) {
      const run = matPowTrace({ kind: 'power', A: FIB_MATRIX, k: BigInt(k), mod: 1000000007n }, mode);
      const bits = k.toString(2).length;
      const ones = k.toString(2).split('').filter((c) => c === '1').length;
      // iterative: one squaring per bit and one product per 1 bit; recursive: one product per call above the base case
      expect(run.mults.length).toBe(mode === 'iterative' ? bits + ones : bits - 1 + ones - 1);
      if (mode === 'recursive') expect(run.calls.length).toBe(bits + ones - 1);
    }
  });

  it('agrees with the other variant for huge exponents under a modulus', () => {
    const other: MatPowMode = mode === 'iterative' ? 'recursive' : 'iterative';
    const rand = rng(77);
    for (let t = 0; t < 40; t++) {
      const n = 1 + Math.floor(rand() * 3);
      const A = randomMatrix(rand, n);
      const k = BigInt(Math.floor(rand() * 1e9)) * BigInt(Math.floor(rand() * 1e9));
      const mod = [97n, 1000000007n, 998244353n][t % 3];
      const a = matPowTrace({ kind: 'power', A, k, mod }, mode).result;
      const b = matPowTrace({ kind: 'power', A, k, mod }, other).result;
      expect(a).toEqual(b);
    }
  });

  it('raises ValueError for a negative exponent, in its own frame', () => {
    const run = matPowTrace({ kind: 'power', A: FIB_MATRIX, k: -1n, mod: null }, mode);
    expect(run.error).toBe('ValueError: exponent must be non-negative');
    expect(run.result).toBeNull();
    const last = run.frames[run.frames.length - 1];
    expect(last.caption).toContain('ValueError');
    expect(last.line).toBe(1);
  });

  it('keeps one picture size for a whole run', () => {
    const frames = stabilizeMatPow(matPowTrace(parseMatPow('A = [[1, 1], [1, 0]]; k = 1000000000000000000; mod 1000000007', mode), mode).frames);
    const layouts = new Set(frames.map((f) => JSON.stringify(f.state.layout)));
    expect(layouts.size).toBe(1);
    expect(frames.length).toBeLessThan(2000);
  });
});

describe('matPowTrace scenarios', () => {
  it('iterative: the README trace of A^11 (bits 1, 1, 0, 1 from the lowest)', () => {
    const run = matPowTrace(parseMatPow('A = [[1, 1], [1, 0]]; k = 11', 'iterative'), 'iterative');
    const show = (M: BMat) => M.map((r) => r.map(Number));
    // result: I x A = A^1, A^1 x A^2 = A^3, A^3 x A^8 = A^11; base squares A, A^2, A^4, A^8 -> A^16
    expect(run.mults.map(([X, Y, Z]) => [show(X), show(Y), show(Z)])).toEqual([
      [[[1, 0], [0, 1]], [[1, 1], [1, 0]], [[1, 1], [1, 0]]],
      [[[1, 1], [1, 0]], [[1, 1], [1, 0]], [[2, 1], [1, 1]]],
      [[[1, 1], [1, 0]], [[2, 1], [1, 1]], [[3, 2], [2, 1]]],
      [[[2, 1], [1, 1]], [[2, 1], [1, 1]], [[5, 3], [3, 2]]],
      [[[5, 3], [3, 2]], [[5, 3], [3, 2]], [[34, 21], [21, 13]]],
      [[[3, 2], [2, 1]], [[34, 21], [21, 13]], [[144, 89], [89, 55]]],
      [[[34, 21], [21, 13]], [[34, 21], [21, 13]], [[1597, 987], [987, 610]]],
    ]);
    expect(run.result).toEqual([
      [144n, 89n],
      [89n, 55n],
    ]);
    // The bits are read from the lowest one: the first round marks bit 0, the last bit 3.
    const reads = run.frames.filter((f) => f.line === 5).map((f) => f.state.bits!.bits.findIndex((b) => b.role === 'active'));
    expect(reads).toEqual([3, 2, 1, 0]);
  });

  it('recursive: A^11 = A x A^10, A^10 = (A^5)^2, A^5 = A x A^4, A^4 = (A^2)^2, A^2 = (A^1)^2', () => {
    const run = matPowTrace(parseMatPow('A = [[1, 1], [1, 0]]; k = 11', 'recursive'), 'recursive');
    expect(run.calls.map(Number)).toEqual([11, 10, 5, 4, 2, 1]);
    expect(run.returns.map(([k]) => Number(k))).toEqual([1, 2, 4, 5, 10, 11]);
    // The returned power glides from the product slot into the factor slot of its caller.
    const back = run.frames.findIndex((f) => f.caption.startsWith('Back in matrix_power(A, 4)'));
    expect(run.frames[back - 1].state.slots[2]?.key).toBe('p2');
    expect(run.frames[back].state.slots[0]?.key).toBe('p2');
    // The call stack grows to six open calls.
    expect(Math.max(...run.frames.map((f) => f.state.stack?.filter((s) => s.text.startsWith('power(')).length ?? 0))).toBe(6);
    // A deep recursion folds its outer calls into one token, so the strip stays short.
    const deep = matPowTrace(parseMatPow('A = [[1, 1], [1, 0]]; k = 1000000; mod 1000', 'recursive'), 'recursive');
    expect(Math.max(...deep.frames.map((f) => f.state.stack!.length))).toBe(6);
    expect(deep.frames.some((f) => f.state.stack![0].text.endsWith('more'))).toBe(true);
  });

  it('fibonacci_matrix(n) = F(n), exactly past 2^53 and modulo m', () => {
    for (let n = 0; n <= 93; n++) {
      const run = matPowTrace({ kind: 'fib', A: FIB_MATRIX, k: BigInt(n), mod: null }, 'recursive');
      expect(run.result, `F(${n})`).toBe(fibRef(n));
    }
    for (const mod of [1n, 2n, 10n, 1000n, 1000000007n]) {
      for (const n of [0, 1, 2, 5, 50, 100, 300]) {
        const run = matPowTrace({ kind: 'fib', A: FIB_MATRIX, k: BigInt(n), mod }, 'recursive');
        expect(run.result, `F(${n}) mod ${mod}`).toBe(pmod(fibRef(n), mod));
      }
    }
    expect(matPowTrace({ kind: 'fib', A: FIB_MATRIX, k: 90n, mod: null }, 'recursive').result).toBe(2880067194370816120n);
    const neg = matPowTrace({ kind: 'fib', A: FIB_MATRIX, k: -1n, mod: null }, 'recursive');
    expect(neg.error).toBe('ValueError: n must be non-negative');
  });

  it('modulus 1 makes even A^0 the zero matrix; modulus 0 means no modulus', () => {
    for (const mode of ['iterative', 'recursive'] as const) {
      expect(matPowTrace({ kind: 'power', A: FIB_MATRIX, k: 0n, mod: 1n }, mode).result).toEqual([
        [0n, 0n],
        [0n, 0n],
      ]);
      expect(matPowTrace({ kind: 'power', A: FIB_MATRIX, k: 5n, mod: 0n }, mode).result).toEqual([
        [8n, 5n],
        [5n, 3n],
      ]);
      expect(matPowTrace({ kind: 'power', A: [[-1n]], k: 3n, mod: 5n }, mode).result).toEqual([[4n]]);
    }
  });

  it('iterative: the closing caption only claims a saving when there is one', () => {
    const last = (k: bigint, mod: bigint | null = null) => {
      const frames = matPowTrace({ kind: 'power', A: FIB_MATRIX, k, mod }, 'iterative').frames;
      return frames[frames.length - 1].caption;
    };
    expect(last(11n)).toMatch(/4 squarings and 3 multiplications into result, instead of 10 multiplications/);
    expect(last(3n)).toMatch(/no fewer than the 2 multiplications of a plain loop/);
    expect(last(0n)).toMatch(/loop never runs/);
    expect(last(0n, 1n)).toMatch(/zero matrix/);
  });
});

describe('matPowTrace matches the Python functions (golden fixtures)', () => {
  type Case = {
    A: string[][];
    k: string;
    mod: string | null;
    fib?: boolean;
    iterative?: { mults: string[][][][]; result: string[][] | null; error: string | null };
    recursive: { mults: string[][][][]; calls: string[]; returns: Array<[string, string[][]]>; result: string[][] | string | null; error: string | null };
  };
  const big = (M: string[][]) => M.map((r) => r.map((v) => BigInt(v)));
  const str = (M: BMat) => M.map((r) => r.map(String));
  const list = fixtures.matrixPower as Case[];

  it('has enough cases', () => {
    expect(list.length).toBeGreaterThanOrEqual(40);
  });

  it.each(list.map((c, i) => [i, c] as const))('case %i: every product, call, return and result', (_, c) => {
    const input: MatPowInput = { kind: c.fib ? 'fib' : 'power', A: c.fib ? FIB_MATRIX : big(c.A), k: BigInt(c.k), mod: c.mod === null ? null : BigInt(c.mod) };
    if (c.iterative) {
      const run = matPowTrace(input, 'iterative');
      expect(run.mults.map((m) => m.map(str))).toEqual(c.iterative.mults);
      expect(run.result === null ? null : str(run.result as BMat)).toEqual(c.iterative.result);
      expect(run.error).toBe(c.iterative.error);
    }
    const run = matPowTrace(input, 'recursive');
    expect(run.mults.map((m) => m.map(str))).toEqual(c.recursive.mults);
    expect(run.calls.map(String)).toEqual(c.recursive.calls);
    expect(run.returns.map(([k, M]) => [String(k), str(M)])).toEqual(c.recursive.returns);
    const result = run.result === null ? null : typeof run.result === 'bigint' ? String(run.result) : str(run.result);
    expect(result).toEqual(c.recursive.result);
    expect(run.error).toBe(c.recursive.error);
  });
});

describe('parseMatPow', () => {
  it('reads matrices, exponents, moduli and fib', () => {
    expect(parseMatPow('A = [[1, 1], [1, 0]]; k = 11; mod 1000', 'iterative')).toEqual({ kind: 'power', A: FIB_MATRIX, k: 11n, mod: 1000n });
    expect(parseMatPow('1 1 / 1 0 ^ 11 mod 0', 'iterative')).toEqual({ kind: 'power', A: FIB_MATRIX, k: 11n, mod: 0n });
    expect(parseMatPow('fib 10; mod 1000', 'recursive')).toEqual({ kind: 'fib', A: FIB_MATRIX, k: 10n, mod: 1000n });
    expect(parseMatPow('k = 1000000000000000000; A = [[2]]; mod 7', 'iterative').k).toBe(10n ** 18n);
  });

  it('gives friendly errors', () => {
    expect(() => parseMatPow('', 'iterative')).toThrow(InputError);
    expect(() => parseMatPow('A = [[1, 2, 3], [4, 5, 6]]; k = 2', 'iterative')).toThrow(/square/);
    expect(() => parseMatPow('A = [[1, 2], [3]]; k = 2', 'iterative')).toThrow(/same length/);
    expect(() => parseMatPow('A = [[1, 1], [1, 0]]', 'iterative')).toThrow(/exponent/);
    expect(() => parseMatPow('fib 10', 'iterative')).toThrow(/Recursive tab/);
    expect(() => parseMatPow('A = [[1, 1], [1, 0]]; k = 1000', 'iterative')).toThrow(/modulus/);
    expect(() => parseMatPow('A = [[2]]; k = 1000000000000000000', 'recursive')).toThrow(/modulus/);
    expect(() => parseMatPow('A = [[1, 1, 1], [1, 1, 1], [1, 1, 1]]; k = 1000; mod 1000000000000000000', 'iterative')).toThrow(/smaller modulus/);
    expect(() => parseMatPow('A = [[1000]]; k = 2', 'iterative')).toThrow(/-999 to 999/);
    expect(() => parseMatPow('A = 1 / 2; k = 1', 'iterative')).toThrow(/square/);
  });
});
