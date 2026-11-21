import { FFT_CODE, fftTrace, parseFftMultiply, parseFftSignal, stabilizeFft, type FftInput } from '../algorithms/fft';
import { MATPOW_CODE, matPowTrace, parseMatPow, stabilizeMatPow, type MatPowInput, type MatPowMode } from '../algorithms/matrixPower';
import type { Example, VizSpec } from '../core/types';
import { FftView, type FftState } from '../renderers/FftView';
import { MatrixPowerView, type MatPowState } from '../renderers/MatrixPowerView';
import { withStripGhosts } from '../renderers/StableStrips';
import { SYM } from '../ui/symbols';

const pick = <T,>(xs: readonly T[]): T => xs[Math.floor(Math.random() * xs.length)];
const rint = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));

/** Draw random inputs until one passes the parser's limits (a few tries at most). */
function valid(make: () => string, parse: (text: string) => unknown): string {
  for (let attempt = 0; attempt < 50; attempt++) {
    const text = make();
    try {
      parse(text);
      return text;
    } catch {
      // entries too wide for the screen: draw again
    }
  }
  return make();
}

/* ---------- Matrix exponentiation ---------- */

function randomMatPow(mode: MatPowMode): string {
  const r = Math.random();
  if (mode === 'recursive' && r < 0.25) return Math.random() < 0.5 ? `fib ${rint(2, 60)}` : `fib ${rint(50, 400)}; mod ${pick([1000, 997, 1000000007])}`;
  const n = pick([1, 2, 2, 2, 3]);
  const A = `[${Array.from({ length: n }, () => `[${Array.from({ length: n }, () => rint(-3, 5)).join(', ')}]`).join(', ')}]`;
  const k = Math.random() < 0.7 ? rint(0, 40) : rint(1000, 1000000);
  const mod = k > 40 || Math.random() < 0.4 ? `; mod ${pick([10, 97, 1000, 1000000007])}` : '';
  return `A = ${A}; k = ${k}${mod}`;
}

const MATPOW_HELP =
  'A square matrix up to 4 x 4 ("A = [[1, 1], [1, 0]]" or "A = 1 1 / 1 0", entries from -999 to 999), the exponent ("k = 11", up to 10^18) and an optional modulus ("mod 1000"); ' +
  'only a positive modulus applies, as in the code (0 and negative values mean none). In the Recursive tab "fib 10" (or "fib 100; mod 1000") runs fibonacci_matrix. ' +
  'The tabs share the input, so the same power can be compared both ways. Without a modulus the entries must stay short enough to show.';

const SHARED: Example[] = [{ label: 'A^11, the README trace', value: 'A = [[1, 1], [1, 0]]; k = 11' }];

function matPowSpec(mode: MatPowMode): VizSpec<MatPowInput, MatPowState> {
  const parse = (text: string) => parseMatPow(text, mode);
  const iterative = mode === 'iterative';
  return {
    id: iterative ? 'matrix-power' : 'matrix-power-recursive',
    title: iterative ? 'Matrix power (iterative)' : 'Matrix power (recursive)',
    inputKind: 'matrix-power',
    inputLabel: 'Matrix, exponent and modulus',
    inputHelp: MATPOW_HELP,
    examples: iterative
      ? [
          ...SHARED,
          { label: 'k = 10^18 modulo 10^9 + 7', value: 'A = [[1, 1], [1, 0]]; k = 1000000000000000000; mod 1000000007' },
          { label: 'Walks of length 3 in a triangle', value: 'A = [[0, 1, 1], [1, 0, 1], [1, 1, 0]]; k = 3' },
          { label: 'Negative entry modulo 5', value: 'A = [[-1]]; k = 3; mod 5' },
          { label: 'Negative exponent: ValueError', value: 'A = [[1, 1], [1, 0]]; k = -1' },
        ]
      : [
          ...SHARED,
          { label: 'fibonacci_matrix(10)', value: 'fib 10' },
          { label: 'F(90), past 2^53', value: 'fib 90' },
          { label: 'F(100) modulo 1000', value: 'fib 100; mod 1000' },
          { label: 'Modulus 1: A^0 is zero', value: 'A = [[1, 1], [1, 0]]; k = 0; mod 1' },
        ],
    randomInput: () => valid(() => randomMatPow(mode), parse),
    parse,
    trace: (input) => stabilizeMatPow(matPowTrace(input, mode).frames),
    render: (state) => <MatrixPowerView state={state} />,
    pseudocode: MATPOW_CODE[mode],
    legend: iterative
      ? [
          { role: 'compare', label: 'factors of the next product' },
          { role: 'active', label: 'bit being read, entries just computed' },
          { role: 'muted', label: 'bits already used, an unused power' },
          { role: 'good', label: `the answer A^k (${SYM.check})` },
          { role: 'bad', label: `ValueError: a negative exponent (${SYM.cross})` },
        ]
      : [
          { role: 'compare', label: 'factors of the product, open calls below the top' },
          { role: 'active', label: 'the running call, the product just computed' },
          { role: 'done', label: 'a base case: I or A itself' },
          { role: 'good', label: `the answer (${SYM.check})` },
          { role: 'bad', label: `ValueError: a negative argument (${SYM.cross})` },
        ],
    complexity: iterative
      ? { time: 'O(n^3 log k): about log2(k) squarings and up to as many products', space: 'O(n^2)' }
      : { time: 'O(n^3 log k): floor(log2 k) + popcount(k) calls (at most 2 log2(k) + 1), one product at most each', space: 'O(n^2) per open call, O(log k) calls deep' },
  };
}

export const matrixPowerSpec = matPowSpec('iterative');
export const matrixPowerRecursiveSpec = matPowSpec('recursive');

/* ---------- Fast Fourier Transform ---------- */

function randomSignal(): string {
  const n = pick([2, 4, 4, 8, 8, 3, 5, 6]);
  const values = Array.from({ length: n }, () => String(rint(-5, 9)));
  return values.join(' ');
}

export const fftSpec: VizSpec<FftInput, FftState> = {
  id: 'fft',
  title: 'Fast Fourier Transform',
  inputKind: 'fft-signal',
  inputLabel: 'Signal',
  inputHelp:
    'Up to 8 values separated by spaces or commas: reals ("1 2 3 4", up to 2 decimals, -999 to 999) or complex values written without spaces ("1+2j", "-0.5j"). ' +
    'A length that is not a power of two is padded with zeros. Start with "inverse" (or "ifft") for the inverse transform, which needs a power-of-two length; "[]" is the empty list.',
  examples: [
    { label: 'fft([1, 2, 3, 4])', value: '1 2 3 4' },
    { label: 'Eight values, three levels', value: '1 1 1 1 0 0 0 0' },
    { label: 'Three values: pad to 4', value: '1 2 3' },
    { label: 'Inverse: back to 1, 2, 3, 4', value: 'inverse 10, -2+2j, -2, -2-2j' },
    { label: 'Inverse of length 3: ValueError', value: 'inverse 1 2 3' },
  ],
  randomInput: randomSignal,
  parse: parseFftSignal,
  trace: (input) => withStripGhosts(stabilizeFft(fftTrace(input, 'transform').frames)),
  render: (state) => <FftView state={state} />,
  pseudocode: FFT_CODE.transform,
  legend: [
    { role: 'compare', label: 'values being split, the halves a butterfly reads' },
    { role: 'active', label: 'values just written, the twiddle on the circle' },
    { role: 'done', label: 'a finished transform of a block' },
    { role: 'muted', label: 'halves already combined' },
    { role: 'good', label: `the result (${SYM.check})` },
    { role: 'bad', label: `ValueError: an inverse of a length that is not a power of two (${SYM.cross})` },
  ],
  complexity: { time: 'O(n log n): log2(n) levels of n/2 butterflies', space: 'O(n) per level of the recursion' },
};

function randomPolynomials(): string {
  const lp = rint(1, 4);
  const lq = rint(1, Math.min(4, 9 - lp));
  const poly = (len: number) => Array.from({ length: len }, () => rint(-9, 9)).join(' ');
  return `p = ${poly(lp)}; q = ${poly(lq)}`;
}

export const fftMultiplySpec: VizSpec<FftInput, FftState> = {
  id: 'fft-polynomial-multiplication',
  title: 'Polynomial multiplication (FFT)',
  inputKind: 'fft-polynomials',
  inputLabel: 'Two polynomials',
  inputHelp:
    'The coefficients of p and q, constant term first: "p = 1 2 3; q = 4 5" is (1 + 2x + 3x^2)(4 + 5x). Also "[1, 2, 3] * [4, 5]". ' +
    'Integers from -99 to 99, at least one per polynomial, and len(p) + len(q) - 1 at most 8, so every transform has size 8 or less.',
  examples: [
    { label: '(1 + 2x + 3x^2)(4 + 5x)', value: 'p = 1 2 3; q = 4 5' },
    { label: '(1 + x)^2', value: 'p = 1 1; q = 1 1' },
    { label: 'Size 8: two cubics', value: 'p = 3 -1 4 1; q = 5 9 -2 6' },
    { label: 'Large coefficients, still exact', value: 'p = 99 99 99; q = 99 -99 99 -99 99' },
    { label: 'Two constants: n = 1', value: 'p = 7; q = 3' },
  ],
  randomInput: randomPolynomials,
  parse: parseFftMultiply,
  trace: (input) => withStripGhosts(stabilizeFft(fftTrace(input, 'multiply').frames)),
  render: (state) => <FftView state={state} />,
  pseudocode: FFT_CODE.multiply,
  legend: [
    { role: 'compare', label: 'values being split or multiplied, the halves a butterfly reads' },
    { role: 'active', label: 'values just written, zero padding, the twiddle' },
    { role: 'done', label: 'a finished transform or product' },
    { role: 'muted', label: 'halves already combined' },
    { role: 'good', label: `a transform's result, the integer coefficients (${SYM.check})` },
  ],
  complexity: { time: 'O(n log n): three transforms and n pointwise products', space: 'O(n)' },
};
