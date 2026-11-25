/**
 * Binomial coefficients tracer, drawn with CombinatoricsView (a triangle over FactorialTables).
 *
 * Mirrors Algorithms/Mathematical_Algorithms/Advanced_Math/Combinatorics/Python/combinatorics.py:
 *   pascal_triangle(n)      rows = [[1]]; for r in 1..n: row = [1] * (r + 1);
 *                           for j in 1..r-1: row[j] = _pascal_cell(above, j) = above[j-1] + above[j]
 *   ModBinomial(n, p)       ValueError if p < 2 or n >= p (Lucas's theorem handles n >= p);
 *                           fact[i] = fact[i-1] * i % p; inverse, mults = _power(fact[n], p - 2, p);
 *                           ValueError unless fact[n] * inverse % p == 1 (p is then not prime);
 *                           inv_fact[n] = inverse; inv_fact[i-1] = inv_fact[i] * i % p for i = n..1
 *   binomial(n, k)          0 for k < 0 or k > n; ValueError for n > n_max;
 *                           fact[n] * inv_fact[k] % p * inv_fact[n - k] % p
 * Golden fixtures (__fixtures__/mathAndProblemTypes.json, section "combinatorics") pin every
 * _pascal_cell call (r, j, the two cells above, the sum) in order, the tables, the _power call,
 * the count of products, every answer and every error message.
 *
 * Input: "C(6, 2) mod 13", several queries ("C(6, 2), C(6, 3) mod 13"), and an optional table
 * size "n 8" (0 to 10; by default the largest n asked about). p from 2 to 2^31 - 1.
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { FactArrowView, FactCellView, FactorialTablesState } from '../renderers/FactorialTables';
import type { OkText } from '../renderers/OptimizationKit';
import { SYM } from '../ui/symbols';
import { scriptSegments } from './hashTable';

const X = SYM.times;

export const BINOMIAL_LIMITS = { maxN: 10, maxP: 2_147_483_647, maxQueries: 4, argLo: -99, argHi: 99 };

export interface BinomialQuery {
  n: number;
  k: number;
}

export interface BinomialInput {
  /** The size of the triangle and of the tables: rows 0..n. */
  n: number;
  p: number;
  queries: BinomialQuery[];
}

function whole(token: string, lo: number, hi: number, what: string): number {
  if (!/^[+-]?\d+$/.test(token)) throw new InputError(`"${token}" is not a whole number (${what}).`);
  const v = Number(token);
  if (v < lo || v > hi) throw new InputError(`${what} goes from ${lo} to ${hi} (got ${token}).`);
  return v === 0 ? 0 : v;
}

/** "C(6, 2) mod 13", "C(6, 2), C(6, 3) mod 13", "n 8; C(6, 2); mod 13". */
export function parseBinomial(text: string): BinomialInput {
  let n: number | undefined;
  let p: number | undefined;
  const queries: BinomialQuery[] = [];
  const setP = (token: string) => {
    if (p !== undefined) throw new InputError('Give the modulus ("mod 13") only once.');
    p = whole(token, 2, BINOMIAL_LIMITS.maxP, 'The modulus p');
  };
  for (const segment of scriptSegments(text)) {
    const q = segment.match(/^(?:c|ncr|binomial)\s*(?:\(\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*\)|\s+([+-]?\d+)\s+([+-]?\d+))(?:\s*(?:mod|%)\s*(\S+))?$/i);
    if (q) {
      queries.push({
        n: whole(q[1] ?? q[3], BINOMIAL_LIMITS.argLo, BINOMIAL_LIMITS.argHi, 'n in C(n, k)'),
        k: whole(q[2] ?? q[4], BINOMIAL_LIMITS.argLo, BINOMIAL_LIMITS.argHi, 'k in C(n, k)'),
      });
      if (q[5] !== undefined) setP(q[5]);
      continue;
    }
    const m = segment.match(/^(mod|p|%|n|rows|size)\s*[:=]?\s*(\S+)$/i);
    if (!m) throw new InputError(`Cannot read "${segment}". Write a query and a prime, for example "C(6, 2) mod 13".`);
    if (/^(mod|p|%)$/i.test(m[1])) {
      setP(m[2]);
      continue;
    }
    if (n !== undefined) throw new InputError('Give the table size ("n 8") only once.');
    n = whole(m[2], 0, BINOMIAL_LIMITS.maxN, 'The table size n');
  }
  if (p === undefined) throw new InputError('Give the modulus, for example "C(6, 2) mod 13".');
  if (queries.length > BINOMIAL_LIMITS.maxQueries) throw new InputError(`At most ${BINOMIAL_LIMITS.maxQueries} queries, please (got ${queries.length}).`);
  if (n === undefined) {
    if (queries.length === 0) throw new InputError('Give a query such as "C(6, 2)", or the table size ("n 6").');
    n = Math.max(0, ...queries.map((q) => q.n));
    if (n > BINOMIAL_LIMITS.maxN) {
      throw new InputError(`The triangle shows rows 0 to ${BINOMIAL_LIMITS.maxN} (C(${n}, ...) needs row ${n}). Add "n 10" to keep the table at 10 and see the query refused.`);
    }
  }
  return { n, p, queries };
}

export const BINOMIAL_CODE = [
  'pascal_triangle(n):',
  '  rows = [[1]]                                  # C(0, 0) = 1',
  '  for r in 1..n: row = [1] * (r + 1)            # C(r, 0) = C(r, r) = 1',
  '    for j in 1..r-1: row[j] = above[j-1] + above[j]',
  'ModBinomial(n, p):           # ValueError if p < 2 or n >= p (Lucas)',
  '  for i in 1..n: fact[i] = fact[i-1] * i % p',
  '  inv = power(fact[n], p - 2, p)   # the one inverse; checked',
  '  for i in n..1: inv_fact[i-1] = inv_fact[i] * i % p',
  'binomial(n, k): if k < 0 or k > n: return 0   # ValueError if n > n_max',
  '  return fact[n] * inv_fact[k] % p * inv_fact[n-k] % p',
];

export interface PascalCell {
  /** null until the code has written the cell. */
  value: number | null;
  role?: Role;
}

export interface CombinatoricsState {
  label: string;
  n: number;
  rows: PascalCell[][];
  /** The cell being computed; arrows come into it from the two cells above. */
  sum: [number, number] | null;
  /** Lines under the triangle: the current sum, the count of additions. */
  triangleLines: OkText[];
  /** Widest value in the triangle, so every frame keeps one cell width. */
  cellChars: number;
  tables: FactorialTablesState;
}

/** One _pascal_cell call as the fixture records it: [r, j, above[j-1], above[j], sum]. */
export type PascalSum = [number, number, number, number, number];
export type BinomialAnswer = number | string;

export interface BinomialRun {
  frames: Array<Frame<CombinatoricsState>>;
  rows: number[][];
  sums: PascalSum[];
  fact: number[] | null;
  invFact: number[] | null;
  /** The _power call: [base, exp, value, multiplications]. */
  power: [number, number, number, number] | null;
  multiplications: number | null;
  answers: BinomialAnswer[];
  error: string | null;
}

const mulMod = (a: number, b: number, m: number) => Number((BigInt(a) * BigInt(b)) % BigInt(m));

/** _power(base, exp, m): square and multiply, [value, multiplications]. */
export function powerCount(base: number, exp: number, m: number): [number, number] {
  let result = 1 % m;
  let b = base % m;
  let e = exp;
  let made = 0;
  while (e > 0) {
    if (e % 2 === 1) {
      result = mulMod(result, b, m);
      made += 1;
    }
    b = mulMod(b, b, m);
    made += 1;
    e = Math.floor(e / 2);
  }
  return [result, made];
}

const plural = (k: number, one: string, many = `${one}s`) => `${k} ${k === 1 ? one : many}`;
const C = (n: number, k: number) => `C(${n}, ${k})`;

export function binomialTrace(input: BinomialInput): BinomialRun {
  const { n, p, queries } = input;
  const exact: number[][] = [[1]];
  const shown: Array<Array<number | null>> = Array.from({ length: n + 1 }, (_, r) => Array<number | null>(r + 1).fill(null));
  const sums: PascalSum[] = [];
  const frames: Array<Frame<CombinatoricsState>> = [];
  const fact = Array<number>(n + 1).fill(1);
  const inv = Array<number>(n + 1).fill(1);
  const factSet = fact.map(() => false);
  const invSet = inv.map(() => false);
  let tablesStarted = false;
  let multiplications = 0;
  let power: BinomialRun['power'] = null;
  const answers: BinomialAnswer[] = [];
  const answerLines: OkText[] = [];
  const pText = p === 1_000_000_007 ? '10^9 + 7' : String(p);
  const title = `ModBinomial(${n}, ${pText}): tables mod p`;

  interface Snap {
    cells?: Record<string, Role>;
    sum?: [number, number] | null;
    triangleLines?: OkText[];
    fact?: Record<number, Role>;
    inv?: Record<number, Role>;
    rowsRole?: Record<number, Role>;
    arrows?: FactArrowView[];
    work?: OkText[];
    vars?: Array<[string, string | number]>;
  }
  let additions = 0;
  const snap = (line: number | undefined, caption: string, o: Snap = {}) => {
    const tableCells = (vals: number[], set: boolean[], roles?: Record<number, Role>): FactCellView[] =>
      vals.map((v, i) => ({ value: tablesStarted ? String(v) : '', role: roles?.[i], ghost: !set[i] && !roles?.[i] }));
    frames.push({
      line,
      caption,
      vars: [['n', n], ['p', p], ...(o.vars ?? []), ['additions', additions], ['products mod p', multiplications]],
      state: {
        label:
          `Pascal's triangle, rows 0 to ${n}: ` +
          shown.map((row, r) => `row ${r}: ${row.map((v) => (v === null ? 'empty' : v)).join(' ')}`).join('; ') +
          `. ${title}${tablesStarted ? `. fact: ${fact.join(', ')}. inv_fact: ${inv.join(', ')}` : ', not built yet'}.`,
        n,
        rows: shown.map((row, r) => row.map((v, j) => ({ value: v, role: o.cells?.[`${r},${j}`] }))),
        sum: o.sum ?? null,
        triangleLines: o.triangleLines ?? [],
        cellChars: 1,
        tables: {
          label: `${title}. fact: ${tablesStarted ? fact.join(', ') : 'not built yet'}. inv_fact: ${tablesStarted ? inv.join(', ') : 'not built yet'}.`,
          title: tablesStarted ? title : `ModBinomial(${n}, ${pText}): built after the triangle`,
          fact: tableCells(fact, factSet, o.fact),
          inv: tableCells(inv, invSet, o.inv),
          rowRoles: o.rowsRole,
          arrows: o.arrows ?? [],
          work: o.work ?? [],
          answers: answerLines.map((l) => ({ ...l })),
          valueChars: 1,
          workChars: 1,
          answerRows: queries.length,
        },
      },
    });
  };
  const additionsLine = (): OkText => ({ text: `additions so far: ${additions}` });

  /* ---------- pascal_triangle(n) ---------- */
  shown[0][0] = 1;
  snap(
    1,
    `rows = [[1]]: row 0 holds C(0, 0) = 1, the one way to choose nothing from nothing. ` +
      (n === 0 ? 'With n = 0 that is the whole triangle.' : `Every cell below it will be the sum of the two cells above, so the triangle up to row ${n} needs additions only.`),
    { cells: { '0,0': 'active' }, triangleLines: [{ text: 'C(0, 0) = 1', role: 'active' }, additionsLine()] },
  );
  for (let r = 1; r <= n; r++) {
    const above = exact[r - 1];
    const row = Array<number>(r + 1).fill(1);
    shown[r][0] = 1;
    shown[r][r] = 1;
    snap(
      2,
      `Row ${r}: row = [1] * ${r + 1}, so both ends are 1 already: C(${r}, 0) = C(${r}, ${r}) = 1, one way to choose nothing and one to choose all ${r}.` +
        (r === 1 ? ' Row 1 has no cell in between.' : ` The ${plural(r - 1, 'cell')} in between ${r - 1 === 1 ? 'comes' : 'come'} from row ${r - 1}.`),
      { cells: { [`${r},0`]: 'active', [`${r},${r}`]: 'active' }, triangleLines: [{ text: `C(${r}, 0) = C(${r}, ${r}) = 1`, role: 'active' }, additionsLine()] },
    );
    for (let j = 1; j < r; j++) {
      const a = above[j - 1];
      const b = above[j];
      row[j] = a + b;
      shown[r][j] = row[j];
      sums.push([r, j, a, b, row[j]]);
      additions += 1;
      const first = sums.length === 1;
      const mirror = j > r - j ? ` Row ${r} is symmetric: it repeats ${C(r, r - j)} = ${row[j]}.` : '';
      snap(
        3,
        `${C(r, j)} = ${C(r - 1, j - 1)} + ${C(r - 1, j)} = ${a} + ${b} = ${row[j]}. ` +
          (first
            ? `A choice of ${j} out of ${r} items either takes item ${r}, leaving ${j - 1} to choose from the other ${r - 1}, or leaves it, leaving ${j} to choose from the other ${r - 1}.`
            : `The ${j}-subsets of ${r} items that take item ${r}, plus those that leave it.`) +
          mirror,
        {
          cells: { [`${r - 1},${j - 1}`]: 'compare', [`${r - 1},${j}`]: 'compare', [`${r},${j}`]: 'active' },
          sum: [r, j],
          triangleLines: [{ text: `${C(r, j)} = ${a} + ${b} = ${row[j]}`, role: 'active' }, additionsLine()],
          vars: [['r', r], ['j', j]],
        },
      );
    }
    exact.push(row);
  }
  const triangleDone = `rows 0..${n}: ${plural(additions, 'addition')}`;
  snap(
    undefined,
    `The triangle is done: rows 0 to ${n} hold every C(r, j) with r <= ${n}, ` +
      (n >= 2 ? `from n(n - 1)/2 = ${plural(additions, 'addition')} and no multiplication. ` : 'without a single addition: no row has a cell between its two ends. ') +
      `The numbers grow fast (row 67 is the last that fits in 64 bits), so modulo a prime the code uses factorials instead.`,
    { triangleLines: [{ text: triangleDone, role: 'done' }, { text: 'next: the same values modulo p' }] },
  );

  /* ---------- ModBinomial(n, p) ---------- */
  const markQueries = (role: Role): Record<string, Role> => {
    const cells: Record<string, Role> = {};
    for (const q of queries) if (q.k >= 0 && q.k <= q.n && q.n <= n) cells[`${q.n},${q.k}`] = role;
    return cells;
  };
  const finish = (error: string | null): BinomialRun => {
    const cellChars = Math.max(1, ...exact.flat().map((v) => String(v).length));
    const valueChars = Math.max(1, ...frames.flatMap((f) => [...f.state.tables.fact, ...f.state.tables.inv].map((c) => c.value.length)));
    const workChars = Math.max(20, ...frames.flatMap((f) => [...f.state.tables.work, ...f.state.tables.answers].map((l) => l.text.length + 2)));
    for (const f of frames) {
      f.state.cellChars = cellChars;
      f.state.tables.valueChars = valueChars;
      f.state.tables.workChars = workChars;
    }
    const built = tablesStarted && error === null;
    return { frames, rows: exact, sums, fact: built ? fact : null, invFact: built ? inv : null, power, multiplications: built ? multiplications : null, answers, error };
  };

  if (n >= p) {
    const error = `ValueError: n_max = ${n} >= p = ${p}: p divides n! for every n >= p, so n! has no inverse modulo p; Lucas's theorem handles n >= p`;
    const examples = queries.filter((q) => q.k >= 0 && q.k <= q.n && q.n <= n && q.n >= p);
    const exactNote = examples.length
      ? ` The triangle still has the exact values: ${examples.map((q) => `${C(q.n, q.k)} = ${exact[q.n][q.k]}, and ${exact[q.n][q.k]} mod ${p} = ${exact[q.n][q.k] % p}`).join('; ')}.`
      : '';
    snap(
      4,
      `ModBinomial(${n}, ${p}) refuses: ${p}! and every larger factorial contain the factor ${p}, so they are 0 modulo ${p} and have no inverse. ` +
        `${error}.${exactNote} Lucas's theorem (in Modular Arithmetic Tricks) computes C(n, k) mod p for n >= p from the base-p digits of n and k.`,
      { cells: markQueries('compare'), triangleLines: [{ text: triangleDone, role: 'done' }, { text: `ValueError: n_max = ${n} >= p = ${p}`, role: 'bad' }] },
    );
    return finish(error);
  }

  tablesStarted = true;
  factSet[0] = true;
  snap(
    4,
    `ModBinomial(${n}, ${pText}): fact = [1] * ${n + 1} and inv_fact = [1] * ${n + 1}. fact[i] will hold i! mod p and inv_fact[i] its inverse, so that ` +
      `C(n, k) = n! / (k! (n - k)!) becomes three lookups. p = ${pText} > ${n}, so none of these factorials contains the factor p.`,
    { triangleLines: [{ text: triangleDone, role: 'done' }, { text: 'now: the tables modulo p' }], work: [{ text: `fact = [1] * ${n + 1}` }, { text: `inv_fact = [1] * ${n + 1}` }, { text: 'fact[0] = 0! = 1 already' }] },
  );
  for (let i = 1; i <= n; i++) {
    const raw = fact[i - 1] * i;
    fact[i] = mulMod(fact[i - 1], i, p);
    factSet[i] = true;
    multiplications += 1;
    snap(
      5,
      `fact[${i}] = fact[${i - 1}] ${X} ${i} % p = ${fact[i - 1]} ${X} ${i} % ${p} = ${fact[i]}` +
        (raw >= p ? `: ${raw} passes p, so only its remainder is kept.` : '.') +
        (i === 1 ? ' Each factorial reuses the one above it: one product per row.' : ''),
      {
        triangleLines: [{ text: triangleDone, role: 'done' }, { text: 'now: the tables modulo p' }],
        fact: { [i - 1]: 'compare', [i]: 'active' },
        rowsRole: { [i]: 'active' },
        arrows: [{ from: [0, i - 1], to: [0, i], label: `${X}${i}`, role: 'active' }],
        work: [{ text: `fact[${i}] = fact[${i - 1}] * ${i} % p`, role: 'active' }, { text: `        = ${fact[i - 1]} * ${i} % ${p}` }, { text: `        = ${fact[i]}` }],
        vars: [['i', i]],
      },
    );
  }
  const [inverse, made] = powerCount(fact[n], p - 2, p);
  power = [fact[n], p - 2, inverse, made];
  multiplications += made;
  const check = mulMod(fact[n], inverse, p);
  if (check !== 1) {
    const error = `ValueError: p = ${p} is not prime: ${fact[n]} * ${inverse} % ${p} = ${check}, so the power p - 2 did not invert ${n}! modulo p`;
    snap(
      6,
      `inv = power(fact[${n}], p - 2, p) = ${fact[n]}^${p - 2} mod ${p} = ${inverse}, but ${fact[n]} ${X} ${inverse} % ${p} = ${check}, not 1. ` +
        `For a prime p, Euler's theorem (with phi(p) = p - 1) makes a^(p - 2) the inverse of a, so ${p} is not prime. ${error}.`,
      {
        triangleLines: [{ text: triangleDone, role: 'done' }, { text: `ValueError: ${p} is not prime`, role: 'bad' }],
        fact: { [n]: 'compare' },
        inv: { [n]: 'bad' },
        rowsRole: { [n]: 'active' },
        arrows: [{ from: [0, n], to: [1, n], label: '^(p-2)', role: 'bad' }],
        work: [
          { text: `inv = power(${fact[n]}, ${p - 2}, ${p})`, role: 'active' },
          { text: `    = ${inverse}   (${plural(made, 'product')})` },
          { text: `check: ${fact[n]} * ${inverse} % ${p} = ${check}`, role: 'bad' },
        ],
      },
    );
    return finish(error);
  }
  inv[n] = inverse;
  invSet[n] = true;
  snap(
    6,
    `The one inverse: inv = power(fact[${n}], p - 2, p) = ${fact[n]}^${p - 2} mod ${p} = ${inverse}. Euler's theorem for a prime p (phi(p) = p - 1) ` +
      `makes a^(p - 2) the inverse of a, and indeed ${fact[n]} ${X} ${inverse} % ${p} = 1. Square and multiply took ${plural(made, 'product')}.`,
    {
      triangleLines: [{ text: triangleDone, role: 'done' }, { text: 'now: the tables modulo p' }],
      fact: { [n]: 'compare' },
      inv: { [n]: 'active' },
      rowsRole: { [n]: 'active' },
      arrows: [{ from: [0, n], to: [1, n], label: '^(p-2)', role: 'active' }],
      work: [
        { text: `inv_fact[${n}] = power(${fact[n]}, ${p - 2}, ${p})`, role: 'active' },
        { text: `            = ${inverse}   (${plural(made, 'product')})` },
        { text: `check: ${fact[n]} * ${inverse} % ${p} = 1`, role: 'good' },
      ],
      vars: [['power() products', made]],
    },
  );
  for (let i = n; i >= 1; i--) {
    inv[i - 1] = mulMod(inv[i], i, p);
    invSet[i - 1] = true;
    multiplications += 1;
    snap(
      7,
      `inv_fact[${i - 1}] = inv_fact[${i}] ${X} ${i} % p = ${inv[i]} ${X} ${i} % ${p} = ${inv[i - 1]}.` +
        (i === n ? ` Because 1/${i - 1}! = ${i} ${X} 1/${i}!, one product replaces a second inverse.` : ''),
      {
        triangleLines: [{ text: triangleDone, role: 'done' }, { text: 'now: the tables modulo p' }],
        inv: { [i]: 'compare', [i - 1]: 'active' },
        rowsRole: { [i - 1]: 'active' },
        arrows: [{ from: [1, i], to: [1, i - 1], label: `${X}${i}`, role: 'active' }],
        work: [{ text: `inv_fact[${i - 1}] = inv_fact[${i}] * ${i} % p`, role: 'active' }, { text: `            = ${inv[i]} * ${i} % ${p}` }, { text: `            = ${inv[i - 1]}` }],
        vars: [['i', i]],
      },
    );
  }
  snap(
    undefined,
    `Built with ${plural(multiplications, 'product')} modulo p: ${n} for fact, ${made} for the one power, ${n} for inv_fact. ` +
      (queries.length ? 'Every query now costs two products.' : 'Add a query such as "C(6, 2)" to read one from the tables.'),
    {
      triangleLines: [{ text: triangleDone, role: 'done' }, { text: `tables: ${plural(multiplications, 'product')}`, role: 'done' }],
      work: [{ text: `build: ${n} + ${made} + ${n} = ${multiplications} products` }, { text: 'one query: 3 lookups, 2 products' }],
    },
  );

  /* ---------- queries ---------- */
  for (const q of queries) {
    const name = C(q.n, q.k);
    if (q.k < 0 || q.k > q.n) {
      answers.push(0);
      answerLines.push({ text: `${name} mod p = 0`, role: 'good' });
      snap(
        8,
        `${name}: ${q.k < 0 ? 'k is negative' : `k = ${q.k} > n = ${q.n}`}, so there is no such subset and binomial returns 0 before it looks at the table` +
          (q.n > n ? ` (so n = ${q.n} past the table does not matter).` : '.'),
        {
          triangleLines: [{ text: triangleDone, role: 'done' }, { text: `${name} = 0: no such subset`, role: 'good' }],
          work: [{ text: `${name}: k < 0 or k > n`, role: 'active' }, { text: '  return 0', role: 'good' }],
        },
      );
      continue;
    }
    if (q.n > n) {
      const error = `ValueError: n = ${q.n} is past the table: it was built for n <= ${n}`;
      answers.push(error);
      answerLines.push({ text: `${name}: ValueError`, role: 'bad' });
      snap(8, `${name} needs fact[${q.n}], but the table stops at ${n}. ${error}. Build ModBinomial with the largest n you will ask about.`, {
        triangleLines: [{ text: triangleDone, role: 'done' }, { text: `${name}: past the table`, role: 'bad' }],
        work: [{ text: `${name}: n = ${q.n} > n_max = ${n}`, role: 'bad' }, { text: '  ValueError', role: 'bad' }],
      });
      continue;
    }
    const a = q.n;
    const b = q.k;
    const rest = a - b;
    const first = mulMod(fact[a], inv[b], p);
    const value = mulMod(first, inv[rest], p);
    const truth = exact[a][b];
    answers.push(value);
    snap(
      9,
      `${name} = fact[${a}] ${X} inv_fact[${b}] ${X} inv_fact[${rest}] mod p: n! / (k! (n - k)!) with each division replaced by a stored inverse. Three lookups and two products, whatever the size of n.`,
      {
        cells: { [`${a},${b}`]: 'compare' },
        triangleLines: [{ text: triangleDone, role: 'done' }, { text: `${name} = ${truth} in the triangle`, role: 'compare' }],
        fact: { [a]: 'compare' },
        inv: { [b]: 'compare', [rest]: 'compare' },
        rowsRole: { [a]: 'compare', [b]: 'compare', [rest]: 'compare' },
        arrows: [{ from: [1, b], to: [0, a], role: 'compare' }, ...(rest !== b ? [{ from: [1, rest], to: [0, a], role: 'compare' } as FactArrowView] : [])],
        work: [{ text: name, role: 'active' }, { text: `= fact[${a}] * inv_fact[${b}] % p` }, { text: `    * inv_fact[${rest}] % p` }, { text: `= ${fact[a]} * ${inv[b]} % p * ${inv[rest]} % p` }],
      },
    );
    const same = truth % p === value;
    answerLines.push({ text: `${name} mod p = ${value}`, role: same ? 'good' : 'bad' });
    snap(
      9,
      `${fact[a]} ${X} ${inv[b]} % ${p} = ${first}, and ${first} ${X} ${inv[rest]} % ${p} = ${value}. ` +
        `The triangle has ${name} = ${truth} exactly, and ${truth} mod ${p} = ${truth % p}: ${same ? 'the same' : 'different'}.`,
      {
        cells: { [`${a},${b}`]: same ? 'good' : 'bad' },
        triangleLines: [{ text: triangleDone, role: 'done' }, { text: `${truth} mod ${p} = ${truth % p}`, role: same ? 'good' : 'bad' }],
        fact: { [a]: same ? 'good' : 'bad' },
        inv: { [b]: 'compare', [rest]: 'compare' },
        work: [{ text: name, role: 'active' }, { text: `= ${first} * ${inv[rest]} % p` }, { text: `= ${value}`, role: same ? 'good' : 'bad' }, { text: `exact: ${truth} mod p = ${truth % p}` }],
      },
    );
  }
  if (queries.length > 0) {
    const read = answers.filter((v) => typeof v === 'number').length;
    snap(
      undefined,
      `Done: ${plural(queries.length, 'query', 'queries')}, ${plural(read, 'answer')} from the tables. The triangle took O(n^2) additions; the tables took O(n) products and one power, and each query O(1).`,
      { cells: markQueries('good'), triangleLines: [{ text: triangleDone, role: 'done' }, { text: `tables: ${plural(multiplications, 'product')}`, role: 'done' }] },
    );
  }
  return finish(null);
}
