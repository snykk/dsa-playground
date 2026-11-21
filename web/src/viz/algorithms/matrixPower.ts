/**
 * Matrix exponentiation tracers, drawn with MatrixPowerView.
 *
 * Mirrors Algorithms/Mathematical_Algorithms/Advanced_Math/Matrix_Exponentiation/Python/matrix_exponentiation.py:
 *   'iterative' matrix_power_iterative(A, k, mod): result = I, base = A; per bit of k multiply
 *               result by base when the bit is 1, then square base and halve k.
 *   'recursive' matrix_power(A, k, mod): A^k = (A^(k/2))^2 for even k, A x A^(k-1) for odd k;
 *               "fib n" runs fibonacci_matrix(n, mod), which calls it on [[1, 1], [1, 0]].
 * matrix_multiply reduces after every term when a modulus applies, and only a positive modulus
 * applies (_has_mod: None, 0 and negative mean none). Python's % is never negative and its
 * integers are unbounded, so every entry is a BigInt here. A negative exponent raises ValueError.
 * Golden fixtures (__fixtures__/mathAndProblemTypes.json) pin every matrix_multiply call, every
 * matrix_power call and return, and the results.
 *
 * Input: "A = [[1, 1], [1, 0]]; k = 11; mod 1000" or "fib 10; mod 1000".
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { StripItem } from '../ui/molecules/Strip';
import { SYM } from '../ui/symbols';

export type BMat = bigint[][];
export type MatPowMode = 'iterative' | 'recursive';

export interface MatPowInput {
  /** "power": A^k. "fib": fibonacci_matrix(k, mod), the recursive tab only. */
  kind: 'power' | 'fib';
  A: BMat;
  k: bigint;
  /** The modulus as written (null when there is none). Only a positive one is applied. */
  mod: bigint | null;
}

/** Entry width (characters) that still fits three matrices side by side, by matrix side. */
const MAX_CHARS = [0, 20, 19, 12, 9];
export const MATPOW_LIMITS = { maxSide: 4, maxEntry: 999, maxK: 10n ** 18n, maxMod: 10n ** 18n, maxChars: MAX_CHARS };

/* ---------- Python's arithmetic ---------- */

/** _has_mod(mod): a modulus applies only when it is a positive integer. */
export const hasMod = (mod: bigint | null): mod is bigint => mod !== null && mod > 0n;

/** Python's a % m for m > 0: never negative. */
export function pmod(a: bigint, m: bigint): bigint {
  const r = a % m;
  return r < 0n ? r + m : r;
}

/** matrix_multiply(A, B, mod): the triple loop, reducing after every term when a modulus applies. */
export function matMul(A: BMat, B: BMat, mod: bigint | null): BMat {
  const n = A.length;
  const m = B.length;
  const p = B[0].length;
  const R: BMat = Array.from({ length: n }, () => Array<bigint>(p).fill(0n));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < p; j++) {
      for (let t = 0; t < m; t++) {
        if (hasMod(mod)) R[i][j] = pmod(R[i][j] + A[i][t] * B[t][j], mod);
        else R[i][j] += A[i][t] * B[t][j];
      }
    }
  }
  return R;
}

/** matrix_identity(n, mod): 1 % mod on the diagonal, so modulus 1 gives the zero matrix. */
export function identity(n: number, mod: bigint | null): BMat {
  const one = hasMod(mod) ? pmod(1n, mod) : 1n;
  return Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? one : 0n)));
}

const reduce = (A: BMat, mod: bigint | null): BMat => A.map((row) => row.map((v) => (hasMod(mod) ? pmod(v, mod) : v)));

/** Python's repr of a matrix: [[1, 2], [3, 4]]. */
export const fmtBMat = (M: BMat) => `[${M.map((r) => `[${r.join(', ')}]`).join(', ')}]`;

/** A long exponent shortened for labels: 1152921504606846976 -> 115...976. */
export function expText(e: bigint): string {
  const s = e.toString();
  return s.length <= 9 ? s : `${s.slice(0, 3)}${SYM.ellipsis}${s.slice(-3)}`;
}

const binary = (k: bigint) => (k < 0n ? `-${(-k).toString(2)}` : k.toString(2));

/* ---------- input ---------- */

/** "[[1, 2], [3, 4]]" or "1 2 / 3 4" -> rows of BigInt entries. */
function parseMatrix(text: string): BMat {
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
        if (!/^-?\d+$/.test(t)) throw new InputError(`A: "${t}" is not a whole number.`);
        const v = BigInt(t);
        const lim = BigInt(MATPOW_LIMITS.maxEntry);
        if (v < -lim || v > lim) throw new InputError(`A: entries go from -${lim} to ${lim} here (got ${t}).`);
        return v;
      }),
  );
  if (M.length === 0 || M[0].length === 0) throw new InputError('A needs at least one row with one number.');
  M.forEach((row, i) => {
    if (row.length !== M[0].length) throw new InputError(`A: row ${i + 1} has ${row.length} numbers but row 1 has ${M[0].length}; every row needs the same length.`);
  });
  if (M.length !== M[0].length) throw new InputError(`A is ${M.length} x ${M[0].length}, but only a square matrix has powers: A x A needs as many columns as rows.`);
  if (M.length > MATPOW_LIMITS.maxSide) throw new InputError(`A may be up to ${MATPOW_LIMITS.maxSide} x ${MATPOW_LIMITS.maxSide} here (got ${M.length} x ${M.length}).`);
  return M;
}

function parseBig(text: string, what: string, lo: bigint, hi: bigint): bigint {
  if (!/^-?\d+$/.test(text)) throw new InputError(`${what}: "${text}" is not a whole number.`);
  const v = BigInt(text);
  if (v < lo || v > hi) throw new InputError(`${what} goes from ${lo} to ${hi} here (got ${text}).`);
  return v;
}

export const FIB_MATRIX: BMat = [
  [1n, 1n],
  [1n, 0n],
];

/**
 * Parse "A = [[1, 1], [1, 0]]; k = 11; mod 1000", "[[1, 1], [1, 0]] ^ 11 mod 1000" or "fib 10; mod 1000".
 * The run is replayed to check that every entry fits on screen; without a modulus they grow fast.
 */
export function parseMatPow(text: string, mode: MatPowMode): MatPowInput {
  let A: BMat | undefined;
  let k: bigint | undefined;
  let mod: bigint | null | undefined;
  let fib = false;
  const segments = text
    .replace(/\bmod(?:ulus)?\b/gi, ';mod')
    .split(/;|\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  for (const seg of segments) {
    let m: RegExpMatchArray | null;
    if ((m = seg.match(/^mod\s*[:=]?\s*(-?\d+)$/i))) {
      if (mod !== undefined) throw new InputError('Give the modulus ("mod 1000") only once.');
      mod = parseBig(m[1], 'The modulus', -MATPOW_LIMITS.maxMod, MATPOW_LIMITS.maxMod);
    } else if ((m = seg.match(/^fib(?:onacci(?:_matrix)?)?\s*\(?\s*(-?\d+)\s*\)?$/i))) {
      if (fib || A || k !== undefined) throw new InputError('Write either "fib n" or a matrix and an exponent, once.');
      fib = true;
      k = parseBig(m[1], 'n', -99n, 999n);
    } else if ((m = seg.match(/^k\s*[:=]?\s*(-?\d+)$/i))) {
      if (k !== undefined) throw new InputError('Give the exponent ("k = 11") only once.');
      k = parseBig(m[1], 'The exponent k', -99n, MATPOW_LIMITS.maxK);
    } else if ((m = seg.match(/^(?:A\s*[:=]?\s*)?([[\d\s,/|-][^^]*?)\s*(?:\^\s*(-?\d+))?$/i))) {
      if (A) throw new InputError('Give the matrix A only once.');
      A = parseMatrix(m[1]);
      if (m[2] !== undefined) {
        if (k !== undefined) throw new InputError('Give the exponent only once.');
        k = parseBig(m[2], 'The exponent k', -99n, MATPOW_LIMITS.maxK);
      }
    } else {
      throw new InputError(`Cannot read "${seg}". Write "A = [[1, 1], [1, 0]]; k = 11", optionally with "; mod 1000", or "fib 10".`);
    }
  }
  if (fib && A) throw new InputError('"fib n" uses the matrix [[1, 1], [1, 0]] of the code: leave A out.');
  if (fib && mode === 'iterative') {
    throw new InputError('fibonacci_matrix calls the recursive matrix_power: open the Recursive tab for "fib n", or write the matrix here, e.g. "A = [[1, 1], [1, 0]]; k = 9".');
  }
  if (!fib && !A) throw new InputError('Give a matrix, e.g. "A = [[1, 1], [1, 0]]; k = 11", or "fib 10".');
  if (k === undefined) throw new InputError('Give the exponent, e.g. "; k = 11".');
  const input: MatPowInput = { kind: fib ? 'fib' : 'power', A: fib ? FIB_MATRIX : A!, k, mod: mod ?? null };
  matPowTrace(input, mode, false, MAX_CHARS[input.A.length]);
  return input;
}

export function formatMatPow(input: MatPowInput): string {
  const tail = input.mod === null ? '' : `; mod ${input.mod}`;
  return input.kind === 'fib' ? `fib ${input.k}${tail}` : `A = ${fmtBMat(input.A)}; k = ${input.k}${tail}`;
}

/* ---------- pseudocode ---------- */

export const MATPOW_CODE: Record<MatPowMode, string[]> = {
  iterative: [
    'def matrix_power_iterative(A, k, mod=None):',
    '    if k < 0: raise ValueError("exponent must be non-negative")',
    '    result = matrix_identity(n, mod)       # 1 % mod on the diagonal',
    '    base = [row[:] for row in A]           # entries % mod when mod > 0',
    '    while k > 0:',
    '        if k % 2 == 1:                     # this bit of k is set',
    '            result = matrix_multiply(result, base, mod)',
    '        base = matrix_multiply(base, base, mod)   # A^(2^i) -> A^(2^(i+1))',
    '        k //= 2',
    '    return result',
  ],
  recursive: [
    'def matrix_power(A, k, mod=None):',
    '    if k < 0: raise ValueError("exponent must be non-negative")',
    '    if k == 0: return matrix_identity(n, mod)',
    '    if k == 1: return [row[:] for row in A]    # entries % mod when mod > 0',
    '    if k % 2 == 0:',
    '        half_power = matrix_power(A, k // 2, mod)',
    '        return matrix_multiply(half_power, half_power, mod)',
    '    return matrix_multiply(A, matrix_power(A, k - 1, mod), mod)',
    'def fibonacci_matrix(n, mod=None):',
    '    if n < 0: raise ValueError("n must be non-negative")',
    '    if n == 0: return 0',
    '    if n == 1: return 1 % mod if mod > 0 else 1',
    '    T_power = matrix_power([[1, 1], [1, 0]], n - 1, mod)',
    '    return matrix_multiply(T_power, [[1], [0]], mod)[0][0]',
  ],
};

/* ---------- frames ---------- */

export interface MatPanelView {
  /** Stable identity: a matrix keeps its key when it moves to another slot, so it glides. */
  key: string;
  title: string;
  /** Second label line, e.g. "A^5". */
  sub?: string;
  cells: string[][];
  /** Roles keyed by "row,col". */
  roles?: Record<string, Role>;
  /** Outline of the whole matrix (good / bad add a glyph). */
  role?: Role;
}

export interface BitView {
  v: 0 | 1;
  role: Role;
}

export interface MatPowState {
  /** The exponent in binary, most significant bit first (iterative only). */
  bits?: { bits: BitView[]; label: string; note: string };
  /** Fixed slots, left to right; null leaves a slot empty. */
  slots: Array<MatPanelView | null>;
  /** The symbol between slot i and slot i + 1 ("" for none). */
  ops: string[];
  /** Open calls, outermost first (recursive only). */
  stack?: StripItem[];
  /** One geometry for the whole run (stabilizeMatPow): cell width, matrix size, slot and bit count. */
  layout?: { cell: number; rows: number; cols: number; slots: number; bits: number; head?: number; stackGhost?: StripItem[] };
}

export interface MatPowRun {
  frames: Array<Frame<MatPowState>>;
  /** Every matrix_multiply call in order: [left, right, product]. */
  mults: Array<[BMat, BMat, BMat]>;
  /** matrix_power calls in call order (recursive): the exponent of each. */
  calls: bigint[];
  /** matrix_power returns in order: [k, A^k]. */
  returns: Array<[bigint, BMat]>;
  /** The returned matrix (power) or number (fib); null after an error. */
  result: BMat | bigint | null;
  error: string | null;
}

const cellsOf = (M: BMat) => M.map((r) => r.map((v) => v.toString()));
const allRoles = (M: BMat, role: Role): Record<string, Role> => {
  const out: Record<string, Role> = {};
  M.forEach((r, i) => r.forEach((_, j) => (out[`${i},${j}`] = role)));
  return out;
};

/**
 * Trace one run. With draw = false only the values are computed (the parser's width check):
 * the same calls happen in the same order, but no frames are built.
 */
export function matPowTrace(input: MatPowInput, mode: MatPowMode, draw = true, maxChars = Infinity): MatPowRun {
  const { A, mod } = input;
  const n = A.length;
  const frames: Array<Frame<MatPowState>> = [];
  const mults: Array<[BMat, BMat, BMat]> = [];
  const calls: bigint[] = [];
  const returns: Array<[bigint, BMat]> = [];
  const modText = hasMod(mod) ? ` (mod ${mod})` : '';
  const modNote =
    mod === null ? 'no modulus' : hasMod(mod) ? `mod ${mod}` : `mod ${mod} (not positive, so no modulus: _has_mod is False)`;
  let multCount = 0;

  const multiply = (X: BMat, Y: BMat): BMat => {
    const Z = matMul(X, Y, mod);
    // The parser's check: stop before the numbers explode (k up to 10^18 without a modulus).
    const widest = Math.max(...Z.flat().map((v) => v.toString().length));
    if (widest > maxChars) {
      throw new InputError(
        `The entries grow past ${maxChars} digits before the run ends${mode === 'iterative' ? ' (base keeps squaring until k reaches 0)' : ''}, more than fit on screen for a ${n} x ${n} matrix. ` +
          (hasMod(mod) ? 'Use a smaller modulus.' : 'Add a modulus, e.g. "; mod 1000000007", or lower k.'),
      );
    }
    mults.push([X, Y, Z]);
    multCount += 1;
    return Z;
  };

  const panel = (key: string, title: string, M: BMat, o: { sub?: string; role?: Role; cells?: Role } = {}): MatPanelView => ({
    key,
    title,
    sub: o.sub,
    cells: cellsOf(M),
    roles: o.cells ? allRoles(M, o.cells) : undefined,
    role: o.role,
  });

  if (mode === 'iterative') return iterative();
  return recursive();

  /* ----- matrix_power_iterative ----- */
  function iterative(): MatPowRun {
    const k0 = input.k;
    const width = k0 > 0n ? k0.toString(2).length : 1;
    let result: BMat | null = null;
    let base: BMat | null = null;
    let resExp = 0n;
    let baseExp = 1n;
    let k = k0;
    let round = -1;
    let squarings = 0;

    const bits = (current: Role | null): MatPowState['bits'] => {
      const s = (k0 > 0n ? k0 : 0n).toString(2).padStart(width, '0');
      const views: BitView[] = s.split('').map((ch, idx) => {
        const pos = width - 1 - idx; // bit position
        const role: Role = round < 0 || pos > round ? 'idle' : pos === round && current ? current : 'muted';
        return { v: ch === '1' ? 1 : 0, role };
      });
      return {
        bits: views,
        label: k0 > 0n ? `k = ${k0} in binary${width > 8 ? ` (${width} bits)` : ''}` : `k = ${k0}`,
        note: round < 0 ? (k0 > 0n ? 'read from the lowest bit' : '') : `k = ${k} now`,
      };
    };
    const resPanel = (o: { role?: Role; cells?: Role } = {}) =>
      result && panel('result', 'result', result, { sub: resExp === 0n ? 'A^0 = I' : `A^${expText(resExp)}`, ...o });
    const basePanel = (o: { role?: Role; cells?: Role } = {}) => base && panel('base', 'base', base, { sub: `A^${expText(baseExp)}`, ...o });
    const snap = (line: number | undefined, caption: string, st: { res?: { role?: Role; cells?: Role }; base?: { role?: Role; cells?: Role }; bit?: Role | null; op?: string } = {}) => {
      if (!draw) return;
      frames.push({
        line,
        caption,
        vars: [
          ['k', k.toString()],
          ['bit', round < 0 ? '-' : String(round)],
          ['mod', modNote],
          ['multiplications', multCount],
          ['squarings', squarings],
        ],
        state: { bits: bits(st.bit ?? null), slots: [resPanel(st.res) ?? null, basePanel(st.base) ?? null], ops: [st.op ?? ''] },
      });
    };

    if (k < 0n) {
      snap(1, `matrix_power_iterative(A, ${k0}): k = ${k0} is negative, so the function raises ValueError("exponent must be non-negative") before it does anything. There is no matrix inverse here.`);
      if (draw) frames[frames.length - 1].state.slots = [panel('A', 'A', A, { role: 'bad' }), null];
      return { frames, mults, calls, returns, result: null, error: 'ValueError: exponent must be non-negative' };
    }
    result = identity(n, mod);
    snap(
      2,
      `matrix_power_iterative(A, ${k0}${hasMod(mod) ? `, mod=${mod}` : ''}): result starts as the ${n} x ${n} identity, A^0. ` +
        (hasMod(mod) && mod === 1n ? 'Its diagonal is 1 % 1 = 0: modulo 1 every number is 0, so even A^0 is the zero matrix.' : 'Whatever result is multiplied by, it collects the powers of A that k needs.'),
      { res: { role: 'active' } },
    );
    base = reduce(A, mod);
    const changed = hasMod(mod) && base.some((r, i) => r.some((v, j) => v !== A[i][j]));
    snap(
      3,
      `base starts as a copy of A${hasMod(mod) ? `, every entry reduced mod ${mod}${changed ? ' (Python\'s % maps a negative entry into [0, mod))' : ''}` : ''}. ` +
        (k0 === 0n ? 'k = 0, so the loop will not run.' : `k = ${k0} is ${binary(k0)} in binary: the loop reads its ${width} bit${width === 1 ? '' : 's'} from the lowest one up, and base runs through A^1, A^2, A^4, ...`),
      { res: {}, base: { role: 'active' } },
    );
    while (k > 0n) {
      round += 1;
      const odd = k % 2n === 1n;
      if (odd) {
        snap(5, `k = ${k} is odd: bit ${round} of ${k0} is 1, so base = A^${expText(baseExp)} is one of the powers that make up A^${expText(k0)}. Multiply it into result.`, {
          res: { cells: 'compare' },
          base: { cells: 'compare' },
          bit: 'active',
          op: SYM.times,
        });
        const before = resExp;
        result = multiply(result, base);
        resExp += baseExp;
        snap(
          6,
          `result = result ${SYM.times} base = A^${expText(before)} ${SYM.times} A^${expText(baseExp)} = A^${expText(resExp)}${modText}. Powers of one matrix add their exponents, so the order of the factors does not matter.`,
          { res: { cells: 'active' }, base: { cells: 'compare' }, bit: 'active', op: SYM.times },
        );
      } else {
        snap(5, `k = ${k} is even: bit ${round} of ${k0} is 0, so A^${expText(baseExp)} is not part of A^${expText(k0)}. result stays A^${expText(resExp)}.`, {
          res: {},
          base: { role: 'muted' },
          bit: 'active',
        });
      }
      const last = k === 1n;
      base = multiply(base, base);
      squarings += 1;
      const prevExp = baseExp;
      baseExp *= 2n;
      snap(
        7,
        `base = base ${SYM.times} base: A^${expText(prevExp)} squared is A^${expText(baseExp)}${modText}, ready for the next bit.` +
          (last ? ` This is the last round, so A^${expText(baseExp)} is never used: the loop always squares once more than it needs.` : ''),
        { res: {}, base: { cells: 'active' }, bit: 'active' },
      );
      k /= 2n;
      snap(
        8,
        `k //= 2 drops the bit just used: k = ${k}.` + (k === 0n ? ' No bits are left.' : ` Next comes bit ${round + 1}, ${k % 2n === 1n ? 'a 1' : 'a 0'}.`),
        { res: {}, base: {}, bit: null },
      );
    }
    const into = multCount - squarings;
    const counts = `${squarings} squaring${squarings === 1 ? '' : 's'} and ${into} multiplication${into === 1 ? '' : 's'} into result`;
    const plain = k0 - 1n;
    snap(
      9,
      k0 === 0n
        ? `k = 0 from the start, so the loop never runs and result, the identity, is returned: A^0 = I${hasMod(mod) && mod === 1n ? ', which modulo 1 is the zero matrix (1 % 1 = 0)' : ''}.`
        : `k = 0, so the loop ends and returns result = A^${expText(k0)}${modText}: ${counts}` +
            (BigInt(multCount) < plain
              ? `, instead of ${plain} multiplications one after another.`
              : `. For so small a k that is no fewer than the ${plain} multiplication${plain === 1n ? '' : 's'} of a plain loop; the saving grows with k, about 2 log2(k) products against k - 1.`),
      { res: { role: 'good' }, base: { role: 'muted' } },
    );
    return { frames, mults, calls, returns, result, error: null };
  }

  /* ----- matrix_power (and fibonacci_matrix) ----- */
  function recursive(): MatPowRun {
    const isFib = input.kind === 'fib';
    const stack: Array<{ k: bigint; text: string }> = [];
    let slots: Array<MatPanelView | null> = [null, null, null];
    let ops = ['', ''];

    /** The open calls; past six, the outer ones fold into one token so the strip stays one line. */
    const stackItems = (top: Role): StripItem[] => {
      if (!stack.length) return [{ text: SYM.emptySet, role: 'muted' }];
      const items: StripItem[] = stack.map((c, i) => ({ text: c.text, role: i === stack.length - 1 ? top : 'compare' }));
      return items.length > 6 ? [{ text: `${items.length - 5} more`, role: 'muted' }, ...items.slice(-5)] : items;
    };
    const snap = (line: number | undefined, caption: string, o: { top?: Role } = {}) => {
      if (!draw) return;
      frames.push({
        line,
        caption,
        vars: [
          ['open calls', stack.length],
          ['mod', modNote],
          ['multiplications', multCount],
          ['calls so far', calls.length],
        ],
        state: {
          slots: [...slots],
          ops: [...ops],
          stack: stackItems(o.top ?? 'active'),
        },
      });
    };
    const aPanel = (o: { role?: Role; cells?: Role } = {}) => panel('A', isFib ? 'T' : 'A', A, { sub: isFib ? 'the Fibonacci matrix' : 'the input', ...o });
    const name = isFib ? 'T' : 'A';
    const callText = (k: bigint) => `matrix_power(${name}, ${expText(k)})`;
    const stackText = (k: bigint) => `power(${expText(k)})`;

    /** One call of matrix_power(A, k, mod); returns A^k. */
    const power = (k: bigint): BMat | null => {
      calls.push(k);
      stack.push({ k, text: stackText(k) });
      if (k < 0n) {
        slots = [aPanel({ role: 'bad' }), null, null];
        ops = ['', ''];
        snap(1, `${callText(k)}: k = ${k} is negative, so matrix_power raises ValueError("exponent must be non-negative"). It used to recurse until RecursionError.`, { top: 'bad' });
        return null;
      }
      if (k === 0n) {
        const I = identity(n, mod);
        slots = [aPanel({ role: 'muted' }), null, panel('p0', 'returns', I, { sub: `${name}^0 = I`, role: 'done' })];
        ops = ['', ''];
        snap(2, `${callText(k)}: k = 0, so return the identity${hasMod(mod) && mod === 1n ? ', whose diagonal is 1 % 1 = 0: modulo 1 it is the zero matrix' : ''}. No multiplication is needed.`);
        returns.push([k, I]);
        stack.pop();
        return I;
      }
      if (k === 1n) {
        const R = reduce(A, mod);
        slots = [aPanel({ role: 'compare' }), null, panel('p1', 'returns', R, { sub: `${name}^1`, role: 'done' })];
        ops = ['', ''];
        snap(3, `${callText(k)}: k = 1 is the base case: return a copy of ${name}${hasMod(mod) ? `, every entry % ${mod}` : ''}. The recursion stops here and the products are built on the way back.`);
        returns.push([k, R]);
        stack.pop();
        return R;
      }
      if (k % 2n === 0n) {
        slots = [aPanel({ role: 'muted' }), null, null];
        ops = ['', ''];
        snap(4, `${callText(k)}: k = ${expText(k)} is even, so ${name}^${expText(k)} = (${name}^${expText(k / 2n)})^2: one recursive call for the half power, then one squaring.`);
        const half = power(k / 2n);
        if (!half) return null;
        slots = [panel(`p${k / 2n}`, 'half_power', half, { sub: `${name}^${expText(k / 2n)}`, cells: 'compare' }), panel(`p${k / 2n}b`, 'half_power', half, { sub: `${name}^${expText(k / 2n)}`, cells: 'compare' }), null];
        ops = [SYM.times, '='];
        snap(5, `Back in ${callText(k)}: half_power = ${name}^${expText(k / 2n)} came back from the call above.`);
        const R = multiply(half, half);
        slots = [slots[0], slots[1], panel(`p${k}`, 'returns', R, { sub: `${name}^${expText(k)}`, cells: 'active' })];
        snap(6, `return half_power ${SYM.times} half_power = ${name}^${expText(k / 2n)} ${SYM.times} ${name}^${expText(k / 2n)} = ${name}^${expText(k)}${modText}: one multiplication covers half of the exponent.`);
        returns.push([k, R]);
        stack.pop();
        return R;
      }
      slots = [aPanel({ role: 'compare' }), null, null];
      ops = ['', ''];
      snap(7, `${callText(k)}: k = ${expText(k)} is odd, so ${name}^${expText(k)} = ${name} ${SYM.times} ${name}^${expText(k - 1n)}. First the call for ${name}^${expText(k - 1n)}, whose exponent is even.`);
      const sub = power(k - 1n);
      if (!sub) return null;
      slots = [aPanel({ cells: 'compare' }), panel(`p${k - 1n}`, 'matrix_power', sub, { sub: `${name}^${expText(k - 1n)}`, cells: 'compare' }), null];
      ops = [SYM.times, '='];
      const R = multiply(A, sub);
      slots = [slots[0], slots[1], panel(`p${k}`, 'returns', R, { sub: `${name}^${expText(k)}`, cells: 'active' })];
      snap(7, `Back in ${callText(k)}: return ${name} ${SYM.times} ${name}^${expText(k - 1n)} = ${name}^${expText(k)}${modText}. ${name} is the original matrix${hasMod(mod) ? '; its entries are not reduced first, but the product reduces after every term' : ''}.`);
      returns.push([k, R]);
      stack.pop();
      return R;
    };

    if (!isFib) {
      const R = power(input.k);
      if (!R) return { frames, mults, calls, returns, result: null, error: 'ValueError: exponent must be non-negative' };
      slots = [slots[0] && { ...slots[0], roles: undefined, role: 'muted' }, slots[1] && { ...slots[1], roles: undefined, role: 'muted' }, slots[2] && { ...slots[2], roles: undefined, role: 'good' }];
      snap(undefined, `matrix_power returns ${name}^${expText(input.k)}${modText} after ${calls.length} call${calls.length === 1 ? '' : 's'} and ${multCount} multiplication${multCount === 1 ? '' : 's'}: one squaring per halving of k and one extra multiplication per odd k on the way down.`);
      return { frames, mults, calls, returns, result: R, error: null };
    }

    /* fibonacci_matrix(n, mod) */
    const nF = input.k;
    stack.push({ k: -1n, text: `fibonacci_matrix(${nF})` });
    if (nF < 0n) {
      snap(9, `fibonacci_matrix(${nF}): n is negative, so it raises ValueError("n must be non-negative").`, { top: 'bad' });
      return { frames, mults, calls, returns, result: null, error: 'ValueError: n must be non-negative' };
    }
    if (nF === 0n) {
      snap(10, 'fibonacci_matrix(0): n = 0, so it returns F(0) = 0 at once, without a matrix.', { top: 'good' });
      return { frames, mults, calls, returns, result: 0n, error: null };
    }
    if (nF === 1n) {
      const v = hasMod(mod) ? pmod(1n, mod) : 1n;
      snap(11, `fibonacci_matrix(1): n = 1, so it returns F(1) ${hasMod(mod) ? `mod ${mod} = 1 % ${mod} = ${v}` : '= 1'} at once.`, { top: 'good' });
      return { frames, mults, calls, returns, result: v, error: null };
    }
    slots = [aPanel({ role: 'compare' }), null, null];
    snap(
      12,
      `fibonacci_matrix(${nF}): T = [[1, 1], [1, 0]] maps (F(i), F(i-1)) to (F(i+1), F(i)), so T^${nF - 1n} applied to (F(1), F(0)) = (1, 0) gives (F(${nF}), F(${nF - 1n})). Compute T^${nF - 1n} with the recursive matrix_power.`,
    );
    const T = power(nF - 1n)!;
    const initial: BMat = [[1n], [0n]];
    const out = multiply(T, initial);
    slots = [
      panel(`p${nF - 1n}`, 'T_power', T, { sub: `T^${expText(nF - 1n)}`, cells: 'compare' }),
      panel('init', 'initial', initial, { sub: '(F(1), F(0))', cells: 'compare' }),
      { ...panel('fib', 'result', out, { sub: `(F(${nF}), F(${nF - 1n}))`, role: 'good' }), roles: { '0,0': 'good' } },
    ];
    ops = [SYM.times, '='];
    snap(13, `matrix_multiply(T^${nF - 1n}, [[1], [0]]) = [[${out[0][0]}], [${out[1][0]}]]${modText}: the first column of T^${nF - 1n}. fibonacci_matrix returns result[0][0] = F(${nF})${hasMod(mod) ? ` mod ${mod}` : ''} = ${out[0][0]}.`, { top: 'good' });
    return { frames, mults, calls, returns, result: out[0][0], error: null };
  }
}

/** One geometry for a whole run: the widest entry, the largest matrix, and the slot and bit counts. */
export function stabilizeMatPow(frames: Array<Frame<MatPowState>>): Array<Frame<MatPowState>> {
  let chars = 1;
  let rows = 1;
  let cols = 1;
  let slots = 1;
  let bits = 0;
  let head = 0;
  // The deepest call stack of the run, which the renderer reserves room for (StableStrips).
  let stackGhost: StripItem[] = [];
  const stackLen = (s: StripItem[]) => s.reduce((n, it) => n + it.text.length + 3, 0);
  for (const f of frames) {
    slots = Math.max(slots, f.state.slots.length);
    bits = Math.max(bits, f.state.bits?.bits.length ?? 0);
    if (f.state.bits) head = Math.max(head, f.state.bits.label.length + f.state.bits.note.length);
    if (f.state.stack && stackLen(f.state.stack) > stackLen(stackGhost)) stackGhost = f.state.stack;
    for (const p of f.state.slots) {
      if (!p) continue;
      rows = Math.max(rows, p.cells.length);
      cols = Math.max(cols, p.cells[0]?.length ?? 0);
      for (const r of p.cells) for (const v of r) chars = Math.max(chars, v.length);
    }
  }
  const layout = { cell: Math.max(42, 16 + chars * 8.6), rows, cols, slots, bits, head, stackGhost: stackGhost.length ? stackGhost : undefined };
  return frames.map((f) => ({ ...f, state: { ...f.state, layout } }));
}
