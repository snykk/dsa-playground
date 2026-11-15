/**
 * Strassen's matrix multiplication, drawn with StrassenView: the current call's A, B and C on
 * top, the two factors of the product being formed below them, and P1..P7 at the bottom.
 *
 * Mirrors Algorithms/Divide_and_Conquer/Strassens_Matrix_Multiplication/Python/strassen_matrix.py:
 *   strassen_multiply(A, B, cutoff=64): ValueError for a cutoff below 1; n == 1 returns
 *     [[A[0][0] * B[0][0]]]; n <= cutoff returns matrix_multiply_naive(A, B); an odd n is padded
 *     by one zero row and column (pad_matrix),
 *     multiplied, and cut back with [row[:n] for row in C[:n]]; otherwise split_matrix cuts A and
 *     B into quadrants, P1..P7 are computed in that order from matrix_add / matrix_subtract
 *     sums, C11 = P5 + P4 - P2 + P6, C12 = P1 + P2, C21 = P3 + P4, C22 = P5 + P1 - P3 - P7, and
 *     combine_matrices joins the quadrants;
 *   strassen_multiply_general(A, B, cutoff=64): ValueError for a cutoff below 1 or when A's
 *     columns and B's rows differ, otherwise both are padded to next_power_of_2(max(m, n1, p)),
 *     multiplied with the same cutoff and cut back to m x p.
 *
 * The cutoff is the code's own parameter. With its default of 64 every matrix small enough to
 * read goes to the naive triple loop and never splits; "cutoff 1" (or 2, 4...) passes cutoff=1, so
 * the seven-product recursion that the default runs only above 64 x 64 shows on a 4 x 4. The
 * golden fixture calls the Python functions with the same cutoff (and with the default, on
 * 65 x 65, 128 x 128 and 130 x 130 inputs too) and pins the order of every call, pad, split and
 * combine and every returned matrix.
 *
 * Input: "A = [[1, 2], [3, 4]]; B = [[5, 6], [7, 8]]; cutoff 1"   (rows may also be "1 2 / 3 4";
 * "general" calls strassen_multiply_general; a non-square or mismatched pair always does)
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { StripItem } from '../ui/molecules/Strip';
import { SYM } from '../ui/symbols';

export type Mat = number[][];

/* ---------- the repository's helpers, as Python runs them ---------- */

export function matrixAdd(A: Mat, B: Mat): Mat {
  const n = A.length;
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => A[i][j] + B[i][j]));
}

export function matrixSubtract(A: Mat, B: Mat): Mat {
  const n = A.length;
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => A[i][j] - B[i][j]));
}

export function splitMatrix(M: Mat): [Mat, Mat, Mat, Mat] {
  const mid = Math.floor(M.length / 2);
  return [
    M.slice(0, mid).map((row) => row.slice(0, mid)),
    M.slice(0, mid).map((row) => row.slice(mid)),
    M.slice(mid).map((row) => row.slice(0, mid)),
    M.slice(mid).map((row) => row.slice(mid)),
  ];
}

export function combineMatrices(C11: Mat, C12: Mat, C21: Mat, C22: Mat): Mat {
  const n = C11.length;
  const C: Mat = Array.from({ length: 2 * n }, () => Array<number>(2 * n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      C[i][j] = C11[i][j];
      C[i][j + n] = C12[i][j];
      C[i + n][j] = C21[i][j];
      C[i + n][j + n] = C22[i][j];
    }
  }
  return C;
}

/** matrix_multiply_naive: n = len(A) drives all three loops (square input). */
export function matrixMultiplyNaive(A: Mat, B: Mat): Mat {
  const n = A.length;
  const C: Mat = Array.from({ length: n }, () => Array<number>(n).fill(0));
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) for (let k = 0; k < n; k++) C[i][j] += A[i][k] * B[k][j];
  return C;
}

/** pad_matrix: the matrix itself when it is already target x target, else a zero-filled copy. */
export function padMatrix(M: Mat, target: number): Mat {
  const rows = M.length;
  const cols = rows > 0 ? M[0].length : 0;
  if (rows === target && cols === target) return M;
  const P: Mat = Array.from({ length: target }, () => Array<number>(target).fill(0));
  for (let i = 0; i < Math.min(rows, target); i++) for (let j = 0; j < Math.min(cols, target); j++) P[i][j] = M[i][j];
  return P;
}

export function nextPowerOf2(n: number): number {
  let power = 1;
  while (power < n) power *= 2;
  return power;
}

/** The schoolbook product of an m x n and an n x p matrix (the reference the tests compare with). */
export function schoolbook(A: Mat, B: Mat): Mat {
  return A.map((row) => B[0].map((_, j) => row.reduce((s, a, k) => s + a * B[k][j], 0)));
}

/** A big matrix in the fixture: [rows, cols, sum, weighted sum] instead of every entry. */
export function digest(M: Mat): number[] {
  let sum = 0;
  let weighted = 0;
  M.forEach((row, i) =>
    row.forEach((v, j) => {
      sum += v;
      weighted += (((i * 31 + j * 17) % 1000) + 1) * v;
    }),
  );
  return [M.length, M.length ? M[0].length : 0, sum, weighted];
}

/** Matrices up to 64 entries go into the event log whole, bigger ones as a digest. */
const logged = (M: Mat): Mat | number[] => (M.length * (M.length ? M[0].length : 0) <= 64 ? M.map((r) => [...r]) : digest(M));

/**
 * The calls the code makes, in order: the same events the fixture generator logs by wrapping the
 * Python functions (strassen_multiply, matrix_multiply_naive, pad_matrix, split_matrix,
 * combine_matrices and strassen_multiply_general).
 */
export type StrassenEvent = Array<string | number | Mat | number[]>;

/* ---------- input ---------- */

export interface StrassenInput {
  A: Mat;
  B: Mat;
  /** The size at or below which the naive loop takes over: 64 in the code. */
  cutoff: number;
  /** Call strassen_multiply_general instead of strassen_multiply. */
  general: boolean;
}

export const PYTHON_CUTOFF = 64;
export const STRASSEN_LIMITS = { maxSide: 8, maxValue: 9, maxFrames: 2000 };

/** "[[1, 2], [3, 4]]" or "1 2 / 3 4" -> rows of integers. */
function parseMatrix(name: string, text: string): Mat {
  const body = text.trim();
  let rows: string[];
  if (body.startsWith('[')) {
    const inner = body.replace(/^\[\s*/, '').replace(/\s*\]$/, '');
    rows = inner.length ? inner.split(/\]\s*,?\s*\[/).map((r) => r.replace(/[[\]]/g, '')) : [];
  } else {
    rows = body.split(/[/|]/);
  }
  const M = rows.map((r) =>
    r
      .split(/[\s,]+/)
      .filter(Boolean)
      .map((t) => {
        if (!/^-?\d+$/.test(t)) throw new InputError(`${name}: "${t}" is not a whole number.`);
        const v = Number(t) || 0;
        if (Math.abs(v) > STRASSEN_LIMITS.maxValue) {
          throw new InputError(`${name}: entries go from -${STRASSEN_LIMITS.maxValue} to ${STRASSEN_LIMITS.maxValue}, so every sum and product stays readable (got ${t}).`);
        }
        return v;
      }),
  );
  if (M.length === 0 || M[0].length === 0) throw new InputError(`${name} needs at least one row with one number.`);
  M.forEach((row, i) => {
    if (row.length !== M[0].length) throw new InputError(`${name}: row ${i + 1} has ${row.length} numbers but row 1 has ${M[0].length}; every row needs the same length.`);
  });
  if (M.length > STRASSEN_LIMITS.maxSide || M[0].length > STRASSEN_LIMITS.maxSide) {
    throw new InputError(`${name} may have up to ${STRASSEN_LIMITS.maxSide} rows and columns here (got ${M.length} x ${M[0].length}).`);
  }
  return M;
}

/** Parse "A = [[1, 2], [3, 4]]; B = 5 6 / 7 8; cutoff 1; general". */
export function parseStrassen(text: string): StrassenInput {
  let A: Mat | undefined;
  let B: Mat | undefined;
  let cutoff: number | undefined;
  let general = false;
  const segments = text
    .split(/;|\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  for (const seg of segments) {
    const mat = seg.match(/^([AaBb])\s*[:=]?\s*(.+)$/);
    const cut = seg.match(/^cut(?:off)?\s*[:=]?\s*(-?\d+)$/i);
    if (cut) {
      if (cutoff !== undefined) throw new InputError('Give the cutoff ("cutoff 1") only once.');
      cutoff = Number(cut[1]) || 0;
      if (cutoff < -9 || cutoff > 999) throw new InputError(`The cutoff goes from -9 to 999 here (${PYTHON_CUTOFF} is the code's default, used when you leave it out; below 1 the code raises ValueError); got ${cut[1]}.`);
    } else if (/^general$/i.test(seg)) {
      general = true;
    } else if (mat && /^[[\d\s,/|-]/.test(mat[2])) {
      const name = mat[1].toUpperCase();
      if (name === 'A') {
        if (A) throw new InputError('Give A only once.');
        A = parseMatrix('A', mat[2]);
      } else {
        if (B) throw new InputError('Give B only once.');
        B = parseMatrix('B', mat[2]);
      }
    } else {
      throw new InputError(`Cannot read "${seg}". Write "A = [[1, 2], [3, 4]]; B = [[5, 6], [7, 8]]", optionally with "cutoff 1" or "general", separated by semicolons.`);
    }
  }
  if (!A || !B) throw new InputError('Give both matrices, e.g. "A = [[1, 2], [3, 4]]; B = [[5, 6], [7, 8]]".');
  const input: StrassenInput = { A, B, cutoff: cutoff ?? PYTHON_CUTOFF, general };
  const frames = strassenTrace(input).frames.length;
  if (frames > STRASSEN_LIMITS.maxFrames) {
    throw new InputError(
      `This product takes ${frames} steps with cutoff ${input.cutoff}, more than the ${STRASSEN_LIMITS.maxFrames} the player shows. Raise the cutoff (each level of recursion multiplies the calls by 7) or use smaller matrices.`,
    );
  }
  return input;
}

/** Python's repr of a matrix: [[1, 2], [3, 4]]. */
export function fmtMat(M: Mat): string {
  return `[${M.map((r) => `[${r.join(', ')}]`).join(', ')}]`;
}

/* ---------- frames ---------- */

export interface MatrixPanel {
  /** Stable identity: a matrix keeps its key when it moves from one row of the picture to another. */
  key: string;
  label: string;
  cells: Array<Array<number | null>>;
  /** Roles keyed by "row,col". */
  roles?: Record<string, Role>;
  /** Draw the quadrant split through the middle. */
  quads?: boolean;
  /** The real part of a padded matrix: cells outside it are zero padding. */
  keep?: { rows: number; cols: number };
  /** Outline of the whole matrix. */
  role?: Role;
}

export interface StrassenState {
  /** The current call: A, B and C = A x B (C fills in as it is computed). */
  call: Array<MatrixPanel | null>;
  /** The product being formed: its left and right factor, and the product once the call returns. */
  factors: Array<MatrixPanel | null>;
  /** What the factors row computes, e.g. "P5 = (A11 + A22)(B11 + B22)". */
  factorsLabel?: string;
  /** P1..P7 of the current call, null until computed. Empty when the call does not split. */
  products: Array<MatrixPanel | null>;
  /** The open calls, outermost first. */
  stack: StripItem[];
  /** Fixed geometry for a whole run (stabilizeStrassen): the largest side, the cell width, and whether any call splits. */
  layout?: { side: number; cell: number; split: boolean };
}

export interface StrassenRun {
  frames: Array<Frame<StrassenState>>;
  result: Mat | null;
  /** "ValueError: ..." when strassen_multiply_general raises. */
  error: string | null;
  events: StrassenEvent[];
  /** Scalar multiplications made (n == 1 leaves and naive loops). */
  multiplications: number;
  calls: number;
}

export const STRASSEN_CODE: string[] = [
  'def strassen_multiply(A, B, cutoff=64):   # n = len(A)',
  '    if cutoff < 1: raise ValueError("cutoff must be at least 1")',
  '    if n == 1: return [[A[0][0] * B[0][0]]]',
  '    if n <= cutoff: return matrix_multiply_naive(A, B)',
  '    if n % 2 == 1:',
  '        C = strassen_multiply(pad_matrix(A, n + 1), pad_matrix(B, n + 1), cutoff)',
  '        return [row[:n] for row in C[:n]]',
  '    A11, A12, A21, A22 = split_matrix(A)   # and B11..B22',
  '    P1 = strassen_multiply(A11, B12 - B22, cutoff)',
  '    P2 = strassen_multiply(A11 + A12, B22, cutoff)',
  '    P3 = strassen_multiply(A21 + A22, B11, cutoff)',
  '    P4 = strassen_multiply(A22, B21 - B11, cutoff)',
  '    P5 = strassen_multiply(A11 + A22, B11 + B22, cutoff)',
  '    P6 = strassen_multiply(A12 - A22, B21 + B22, cutoff)',
  '    P7 = strassen_multiply(A11 - A21, B11 + B12, cutoff)',
  '    C11 = P5 + P4 - P2 + P6',
  '    C12 = P1 + P2',
  '    C21 = P3 + P4',
  '    C22 = P5 + P1 - P3 - P7',
  '    return combine_matrices(C11, C12, C21, C22)',
  'def strassen_multiply_general(A, B, cutoff=64):   # m x n1 times n2 x p',
  '    if cutoff < 1: raise ValueError("cutoff must be at least 1")',
  '    if n1 != n2: raise ValueError("Matrix dimensions incompatible ...")',
  '    size = next_power_of_2(max(m, n1, p)); pad A and B to size',
  '    C_padded = strassen_multiply(A_padded, B_padded, cutoff)',
  '    return C_padded cut to m x p',
];

const L = {
  call: 0,
  badCutoff: 1,
  one: 2,
  naive: 3,
  odd: 4,
  padCall: 5,
  crop: 6,
  split: 7,
  product: 8, // + i - 1
  c11: 15,
  combine: 19,
  general: 20,
  gBadCutoff: 21,
  raise: 22,
  gpad: 23,
  gcall: 24,
  gcrop: 25,
};

const CUTOFF_ERROR = 'ValueError: cutoff must be at least 1';

/** Which quadrants (0 = 11, 1 = 12, 2 = 21, 3 = 22) of A and B feed each product, with signs. */
const PRODUCTS: Array<{ a: Array<[number, 1 | -1]>; b: Array<[number, 1 | -1]>; text: string }> = [
  { a: [[0, 1]], b: [[1, 1], [3, -1]], text: 'A11 (B12 - B22)' },
  { a: [[0, 1], [1, 1]], b: [[3, 1]], text: '(A11 + A12) B22' },
  { a: [[2, 1], [3, 1]], b: [[0, 1]], text: '(A21 + A22) B11' },
  { a: [[3, 1]], b: [[2, 1], [0, -1]], text: 'A22 (B21 - B11)' },
  { a: [[0, 1], [3, 1]], b: [[0, 1], [3, 1]], text: '(A11 + A22)(B11 + B22)' },
  { a: [[1, 1], [3, -1]], b: [[2, 1], [3, 1]], text: '(A12 - A22)(B21 + B22)' },
  { a: [[0, 1], [2, -1]], b: [[0, 1], [1, 1]], text: '(A11 - A21)(B11 + B12)' },
];

/** The result quadrants: which products, with signs, in the code's order of evaluation. */
const QUADS: Array<{ name: string; terms: Array<[number, 1 | -1]> }> = [
  { name: 'C11', terms: [[5, 1], [4, 1], [2, -1], [6, 1]] },
  { name: 'C12', terms: [[1, 1], [2, 1]] },
  { name: 'C21', terms: [[3, 1], [4, 1]] },
  { name: 'C22', terms: [[5, 1], [1, 1], [3, -1], [7, -1]] },
];

const Q_NAMES = ['11', '12', '21', '22'];

function factorName(letter: string, parts: Array<[number, 1 | -1]>): string {
  return parts.map(([q, s], i) => `${i ? (s > 0 ? ' + ' : ' - ') : ''}${letter}${Q_NAMES[q]}`).join('');
}

/** Python evaluates the factor as matrix_add / matrix_subtract of the quadrants, left to right. */
function factorValue(quads: Mat[], parts: Array<[number, 1 | -1]>): Mat {
  let M = quads[parts[0][0]].map((r) => [...r]);
  for (const [q, s] of parts.slice(1)) M = s > 0 ? matrixAdd(M, quads[q]) : matrixSubtract(M, quads[q]);
  return M;
}

/** Cell roles covering whole quadrants of an n x n matrix. */
function quadRoles(n: number, quads: number[], role: Role, base: Record<string, Role> = {}): Record<string, Role> {
  const h = n / 2;
  const out = { ...base };
  for (const q of quads) {
    const r0 = q >= 2 ? h : 0;
    const c0 = q % 2 ? h : 0;
    for (let i = 0; i < h; i++) for (let j = 0; j < h; j++) out[`${r0 + i},${c0 + j}`] = role;
  }
  return out;
}

function allRoles(M: Array<Array<unknown>>, role: Role): Record<string, Role> {
  const out: Record<string, Role> = {};
  M.forEach((row, i) => row.forEach((_, j) => (out[`${i},${j}`] = role)));
  return out;
}

const empty = (rows: number, cols: number): Array<Array<number | null>> => Array.from({ length: rows }, () => Array<number | null>(cols).fill(null));
const dims = (M: Mat) => `${M.length} x ${M[0].length}`;
const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

interface OpenCall {
  label: string;
}

/**
 * Trace one run. With draw = false only the result and the event log are built (the fixture
 * checks 128 x 128 products that way).
 */
export function strassenTrace(input: StrassenInput, draw = true): StrassenRun {
  const { cutoff } = input;
  const frames: Array<Frame<StrassenState>> = [];
  const events: StrassenEvent[] = [];
  const open: OpenCall[] = [];
  let multiplications = 0;
  let calls = 0;

  const stackItems = (): StripItem[] => open.map((c, i) => ({ text: c.label, role: i === open.length - 1 ? 'active' : 'idle' }));

  const snap = (line: number | undefined, caption: string, state: Omit<StrassenState, 'stack'>, vars: Array<[string, string | number]> = []) => {
    if (!draw) return;
    frames.push({
      line,
      caption,
      state: { ...state, stack: stackItems() },
      vars: [...vars, ['cutoff', cutoff], ['depth', Math.max(0, open.length - 1)], ['calls so far', calls], ['multiplications', multiplications]],
    });
  };

  // Every frame is a snapshot: copy the cells and the roles, which the tracer keeps mutating.
  const panel = (key: string, label: string, M: Array<Array<number | null>>, o: Partial<MatrixPanel> = {}): MatrixPanel => ({
    key,
    label,
    ...o,
    cells: M.map((r) => [...r]),
    ...(o.roles ? { roles: { ...o.roles } } : {}),
  });

  /**
   * strassen_multiply(A, B) for the call with identity `key`. `caller` describes it in the stack;
   * the returned matrix is what Python returns.
   */
  const mul = (A: Mat, B: Mat, key: string, caller: string): Mat => {
    const n = A.length;
    calls++;
    events.push(['call', n]);
    open.push({ label: `${caller}${n} x ${n}` });
    const depth = open.length - 1;
    const vars: Array<[string, string | number]> = [['n', n]];
    const aPanel = (o: Partial<MatrixPanel> = {}) => panel(`A:${key}`, 'A', A, o);
    const bPanel = (o: Partial<MatrixPanel> = {}) => panel(`B:${key}`, 'B', B, o);
    let result: Mat;

    if (n === 1) {
      result = [[A[0][0] * B[0][0] + 0]]; // + 0: a Python int has no -0
      multiplications++;
      snap(
        L.one,
        `n == 1: a 1 x 1 product is one multiplication, ${A[0][0]} * ${B[0][0]} = ${result[0][0]}. strassen_multiply returns [[${result[0][0]}]] without splitting.`,
        { call: [aPanel({ roles: { '0,0': 'compare' } }), bPanel({ roles: { '0,0': 'compare' } }), panel(`C:${key}`, 'C', result, { roles: { '0,0': 'active' } })], factors: [], products: [] },
        vars,
      );
    } else if (n <= cutoff) {
      const why =
        cutoff === PYTHON_CUTOFF
          ? `n = ${n} <= 64, the default cutoff`
          : `n = ${n} <= cutoff = ${cutoff}`;
      if (depth === 0) {
        // The whole product is naive: show it cell by cell.
        const C = empty(n, n);
        const sofar: Record<string, Role> = {};
        for (let i = 0; i < n; i++) {
          for (let j = 0; j < n; j++) {
            let s = 0;
            const terms: string[] = [];
            for (let k = 0; k < n; k++) {
              s += A[i][k] * B[k][j];
              terms.push(`${A[i][k]}*${B[k][j]}`);
            }
            C[i][j] = s;
            multiplications += n;
            const rowA: Record<string, Role> = {};
            const colB: Record<string, Role> = {};
            for (let k = 0; k < n; k++) {
              rowA[`${i},${k}`] = 'compare';
              colB[`${k},${j}`] = 'compare';
            }
            snap(
              L.naive,
              i === 0 && j === 0
                ? `${why}, so strassen_multiply hands the whole product to matrix_multiply_naive, the schoolbook triple loop: no split, no seven products${cutoff === PYTHON_CUTOFF && n > 1 ? ' (pass a smaller cutoff, e.g. "cutoff 1", to see them)' : ''}. C[0][0] = row 0 of A times column 0 of B = ${terms.join(' + ')} = ${s}.`
                : `C[${i}][${j}] = row ${i} of A times column ${j} of B = ${terms.join(' + ')} = ${s}.`,
              { call: [aPanel({ roles: rowA }), bPanel({ roles: colB }), panel(`C:${key}`, 'C', C, { roles: { ...sofar, [`${i},${j}`]: 'active' } })], factors: [], products: [] },
              [...vars, ['i', i], ['j', j]],
            );
            sofar[`${i},${j}`] = 'done';
          }
        }
        events.push(['naive', n]);
        result = matrixMultiplyNaive(A, B);
      } else {
        events.push(['naive', n]);
        result = matrixMultiplyNaive(A, B);
        multiplications += n * n * n;
        snap(
          L.naive,
          `${why}: below the cutoff the naive triple loop is cheaper than splitting again, so matrix_multiply_naive returns all ${n * n} entries with ${n}^3 = ${n * n * n} multiplications.`,
          { call: [aPanel(), bPanel(), panel(`C:${key}`, 'C', result, { roles: allRoles(result, 'active') })], factors: [], products: [] },
          vars,
        );
      }
    } else if (n % 2 === 1) {
      events.push(['pad', n, n, n + 1], ['pad', n, n, n + 1]);
      const PA = padMatrix(A, n + 1);
      const PB = padMatrix(B, n + 1);
      const keep = { rows: n, cols: n };
      const ck = `${key}.p`;
      snap(
        L.padCall,
        `n = ${n} is odd, so A cannot be cut into four equal quadrants. pad_matrix adds one zero row and one zero column (dashed) to A and B, making them ${n + 1} x ${n + 1}; the zeros add nothing to any entry of the product.`,
        {
          call: [panel(`A:${ck}`, 'A padded', PA, { keep }), panel(`B:${ck}`, 'B padded', PB, { keep }), panel(`C:${ck}`, 'C', empty(n + 1, n + 1), { keep })],
          factors: [],
          products: [],
        },
        vars,
      );
      const C = mul(PA, PB, ck, 'pad: ');
      result = C.slice(0, n).map((row) => row.slice(0, n));
      snap(
        L.crop,
        `The padded product is ${n + 1} x ${n + 1}; its last row and column are the padding's and are cut off: [row[:${n}] for row in C[:${n}]] is the ${n} x ${n} answer.`,
        {
          call: [panel(`A:${ck}`, 'A padded', PA, { keep }), panel(`B:${ck}`, 'B padded', PB, { keep }), panel(`C:${ck}`, 'C', C, { keep, roles: allRoles(result, 'done') })],
          factors: [],
          products: [],
        },
        vars,
      );
    } else {
      events.push(['split', n], ['split', n]);
      const h = n / 2;
      const qa = splitMatrix(A);
      const qb = splitMatrix(B);
      const P: Array<Mat | null> = Array(7).fill(null);
      const prodPanels = (active?: number, compare: number[] = []): Array<MatrixPanel | null> =>
        P.map((M, i) =>
          M && i !== active
            ? panel(`C:${key}.${i + 1}`, `P${i + 1}`, M, { roles: allRoles(M, compare.includes(i + 1) ? 'compare' : 'done') })
            : null,
        );
      const Cpart = empty(n, n);
      const cRoles: Record<string, Role> = {};
      const cPanel = (roles: Record<string, Role> = cRoles) => panel(`C:${key}`, 'C', Cpart, { quads: true, roles });
      snap(
        L.split,
        `n = ${n} is above the cutoff and even: split_matrix cuts A and B into four ${h} x ${h} quadrants each (11 top left, 12 top right, 21 bottom left, 22 bottom right). The schoolbook rule would need 8 quadrant products; Strassen gets C from 7.`,
        { call: [aPanel({ quads: true }), bPanel({ quads: true }), cPanel()], factors: [], products: prodPanels() },
        vars,
      );
      PRODUCTS.forEach((spec, idx) => {
        const i = idx + 1;
        const left = factorValue(qa, spec.a);
        const right = factorValue(qb, spec.b);
        const ln = factorName('A', spec.a);
        const rn = factorName('B', spec.b);
        const childKey = `${key}.${i}`;
        const sums = [spec.a.length > 1 ? `${ln} = ${fmtMat(left)}` : '', spec.b.length > 1 ? `${rn} = ${fmtMat(right)}` : ''].filter(Boolean);
        snap(
          L.product + idx,
          `P${i} = ${spec.text}: ${sums.length ? `first the quadrant ${sums.length === 2 ? 'sums' : 'sum'} ${sums.join(' and ')}, then` : 'no sum needed,'} one recursive call multiplies the two ${h} x ${h} factors.${i === 1 ? '' : ` P1..P${i - 1} are done.`}`,
          {
            call: [
              aPanel({ quads: true, roles: quadRoles(n, spec.a.map(([q]) => q), 'compare') }),
              bPanel({ quads: true, roles: quadRoles(n, spec.b.map(([q]) => q), 'compare') }),
              cPanel(),
            ],
            factors: [panel(`A:${childKey}`, ln, left, { role: 'active' }), panel(`B:${childKey}`, rn, right, { role: 'active' }), null],
            factorsLabel: `P${i} = ${spec.text}`,
            products: prodPanels(),
          },
          [...vars, ['product', `P${i}`]],
        );
        const M = mul(left, right, childKey, `P${i}: `);
        P[idx] = M;
        snap(
          L.product + idx,
          `P${i} = ${fmtMat(M)} comes back from the recursive call: ${i} of 7 products done.${i === 7 ? ' Every C quadrant is now a sum of products: no more multiplications.' : ''}`,
          {
            call: [aPanel({ quads: true }), bPanel({ quads: true }), cPanel()],
            factors: [panel(`A:${childKey}`, ln, left), panel(`B:${childKey}`, rn, right), panel(`C:${childKey}`, `P${i}`, M, { roles: allRoles(M, 'active') })],
            factorsLabel: `P${i} = ${spec.text}`,
            products: prodPanels(idx),
          },
          [...vars, ['product', `P${i}`]],
        );
      });
      // Python: C11 = matrix_add(matrix_subtract(matrix_add(P5, P4), P2), P6), and so on.
      const Pm = P as Mat[];
      const quadsOut: Mat[] = [];
      QUADS.forEach((qd, q) => {
        let M = Pm[qd.terms[0][0] - 1];
        for (const [p, s] of qd.terms.slice(1)) M = s > 0 ? matrixAdd(M, Pm[p - 1]) : matrixSubtract(M, Pm[p - 1]);
        quadsOut.push(M);
        const r0 = q >= 2 ? h : 0;
        const c0 = q % 2 ? h : 0;
        for (let i = 0; i < h; i++) for (let j = 0; j < h; j++) Cpart[r0 + i][c0 + j] = M[i][j];
        const formula = qd.terms.map(([p, s], t) => `${t ? (s > 0 ? ' + ' : ' - ') : ''}P${p}`).join('');
        const arithmetic = qd.terms.map(([p, s], t) => {
          const v = Pm[p - 1][0][0];
          return t === 0 ? String(v) : `${s > 0 ? '+' : '-'} ${v < 0 ? `(${v})` : v}`;
        });
        snap(
          L.c11 + q,
          `${qd.name} = ${formula}: additions only. ${h === 1 ? '' : 'Top-left entry: '}${arithmetic.join(' ')} = ${M[0][0]}.${q === 0 ? ' The cross terms of the products cancel, leaving A11 B11 + A12 B21, the schoolbook value.' : ''}`,
          {
            call: [aPanel({ quads: true }), bPanel({ quads: true }), cPanel(quadRoles(n, [q], 'active', cRoles))],
            factors: [],
            products: prodPanels(
              undefined,
              qd.terms.map(([p]) => p),
            ),
          },
          [...vars, ['quadrant', qd.name]],
        );
        Object.assign(cRoles, quadRoles(n, [q], 'done'));
      });
      events.push(['combine', h]);
      result = combineMatrices(quadsOut[0], quadsOut[1], quadsOut[2], quadsOut[3]);
      snap(
        L.combine,
        `combine_matrices joins C11, C12, C21 and C22 into the ${n} x ${n} result: 7 recursive products and 18 quadrant additions instead of 8 products.`,
        { call: [aPanel({ quads: true }), bPanel({ quads: true }), panel(`C:${key}`, 'C', result, { quads: true, roles: allRoles(result, 'done') })], factors: [], products: prodPanels() },
        vars,
      );
    }
    events.push(['ret', n, logged(result)]);
    open.pop();
    return result;
  };

  const { A, B } = input;
  const square = A.length === A[0].length && B.length === B[0].length && A.length === B.length;
  let result: Mat | null = null;
  let error: string | null = null;

  const cutoffArg = cutoff === PYTHON_CUTOFF ? '' : `, cutoff=${cutoff}`;
  const badCutoff = (line: number, key: string, events0: StrassenEvent[], name: string) => {
    error = CUTOFF_ERROR;
    events.push(...events0, ['error', error]);
    snap(
      line,
      `cutoff = ${cutoff} is below 1: no size could ever reach the naive loop's base case through it, so ${name} raises ValueError("cutoff must be at least 1") before it multiplies anything.`,
      { call: [panel(`A:${key}`, 'A', A, { role: 'bad' }), panel(`B:${key}`, 'B', B, { role: 'bad' }), null], factors: [], products: [] },
      [['cutoff', cutoff]],
    );
  };

  if (!input.general && square) {
    snap(
      undefined,
      `strassen_multiply(A, B${cutoffArg}) on two ${A.length} x ${A.length} matrices, ${cutoff === PYTHON_CUTOFF ? 'with the default cutoff of 64' : `with cutoff=${cutoff} instead of the default 64, so the seven-product recursion that the default runs only above 64 x 64 shows at this size`}.`,
      { call: [panel('A:', 'A', A), panel('B:', 'B', B), panel('C:', 'C', empty(A.length, A.length))], factors: [], products: [] },
    );
    if (cutoff < 1) badCutoff(L.badCutoff, '', [['call', A.length]], 'strassen_multiply');
    else result = mul(A, B, '', '');
  } else {
    const m = A.length;
    const n1 = A[0].length;
    const n2 = B.length;
    const p = B[0].length;
    events.push(['general', m, n1, n2, p]);
    open.push({ label: `general ${m} x ${n1} times ${n2} x ${p}` });
    snap(
      L.general,
      `strassen_multiply_general(A, B${cutoffArg}): A is ${m} x ${n1} and B is ${n2} x ${p}.${square ? ' Both are square, but this wrapper pads to a power of two instead of padding odd sizes one row at a time.' : ' strassen_multiply needs two square matrices of one size, so this wrapper pads them first.'}${cutoff === PYTHON_CUTOFF ? '' : ` It passes cutoff=${cutoff} on to strassen_multiply (the default is 64).`}`,
      { call: [panel('A:g', 'A', A), panel('B:g', 'B', B), null], factors: [], products: [] },
      [['m', m], ['n1', n1], ['n2', n2], ['p', p]],
    );
    if (cutoff < 1) {
      badCutoff(L.gBadCutoff, 'g', [], 'strassen_multiply_general');
    } else if (n1 !== n2) {
      error = 'ValueError: Matrix dimensions incompatible for multiplication';
      events.push(['error', error]);
      snap(
        L.raise,
        `A has ${n1} columns but B has ${n2} rows, so the product is undefined: raise ValueError("Matrix dimensions incompatible for multiplication"). Nothing is padded or multiplied.`,
        { call: [panel('A:g', 'A', A, { role: 'bad' }), panel('B:g', 'B', B, { role: 'bad' }), null], factors: [], products: [] },
        [['m', m], ['n1', n1], ['n2', n2], ['p', p]],
      );
    } else {
      const size = nextPowerOf2(Math.max(m, n1, p));
      events.push(['pad', m, n1, size], ['pad', n2, p, size]);
      const PA = padMatrix(A, size);
      const PB = padMatrix(B, size);
      snap(
        L.gpad,
        `max(m, n1, p) = ${Math.max(m, n1, p)} and next_power_of_2 gives ${size}: pad_matrix fills A and B up to ${size} x ${size} with zeros (dashed)${size === Math.max(m, n1, p) && m === n1 && n1 === p ? ', which here changes nothing' : ''}. A power of two never needs padding again further down.`,
        {
          call: [panel('A:g.s', 'A padded', PA, { keep: { rows: m, cols: n1 } }), panel('B:g.s', 'B padded', PB, { keep: { rows: n2, cols: p } }), panel('C:g.s', 'C', empty(size, size), { keep: { rows: m, cols: p } })],
          factors: [],
          products: [],
        },
        [['size', size]],
      );
      const C = mul(PA, PB, 'g.s', 'padded: ');
      result = Array.from({ length: m }, (_, i) => Array.from({ length: p }, (_, j) => C[i][j]));
      events.push(['ret_general', logged(result)]);
      snap(
        L.gcrop,
        `Keep the top-left ${m} x ${p} block of the ${size} x ${size} product: [[C_padded[i][j] for j in range(${p})] for i in range(${m})]. The padding rows and columns hold only zeros.`,
        {
          call: [panel('A:g.s', 'A padded', PA, { keep: { rows: m, cols: n1 } }), panel('B:g.s', 'B padded', PB, { keep: { rows: n2, cols: p } }), panel('C:g.s', 'C', C, { keep: { rows: m, cols: p }, roles: allRoles(result, 'done') })],
          factors: [],
          products: [],
        },
        [['size', size]],
      );
    }
    open.pop();
  }

  if (result) {
    const naiveCount = A.length * A[0].length * B[0].length;
    snap(
      undefined,
      `Done: C = ${fmtMat(result)}, the same as the schoolbook product. ${plural(calls, 'call')} to strassen_multiply, ${plural(multiplications, 'scalar multiplication')} (the schoolbook loop needs ${A.length} * ${A[0].length} * ${B[0].length} = ${naiveCount}${multiplications > naiveCount ? '; on matrices this small the padding and the extra calls cost more than they save' : ''}).`,
      { call: [panel('A:', 'A', A), panel('B:', 'B', B), panel('C:', `C = A ${SYM.times} B`, result, { role: 'good', roles: allRoles(result, 'done') })], factors: [], products: [] },
      [['result', dims(result)]],
    );
  }
  return { frames, result, error, events, multiplications, calls };
}

/** Pin one picture size for a run: the largest side of any matrix and a cell wide enough for every value. */
export function stabilizeStrassen(frames: Array<Frame<StrassenState>>): Array<Frame<StrassenState>> {
  let side = 1;
  let chars = 1;
  let split = false;
  for (const f of frames) {
    if (f.state.products.length) split = true;
    for (const p of [...f.state.call, ...f.state.factors, ...f.state.products]) {
      if (!p) continue;
      side = Math.max(side, p.cells.length, p.cells[0]?.length ?? 0);
      for (const row of p.cells) for (const v of row) if (v !== null) chars = Math.max(chars, String(v).length);
    }
  }
  const layout = { side, cell: Math.max(26, 10 + chars * 7), split };
  return frames.map((f) => ({ ...f, state: { ...f.state, layout } }));
}
