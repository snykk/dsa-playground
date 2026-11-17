import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError, type Frame } from '../core/types';
import { cstr, FFT_CODE, fftTrace, parseComplex, parseFftMultiply, parseFftSignal, pyRound, round9, stabilizeFft, type C, type FftMode, type FftState } from './fft';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/mathAndProblemTypes.json', import.meta.url), 'utf8'));

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

/** Reference: the direct DFT with the code's convention, X[k] = sum a[j] e^(-2 pi i j k / n). */
function dft(a: C[], inverse: boolean): C[] {
  const n = a.length;
  return Array.from({ length: n }, (_, k) => {
    let re = 0;
    let im = 0;
    for (let j = 0; j < n; j++) {
      const th = ((inverse ? 2 : -2) * Math.PI * j * k) / n;
      re += a[j][0] * Math.cos(th) - a[j][1] * Math.sin(th);
      im += a[j][0] * Math.sin(th) + a[j][1] * Math.cos(th);
    }
    return inverse ? ([re / n, im / n] as C) : ([re, im] as C);
  });
}

function schoolbook(p: number[], q: number[]): number[] {
  const out = Array(p.length + q.length - 1).fill(0);
  p.forEach((x, i) => q.forEach((y, j) => (out[i + j] += x * y)));
  return out;
}

function expectClose(got: C[], want: C[], scale: number) {
  expect(got.length).toBe(want.length);
  got.forEach((g, i) => {
    expect(Math.abs(g[0] - want[i][0])).toBeLessThan(1e-9 * scale);
    expect(Math.abs(g[1] - want[i][1])).toBeLessThan(1e-9 * scale);
  });
}

/** Every frame's problems, collected in plain code and asserted once: thousands of expect calls are slow. */
function expectWellFormed(frames: Array<Frame<FftState>>, mode: FftMode) {
  expect(frames.length).toBeGreaterThan(0);
  const problems: string[] = [];
  frames.forEach((f, i) => {
    const bad = (what: string) => problems.push(`frame ${i}: ${what}`);
    if (f.caption.length <= 10) bad('caption too short');
    if (f.line !== undefined && (f.line < 0 || f.line >= FFT_CODE[mode].length)) bad(`line ${f.line} out of range`);
    const cols = f.state.rows.reduce((m, r) => Math.max(m, r.cells.length), 0);
    for (const b of f.state.blocks) {
      if (b.start + b.size > cols) bad(`block ${b.depth}:${b.start} past column ${cols}`);
      if (b.depth >= f.state.rows.length) bad(`block depth ${b.depth} has no row`);
    }
    if (f.state.butterfly) {
      const { depth, a, b } = f.state.butterfly;
      if (depth + 1 >= f.state.rows.length) bad(`butterfly depth ${depth} has no child row`);
      if (!(a < b)) bad(`butterfly ${a} -> ${b} not ordered`);
      if (b >= cols) bad(`butterfly position ${b} past column ${cols}`);
    }
    if (f.state.circle?.k != null && f.state.circle.k >= f.state.circle.m) bad(`twiddle k ${f.state.circle.k} >= m ${f.state.circle.m}`);
  });
  expect(problems).toEqual([]);
}

const randomSignal = (rand: () => number, n: number): C[] =>
  Array.from({ length: n }, () => [Math.round((rand() * 200 - 100) * 100) / 100, rand() < 0.4 ? Math.round((rand() * 20 - 10) * 100) / 100 : 0] as C);

describe('CPython helpers', () => {
  it('round() rounds half to even and never returns -0', () => {
    expect([0.5, 1.5, 2.5, -0.5, -1.5, 2.4999999999999996, -0.2, 3.0000000000000004].map(pyRound)).toEqual([0, 2, 2, 0, -2, 2, 0, 3]);
    expect(Object.is(pyRound(-0.3), 0)).toBe(true);
  });

  it('formats complex values the way the article writes them', () => {
    expect([[10, 0], [-2, 2], [-2, 0], [-2, -2], [0, 1], [0, -2.5], [0.70710678, -0.70710678], [1e-17, -3e-16]].map((c) => cstr(c as C))).toEqual([
      '10',
      '-2+2i',
      '-2',
      '-2-2i',
      'i',
      '-2.5i',
      '0.71-0.71i',
      '0',
    ]);
  });

  it('rounds the fixtures to 9 significant digits, at most 9 decimals', () => {
    expect(round9(0.7071067811865476)).toBe(0.707106781);
    expect(round9(-1.2246467991473532e-16)).toBe(0);
    expect(round9(123456.78912345)).toBe(123456.789);
    expect(round9(-2.0000000000000004)).toBe(-2);
  });
});

describe('fftTrace (transform)', () => {
  it('equals the direct DFT (and its inverse) on random signals', () => {
    const rand = rng(41);
    for (let t = 0; t < 150; t++) {
      const n = 1 + Math.floor(rand() * 8);
      const a = randomSignal(rand, n);
      const pow2 = (n & (n - 1)) === 0;
      const inverse = pow2 && rand() < 0.4;
      const run = fftTrace({ a, inverse, p: [], q: [] }, 'transform');
      let size = 1;
      while (size < n) size <<= 1;
      const padded = [...a, ...Array.from({ length: size - n }, () => [0, 0] as C)];
      expect(run.error).toBeNull();
      expectClose(run.result as C[], n === 1 ? a : dft(padded, inverse), 1000);
      expectWellFormed(stabilizeFft(run.frames), 'transform');
      // 2n - 1 calls and n/2 log2(n) butterflies, each with one twiddle.
      if (n > 1) {
        expect(run.calls.length).toBe(2 * size - 1);
        expect(run.roots.length).toBe((size / 2) * Math.log2(size));
      }
    }
  });

  it('fft([1, 2, 3, 4]) = [10, -2+2i, -2, -2-2i] (the textbook sign) and the inverse brings it back', () => {
    const run = fftTrace(parseFftSignal('1 2 3 4'), 'transform');
    expect((run.result as C[]).map(cstr)).toEqual(['10', '-2+2i', '-2', '-2-2i']);
    const back = fftTrace(parseFftSignal('inverse 10, -2+2j, -2, -2-2j'), 'transform');
    expect((back.result as C[]).map(cstr)).toEqual(['1', '2', '3', '4']);
  });

  it('pads a forward transform, rejects a non-power-of-two inverse, and returns [] for []', () => {
    const run = fftTrace(parseFftSignal('1 2 3'), 'transform');
    expect((run.result as C[]).length).toBe(4);
    expect(run.frames.some((f) => f.line === 5 && f.caption.includes('pads with 1 zero'))).toBe(true);
    const bad = fftTrace(parseFftSignal('inverse 1 2 3'), 'transform');
    expect(bad.error).toMatch(/^ValueError: inverse FFT needs a power-of-two length; got 3/);
    expect(bad.frames[bad.frames.length - 1].state.rows[0].cells.every((c) => c?.role === 'bad')).toBe(true);
    const empty = fftTrace(parseFftSignal('[]'), 'transform');
    expect(empty.result).toEqual([]);
    expect(empty.frames).toHaveLength(1);
  });

  it('fills the levels top-down on the split and bottom-up through the butterflies', () => {
    const run = fftTrace(parseFftSignal('0 1 2 3 4 5 6 7'), 'transform');
    const frames = run.frames;
    // The leaves are reached in bit-reversed order, and each one lands in the next column of the bottom row.
    expect(run.calls.filter((c) => c.input.length === 1).map((c) => c.input[0][0])).toEqual([0, 4, 2, 6, 1, 5, 3, 7]);
    const leafFrames = frames.filter((f) => f.line === 10);
    expect(leafFrames.map((f) => f.state.rows[3].cells.map((c) => (c ? c.re : '')).join(' '))).toContain('0 4 2 6 1 5 3 7');
    // Every butterfly reads two cells of the level below and writes the same two positions above.
    const writes = frames.filter((f) => f.line === 16);
    expect(writes).toHaveLength(12);
    for (const f of writes) {
      const { depth, a, b } = f.state.butterfly!;
      expect(f.state.rows[depth].cells[a]?.role).toBe('active');
      expect(f.state.rows[depth].cells[b]?.role).toBe('active');
      expect(f.state.rows[depth + 1].cells[a]?.role).toBe('compare');
    }
    const last = frames[frames.length - 1];
    expect(last.state.rows[0].cells.every((c) => c?.role === 'good')).toBe(true);
  });
});

describe('fftTrace (multiply)', () => {
  it('equals schoolbook multiplication on random polynomials', () => {
    const rand = rng(42);
    for (let t = 0; t < 150; t++) {
      const lp = 1 + Math.floor(rand() * 5);
      const lq = 1 + Math.floor(rand() * (9 - lp));
      const p = Array.from({ length: lp }, () => Math.floor(rand() * 199) - 99);
      const q = Array.from({ length: lq }, () => Math.floor(rand() * 199) - 99);
      const run = fftTrace({ a: [], inverse: false, p, q }, 'multiply');
      expect(run.result).toEqual(schoolbook(p, q).map((x) => x + 0));
      expectWellFormed(stabilizeFft(run.frames), 'multiply');
      expect(run.ffts.map((f) => f.inverse)).toEqual([false, false, true]);
      expect(run.frames.length).toBeLessThan(2000);
    }
  });

  it('the article example: (1 + 2x + 3x^2)(4 + 5x)', () => {
    const run = fftTrace(parseFftMultiply('p = 1 2 3; q = 4 5'), 'multiply');
    expect(run.ffts[0].output.map(cstr)).toEqual(['6', '-2-2i', '2', '-2+2i']);
    expect(run.ffts[1].output.map(cstr)).toEqual(['9', '4-5i', '-1', '4+5i']);
    expect(run.product!.map(cstr)).toEqual(['54', '-18+2i', '-2', '-18-2i']);
    expect(run.result).toEqual([4, 13, 22, 15]);
  });

  it('two constants need no recursion at all (n = 1)', () => {
    const run = fftTrace(parseFftMultiply('p = 7; q = 3'), 'multiply');
    expect(run.result).toEqual([21]);
    expect(run.calls).toHaveLength(0);
  });
});

describe('fftTrace matches the Python functions (golden fixtures)', () => {
  type Call = { input: C[]; output: C[] };
  type Fft = { input: C[]; inverse: boolean; output: C[] };
  const R = (xs: C[]) => xs.map(([a, b]) => [round9(a), round9(b)]);

  it.each((fixtures.fft as Array<{ a: C[]; inverse: boolean; calls: Call[]; roots: C[]; ffts: Fft[]; result: C[] | null; error: string | null }>).map((c, i) => [i, c] as const))(
    'fft case %i: every call, twiddle and value (rounded)',
    (_, c) => {
      const run = fftTrace({ a: c.a, inverse: c.inverse, p: [], q: [] }, 'transform');
      expect(run.error).toBe(c.error);
      expect(run.calls.map((k) => ({ input: R(k.input), output: R(k.output) }))).toEqual(c.calls);
      expect(R(run.roots)).toEqual(c.roots);
      expect(run.ffts.map((f) => ({ input: R(f.input), inverse: f.inverse, output: R(f.output) }))).toEqual(c.ffts);
      expect(run.result === null ? null : R(run.result as C[])).toEqual(c.result);
    },
  );

  it.each((fixtures.fftMultiply as Array<{ p: number[]; q: number[]; calls: Call[]; roots: C[]; ffts: Fft[]; result: number[] }>).map((c, i) => [i, c] as const))(
    'multiply case %i: every transform rounded, the coefficients exactly',
    (_, c) => {
      const run = fftTrace({ a: [], inverse: false, p: c.p, q: c.q }, 'multiply');
      expect(run.calls.map((k) => ({ input: R(k.input), output: R(k.output) }))).toEqual(c.calls);
      expect(R(run.roots)).toEqual(c.roots);
      expect(run.ffts.map((f) => ({ input: R(f.input), inverse: f.inverse, output: R(f.output) }))).toEqual(c.ffts);
      expect(run.result).toEqual(c.result);
    },
  );

  it('has enough cases', () => {
    expect(fixtures.fft.length + fixtures.fftMultiply.length).toBeGreaterThanOrEqual(60);
  });
});

describe('FFT parsers', () => {
  it('reads reals, complex values and the inverse keyword', () => {
    expect(parseComplex('3')).toEqual([3, 0]);
    expect(parseComplex('-2.5')).toEqual([-2.5, 0]);
    expect(parseComplex('2j')).toEqual([0, 2]);
    expect(parseComplex('-j')).toEqual([0, -1]);
    expect(parseComplex('1+2j')).toEqual([1, 2]);
    expect(parseComplex('1-0.5i')).toEqual([1, -0.5]);
    expect(parseFftSignal('inverse 10, -2+2j, -2, -2-2j')).toEqual({ a: [[10, 0], [-2, 2], [-2, 0], [-2, -2]], inverse: true, p: [], q: [] });
    expect(parseFftSignal('[]').a).toEqual([]);
    expect(parseFftMultiply('[1, 2, 3] * [4, 5]')).toEqual({ a: [], inverse: false, p: [1, 2, 3], q: [4, 5] });
    expect(parseFftMultiply('p = 1 2; q = 3 4').p).toEqual([1, 2]);
  });

  it('gives friendly errors', () => {
    expect(() => parseFftSignal('')).toThrow(InputError);
    expect(() => parseFftSignal('1 2 3 4 5 6 7 8 9')).toThrow(/At most 8/);
    expect(() => parseFftSignal('1 + 2j')).toThrow(/not a number/);
    expect(() => parseFftSignal('1.234')).toThrow(/2 decimals/);
    expect(() => parseFftSignal('1000')).toThrow(/-999 to 999/);
    expect(() => parseFftMultiply('p = 1 2 3')).toThrow(/two polynomials/);
    expect(() => parseFftMultiply('p = 1 2 3 4 5; q = 1 2 3 4 5')).toThrow(/at most 8/);
    expect(() => parseFftMultiply('p = 1.5; q = 2')).toThrow(/whole number/);
    expect(() => parseFftMultiply('p = 100; q = 2')).toThrow(/-99 to 99/);
  });
});
