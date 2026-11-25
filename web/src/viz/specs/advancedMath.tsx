import { BINOMIAL_CODE, binomialTrace, parseBinomial, type BinomialInput, type CombinatoricsState } from '../algorithms/combinatorics';
import { FFT_CODE, fftTrace, parseFftMultiply, parseFftSignal, stabilizeFft, type FftInput } from '../algorithms/fft';
import { GAUSS_CODE, gaussTrace, parseGaussFloat, parseGaussMod, type GaussFloatInput, type GaussModInput } from '../algorithms/gaussianElimination';
import { MATPOW_CODE, matPowTrace, parseMatPow, stabilizeMatPow, type MatPowInput, type MatPowMode } from '../algorithms/matrixPower';
import { NTT_CODE, nttTrace, parseNttMultiply, parseNttSequence, stabilizeNtt, type NttInput } from '../algorithms/ntt';
import type { Example, VizSpec } from '../core/types';
import { CombinatoricsView } from '../renderers/CombinatoricsView';
import { FftView, type FftState } from '../renderers/FftView';
import { GaussView, type GaussState } from '../renderers/GaussView';
import { MatrixPowerView, type MatPowState } from '../renderers/MatrixPowerView';
import { NttView } from '../renderers/NttView';
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

/* ---------- Gaussian elimination ---------- */

function randomSystem(mode: 'float' | 'mod'): string {
  const n = rint(1, 4);
  const m = Math.random() < 0.6 ? n : rint(1, 4);
  const entry = () => (mode === 'float' && Math.random() < 0.15 ? String(rint(-9, 9) / 2) : String(rint(-5, 9)));
  const A = Array.from({ length: n }, () => Array.from({ length: m }, entry));
  if (n > 1 && Math.random() < 0.3) A[n - 1] = A[0].map((v) => String(Number(v) * 2));
  const b = Array.from({ length: n }, () => String(rint(-9, 9)));
  const tail = mode === 'mod' ? `; p = ${pick([2, 3, 5, 7, 11, 13, 97, 1000000007])}` : Math.random() < 0.15 ? '; no pivoting' : '';
  return `A = [${A.map((r) => `[${r.join(', ')}]`).join(', ')}]; b = [${b.join(', ')}]${tail}`;
}

const GAUSS_SHAPE =
  'Up to 5 equations in up to 5 unknowns: "A = [[2, 1], [1, 3]]; b = [3, 5]", or augmented rows "2 1 | 3 / 1 3 | 5". Rows are labelled E0, E1, ... by the equation they started as, so a swap shows. ';

export const gaussSpec: VizSpec<GaussFloatInput, GaussState> = {
  id: 'gaussian-elimination',
  title: 'Gaussian elimination',
  inputKind: 'linear-system-float',
  inputLabel: 'System A x = b',
  inputHelp:
    GAUSS_SHAPE +
    'Entries are numbers from -10^6 to 10^6 (2, -0.5, 1e-8). Add "; no pivoting" to run solve_without_pivoting, or "; eps 1e-12" for another tolerance. ' +
    'Cells show 4 significant digits; the strips and the variables give the full values.',
  examples: [
    { label: 'The README system, 3 x 3', value: 'A = [[2, 1, -1], [-3, -1, 2], [-2, 1, 2]]; b = [8, -11, -3]' },
    { label: 'Small pivots, no pivoting: x1 = 4.47', value: 'A = [[1e-8, 0, 1], [1, 1e-8, 0], [0, 1, 0]]; b = [1, 2, 3]; no pivoting' },
    { label: 'The same with partial pivoting: x1 = 3', value: 'A = [[1e-8, 0, 1], [1, 1e-8, 0], [0, 1, 0]]; b = [1, 2, 3]' },
    { label: '2 equations, 4 unknowns: infinitely many', value: 'A = [[1, 2, 3, 4], [2, 4, 7, 9]]; b = [5, 11]' },
    { label: '3 equations, 2 unknowns: no solution', value: 'A = [[1, 1], [1, 2], [2, 3]]; b = [3, 5, 9]' },
    { label: '1e-10 counts as zero', value: 'A = [[1e-10]]; b = [1]' },
  ],
  randomInput: () => randomSystem('float'),
  parse: parseGaussFloat,
  trace: (input) => gaussTrace(input).frames,
  render: (state) => <GaussView state={state} />,
  pseudocode: GAUSS_CODE.float,
  legend: [
    { role: 'compare', label: 'the column searched for a pivot, the pivot row being subtracted, the row being solved' },
    { role: 'active', label: 'the pivot just chosen, the entries a row operation changed, the unknown just found' },
    { role: 'done', label: 'pivots already placed' },
    { role: 'good', label: `a solution (${SYM.check})` },
    { role: 'bad', label: `a row that reads 0 = c: no solution (${SYM.cross})` },
  ],
  complexity: { time: 'O(min(n, m) * n * m): a pivot per column, the rows below it, the entries to its right; O(n^3) for a square system', space: 'O(n * m): a copy of [A | b]' },
};

export const gaussModSpec: VizSpec<GaussModInput, GaussState> = {
  id: 'gaussian-elimination-mod',
  title: 'Gaussian elimination modulo a prime',
  inputKind: 'linear-system-mod',
  inputLabel: 'System A x = b and the prime p',
  inputHelp:
    GAUSS_SHAPE +
    'Entries are whole numbers from -10^12 to 10^12, reduced modulo p first; then "; p = 7", up to 2147483647. ' +
    'p is not tested for primality, as in the code: a composite p raises ValueError when a pivot has no inverse.',
  examples: [
    { label: 'The README system modulo 7', value: 'A = [[2, 1, -1], [-3, -1, 2], [-2, 1, 2]]; b = [8, -11, -3]; p = 7' },
    { label: 'The same modulo 10^9 + 7', value: 'A = [[2, 1, -1], [-3, -1, 2], [-2, 1, 2]]; b = [8, -11, -3]; p = 1000000007' },
    { label: 'Column x0 has no pivot', value: 'A = [[0, 1, 2], [0, 2, 5], [0, 3, 7]]; b = [1, 2, 3]; p = 13' },
    { label: 'No solution modulo 7', value: 'A = [[2, 4, 6], [1, 2, 3], [3, 6, 9]]; b = [2, 1, 4]; p = 7' },
    { label: 'p = 4 is not prime: ValueError', value: 'A = [[2, 1], [1, 1]]; b = [1, 1]; p = 4' },
  ],
  randomInput: () => randomSystem('mod'),
  parse: parseGaussMod,
  trace: (input) => gaussTrace(input).frames,
  render: (state) => <GaussView state={state} />,
  pseudocode: GAUSS_CODE.mod,
  legend: [
    { role: 'compare', label: 'the column searched for a pivot, the pivot row being subtracted, the row being solved' },
    { role: 'active', label: 'the pivot just chosen, the entries a row operation changed, the unknown just found' },
    { role: 'done', label: 'pivots already placed' },
    { role: 'good', label: `a solution (${SYM.check})` },
    { role: 'bad', label: `a row that reads 0 = c, or a pivot without an inverse (${SYM.cross})` },
  ],
  complexity: { time: 'O(min(n, m) * n * m) operations modulo p, plus O(log p) per pivot for its inverse', space: 'O(n * m)' },
};

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

/* ---------- Number Theoretic Transform ---------- */

const NTT_P = 998244353;

function randomSequence(): string {
  const n = pick([1, 2, 4, 4, 8, 8, 3, 5, 6]);
  const values = Array.from({ length: n }, () => (Math.random() < 0.15 ? String(pick([NTT_P - 1, NTT_P - 2, -1, -2])) : String(rint(-9, 20))));
  return Math.random() < 0.25 && (n & (n - 1)) === 0 ? `inverse ${values.join(' ')}` : values.join(' ');
}

export const nttSpec: VizSpec<NttInput, FftState> = {
  id: 'ntt',
  title: 'Number Theoretic Transform',
  inputKind: 'ntt-sequence',
  inputLabel: 'Sequence',
  inputHelp:
    'Up to 8 whole numbers separated by spaces or commas, from -99999999 to 999999999 ("1 2 3 4"); they are reduced modulo p = 998244353. ' +
    'A length that is not a power of two is padded with zeros. Start with "inverse" (or "intt") for the inverse transform, which needs a power-of-two length; "[]" is the empty list.',
  examples: [
    { label: 'ntt([1, 2, 3, 4])', value: '1 2 3 4' },
    { label: 'Eight values, three stages', value: '1 1 1 1 0 0 0 0' },
    { label: 'Inverse: back to 1, 2, 3, 4', value: 'inverse 10 173167434 998244351 825076915' },
    { label: 'Three values: pad to 4', value: '1 2 3' },
    { label: 'Negative values: -1 is p - 1', value: '-1 -2 3 998244352' },
    { label: 'Inverse of length 3: ValueError', value: 'inverse 1 2 3' },
  ],
  randomInput: () => valid(randomSequence, parseNttSequence),
  parse: parseNttSequence,
  trace: (input) => withStripGhosts(stabilizeNtt(nttTrace(input, 'transform').frames)),
  render: (state) => <NttView state={state} />,
  pseudocode: NTT_CODE.transform,
  legend: [
    { role: 'compare', label: 'the two values a butterfly reads, an entry the reduction changed' },
    { role: 'active', label: 'values just written or swapped, zero padding, the twiddle on the circle' },
    { role: 'done', label: 'the last finished stage' },
    { role: 'muted', label: 'outlines of stages already combined' },
    { role: 'good', label: `the result (${SYM.check})` },
    { role: 'bad', label: `ValueError: an inverse of a length that is not a power of two (${SYM.cross})` },
  ],
  complexity: { time: 'O(n log n): log2(n) stages of n/2 butterflies', space: 'O(n) for the copy; the stages run in place' },
};

function randomNttPolynomials(): string {
  const lp = rint(1, 4);
  const lq = rint(1, Math.min(4, 9 - lp));
  const coefficient = () => (Math.random() < 0.15 ? pick([NTT_P - 1, 100000000, -1]) : rint(-9, 20));
  const poly = (len: number) => Array.from({ length: len }, coefficient).join(' ');
  return `p = ${poly(lp)}; q = ${poly(lq)}`;
}

export const nttMultiplySpec: VizSpec<NttInput, FftState> = {
  id: 'ntt-polynomial-multiplication',
  title: 'Polynomial multiplication (NTT)',
  inputKind: 'ntt-polynomials',
  inputLabel: 'Two polynomials',
  inputHelp:
    'The coefficients of p and q, constant term first: "p = 1 2 3; q = 4 5" is (1 + 2x + 3x^2)(4 + 5x). Also "[1, 2, 3] * [4, 5]". ' +
    'Whole numbers from -99999999 to 999999999, at least one per polynomial, and len(p) + len(q) - 1 at most 8. The result is modulo p = 998244353.',
  examples: [
    { label: '(1 + 2x + 3x^2)(4 + 5x)', value: 'p = 1 2 3; q = 4 5' },
    { label: '(1 - x)(1 + x): -1 is p - 1', value: 'p = 1 -1; q = 1 1' },
    { label: 'Size 8: two cubics', value: 'p = 3 1 4 1; q = 5 9 2 6' },
    { label: '(p - 2)^2, past 2^53: 4', value: 'p = 998244351; q = 998244351' },
    { label: 'Two constants: n = 1', value: 'p = 7; q = 3' },
  ],
  randomInput: () => valid(randomNttPolynomials, parseNttMultiply),
  parse: parseNttMultiply,
  trace: (input) => withStripGhosts(stabilizeNtt(nttTrace(input, 'multiply').frames)),
  render: (state) => <NttView state={state} />,
  pseudocode: NTT_CODE.multiply,
  legend: [
    { role: 'compare', label: 'values a butterfly reads or a product multiplies, a reduced coefficient' },
    { role: 'active', label: 'values just written or swapped, zero padding, the twiddle' },
    { role: 'done', label: 'the last finished stage, the products so far' },
    { role: 'muted', label: 'outlines of stages already combined' },
    { role: 'good', label: `a transform's result, the coefficients modulo p (${SYM.check})` },
  ],
  complexity: { time: 'O(n log n): three transforms and n pointwise products', space: 'O(n)' },
};

/* ---------- Combinatorics ---------- */

function randomBinomial(): string {
  const n = rint(2, 10);
  // Mostly a prime above n; now and then a small prime (n >= p) or a composite, which the code refuses.
  const p = Math.random() < 0.8 ? pick([11, 13, 17, 101, 1000000007]) : pick([2, 3, 5, 7, 4, 9, 10]);
  const queries = Array.from({ length: rint(1, 2) }, () => {
    const qn = rint(Math.max(0, n - 3), n);
    return `C(${qn}, ${rint(0, qn)})`;
  });
  return `n ${n}; ${queries.join(', ')} mod ${p}`;
}

export const binomialSpec: VizSpec<BinomialInput, CombinatoricsState> = {
  id: 'binomial-coefficients',
  title: "Pascal's triangle and C(n, k) mod p",
  inputKind: 'binomial-mod-p',
  inputLabel: 'Queries and a prime',
  inputHelp:
    'One to four queries and the modulus: "C(6, 2) mod 13" or "C(6, 2), C(6, 3) mod 13" (n and k from -99 to 99, p from 2 to 2147483647). ' +
    'The triangle and the tables go up to the largest n asked about, at most 10; "n 8" sets that size, so a query past it shows the error. ' +
    'A table with n >= p, or a modulus that is not prime, raises ValueError as the code does.',
  examples: [
    { label: 'C(6, 2) mod 13, the README trace', value: 'C(6, 2) mod 13' },
    { label: 'Row 10 modulo 10^9 + 7', value: 'C(10, 5), C(10, 3) mod 1000000007' },
    { label: 'k out of range: 0', value: 'C(5, 7), C(5, -1), C(5, 2) mod 11' },
    { label: 'n >= p: Lucas takes over', value: 'C(9, 4) mod 7' },
    { label: 'Not prime: 8', value: 'C(6, 3) mod 8' },
    { label: 'Past the table', value: 'n 4; C(4, 2), C(6, 2) mod 13' },
  ],
  randomInput: randomBinomial,
  parse: parseBinomial,
  trace: (input) => binomialTrace(input).frames,
  render: (state) => <CombinatoricsView state={state} />,
  pseudocode: BINOMIAL_CODE,
  legend: [
    { role: 'compare', label: 'the two cells above, the entries a step reads' },
    { role: 'active', label: 'the cell or entry just written' },
    { role: 'idle', label: 'dashed: not written yet' },
    { role: 'good', label: `an answer that matches the triangle (${SYM.check})` },
    { role: 'bad', label: `ValueError: n >= p, p not prime, past the table (${SYM.cross})` },
  ],
  complexity: { time: 'O(n^2) additions for the triangle; O(n + log p) products for the tables, O(1) per query', space: 'O(n^2) for the triangle, O(n) for the tables' },
};
