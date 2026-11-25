import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError, type Frame } from '../core/types';
import type { FftState } from './fft';
import { MOD, mulMod, NTT_CODE, nttTrace, parseNttMultiply, parseNttSequence, powMod, rootOfUnity, stabilizeNtt, type Butterfly, type NttMode, type NttTransformLog } from './ntt';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/mathAndProblemTypes.json', import.meta.url), 'utf8'));

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

const red = (x: number) => ((x % MOD) + MOD) % MOD;

/** Reference: the definition X[k] = sum a[j] w^(jk) mod p in O(n^2), and the inverse with w^-1 and n^-1. */
function direct(a: number[], inverse: boolean): number[] {
  const n = a.length;
  const w = rootOfUnity(n, inverse);
  const out = Array.from({ length: n }, (_, k) => {
    let sum = 0n;
    for (let j = 0; j < n; j++) sum += BigInt(red(a[j])) * BigInt(powMod(w, j * k));
    return Number(sum % BigInt(MOD));
  });
  return inverse ? out.map((x) => mulMod(x, powMod(n, MOD - 2))) : out;
}

function schoolbook(p: number[], q: number[]): number[] {
  const out = Array(p.length + q.length - 1).fill(0n);
  p.forEach((x, i) => q.forEach((y, j) => (out[i + j] += BigInt(x) * BigInt(y))));
  return out.map((c: bigint) => Number(((c % BigInt(MOD)) + BigInt(MOD)) % BigInt(MOD)));
}

/** Every frame's problems, collected and asserted once. */
function expectWellFormed(frames: Array<Frame<FftState>>, mode: NttMode) {
  expect(frames.length).toBeGreaterThan(0);
  const problems: string[] = [];
  frames.forEach((f, i) => {
    const bad = (what: string) => problems.push(`frame ${i}: ${what}`);
    if (f.caption.length <= 10) bad('caption too short');
    if (f.line !== undefined && (f.line < 0 || f.line >= NTT_CODE[mode].length)) bad(`line ${f.line} out of range`);
    const cols = f.state.rows.reduce((m, r) => Math.max(m, r.cells.length), 0);
    for (const b of f.state.blocks) {
      if (b.start + b.size > cols) bad(`block ${b.depth}:${b.start} past column ${cols}`);
      if (b.depth >= f.state.rows.length) bad(`block depth ${b.depth} has no row`);
    }
    if (f.state.butterfly) {
      const { depth, a, b } = f.state.butterfly;
      if (depth + 1 >= f.state.rows.length) bad(`butterfly depth ${depth} has no row below`);
      if (!(a < b) || b >= cols) bad(`butterfly ${a} -> ${b}`);
    }
    if (f.state.circle?.k != null && f.state.circle.k >= f.state.circle.m) bad(`twiddle k ${f.state.circle.k} >= m ${f.state.circle.m}`);
    for (const r of f.state.rows) {
      for (const c of r.cells) {
        if (c && c.re.length > 9) bad(`cell "${c.re}" wider than nine characters`);
        if (c && c.role === 'muted') bad('a muted cell carries text');
      }
    }
  });
  expect(problems).toEqual([]);
}

describe('arithmetic modulo 998244353', () => {
  it('has the roots the Python code pins', () => {
    expect([1, 2, 4, 8].map((n) => rootOfUnity(n, false))).toEqual([1, 998244352, 911660635, 372528824]);
    expect(rootOfUnity(4, true)).toBe(86583718);
    expect(mulMod(MOD - 1, MOD - 1)).toBe(1);
    expect(mulMod(MOD - 2, MOD - 2)).toBe(4);
    expect(powMod(4, MOD - 2)).toBe(748683265);
  });
});

describe('nttTrace (transform)', () => {
  it('equals the direct sum (and its inverse) on random sequences', () => {
    const rand = rng(7);
    for (let t = 0; t < 150; t++) {
      const n = 1 + Math.floor(rand() * 8);
      const a = Array.from({ length: n }, () => (rand() < 0.2 ? MOD - 1 - Math.floor(rand() * 3) : Math.floor(rand() * 40) - 10));
      const pow2 = (n & (n - 1)) === 0;
      const inverse = pow2 && rand() < 0.4;
      const run = nttTrace({ a, inverse, p: [], q: [] }, 'transform');
      let size = 1;
      while (size < n) size <<= 1;
      expect(run.error).toBeNull();
      expect(run.result).toEqual(direct([...a, ...Array(size - n).fill(0)], inverse));
      expectWellFormed(stabilizeNtt(run.frames), 'transform');
      // Exactly (n/2) log2(n) butterflies and one root per stage.
      expect(run.butterflies.length).toBe((size / 2) * Math.log2(size));
      expect(run.roots.map((r) => r[0])).toEqual(Array.from({ length: Math.log2(size) }, (_, s) => 2 ** (s + 1)));
    }
  });

  it('ntt([1, 2, 3, 4]) is the README example, and the inverse brings it back', () => {
    const run = nttTrace(parseNttSequence('1 2 3 4'), 'transform');
    expect(run.result).toEqual([10, 173167434, 998244351, 825076915]);
    expect(run.permutations).toEqual([[[1, 2, 3, 4], [1, 3, 2, 4]]]);
    expect(run.butterflies).toEqual([
      [0, 1, 1, 1, 3, 4, 998244351],
      [2, 3, 1, 2, 4, 6, 998244351],
      [0, 2, 1, 4, 6, 10, 998244351],
      [1, 3, 911660635, 998244351, 998244351, 173167434, 825076915],
    ]);
    const back = nttTrace(parseNttSequence('inverse 10 173167434 998244351 825076915'), 'transform');
    expect(back.result).toEqual([1, 2, 3, 4]);
  });

  it('pads, reduces, rejects a non-power-of-two inverse, and returns [] for []', () => {
    const run = nttTrace(parseNttSequence('1 2 3'), 'transform');
    expect(run.result).toHaveLength(4);
    expect(run.frames[0].caption).toContain('pads with 1 zero to n = 4');
    expect(nttTrace(parseNttSequence('-1 -2'), 'transform').frames[0].caption).toContain('-1 becomes 998244352');
    const bad = nttTrace(parseNttSequence('inverse 1 2 3'), 'transform');
    expect(bad.error).toBe('ValueError: inverse NTT needs a power-of-two length; got 3 (a zero-padded spectrum is not the spectrum of the original sequence)');
    expect(bad.frames[0].state.rows[0].cells.every((c) => c?.role === 'bad')).toBe(true);
    const empty = nttTrace(parseNttSequence('[]'), 'transform');
    expect(empty.result).toEqual([]);
    expect(empty.frames).toHaveLength(1);
  });

  it('fills the stages bottom-up, one block per recursive call', () => {
    const run = nttTrace(parseNttSequence('0 1 2 3 4 5 6 7'), 'transform');
    expect(run.permutations[0][1]).toEqual([0, 4, 2, 6, 1, 5, 3, 7]);
    const writes = run.frames.filter((f) => f.line === 16);
    expect(writes).toHaveLength(12);
    for (const f of writes) {
      const { depth, a, b } = f.state.butterfly!;
      expect(f.state.rows[depth].cells[a]?.role).toBe('active');
      expect(f.state.rows[depth].cells[b]?.role).toBe('active');
      expect(f.state.rows[depth + 1].cells[a]?.role).toBe('compare');
      expect(b - a).toBe(8 >> (depth + 1));
    }
    expect(run.frames.filter((f) => f.line === 11).map((f) => f.state.circle?.m)).toEqual([2, 4, 8]);
    const last = run.frames[run.frames.length - 1];
    expect(last.state.rows[0].cells.every((c) => c?.role === 'good')).toBe(true);
    expect(last.state.rows.map((r) => r.label)).toEqual(['length 8', 'length 4', 'length 2', 'bit-reversed']);
  });
});

describe('nttTrace (multiply)', () => {
  it('equals schoolbook multiplication modulo p on random polynomials', () => {
    const rand = rng(8);
    for (let t = 0; t < 150; t++) {
      const lp = 1 + Math.floor(rand() * 5);
      const lq = 1 + Math.floor(rand() * (9 - lp));
      const coef = () => (rand() < 0.2 ? MOD - 1 : Math.floor(rand() * 2000) - 1000);
      const p = Array.from({ length: lp }, coef);
      const q = Array.from({ length: lq }, coef);
      const run = nttTrace({ a: [], inverse: false, p, q }, 'multiply');
      expect(run.result).toEqual(schoolbook(p, q));
      expectWellFormed(stabilizeNtt(run.frames), 'multiply');
      expect(run.transforms.map((f) => f.inverse)).toEqual([false, false, true]);
    }
  });

  it('the README trace: (1 + 2x + 3x^2)(4 + 5x)', () => {
    const run = nttTrace(parseNttMultiply('p = 1 2 3; q = 4 5'), 'multiply');
    expect(run.transforms[0].output).toEqual([6, 825076915, 2, 173167434]);
    expect(run.transforms[1].output).toEqual([9, 565325767, 998244352, 432918594]);
    expect(run.product).toEqual([54, 173167418, 998244351, 825076899]);
    expect(run.result).toEqual([4, 13, 22, 15]);
    expect(run.frames.some((f) => f.caption.includes('[16, 52, 88, 60] becomes [4, 13, 22, 15]'))).toBe(true);
  });

  it('names what reduction did to the coefficients', () => {
    const neg = nttTrace(parseNttMultiply('p = 1 -1; q = 1 1'), 'multiply');
    expect(neg.result).toEqual([1, 0, 998244352]);
    expect(neg.frames[neg.frames.length - 1].caption).toContain('x^2 is -1, negative, so it shows as p - 1 = 998244352');
    const big = nttTrace(parseNttMultiply('p = 998244351; q = 998244351'), 'multiply');
    expect(big.result).toEqual([4]);
    expect(big.frames[big.frames.length - 1].caption).toContain('996491784303411201, above p');
  });
});

describe('nttTrace matches the Python functions (golden fixtures)', () => {
  type Log = { butterflies: Butterfly[]; roots: Array<[number, boolean, number]>; permutations: Array<[number[], number[]]>; transforms: NttTransformLog[]; result: number[] | null; error: string | null };

  it.each((fixtures.ntt as Array<Log & { a: number[]; inverse: boolean }>).map((c, i) => [i, c] as const))('ntt case %i: every butterfly, root, permutation and transform', (_, c) => {
    const run = nttTrace({ a: c.a, inverse: c.inverse, p: [], q: [] }, 'transform');
    expect(run.error).toBe(c.error);
    expect(run.butterflies).toEqual(c.butterflies);
    expect(run.roots).toEqual(c.roots);
    expect(run.permutations).toEqual(c.permutations);
    expect(run.transforms).toEqual(c.transforms);
    expect(run.result).toEqual(c.result);
  });

  it.each((fixtures.nttMultiply as Array<Log & { p: number[]; q: number[] }>).map((c, i) => [i, c] as const))('multiply case %i: every butterfly, root, permutation and transform', (_, c) => {
    const run = nttTrace({ a: [], inverse: false, p: c.p, q: c.q }, 'multiply');
    expect(run.butterflies).toEqual(c.butterflies);
    expect(run.roots).toEqual(c.roots);
    expect(run.permutations).toEqual(c.permutations);
    expect(run.transforms).toEqual(c.transforms);
    expect(run.result).toEqual(c.result);
  });

  it('has enough cases', () => {
    expect(fixtures.ntt.length + fixtures.nttMultiply.length).toBeGreaterThanOrEqual(60);
  });
});

describe('NTT parsers', () => {
  it('reads integers, the inverse keyword and both polynomial forms', () => {
    expect(parseNttSequence('inverse 10, 173167434, 998244351, 825076915')).toEqual({ a: [10, 173167434, 998244351, 825076915], inverse: true, p: [], q: [] });
    expect(parseNttSequence('intt 1 2').inverse).toBe(true);
    expect(parseNttSequence('ntt 1 2').inverse).toBe(false);
    expect(parseNttSequence('[]').a).toEqual([]);
    expect(parseNttSequence('-99999999 999999999').a).toEqual([-99999999, 999999999]);
    expect(parseNttMultiply('[1, 2, 3] * [4, 5]')).toEqual({ a: [], inverse: false, p: [1, 2, 3], q: [4, 5] });
    expect(parseNttMultiply('p = 1 -1; q = 1 1').p).toEqual([1, -1]);
  });

  it('gives friendly errors', () => {
    expect(() => parseNttSequence('')).toThrow(InputError);
    expect(() => parseNttSequence('1 2 3 4 5 6 7 8 9')).toThrow(/At most 8/);
    expect(() => parseNttSequence('1.5')).toThrow(/whole number/);
    expect(() => parseNttSequence('1000000000')).toThrow(/-99999999 to 999999999/);
    expect(() => parseNttSequence('-100000000')).toThrow(/-99999999 to 999999999/);
    expect(() => parseNttMultiply('p = 1 2 3')).toThrow(/two polynomials/);
    expect(() => parseNttMultiply('p = 1 2 3 4 5; q = 1 2 3 4 5')).toThrow(/at most 8/);
    expect(() => parseNttMultiply('p = 2x; q = 2')).toThrow(/whole number/);
  });
});
