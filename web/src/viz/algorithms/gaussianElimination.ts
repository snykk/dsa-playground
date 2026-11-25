/**
 * Gaussian elimination tracers, drawn with GaussView (the augmented matrix as a Grid, with
 * strips for the pivots, x and the result).
 *
 * Mirrors Algorithms/Mathematical_Algorithms/Advanced_Math/Gaussian_Elimination/Python/gaussian_elimination.py:
 *   'float' solve(A, b, eps) and solve_without_pivoting: _forward (_choose_pivot, then
 *           _subtract_row for every row below whose entry is not already 0), the 0 = c check,
 *           _back_substitute; after solve, determinant(A) for a square A, which is the product
 *           of the same pivots with the sign of the swaps (determinant always pivots).
 *   'mod'   solve_mod(A, b, p): _forward_mod (the first nonzero entry is the pivot, _inverse once
 *           per pivot, _subtract_row_mod), the check, back substitution with the inverses;
 *           determinant_mod for a square A.
 * JavaScript numbers are IEEE doubles and never fuse a multiplication with an addition, like
 * CPython, so the floating-point run reproduces Python's values bit for bit; the modular run uses
 * BigInt. Golden fixtures (__fixtures__/mathAndProblemTypes.json, sections gaussian and
 * gaussianMod) pin every pivot choice, row operation and inverse, the result and the determinant.
 *
 * Input: "A = [[2, 1, -1], [-3, -1, 2], [-2, 1, 2]]; b = [8, -11, -3]", or the augmented rows
 * "2 1 -1 | 8 / -3 -1 2 | -11 / -2 1 2 | -3"; then "; no pivoting" or "; eps 1e-12" (float),
 * "; p = 7" (modular).
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { GridState } from '../renderers/Grid';
import type { StripData, StripItem } from '../ui/molecules/Strip';
import { SYM } from '../ui/symbols';
import { pyFloat } from './pointLineCircle';

export type GaussKind = 'no solution' | 'unique' | 'infinite';
export type Num = number | bigint;

export interface GaussFloatInput {
  mode: 'float';
  A: number[][];
  b: number[];
  eps: number;
  /** false runs solve_without_pivoting. */
  pivoting: boolean;
}

export interface GaussModInput {
  mode: 'mod';
  A: bigint[][];
  b: bigint[];
  p: bigint;
}

export type GaussInput = GaussFloatInput | GaussModInput;

export interface GaussState {
  grid: GridState;
  strips: StripData[];
}

export const EPS = 1e-9;
export const GAUSS_LIMITS = { maxRows: 5, maxCols: 5, maxFloat: 1e6, maxInt: 10n ** 12n, maxP: 2147483647n, minP: -99n };

/* ---------- numbers ---------- */

/** A cell: 4 significant digits, exponent form outside 1e-3 .. 1e7 (1e-8, -1e16). -0 shows as 0. */
export function fmtNum(v: number): string {
  if (v === 0) return '0';
  const a = Math.abs(v);
  if (Number.isInteger(v) && a < 1e7) return String(v);
  if (a >= 1e-3 && a < 1e7) return String(Number(v.toPrecision(4)));
  const [mant, exp] = v.toExponential(3).split('e');
  return `${Number(mant)}e${Number(exp)}`;
}

const fmt = (v: Num): string => (typeof v === 'bigint' ? v.toString() : fmtNum(v));

/** Python's a % m for m > 0: never negative. */
export function pmod(a: bigint, m: bigint): bigint {
  const r = a % m;
  return r < 0n ? r + m : r;
}

/** pow(a, e, m) for m >= 1, e >= 0, by square and multiply. */
export function powMod(a: bigint, e: bigint, m: bigint): bigint {
  let result = 1n % m;
  let base = pmod(a, m);
  while (e > 0n) {
    if (e & 1n) result = (result * base) % m;
    base = (base * base) % m;
    e >>= 1n;
  }
  return result;
}

/* ---------- input ---------- */

const FLOAT_RE = /^[-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?$/i;

function parseNumber(t: string, mode: 'float' | 'mod', where: string): Num {
  if (mode === 'mod') {
    if (!/^[-+]?\d+$/.test(t)) throw new InputError(`${where}: "${t}" is not a whole number; modulo p every entry is an integer.`);
    const v = BigInt(t.replace(/^\+/, ''));
    const lim = GAUSS_LIMITS.maxInt;
    if (v < -lim || v > lim) throw new InputError(`${where}: entries go from -10^12 to 10^12 here (got ${t}).`);
    return v;
  }
  if (!FLOAT_RE.test(t)) throw new InputError(`${where}: "${t}" is not a number. Write 2, -0.5 or 1e-8.`);
  const v = Number(t);
  if (!Number.isFinite(v) || Math.abs(v) > GAUSS_LIMITS.maxFloat) throw new InputError(`${where}: entries go from -10^6 to 10^6 here (got ${t}).`);
  return v;
}

function splitRows(body: string): string[] {
  const text = body.trim();
  if (text.startsWith('[')) {
    const inner = text.replace(/^\[\s*/, '').replace(/\s*\]$/, '');
    return inner.length ? inner.split(/\]\s*,?\s*\[/).map((r) => r.replace(/[[\]]/g, '')) : [];
  }
  return text.split('/');
}

const tokens = (row: string) => row.split(/[\s,]+/).filter(Boolean);

interface Parsed {
  A: Num[][];
  b: Num[];
  extras: string[];
}

function parseSystem(text: string, mode: 'float' | 'mod'): Parsed {
  let A: Num[][] | undefined;
  let b: Num[] | undefined;
  const extras: string[] = [];
  const segments = text
    .split(/;|\n/)
    .map((s) => s.trim())
    .filter(Boolean);
  for (const seg of segments) {
    let m: RegExpMatchArray | null;
    if ((m = seg.match(/^A\s*[:=]?\s*(.+)$/i))) {
      if (A) throw new InputError('Give the matrix A only once.');
      A = splitRows(m[1]).map((r, i) => tokens(r).map((t) => parseNumber(t, mode, `A, row ${i}`)));
    } else if ((m = seg.match(/^b\s*[:=]?\s*(.+)$/i))) {
      if (b) throw new InputError('Give the right-hand side b only once.');
      b = tokens(m[1].replace(/[[\]]/g, ' ')).map((t) => parseNumber(t, mode, 'b'));
    } else if (seg.includes('|')) {
      if (A || b) throw new InputError('Write the system either as "A = ...; b = ..." or as augmented rows "2 1 | 8 / 3 4 | 9", not both.');
      const rows = splitRows(seg);
      A = [];
      b = [];
      rows.forEach((row, i) => {
        const parts = row.split('|');
        if (parts.length !== 2) throw new InputError(`Augmented row ${i} needs exactly one "|" between A and b (got "${row.trim()}").`);
        A!.push(tokens(parts[0]).map((t) => parseNumber(t, mode, `A, row ${i}`)));
        const rhs = tokens(parts[1]);
        if (rhs.length !== 1) throw new InputError(`Augmented row ${i} needs one number after "|" (got ${rhs.length}).`);
        b!.push(parseNumber(rhs[0], mode, `b, row ${i}`));
      });
    } else {
      extras.push(seg);
    }
  }
  if (!A) throw new InputError('Give the system, e.g. "A = [[2, 1], [1, 3]]; b = [3, 5]" or "2 1 | 3 / 1 3 | 5".');
  if (!b) throw new InputError('Give the right-hand side, e.g. "; b = [3, 5]".');
  if (A.length === 0 || A[0].length === 0) throw new InputError('A needs at least one row with one number: a system needs an equation and an unknown.');
  A.forEach((row, i) => {
    if (row.length !== A![0].length) throw new InputError(`Row ${i} of A has ${row.length} entries, but row 0 has ${A![0].length}: the code raises ValueError for a ragged A.`);
  });
  if (b.length !== A.length) throw new InputError(`b has ${b.length} entries, but A has ${A.length} rows: one right-hand side per equation.`);
  if (A.length > GAUSS_LIMITS.maxRows || A[0].length > GAUSS_LIMITS.maxCols) {
    throw new InputError(`Up to ${GAUSS_LIMITS.maxRows} equations in ${GAUSS_LIMITS.maxCols} unknowns here (got ${A.length} in ${A[0].length}).`);
  }
  return { A, b, extras };
}

/** Parse the floating-point tab's input: the system, then "no pivoting" and "eps 1e-12" if wanted. */
export function parseGaussFloat(text: string): GaussFloatInput {
  const { A, b, extras } = parseSystem(text, 'float');
  let eps = EPS;
  let pivoting = true;
  let epsSeen = false;
  for (const seg of extras) {
    let m: RegExpMatchArray | null;
    if (/^(no|without)\s+pivoting$/i.test(seg) || /^solve_without_pivoting$/i.test(seg)) pivoting = false;
    else if ((m = seg.match(/^eps\s*[:=]?\s*(\S+)$/i))) {
      if (epsSeen) throw new InputError('Give eps only once.');
      epsSeen = true;
      if (!FLOAT_RE.test(m[1])) throw new InputError(`eps: "${m[1]}" is not a number.`);
      eps = Number(m[1]);
      if (!(eps > 0 && eps <= 1)) throw new InputError(`eps must be above 0 and at most 1 (got ${m[1]}).`);
    } else if (/^(p|mod)\b/i.test(seg)) {
      throw new InputError('A modulus belongs in the "Modulo a prime" tab; this tab solves in floating point.');
    } else {
      throw new InputError(`Cannot read "${seg}". After the system, write "no pivoting" or "eps 1e-12".`);
    }
  }
  return { mode: 'float', A: A as number[][], b: b as number[], eps, pivoting };
}

/** Parse the modular tab's input: the system with integer entries, then "p = 7". */
export function parseGaussMod(text: string): GaussModInput {
  const { A, b, extras } = parseSystem(text, 'mod');
  let p: bigint | undefined;
  for (const seg of extras) {
    const m = seg.match(/^(?:p|mod(?:ulo)?)\s*[:=]?\s*([-+]?\d+)$/i);
    if (!m) throw new InputError(`Cannot read "${seg}". After the system, write the prime as "p = 7".`);
    if (p !== undefined) throw new InputError('Give p only once.');
    p = BigInt(m[1].replace(/^\+/, ''));
    if (p < GAUSS_LIMITS.minP || p > GAUSS_LIMITS.maxP) throw new InputError(`p goes from ${GAUSS_LIMITS.minP} to 2147483647 (2^31 - 1) here (got ${m[1]}).`);
  }
  if (p === undefined) throw new InputError('Give the prime, e.g. "; p = 7".');
  return { mode: 'mod', A: A as bigint[][], b: b as bigint[], p };
}

const fmtList = (xs: Num[], f: (v: Num) => string) => `[${xs.map(f).join(', ')}]`;

export function formatGaussInput(input: GaussInput): string {
  const A = `[${input.A.map((r) => fmtList(r, (v) => (typeof v === 'bigint' ? v.toString() : pyFloat(v)))).join(', ')}]`;
  const b = fmtList(input.b, (v) => (typeof v === 'bigint' ? v.toString() : pyFloat(v)));
  if (input.mode === 'mod') return `A = ${A}; b = ${b}; p = ${input.p}`;
  return `A = ${A}; b = ${b}${input.pivoting ? '' : '; no pivoting'}${input.eps === EPS ? '' : `; eps ${pyFloat(input.eps)}`}`;
}

/* ---------- pseudocode ---------- */

export const GAUSS_CODE = {
  float: [
    'def solve(A, b, eps=1e-9):            # solve_without_pivoting: line 4 differs',
    '    M = [row + [b_i] for each row of A]; row = 0',
    '    for col in range(m):',
    '        if row == n: break',
    '        r = r >= row with the largest |M[r][col]|   # upper row on a tie; without pivoting: first |v| > eps',
    '        if |M[r][col]| <= eps: continue          # no pivot: x[col] is free',
    '        swap rows r and row',
    '        for target in range(row + 1, n):',
    '            if M[target][col] == 0: continue',
    '            factor = M[target][col] / M[row][col]',
    '            M[target][c] -= factor * M[row][c] for every c > col',
    '        row += 1                                 # col is a pivot column',
    '    rank = row',
    '    if a row >= rank has |M[r][m]| > eps: return NO_SOLUTION   # 0 = c',
    '    for i = rank - 1 down to 0, pivot column c:',
    '        x[c] = (M[i][m] - sum of M[i][j] * x[j] for j > c) / M[i][c]',
    '    return UNIQUE if rank == m else INFINITE    # free unknowns stay 0',
  ],
  mod: [
    'def solve_mod(A, b, p):                 # ValueError if p < 2',
    '    M = [[v % p for v in row] + [b_i % p]]; row = 0',
    '    for col in range(m):',
    '        if row == n: break',
    '        r = the first r >= row with M[r][col] != 0',
    '        if there is none: continue              # no pivot: x[col] is free',
    '        swap rows r and row',
    '        inv = pow(M[row][col], p - 2, p)        # ValueError unless M[row][col] * inv % p == 1',
    '        for target in range(row + 1, n):',
    '            if M[target][col] == 0: continue',
    '            factor = M[target][col] * inv % p',
    '            M[target][c] = (M[target][c] - factor * M[row][c]) % p for every c > col',
    '        row += 1                                # col is a pivot column',
    '    if a row >= rank has M[r][m] != 0: return NO_SOLUTION   # 0 = c',
    '    for i = rank - 1 down to 0, pivot column c:',
    '        x[c] = (M[i][m] - sum of M[i][j] * x[j] for j > c) * inv[i] % p',
    '    return UNIQUE if rank == m else INFINITE    # free unknowns stay 0',
  ],
};

/* ---------- the run ---------- */

export interface GaussOp {
  target: number;
  source: number;
  col: number;
  factor: Num;
  /** The target row after the operation. */
  row: Num[];
}

export interface GaussResult {
  kind: GaussKind;
  x: Num[] | null;
  rank: number;
  pivotCols: number[];
  swaps: number;
  updates: number;
}

export interface GaussRun {
  frames: Array<Frame<GaussState>>;
  /** Float: every _choose_pivot call as [row, col, chosen row or -1]. */
  choices: Array<[number, number, number]>;
  ops: GaussOp[];
  /** Mod: every _inverse call as [a, its inverse]. */
  inverses: Array<[bigint, bigint]>;
  result: GaussResult | null;
  /** determinant(A) or determinant_mod(A, p) for a square A; null otherwise or after an error. */
  det: Num | null;
  error: string | null;
}

const plural = (k: number, one: string, many = `${one}s`) => `${k} ${k === 1 ? one : many}`;
const xs = (cols: number[]) => cols.map((c) => `x${c}`).join(', ');

/**
 * Trace one run. With draw = false only the values are computed (for the tests): the same calls
 * happen in the same order, but no frames are built.
 */
export function gaussTrace(input: GaussInput, draw = true): GaussRun {
  const isMod = input.mode === 'mod';
  const n = input.A.length;
  const m = input.A[0].length;
  const frames: Array<Frame<GaussState>> = [];
  const choices: Array<[number, number, number]> = [];
  const ops: GaussOp[] = [];
  const inverses: Array<[bigint, bigint]> = [];
  const eps = input.mode === 'float' ? input.eps : 0;
  const pivoting = input.mode === 'float' ? input.pivoting : false;
  const p = input.mode === 'mod' ? input.p : 0n;
  const fn = isMod ? 'solve_mod' : pivoting ? 'solve' : 'solve_without_pivoting';

  let M: Num[][] = [];
  const orig = Array.from({ length: n }, (_, i) => i);
  const pivotCols: number[] = [];
  const pivotVals: Num[] = [];
  const invs: bigint[] = [];
  let swaps = 0;
  let updates = 0;
  let row = 0;
  let x: Num[] | null = null;
  const solved = new Set<number>();
  let result: GaussResult | null = null;
  let det: Num | null = null;

  /* ----- frames ----- */
  const colHeaders = [...Array.from({ length: m }, (_, c) => `x${c}`), 'b'];
  const pivotStrip = (): StripData => ({
    label: 'Pivots',
    items: pivotVals.length ? pivotVals.map((v, i) => ({ text: `x${pivotCols[i]}: ${fmt(v)}`, role: 'done' as Role })) : [{ text: 'none yet' }],
  });
  const xStrip = (active = -1): StripData | null =>
    x === null
      ? null
      : {
          label: 'x',
          items: x.map((v, c) => {
            if (!solved.has(c) && !pivotCols.includes(c)) return { text: `x${c} = ${fmtX(v)} (free)` };
            if (!solved.has(c)) return { text: `x${c} = ?` };
            return { text: `x${c} = ${fmtX(v)}`, role: (c === active ? 'active' : 'done') as Role };
          }),
        };
  const fmtX = (v: Num) => (typeof v === 'bigint' ? v.toString() : pyFloat(v));
  const snap = (line: number | undefined, caption: string, roles: Record<string, Role> = {}, extra: { strips?: StripData[]; vars?: Array<[string, string | number]>; active?: number } = {}) => {
    if (!draw) return;
    const strips: StripData[] = [pivotStrip()];
    const xs2 = xStrip(extra.active);
    if (xs2) strips.push(xs2);
    if (extra.strips) strips.push(...extra.strips);
    frames.push({
      line,
      caption,
      vars: [
        ['row', row],
        ['rank so far', pivotCols.length],
        ['swaps', swaps],
        ['updates', updates],
        ...(isMod ? [['p', p.toString()] as [string, string]] : [['eps', pyFloat(eps)] as [string, string]]),
        ...(extra.vars ?? []),
      ],
      state: {
        grid: {
          corner: 'eq',
          colHeaders,
          rowHeaders: orig.map((o) => `E${o}`),
          cells: M.map((r) => r.map(fmt)),
          roles,
        },
        strips,
      },
    });
  };
  const rowRoles = (r: number, role: Role, from = 0, roles: Record<string, Role> = {}) => {
    for (let c = from; c <= m; c++) roles[`${r},${c}`] = role;
    return roles;
  };
  const pivotRoles = (roles: Record<string, Role> = {}) => {
    pivotCols.forEach((c, i) => (roles[`${i},${c}`] = 'done'));
    return roles;
  };

  /* ----- solve_mod's check of p ----- */
  if (input.mode === 'mod' && p < 2n) {
    M = input.A.map((r, i) => [...r, input.b[i]]);
    const msg = `p = ${p}: the modulus must be a prime, so at least 2`;
    snap(0, `solve_mod(A, b, ${p}): p = ${p} is below 2, so solve_mod raises ValueError("${msg}") before it looks at A. Modulo ${p} there is no field to divide in.`, {}, {
      strips: [{ label: 'Result', items: [{ text: `ValueError ${SYM.cross}`, role: 'bad' }] }],
    });
    return { frames, choices, ops, inverses, result: null, det: null, error: `ValueError: ${msg}` };
  }

  /* ----- M = [A | b] ----- */
  if (input.mode === 'mod') {
    M = input.A.map((r, i) => [...r.map((v) => pmod(v, p)), pmod(input.b[i], p)]);
    const changed = input.A.some((r, i) => r.some((v) => v < 0n || v >= p) || input.b[i] < 0n || input.b[i] >= p);
    snap(
      1,
      `solve_mod: [A | b] is ${n} x ${m + 1}, ${plural(n, 'equation')} in ${plural(m, 'unknown')}, modulo p = ${p}. ` +
        (changed ? `Every entry is reduced into [0, ${p}) first, as Python's % does (a negative entry becomes positive). ` : 'Every entry is already in [0, p). ') +
        'In each column the pivot is the first nonzero entry: nothing rounds modulo a prime, so its size does not matter.',
    );
  } else {
    M = input.A.map((r, i) => [...r, input.b[i]]);
    snap(
      1,
      `${fn}: [A | b] is ${n} x ${m + 1}, ${plural(n, 'equation')} in ${plural(m, 'unknown')}. ` +
        (pivoting
          ? 'Partial pivoting: each column takes the entry of largest absolute value at or below the current row, so every multiplier is at most 1 in size. '
          : 'No pivoting: each column takes the first entry at or below the current row whose size is above eps, however small. ') +
        `An entry with |v| <= ${pyFloat(eps)} counts as zero.`,
    );
  }

  /* ----- forward elimination ----- */
  let error: string | null = null;
  for (let col = 0; col < m; col++) {
    if (row === n) {
      const rest = Array.from({ length: m - col }, (_, k) => col + k);
      snap(3, `row = ${n}: every row already has a pivot, so the loop stops. ${rest.length === 1 ? `Column x${rest[0]} gets` : `Columns ${xs(rest)} get`} no pivot: ${rest.length === 1 ? 'its unknown is' : 'their unknowns are'} free.`, pivotRoles());
      break;
    }
    // _choose_pivot / the first nonzero entry
    let r = -1;
    if (input.mode === 'float') {
      const F = M as number[][];
      if (pivoting) {
        let best = row;
        for (let t = row + 1; t < n; t++) if (Math.abs(F[t][col]) > Math.abs(F[best][col])) best = t;
        r = Math.abs(F[best][col]) > eps ? best : -1;
      } else {
        for (let t = row; t < n && r < 0; t++) if (Math.abs(F[t][col]) > eps) r = t;
      }
      choices.push([row, col, r]);
    } else {
      for (let t = row; t < n && r < 0; t++) if ((M[t][col] as bigint) !== 0n) r = t;
    }
    const scan = pivotRoles();
    for (let t = row; t < n; t++) scan[`${t},${col}`] = 'compare';
    if (r < 0) {
      snap(
        5,
        isMod
          ? `Column x${col}: every entry at or below row ${row} is 0 modulo ${p}. No pivot here: x${col} is free, and the next column is tried with the same row.`
          : `Column x${col}: every entry at or below row ${row} has |v| <= ${pyFloat(eps)}, so it counts as zero. No pivot here: x${col} is free, and the next column is tried with the same row.`,
        scan,
        { vars: [['col', col]] },
      );
      continue;
    }
    scan[`${r},${col}`] = 'active';
    const pv = M[r][col];
    let why: string;
    if (isMod) {
      why = `Column x${col}: the first nonzero entry at or below row ${row} is ${fmt(pv)}, in row ${r} (E${orig[r]}). It becomes the pivot.`;
    } else if (pivoting) {
      const F = M as number[][];
      const ties = [];
      for (let t = row; t < n; t++) if (t !== r && Math.abs(F[t][col]) === Math.abs(F[r][col])) ties.push(t);
      why =
        `Column x${col}: the largest |v| at or below row ${row} is |${fmt(pv)}|, in row ${r} (E${orig[r]}). ` +
        (ties.length ? `Row ${ties[0]} ties with it, and the upper row wins (the test is a strict >). ` : '') +
        'It becomes the pivot, so every multiplier below it is at most 1 in size.';
    } else {
      const F = M as number[][];
      let best = row;
      for (let t = row + 1; t < n; t++) if (Math.abs(F[t][col]) > Math.abs(F[best][col])) best = t;
      why =
        `Column x${col}: the first entry at or below row ${row} with |v| > eps is ${fmt(pv)}, in row ${r} (E${orig[r]}), and without pivoting it becomes the pivot.` +
        (best !== r && Math.abs(F[best][col]) > Math.abs(F[r][col]) ? ` Partial pivoting would take ${fmt(F[best][col])} in row ${best}.` : '');
    }
    snap(4, why, scan, { vars: [['col', col], ['pivot', fmtFull(pv)]] });
    if (r !== row) {
      [M[row], M[r]] = [M[r], M[row]];
      [orig[row], orig[r]] = [orig[r], orig[row]];
      swaps += 1;
      const roles = rowRoles(row, 'compare', 0, rowRoles(r, 'compare', 0, pivotRoles()));
      roles[`${row},${col}`] = 'active';
      snap(6, `Swap rows ${row} and ${r}: E${orig[row]} moves up to row ${row}, and E${orig[r]} down to row ${r}. A swap does not change the solutions, but it flips the sign of the determinant (${plural(swaps, 'swap')} so far).`, roles, {
        vars: [['col', col], ['pivot', fmtFull(M[row][col])]],
      });
    }
    let inv = 0n;
    if (input.mode === 'mod') {
      const a = M[row][col] as bigint;
      inv = powMod(a, p - 2n, p);
      inverses.push([a, inv]);
      const check = (a * inv) % p;
      const roles = pivotRoles();
      roles[`${row},${col}`] = 'active';
      if (check !== 1n) {
        const msg = `${a} has no inverse modulo ${p} by Fermat's little theorem: p must be prime`;
        error = `ValueError: ${msg}`;
        roles[`${row},${col}`] = 'bad';
        snap(
          7,
          `inv = ${a}^(p - 2) mod ${p} = ${a}^${p - 2n} mod ${p} = ${inv}, but ${a} ${SYM.times} ${inv} mod ${p} = ${check}, not 1. Fermat's little theorem holds only for a prime, and ${p} is not one: solve_mod raises ValueError("${msg}").`,
          roles,
          { vars: [['col', col], ['pivot', a.toString()], ['inv', inv.toString()]], strips: [{ label: 'Result', items: [{ text: `ValueError ${SYM.cross}`, role: 'bad' }] }] },
        );
        return { frames, choices, ops, inverses, result: null, det: null, error };
      }
      snap(
        7,
        `inv = ${a}^(p - 2) mod ${p} = ${inv} (Fermat's little theorem), and indeed ${a} ${SYM.times} ${inv} mod ${p} = 1. Dividing by the pivot is multiplying by ${inv}; it is computed once and reused for every row below and in back substitution.`,
        roles,
        { vars: [['col', col], ['pivot', a.toString()], ['inv', inv.toString()]] },
      );
    }
    for (let target = row + 1; target < n; target++) {
      const line0 = isMod ? 9 : 8;
      if (input.mode === 'float' ? (M[target][col] as number) === 0 : (M[target][col] as bigint) === 0n) {
        const roles = pivotRoles();
        roles[`${row},${col}`] = 'active';
        roles[`${target},${col}`] = 'compare';
        snap(line0, `Row ${target} (E${orig[target]}) already has 0 in column x${col}: there is nothing to subtract, so the row is skipped.`, roles, { vars: [['col', col]] });
        continue;
      }
      const before = M[target][col];
      let factor: Num;
      if (input.mode === 'float') {
        const F = M as number[][];
        factor = F[target][col] / F[row][col];
        F[target][col] = 0;
        for (let c = col + 1; c <= m; c++) F[target][c] -= (factor as number) * F[row][c];
      } else {
        const B = M as bigint[][];
        factor = (B[target][col] * inv) % p;
        B[target][col] = 0n;
        for (let c = col + 1; c <= m; c++) B[target][c] = pmod(B[target][c] - (factor as bigint) * B[row][c], p);
      }
      const changed = m - col;
      updates += changed;
      ops.push({ target, source: row, col, factor, row: [...M[target]] });
      const roles = rowRoles(row, 'compare', col, pivotRoles());
      rowRoles(target, 'active', col + 1, roles);
      roles[`${row},${col}`] = 'done';
      const how = isMod ? `factor = ${fmt(before)} ${SYM.times} ${inv} mod ${p} = ${fmt(factor)}` : `factor = ${fmt(before)} / ${fmt(M[row][col])} = ${fmt(factor)}`;
      snap(
        isMod ? 11 : 10,
        `${how}. Row ${target} (E${orig[target]}) -= ${fmt(factor)} ${SYM.times} row ${row}${isMod ? `, modulo ${p}` : ''}: column x${col} becomes 0, and the ${changed === 1 ? 'entry' : `${changed} entries`} to its right change.`,
        roles,
        { vars: [['col', col], ['factor', fmtFull(factor)]] },
      );
    }
    pivotCols.push(col);
    pivotVals.push(M[row][col]);
    if (isMod) invs.push(inv);
    row += 1;
    const roles = pivotRoles();
    snap(
      isMod ? 12 : 11,
      `Column x${col} is done: its pivot ${fmt(M[row - 1][col])} sits in row ${row - 1}, and every entry below it is 0. ${plural(pivotCols.length, 'pivot')} so far.`,
      roles,
      { vars: [['col', col]] },
    );
  }

  const rank = pivotCols.length;
  const free = Array.from({ length: m }, (_, c) => c).filter((c) => !pivotCols.includes(c));
  if (!isMod) snap(12, `Forward elimination is done: the matrix is in row echelon form with ${plural(rank, 'pivot')}, so rank = ${rank}.`, pivotRoles());

  /* ----- determinant: determinant(A) pivots like solve, so it is shown after solve only ----- */
  if (n === m && (isMod || pivoting)) {
    if (rank < n) det = isMod ? 0n : 0;
    else if (input.mode === 'float') {
      let d = swaps % 2 ? -1 : 1;
      for (let i = 0; i < n; i++) d *= M[i][i] as number;
      det = d;
    } else {
      let d = swaps % 2 ? p - 1n : 1n;
      for (let i = 0; i < n; i++) d = (d * (M[i][i] as bigint)) % p;
      det = d;
    }
  }
  const detText = (): string => {
    if (det === null) return '';
    if (rank < n) return ` det(A) = 0: a column has no pivot, so A is singular.`;
    const odd = swaps % 2 === 1;
    const count = swaps ? ` (${plural(swaps, 'swap')}${odd && isMod ? ': -1 modulo p' : ''})` : '';
    const sign = `${odd ? (isMod ? `${p - 1n}` : '-1') : isMod ? '1' : '+1'}${count}`;
    return ` det(A) = ${sign} ${SYM.times} ${pivotVals.map(fmt).join(` ${SYM.times} `)}${isMod ? ` mod ${p}` : ''} = ${fmtFull(det)}.`;
  };

  /* ----- the 0 = c check ----- */
  const bad = (() => {
    for (let r = rank; r < n; r++) {
      if (input.mode === 'float' ? Math.abs(M[r][m] as number) > eps : (M[r][m] as bigint) !== 0n) return r;
    }
    return -1;
  })();
  const checkLine = 13;
  if (bad >= 0) {
    result = { kind: 'no solution', x: null, rank, pivotCols: [...pivotCols], swaps, updates };
    const roles = rowRoles(bad, 'bad', 0, pivotRoles());
    snap(
      checkLine,
      `Row ${bad} (E${orig[bad]}) is zero in every column of A${isMod ? '' : ' (or below eps)'}, but its right-hand side is ${fmt(M[bad][m])}: it reads 0 = ${fmt(M[bad][m])}, which no x satisfies. ${fn} returns NO_SOLUTION, with rank ${rank}.${detText()}`,
      roles,
      { strips: [resultStrip()] },
    );
    return { frames, choices, ops, inverses, result, det, error: null };
  }
  snap(
    checkLine,
    rank === n
      ? `Every row has a pivot (rank ${rank} = ${plural(n, 'equation')}), so no row can read 0 = c: the system is consistent.`
      : `Rows ${rank === n - 1 ? rank : `${rank} to ${n - 1}`} ${rank === n - 1 ? 'is' : 'are'} zero in every column of A${isMod ? '' : ' (or below eps)'}, and so ${rank === n - 1 ? 'is its' : 'are their'} right-hand side${rank === n - 1 ? '' : 's'}${isMod ? '' : ' (within eps)'}: ${rank === n - 1 ? 'it reads' : 'they read'} 0 = 0, so the system is consistent.`,
    pivotRoles(),
  );

  /* ----- back substitution ----- */
  x = Array.from({ length: m }, () => (isMod ? 0n : 0));
  for (let i = rank - 1; i >= 0; i--) {
    const c = pivotCols[i];
    const rhs = M[i][m];
    const terms: string[] = [];
    let s: Num = rhs;
    for (let j = c + 1; j < m; j++) {
      if (input.mode === 'float') s = (s as number) - (M[i][j] as number) * (x[j] as number);
      else s = pmod((s as bigint) - (M[i][j] as bigint) * (x[j] as bigint), p);
      const zero = typeof x[j] === 'bigint' ? x[j] === 0n : x[j] === 0;
      const aZero = typeof M[i][j] === 'bigint' ? M[i][j] === 0n : M[i][j] === 0;
      if (!zero && !aZero) terms.push(`${fmt(M[i][j])} ${SYM.times} ${fmt(x[j])}`);
    }
    const value: Num = input.mode === 'float' ? (s as number) / (M[i][c] as number) : ((s as bigint) * invs[i]) % p;
    x[c] = value;
    solved.add(c);
    const roles = pivotRoles();
    for (let j = c; j <= m; j++) roles[`${i},${j}`] = 'compare';
    roles[`${i},${c}`] = 'active';
    const inner = terms.length ? `(${fmt(rhs)} - [${terms.join(' + ')}])` : fmt(rhs);
    snap(
      15,
      isMod
        ? `Row ${i} solves for x${c}: x${c} = ${inner} ${SYM.times} ${invs[i]} mod ${p} = ${fmt(value)}, using the inverse of the pivot ${fmt(M[i][c])}.`
        : `Row ${i} solves for x${c}: x${c} = ${inner} / ${fmt(M[i][c])} = ${fmt(value)}.${terms.length ? ' The unknowns to the right are already known.' : ''}`,
      roles,
      { active: c, vars: [['x' + c, fmtFull(value)]] },
    );
  }
  const kind: GaussKind = rank === m ? 'unique' : 'infinite';
  result = { kind, x: [...x], rank, pivotCols: [...pivotCols], swaps, updates };
  snap(
    16,
    (kind === 'unique'
      ? `Unique solution: rank ${rank} = ${plural(m, 'unknown')}, so every column has a pivot and this x is the only one.`
      : `Infinitely many solutions: rank ${rank} < ${plural(m, 'unknown')}, so ${free.length === 1 ? `x${free[0]} has no pivot and can take any value` : `${xs(free)} have no pivot and can take any values`}; ${fn} returns the solution with ${free.length === 1 ? 'it' : 'them'} set to 0.`) +
      ` ${plural(swaps, 'swap')}, ${plural(updates, 'update')}.${detText()}`,
    pivotRoles(),
    { strips: [resultStrip()] },
  );
  return { frames, choices, ops, inverses, result, det, error: null };

  function resultStrip(): StripData {
    const items: StripItem[] = [
      { text: result!.kind === 'no solution' ? `no solution ${SYM.cross}` : `${result!.kind} ${SYM.check}`, role: result!.kind === 'no solution' ? 'bad' : 'good' },
      { text: `rank ${result!.rank}` },
    ];
    if (det !== null) items.push({ text: `det ${fmtFull(det)}` });
    return { label: 'Result', items };
  }
}

/** A value in full: Python's repr of a float, or the integer. */
export const fmtFull = (v: Num): string => (typeof v === 'bigint' ? v.toString() : pyFloat(v));
