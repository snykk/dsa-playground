/**
 * Precomputation tracers: a table is filled once, then every query is a few lookups.
 *
 * Mirrors Utilities/Optimization_Techniques/Precomputation/Python/precomputation.py:
 *   factorialTrace  Factorials.__init__ / nCr / nPr and power(base, exp, mod). fact[i] is filled
 *                   downwards, then ONE Fermat inverse power(fact[n], mod - 2, mod) and inv_fact[i]
 *                   upwards as inv_fact[i+1] * (i+1) % mod. A query reads fact[n] and inv_fact
 *                   entries; r < 0 or r > n returns 0 first, and a query past the table raises
 *                   IndexError. Modular_Arithmetic_Tricks/Python/modular_tricks.py has the same class
 *                   (its power starts from 1 % m, which is 1 for every modulus allowed here).
 *   spfTrace        compute_spf(n) and factorize(n, spf): spf starts as list(range(n + 1)); for each
 *                   i up to int(n**0.5) with spf[i] == i, every j = i*i, i*i + i, ... whose spf[j]
 *                   is still j gets spf[j] = i. factorize hops n -> n // p with p = spf[n].
 *   prefix2DTrace   PrefixSum2D.__init__ and rect_sum: P[i][j] = g[i-1][j-1] + P[i-1][j] +
 *                   P[i][j-1] - P[i-1][j-1] row by row, and a rectangle is four corners of P.
 *   lcaTrace        LCA.__init__ and query: LOG = max(1, int(log2(n)) + 1); an iterative DFS pops
 *                   (u, p, d) from a stack (the last neighbour pushed is visited first); then
 *                   parent[i][j] = parent[parent[i][j-1]][j-1] column by column; a query lifts the
 *                   deeper node by the bits of the depth difference, then lifts both from the
 *                   largest jump down while their ancestors differ.
 * Python ints are unbounded: factorial products go through BigInt (a residue below 2^31 times
 * another one passes 2^53). Golden fixtures (__fixtures__/optimizationTechniques.json) pin
 * every table entry, the power() loop counts, every crossed-off multiple and every answer.
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { FactArrowView, FactCellView, FactorialTablesState } from '../renderers/FactorialTables';
import type { LcaState } from '../renderers/LcaLifting';
import type { OkText } from '../renderers/OptimizationKit';
import type { Prefix2DState, RectOverlay } from '../renderers/PrefixGrid2D';
import type { SpfGridState } from '../renderers/SpfGrid';
import { SYM } from '../ui/symbols';
import { parseCall, scriptSegments } from './hashTable';

export const MOD = 1_000_000_007;
const X = SYM.times;

/** Python's error for a list index past the end. */
export const INDEX_ERROR: [string, string] = ['IndexError', 'list index out of range'];

function wholeNumber(token: string, lo: number, hi: number, what: string): number {
  if (!/^[+-]?\d+$/.test(token)) throw new InputError(`"${token}" is not a whole number (${what}).`);
  const v = Number(token);
  if (v < lo || v > hi) throw new InputError(`${what} goes from ${lo} to ${hi} (got ${token}).`);
  return v === 0 ? 0 : v;
}

/** a * b % m on BigInt, back to a number (every value here is a residue below 2^31). */
const mulMod = (a: number, b: number, m: number) => Number((BigInt(a) * BigInt(b)) % BigInt(m));

/** Python's power(base, exp, mod) loop: the value, the loop steps and the multiplications into the result. */
export function powerCount(base: number, exp: number, mod: number): [number, number, number] {
  let result = 1;
  let b = base;
  let e = exp;
  let steps = 0;
  let mults = 0;
  while (e > 0) {
    steps += 1;
    if (e & 1) {
      result = mulMod(result, b, mod);
      mults += 1;
    }
    b = mulMod(b, b, mod);
    e = Math.floor(e / 2);
  }
  return [result, steps, mults];
}

/** The exact binomial C(n, r) reduced mod m (BigInt), for checking an answer by definition. */
export function exactBinomialMod(n: number, r: number, m: number): number {
  if (r < 0 || r > n) return 0;
  let num = 1n;
  let den = 1n;
  for (let k = 1; k <= r; k++) {
    num *= BigInt(n - r + k);
    den *= BigInt(k);
  }
  return Number((num / den) % BigInt(m));
}

export function exactPermMod(n: number, r: number, m: number): number {
  if (r < 0 || r > n) return 0;
  let v = 1n;
  for (let k = 0; k < r; k++) v *= BigInt(n - k);
  return Number(v % BigInt(m));
}

/* ======================================================================================
 * Factorials(n, mod): fact down, one Fermat inverse, inv_fact up; nCr / nPr by lookups.
 * ====================================================================================== */

export interface FactQuery {
  kind: 'nCr' | 'nPr';
  a: number;
  b: number;
}

export interface FactInput {
  n: number;
  mod: number;
  queries: FactQuery[];
}

export const FACT_LIMITS = { maxN: 12, maxMod: 2_147_483_647, maxQueries: 8, argLo: -99, argHi: 99 };

/** "n 10; nCr 10 3, nPr 10 3" with an optional "mod 13" (default 10^9 + 7); also "Factorials(10, 13)". */
export function parseFactorials(text: string): FactInput {
  let n: number | undefined;
  let mod: number | undefined;
  const queries: FactQuery[] = [];
  for (const segment of scriptSegments(text)) {
    const call = parseCall(segment);
    if (!call) throw new InputError(`Cannot read "${segment}". Write the size and queries, for example "n 10; nCr 10 3, nPr 10 3".`);
    const name = call.name;
    if (name === 'n' || name === 'size' || name === 'factorials') {
      if (n !== undefined) throw new InputError('Give the table size ("n 10") only once.');
      if (call.args.length < 1 || call.args.length > 2) throw new InputError(`"${segment}": write the table size, as in "n 10" or "Factorials(10, 13)".`);
      const v = wholeNumber(call.args[0], -99, 99, 'The table size n');
      if (v < 0) throw new InputError(`Factorials(${v}) raises IndexError: [1] * (n + 1) is an empty list, so fact[n] does not exist. Use n from 0 to ${FACT_LIMITS.maxN}.`);
      if (v > FACT_LIMITS.maxN) throw new InputError(`n goes up to ${FACT_LIMITS.maxN} here, so every row of the table fits on screen (got ${v}).`);
      n = v;
      if (call.args.length === 2) {
        if (mod !== undefined) throw new InputError('Give the modulus only once.');
        mod = wholeNumber(call.args[1], 2, FACT_LIMITS.maxMod, 'The modulus');
      }
      continue;
    }
    if (name === 'mod' || name === 'm' || name === 'p') {
      if (mod !== undefined) throw new InputError('Give the modulus ("mod 13") only once.');
      if (call.args.length !== 1) throw new InputError(`"${segment}": write one modulus, as in "mod 13".`);
      mod = wholeNumber(call.args[0], 2, FACT_LIMITS.maxMod, 'The modulus');
      continue;
    }
    const kind = name === 'ncr' || name === 'c' ? 'nCr' : name === 'npr' ? 'nPr' : undefined;
    if (!kind) throw new InputError(`Cannot read "${segment}". Queries look like "nCr 10 3" or "nPr 10 3".`);
    if (call.args.length !== 2) throw new InputError(`"${segment}": ${kind} takes n and r, as in "${kind} 10 3".`);
    queries.push({ kind, a: wholeNumber(call.args[0], FACT_LIMITS.argLo, FACT_LIMITS.argHi, 'n'), b: wholeNumber(call.args[1], FACT_LIMITS.argLo, FACT_LIMITS.argHi, 'r') });
  }
  if (n === undefined) throw new InputError('Start with the table size, for example "n 10; nCr 10 3".');
  if (queries.length > FACT_LIMITS.maxQueries) throw new InputError(`At most ${FACT_LIMITS.maxQueries} queries, please (got ${queries.length}).`);
  return { n, mod: mod ?? MOD, queries };
}

export const FACT_CODE = [
  'Factorials(n, mod=MOD): fact = [1] * (n + 1); inv_fact = [1] * (n + 1)',
  '  for i in range(1, n + 1): fact[i] = fact[i-1] * i % mod',
  '  inv_fact[n] = power(fact[n], mod - 2, mod)       # the only inverse (Fermat)',
  '  for i in range(n - 1, -1, -1):',
  '    inv_fact[i] = inv_fact[i+1] * (i+1) % mod      # 1/i! = (i+1) / (i+1)!',
  'nCr(n, r): if r < 0 or r > n: return 0',
  '  return fact[n] * inv_fact[r] % mod * inv_fact[n-r] % mod',
  'nPr(n, r): if r < 0 or r > n: return 0',
  '  return fact[n] * inv_fact[n-r] % mod',
];

export type FactAnswer = number | [string, string];

export interface FactRun {
  frames: Array<Frame<FactorialTablesState>>;
  fact: number[];
  invFact: number[];
  /** power(fact[n], mod - 2, mod): [value, loop steps, multiplications into the result]. */
  power: [number, number, number];
  answers: FactAnswer[];
}

const queryText = (q: FactQuery) => `${q.kind}(${q.a}, ${q.b})`;

export function factorialTrace(input: FactInput): FactRun {
  const { n, mod, queries } = input;
  const fact = Array<number>(n + 1).fill(1);
  const inv = Array<number>(n + 1).fill(1);
  const factSet = fact.map((_, i) => i === 0);
  const invSet = inv.map(() => false);
  const frames: Array<Frame<FactorialTablesState>> = [];
  const answers: FactAnswer[] = [];
  const answerLines: OkText[] = [];
  let mults = 0;
  let lookups = 0;
  const modText = mod === MOD ? '10^9 + 7' : String(mod);
  const title = `Factorials(${n}${mod === MOD ? '' : `, ${mod}`}): tables mod ${modText}`;

  interface SnapOpts {
    fact?: Record<number, Role>;
    inv?: Record<number, Role>;
    rows?: Record<number, Role>;
    arrows?: FactArrowView[];
    work?: OkText[];
    vars?: Array<[string, string | number]>;
  }
  const snap = (line: number | undefined, caption: string, o: SnapOpts = {}) => {
    const cells = (vals: number[], set: boolean[], roles?: Record<number, Role>): FactCellView[] =>
      vals.map((v, i) => ({ value: String(v), role: roles?.[i], ghost: !set[i] && !roles?.[i] }));
    frames.push({
      line,
      caption,
      vars: [...(o.vars ?? []), ['n', n], ['mod', mod], ['multiplications so far', mults], ['table lookups so far', lookups]],
      state: {
        label: `${title}. fact: ${fact.join(', ')}. inv_fact: ${inv.join(', ')}.`,
        title,
        fact: cells(fact, factSet, o.fact),
        inv: cells(inv, invSet, o.inv),
        rowRoles: o.rows,
        arrows: o.arrows ?? [],
        work: o.work ?? [],
        answers: answerLines.map((l) => ({ ...l })),
        valueChars: 1,
        workChars: 1,
        answerRows: queries.length,
      },
    });
  };

  snap(
    0,
    `Factorials(${n}): two lists of ${n + 1} ones. fact[i] will hold i! mod ${modText} and inv_fact[i] its inverse. ` +
      `Both are filled once, so that every nCr afterwards is three lookups instead of a loop.`,
    { work: [{ text: `fact = [1] * ${n + 1}` }, { text: `inv_fact = [1] * ${n + 1}` }, { text: 'fact[0] = 1 = 0! already' }] },
  );

  // fact[i] = fact[i-1] * i % mod, downwards.
  for (let i = 1; i <= n; i++) {
    const raw = BigInt(fact[i - 1]) * BigInt(i);
    fact[i] = Number(raw % BigInt(mod));
    factSet[i] = true;
    mults += 1;
    const reduced = raw >= BigInt(mod);
    const why =
      fact[i] === 0
        ? ` ${raw} is a multiple of ${mod}, so fact[${i}] = 0: from here on every factorial contains that factor and stays 0.`
        : reduced
          ? ` ${raw} passes the modulus, so only its remainder ${fact[i]} is kept: the table never holds a number above ${modText}.`
          : ' Each factorial reuses the one above it: one multiplication per row.';
    snap(1, `fact[${i}] = fact[${i - 1}] ${X} ${i} % mod = ${fact[i - 1]} ${X} ${i} = ${raw}${reduced ? ` ${SYM.rightArrow} ${fact[i]}` : ''}.${why}`, {
      fact: { [i - 1]: 'compare', [i]: fact[i] === 0 ? 'bad' : 'active' },
      rows: { [i]: 'active' },
      arrows: [{ from: [0, i - 1], to: [0, i], label: `${X}${i}`, role: 'active' }],
      work: [
        { text: `fact[${i}] = fact[${i - 1}] * ${i} % mod`, role: 'active' },
        { text: `        = ${fact[i - 1]} * ${i} % mod` },
        { text: `        = ${fact[i]}` },
      ],
      vars: [['i', i]],
    });
  }

  // The one Fermat inverse.
  const power = powerCount(fact[n], mod - 2, mod);
  inv[n] = power[0];
  invSet[n] = true;
  mults += power[1] + power[2];
  const check = mulMod(fact[n], inv[n], mod);
  const ok = check === 1 % mod;
  const why = ok
    ? `${fact[n]} ${X} ${inv[n]} % mod = 1, so it really is the inverse of ${n}!.`
    : fact[n] === 0
      ? `fact[${n}] is 0 (n >= ${mod} puts the factor ${mod} into n!), and 0 has no inverse: power returns 0, and that 0 will spread up the whole column.`
      : `but ${fact[n]} ${X} ${inv[n]} % mod = ${check}, not 1: ${mod} is not prime, so Fermat's little theorem does not hold and every inv_fact built from it is wrong.`;
  snap(
    2,
    `The only inverse that is computed: inv_fact[${n}] = power(fact[${n}], mod - 2, mod) = ${inv[n]} (Fermat: a^(p-2) is 1/a mod a prime p). ` +
      `The loop ran ${power[1]} times, once per bit of mod - 2 = ${mod - 2}, and multiplied ${power[2]} times into the result. ${why}`,
    {
      fact: { [n]: 'compare' },
      inv: { [n]: ok ? 'active' : 'bad' },
      rows: { [n]: 'active' },
      arrows: [{ from: [0, n], to: [1, n], label: `^(mod-2)`, role: ok ? 'active' : 'bad' }],
      work: [
        { text: `inv_fact[${n}] = power(fact[${n}], ${mod - 2}, mod)`, role: 'active' },
        { text: `             = ${inv[n]}   (${power[1]} squarings, ${power[2]} products)` },
        { text: `check: ${fact[n]} * ${inv[n]} % mod = ${check}`, role: ok ? 'good' : 'bad' },
      ],
      vars: [['power() loop steps', power[1]], ['power() products', power[2]]],
    },
  );

  // inv_fact[i] = inv_fact[i+1] * (i+1) % mod, upwards.
  for (let i = n - 1; i >= 0; i--) {
    inv[i] = mulMod(inv[i + 1], i + 1, mod);
    invSet[i] = true;
    mults += 1;
    const why =
      inv[i + 1] === 0
        ? ` inv_fact[${i + 1}] is 0, so this entry is 0 as well: one bad inverse at the bottom spoils the whole column.`
        : ` Because 1/${i}! = ${i + 1}/${i + 1}!, one multiplication replaces a second inverse.`;
    snap(4, `inv_fact[${i}] = inv_fact[${i + 1}] ${X} ${i + 1} % mod = ${inv[i + 1]} ${X} ${i + 1} % mod = ${inv[i]}.${why}`, {
      inv: { [i + 1]: 'compare', [i]: inv[i] === 0 ? 'bad' : 'active' },
      rows: { [i]: 'active' },
      arrows: [{ from: [1, i + 1], to: [1, i], label: `${X}${i + 1}`, role: 'active' }],
      work: [
        { text: `inv_fact[${i}] = inv_fact[${i + 1}] * ${i + 1} % mod`, role: 'active' },
        { text: `            = ${inv[i + 1]} * ${i + 1} % mod` },
        { text: `            = ${inv[i]}` },
      ],
      vars: [['i', i]],
    });
  }

  snap(
    undefined,
    `Built: ${n} multiplications down, one power of about ${power[1]} squarings, ${n} multiplications up. ` +
      (queries.length > 0 ? 'Every query below reads the table; none of them loops or divides.' : 'Add queries such as "nCr 10 3" to see them answered by lookups.'),
    {
      work: [{ text: `build cost: ${2 * n} multiplications` }, { text: `           + 1 power (${power[1]} steps)` }, { text: 'query cost: 2 or 3 lookups' }],
    },
  );

  // Queries.
  for (const q of queries) {
    const name = queryText(q);
    const isC = q.kind === 'nCr';
    const lineGuard = isC ? 5 : 7;
    const lineBody = isC ? 6 : 8;
    if (q.b < 0 || q.b > q.a) {
      answers.push(0);
      answerLines.push({ text: `${name} = 0`, role: 'muted' });
      snap(lineGuard, `${name}: ${q.b < 0 ? 'r is negative' : `r = ${q.b} > n = ${q.a}`}, so there is no way to ${isC ? 'choose' : 'arrange'} them: ${q.kind} returns 0 before touching the table.`, {
        work: [{ text: `${name}: r < 0 or r > n`, role: 'active' }, { text: '  return 0' }],
      });
      continue;
    }
    if (q.a > n) {
      answers.push(INDEX_ERROR);
      answerLines.push({ text: `${name}: IndexError`, role: 'bad' });
      snap(
        lineBody,
        `${name} reads fact[${q.a}], but the table stops at fact[${n}]: IndexError: list index out of range. ` + `Build Factorials with the largest n you will ask about.`,
        { work: [{ text: `${name}: fact[${q.a}]`, role: 'bad' }, { text: `  the table has rows 0..${n}` }, { text: '  IndexError: list index out of range', role: 'bad' }] },
      );
      continue;
    }
    const a = q.a;
    const b = q.b;
    const rest = a - b;
    if (isC) {
      lookups += 3;
      const first = mulMod(fact[a], inv[b], mod);
      const value = mulMod(first, inv[rest], mod);
      mults += 2;
      const exact = exactBinomialMod(a, b, mod);
      const good = exact === value;
      answers.push(value);
      const fRoles: Record<number, Role> = { [a]: 'compare' };
      const iRoles: Record<number, Role> = { [b]: 'compare', [rest]: 'compare' };
      snap(lineBody, `${name} = fact[${a}] ${X} inv_fact[${b}] ${X} inv_fact[${rest}] (mod ${modText}): three lookups, since C(n, r) = n! / (r! (n-r)!) and the table already holds every 1/k!.`, {
        fact: fRoles,
        inv: iRoles,
        rows: { [a]: 'compare', [b]: 'compare', [rest]: 'compare' },
        arrows: [
          { from: [1, b], to: [0, a], role: 'compare' },
          ...(rest !== b ? [{ from: [1, rest], to: [0, a], role: 'compare' } as FactArrowView] : []),
        ],
        work: [
          { text: `${name}`, role: 'active' },
          { text: `= fact[${a}] * inv_fact[${b}] % mod` },
          { text: `    * inv_fact[${rest}] % mod` },
          { text: `= ${fact[a]} * ${inv[b]} % mod * ${inv[rest]} % mod` },
        ],
      });
      answerLines.push({ text: `${name} = ${value}`, role: good ? 'good' : 'bad' });
      snap(
        lineBody,
        `${fact[a]} ${X} ${inv[b]} % mod = ${first}, times ${inv[rest]} % mod = ${value}. ` +
          (good
            ? `Check: C(${a}, ${b}) = ${a}! / (${b}! ${rest}!) reduced mod ${modText} is ${exact}, the same.`
            : `Wrong: C(${a}, ${b}) mod ${modText} is ${exact}. The table is broken (${fact[n] === 0 ? `n >= ${mod}, so inv_fact is all 0` : `${mod} is not prime`}); the code cannot notice.`),
        {
          fact: { [a]: good ? 'good' : 'bad' },
          inv: { [b]: 'compare', [rest]: 'compare' },
          work: [{ text: `${name}`, role: 'active' }, { text: `= ${first} * ${inv[rest]} % mod` }, { text: `= ${value}`, role: good ? 'good' : 'bad' }, { text: `exact C(${a}, ${b}) mod p = ${exact}` }],
        },
      );
    } else {
      lookups += 2;
      const value = mulMod(fact[a], inv[rest], mod);
      mults += 1;
      const exact = exactPermMod(a, b, mod);
      const good = exact === value;
      answers.push(value);
      answerLines.push({ text: `${name} = ${value}`, role: good ? 'good' : 'bad' });
      snap(
        lineBody,
        `${name} = fact[${a}] ${X} inv_fact[${rest}] % mod = ${fact[a]} ${X} ${inv[rest]} % mod = ${value}: two lookups, since P(n, r) = n! / (n-r)!. ` +
          (good ? `Check: ${a}!/${rest}! mod ${modText} is ${exact}.` : `Wrong: P(${a}, ${b}) mod ${modText} is ${exact}; the table is broken.`),
        {
          fact: { [a]: good ? 'good' : 'bad' },
          inv: { [rest]: 'compare' },
          rows: { [a]: 'compare', [rest]: 'compare' },
          arrows: [{ from: [1, rest], to: [0, a], role: 'compare' }],
          work: [{ text: `${name}`, role: 'active' }, { text: `= fact[${a}] * inv_fact[${rest}] % mod` }, { text: `= ${fact[a]} * ${inv[rest]} % mod` }, { text: `= ${value}`, role: good ? 'good' : 'bad' }],
        },
      );
    }
  }

  if (queries.length > 0) {
    const wrong = answerLines.filter((l) => l.role === 'bad' && !l.text.endsWith('IndexError')).length;
    snap(
      undefined,
      `Done: ${queries.length} quer${queries.length === 1 ? 'y' : 'ies'} answered with ${lookups} lookups in all. ` +
        (wrong > 0
          ? `${wrong} answer${wrong === 1 ? ' is' : 's are'} wrong: the tables need a prime modulus larger than n, and Factorials does not check either.`
          : 'Without the tables every nCr would need its own loop and its own modular inverse.'),
    );
  }

  // One picture size for the whole run.
  const valueChars = Math.max(1, ...frames.flatMap((f) => [...f.state.fact, ...f.state.inv].map((c) => c.value.length)));
  const workChars = Math.max(20, ...frames.flatMap((f) => [...f.state.work, ...f.state.answers].map((l) => l.text.length + 2)));
  for (const f of frames) {
    f.state.valueChars = valueChars;
    f.state.workChars = workChars;
  }
  return { frames, fact, invFact: inv, power, answers };
}

/* ======================================================================================
 * compute_spf(n), then factorize(x, spf) by hopping x -> x // spf[x].
 * ====================================================================================== */

export interface SpfInput {
  n: number;
  queries: number[];
}

export const SPF_LIMITS = { maxN: 99, maxQueries: 6, queryLo: -9, queryHi: 999 };

/** "n 60; factorize 60, 45, 97" (also "spf 60", "f 60", bare numbers after the size). */
export function parseSpf(text: string): SpfInput {
  let n: number | undefined;
  const queries: number[] = [];
  for (const segment of scriptSegments(text)) {
    const call = parseCall(segment);
    const nums = (call ? call.args : segment.split(/[\s,]+/)).filter(Boolean);
    const name = call?.name ?? '';
    if (call && ['n', 'spf', 'compute_spf', 'size'].includes(name)) {
      if (n !== undefined) throw new InputError('Give the table size ("n 60") only once.');
      if (nums.length !== 1) throw new InputError(`"${segment}": write one table size, as in "n 60".`);
      n = wholeNumber(nums[0], 0, SPF_LIMITS.maxN, 'The table size n');
      continue;
    }
    if (call && ['factorize', 'factor', 'f'].includes(name)) {
      if (nums.length === 0) throw new InputError(`"${segment}": write the number to factorize, as in "factorize 84".`);
      for (const t of nums) queries.push(wholeNumber(t, SPF_LIMITS.queryLo, SPF_LIMITS.queryHi, 'A number to factorize'));
      continue;
    }
    if (!call && nums.every((t) => /^[+-]?\d+$/.test(t)) && n !== undefined) {
      for (const t of nums) queries.push(wholeNumber(t, SPF_LIMITS.queryLo, SPF_LIMITS.queryHi, 'A number to factorize'));
      continue;
    }
    throw new InputError(`Cannot read "${segment}". Write the table size, then numbers to factorize: "n 60; factorize 60, 45, 97".`);
  }
  if (n === undefined) throw new InputError('Start with the table size, for example "n 60; factorize 60".');
  if (queries.length > SPF_LIMITS.maxQueries) throw new InputError(`At most ${SPF_LIMITS.maxQueries} numbers to factorize, please (got ${queries.length}).`);
  return { n, queries };
}

export const SPF_CODE = [
  'compute_spf(n): spf = list(range(n + 1))       # spf[x] = x for now',
  '  for i in range(2, int(n**0.5) + 1):',
  '    if spf[i] == i:                             # i is prime',
  '      for j in range(i*i, n + 1, i):',
  '        if spf[j] == j: spf[j] = i              # the first prime to reach j',
  '  return spf',
  'factorize(n, spf): factors = []',
  '  while n > 1:',
  '    p = spf[n]; cnt = 0                         # one lookup',
  '    while n % p == 0: n //= p; cnt += 1        # hop to n // p',
  '    factors.append((p, cnt))',
  '  return factors',
];

/** One event of the sieve loops, as the fixture records them. */
export type SpfEvent = ['i', number, boolean] | ['j', number, number, boolean];

export type SpfAnswer = Array<[number, number]> | [string, string];

export interface SpfRun {
  frames: Array<Frame<SpfGridState>>;
  spf: number[];
  events: SpfEvent[];
  answers: SpfAnswer[];
}

export function spfTrace(input: SpfInput): SpfRun {
  const { n, queries } = input;
  const spf = Array.from({ length: n + 1 }, (_, x) => x);
  const events: SpfEvent[] = [];
  const answers: SpfAnswer[] = [];
  const frames: Array<Frame<SpfGridState>> = [];
  const answerLines: OkText[] = [];
  const limit = Math.floor(Math.sqrt(n)); // int(n**0.5): exact for n <= 99
  let marks = 0;
  let checks = 0;
  let finished = false;

  interface SnapOpts {
    roles?: Record<number, Role>;
    hops?: Array<{ from: number; to: number; role?: Role }>;
    vars?: Array<[string, string | number]>;
    work?: OkText[];
  }
  const snap = (line: number | undefined, caption: string, o: SnapOpts = {}) => {
    const cells = spf.map((p, x) => {
      const prime = finished && x >= 2 && p === x;
      return { x, spf: x >= 2 && p !== x ? p : null, role: o.roles?.[x] ?? (prime ? ('done' as Role) : x < 2 ? ('muted' as Role) : undefined) };
    });
    frames.push({
      line,
      caption,
      vars: [...(o.vars ?? []), ['n', n], ['spf entries set', marks], ['entries checked', checks]],
      state: {
        label: `Smallest prime factors of 0..${n}: ${spf.map((p, x) => `${x}:${p}`).join(' ')}`,
        n,
        cells,
        hops: o.hops ?? [],
        work: o.work ?? [],
        answers: answerLines.map((l) => ({ ...l })),
        answerRows: queries.length,
        workChars: 1,
      },
    });
  };

  snap(
    0,
    `spf = list(range(${n + 1})): every number starts as its own smallest prime factor. A number keeps spf[x] = x only if no smaller prime ever reaches it, which is exactly when x is prime.`,
  );

  for (let i = 2; i <= limit; i++) {
    const prime = spf[i] === i;
    events.push(['i', i, prime]);
    if (!prime) {
      snap(2, `i = ${i}: spf[${i}] = ${spf[i]}, not ${i}, so ${i} is not prime. Skip it: every multiple of ${i} is a multiple of ${spf[i]} and already has a factor at most ${spf[i]}.`, {
        roles: { [i]: 'muted', [spf[i]]: 'compare' },
        vars: [['i', i]],
      });
      continue;
    }
    snap(2, `i = ${i}: spf[${i}] == ${i}, so ${i} is prime. Mark its multiples from ${i} ${X} ${i} = ${i * i}: a smaller multiple k ${X} ${i} (k < ${i}) has a prime factor below ${i} and was reached earlier.`, {
      roles: { [i]: 'done' },
      vars: [['i', i]],
    });
    for (let j = i * i; j <= n; j += i) {
      const fresh = spf[j] === j;
      events.push(['j', i, j, fresh]);
      checks += 1;
      if (fresh) {
        spf[j] = i;
        marks += 1;
        snap(4, `j = ${j}: spf[${j}] was still ${j}, so no smaller prime divides it. Store spf[${j}] = ${i}.`, {
          roles: { [i]: 'done', [j]: 'active' },
          vars: [['i', i], ['j', j]],
        });
      } else {
        snap(4, `j = ${j}: spf[${j}] is already ${spf[j]}, set by a smaller prime. Keep it: the first prime to reach a number is its smallest factor.`, {
          roles: { [i]: 'done', [j]: 'compare' },
          vars: [['i', i], ['j', j]],
        });
      }
    }
  }

  finished = true;
  const primes = spf.filter((p, x) => x >= 2 && p === x).length;
  snap(
    5,
    n < 4
      ? `Done: no i with i ${X} i <= ${n}, so nothing was marked. ${primes} prime${primes === 1 ? '' : 's'} up to ${n}.`
      : `Done: ${marks} entries set in ${checks} checks. The ${primes} numbers with spf[x] = x (from 2 up) are prime; every other number holds its smallest prime factor, ready to be looked up.`,
  );

  for (const x0 of queries) {
    const name = `factorize(${x0})`;
    if (x0 <= 1) {
      answers.push([]);
      answerLines.push({ text: `${name} = []`, role: 'muted' });
      snap(7, `${name}: n = ${x0} is not greater than 1, so the while loop never runs and the answer is the empty list.`, {
        roles: x0 >= 0 && x0 <= n ? { [x0]: 'compare' } : {},
        work: [{ text: `${name}`, role: 'active' }, { text: `  ${x0} > 1 is False` }, { text: '  return []' }],
      });
      continue;
    }
    if (x0 > n) {
      answers.push(INDEX_ERROR);
      answerLines.push({ text: `${name}: IndexError`, role: 'bad' });
      snap(8, `${name}: p = spf[${x0}] reads past the table, which stops at ${n}: IndexError: list index out of range. The table must cover every number you factorize.`, {
        work: [{ text: `${name}`, role: 'active' }, { text: `  p = spf[${x0}]`, role: 'bad' }, { text: '  IndexError: list index out of range', role: 'bad' }],
      });
      continue;
    }
    let x = x0;
    const factors: Array<[number, number]> = [];
    const hops: Array<{ from: number; to: number; role?: Role }> = [];
    const factorText = () => `[${factors.map(([p, c]) => `(${p}, ${c})`).join(', ')}]`;
    let lookupsHere = 0;
    while (x > 1) {
      const p = spf[x];
      lookupsHere += 1;
      snap(8, `${name}: n = ${x} > 1. One lookup: p = spf[${x}] = ${p}, the smallest prime factor, without trying any divisor.`, {
        roles: { [x]: 'compare', [p]: 'done' },
        hops: hops.map((h) => ({ ...h, role: 'muted' as Role })),
        work: [{ text: `${name}`, role: 'active' }, { text: `  p = spf[${x}] = ${p}` }, { text: `  factors = ${factorText()}` }],
        vars: [['n (in factorize)', x], ['p', p]],
      });
      let cnt = 0;
      while (x % p === 0) {
        const next = Math.floor(x / p);
        cnt += 1;
        hops.push({ from: x, to: next });
        snap(9, `${x} % ${p} == 0: hop to n = ${x} // ${p} = ${next} (cnt = ${cnt}).`, {
          roles: { [next]: 'active', [p]: 'done' },
          hops: hops.map((h, k) => ({ ...h, role: k === hops.length - 1 ? ('active' as Role) : ('muted' as Role) })),
          work: [{ text: `${name}`, role: 'active' }, { text: `  n = ${x} // ${p} = ${next}, cnt = ${cnt}` }, { text: `  factors = ${factorText()}` }],
          vars: [['n (in factorize)', next], ['p', p], ['cnt', cnt]],
        });
        x = next;
      }
      factors.push([p, cnt]);
      snap(10, `${x === 1 ? `n = 1` : `${x} % ${p} != 0`}, so ${p} is used up: append (${p}, ${cnt}).`, {
        roles: { [x]: x === 1 ? 'done' : 'compare' },
        hops: hops.map((h) => ({ ...h, role: 'muted' as Role })),
        work: [{ text: `${name}`, role: 'active' }, { text: `  append (${p}, ${cnt})` }, { text: `  factors = ${factorText()}` }],
        vars: [['n (in factorize)', x], ['p', p], ['cnt', cnt]],
      });
    }
    answers.push(factors);
    const product = factors.reduce((s, [p, c]) => s * p ** c, 1);
    answerLines.push({ text: `${name} = ${factorText()}`, role: product === x0 ? 'good' : 'bad' });
    snap(
      11,
      `n = 1: stop. ${name} = ${factorText()}: ${lookupsHere} lookup${lookupsHere === 1 ? '' : 's'} and ${hops.length} division${hops.length === 1 ? '' : 's'}, ` +
        `each hop at least halving n. Check: ${factors.map(([p, c]) => (c > 1 ? `${p}^${c}` : `${p}`)).join(` ${X} `)} = ${product}.`,
      {
        roles: { [x0]: 'good' },
        hops: hops.map((h) => ({ ...h, role: 'active' as Role })),
        work: [{ text: `${name}`, role: 'active' }, { text: `  = ${factorText()}`, role: 'good' }],
      },
    );
  }
  const workChars = Math.max(26, ...frames.flatMap((f) => [...f.state.work, ...f.state.answers].map((l) => l.text.length + 2)));
  for (const f of frames) f.state.workChars = workChars;
  return { frames, spf, events, answers };
}

/* ======================================================================================
 * PrefixSum2D(grid): P filled row by row; rect_sum reads four corners.
 * ====================================================================================== */

export interface Prefix2DInput {
  grid: number[][];
  queries: Array<[number, number, number, number]>;
}

export const PREFIX2D_LIMITS = { maxRows: 6, maxCols: 6, valueLo: -99, valueHi: 99, maxQueries: 6, cornerHi: 9 };

/** "1 2 3 / 4 5 6 / 7 8 9; rect 1 1 2 2, rect 0 1 1 2". Rows are separated by "/". */
export function parsePrefix2D(text: string): Prefix2DInput {
  const [gridText, ...rest] = text.split(';');
  const rowsText = gridText
    .split('/')
    .map((r) => r.trim())
    .filter((r, _, all) => r.length > 0 || all.length > 1);
  if (rowsText.length === 0 || rowsText.every((r) => r.length === 0)) throw new InputError('Start with the grid: rows of numbers separated by "/", for example "1 2 3 / 4 5 6".');
  const grid = rowsText.map((row, r) => {
    const tokens = row.split(/[\s,]+/).filter(Boolean);
    if (tokens.length === 0) throw new InputError(`Row ${r} is empty: PrefixSum2D reads m = len(grid[0]) values from every row.`);
    return tokens.map((t) => wholeNumber(t, PREFIX2D_LIMITS.valueLo, PREFIX2D_LIMITS.valueHi, 'A grid value'));
  });
  if (grid.length > PREFIX2D_LIMITS.maxRows) throw new InputError(`At most ${PREFIX2D_LIMITS.maxRows} rows, so both tables fit on screen (got ${grid.length}).`);
  const m = grid[0].length;
  if (m > PREFIX2D_LIMITS.maxCols) throw new InputError(`At most ${PREFIX2D_LIMITS.maxCols} columns, so both tables fit on screen (got ${m}).`);
  grid.forEach((row, r) => {
    if (row.length !== m) {
      throw new InputError(
        `Row ${r} has ${row.length} values but row 0 has ${m}. PrefixSum2D takes m from the first row: a shorter row raises IndexError and the extra values of a longer one are ignored, so give every row ${m}.`,
      );
    }
  });
  const queries: Array<[number, number, number, number]> = [];
  for (const segment of scriptSegments(rest.join(';'))) {
    const call = parseCall(segment);
    if (!call || !['rect', 'rect_sum', 'sum', 'q', 'query'].includes(call.name)) throw new InputError(`Cannot read "${segment}". Queries look like "rect 1 1 2 2" (r1 c1 r2 c2, corners included).`);
    if (call.args.length !== 4) throw new InputError(`"${segment}": rect takes four numbers r1 c1 r2 c2, as in "rect 1 1 2 2".`);
    const [r1, c1, r2, c2] = call.args.map((t) => wholeNumber(t, -9, PREFIX2D_LIMITS.cornerHi, 'A corner'));
    if (r1 < 0 || c1 < 0 || r2 < 0 || c2 < 0) throw new InputError(`"${segment}": rect_sum does not check its corners, and a negative index wraps around to the end of a Python list, so the answer would not be a rectangle. Use corners from 0.`);
    if (r1 > r2 || c1 > c2) throw new InputError(`"${segment}": the first corner must be the top-left one (r1 <= r2, c1 <= c2). rect_sum does not check this and would return a meaningless number.`);
    queries.push([r1, c1, r2, c2]);
  }
  if (queries.length > PREFIX2D_LIMITS.maxQueries) throw new InputError(`At most ${PREFIX2D_LIMITS.maxQueries} queries, please (got ${queries.length}).`);
  return { grid, queries };
}

export const PREFIX2D_CODE = [
  'PrefixSum2D(grid): n, m = len(grid), len(grid[0]); P = [[0] * (m + 1) for _ in range(n + 1)]',
  '  for i in range(1, n + 1): for j in range(1, m + 1):',
  '    P[i][j] = grid[i-1][j-1] + P[i-1][j] + P[i][j-1] - P[i-1][j-1]',
  'rect_sum(r1, c1, r2, c2):',
  '  return P[r2+1][c2+1] - P[r1][c2+1] - P[r2+1][c1] + P[r1][c1]',
];

export type Prefix2DAnswer = number | [string, string];

export interface Prefix2DRun {
  frames: Array<Frame<Prefix2DState>>;
  prefix: number[][];
  answers: Prefix2DAnswer[];
}

export function prefix2DTrace(input: Prefix2DInput): Prefix2DRun {
  const { grid, queries } = input;
  const n = grid.length;
  const m = grid[0].length;
  const P = Array.from({ length: n + 1 }, () => Array<number>(m + 1).fill(0));
  const written = Array.from({ length: n + 1 }, (_, i) => Array<boolean>(m + 1).fill(i === 0));
  for (let i = 0; i <= n; i++) written[i][0] = true;
  const frames: Array<Frame<Prefix2DState>> = [];
  const answers: Prefix2DAnswer[] = [];
  const answerLines: OkText[] = [];
  let reads = 0;

  interface SnapOpts {
    gridRoles?: Record<string, Role>;
    pRoles?: Record<string, Role>;
    signs?: Record<string, string>;
    overlays?: RectOverlay[];
    work?: OkText[];
    vars?: Array<[string, string | number]>;
  }
  const snap = (line: number | undefined, caption: string, o: SnapOpts = {}) => {
    frames.push({
      line,
      caption,
      vars: [...(o.vars ?? []), ['rows n', n], ['columns m', m], ['prefix entries read by queries', reads]],
      state: {
        label: `Grid ${grid.map((r) => r.join(' ')).join(' / ')}; prefix table ${P.map((r) => r.join(' ')).join(' / ')}`,
        grid: grid.map((row, r) => row.map((v, c) => ({ value: String(v), role: o.gridRoles?.[`${r},${c}`] }))),
        prefix: P.map((row, i) => row.map((v, j) => ({ value: String(v), role: o.pRoles?.[`${i},${j}`], ghost: !written[i][j], sign: o.signs?.[`${i},${j}`] }))),
        overlays: o.overlays ?? [],
        work: o.work ?? [],
        answers: answerLines.map((l) => ({ ...l })),
        answerRows: queries.length,
        workChars: 1,
      },
    });
  };

  snap(
    0,
    `PrefixSum2D: a ${n + 1} ${X} ${m + 1} table of zeros. P[i][j] will hold the sum of the top-left block of i rows and j columns, so row 0 and column 0 stay 0 (an empty block) and no border case is needed.`,
  );

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const g = grid[i - 1][j - 1];
      const up = P[i - 1][j];
      const left = P[i][j - 1];
      const diag = P[i - 1][j - 1];
      P[i][j] = g + up + left - diag;
      written[i][j] = true;
      snap(
        2,
        `P[${i}][${j}] = grid[${i - 1}][${j - 1}] + P[${i - 1}][${j}] + P[${i}][${j - 1}] - P[${i - 1}][${j - 1}] = ${g} + ${up} + ${left} - ${diag} = ${P[i][j]}. ` +
          `The block above and the block to the left both contain P[${i - 1}][${j - 1}], so it is subtracted once.`,
        {
          gridRoles: { [`${i - 1},${j - 1}`]: 'active' },
          pRoles: { [`${i},${j}`]: 'active', [`${i - 1},${j}`]: 'compare', [`${i},${j - 1}`]: 'compare', [`${i - 1},${j - 1}`]: 'compare' },
          signs: { [`${i - 1},${j}`]: '+', [`${i},${j - 1}`]: '+', [`${i - 1},${j - 1}`]: '-' },
          overlays: [{ id: 'region', r1: 0, c1: 0, r2: i - 1, c2: j - 1, role: 'compare' }],
          work: [
            { text: `P[${i}][${j}] = g + up + left - diag`, role: 'active' },
            { text: `= ${g} + ${up} + ${left} - ${diag}` },
            { text: `= ${P[i][j]}` },
          ],
          vars: [['i', i], ['j', j]],
        },
      );
    }
  }

  snap(undefined, `Built: ${n * m} entries, each from three neighbours and one grid value. From now on any rectangle costs four lookups, however large it is.`);

  for (const [r1, c1, r2, c2] of queries) {
    const name = `rect_sum(${r1}, ${c1}, ${r2}, ${c2})`;
    if (r2 + 1 > n || c2 + 1 > m) {
      answers.push(INDEX_ERROR);
      answerLines.push({ text: `${name}: IndexError`, role: 'bad' });
      const what = r2 + 1 > n ? `P[${r2 + 1}] does not exist (rows 0..${n})` : `P[${r2 + 1}][${c2 + 1}] does not exist (columns 0..${m})`;
      snap(4, `${name}: the first term reads P[${r2 + 1}][${c2 + 1}], but ${what}: IndexError: list index out of range. The corners are grid cells, from (0, 0) to (${n - 1}, ${m - 1}).`, {
        work: [{ text: name, role: 'active' }, { text: `  P[${r2 + 1}][${c2 + 1}]`, role: 'bad' }, { text: '  IndexError: list index out of range', role: 'bad' }],
      });
      continue;
    }
    const big = P[r2 + 1][c2 + 1];
    const top = P[r1][c2 + 1];
    const leftV = P[r2 + 1][c1];
    const corner = P[r1][c1];
    const value = big - top - leftV + corner;
    reads += 4;
    let brute = 0;
    for (let r = r1; r <= r2; r++) for (let c = c1; c <= c2; c++) brute += grid[r][c];
    const target: RectOverlay = { id: 'target', r1, c1, r2, c2, role: 'active' };
    const k = (i: number, j: number) => `${i},${j}`;
    const terms = `P[${r2 + 1}][${c2 + 1}] - P[${r1}][${c2 + 1}] - P[${r2 + 1}][${c1}] + P[${r1}][${c1}]`;
    snap(3, `${name}: the cells from row ${r1} to ${r2} and column ${c1} to ${c2}. Instead of adding ${(r2 - r1 + 1) * (c2 - c1 + 1)} cells, read four corners of P: ${terms}.`, {
      overlays: [target],
      work: [{ text: name, role: 'active' }, { text: `= ${terms}` }],
    });
    snap(4, `+ P[${r2 + 1}][${c2 + 1}] = ${big}: everything above and left of (${r2}, ${c2}), more than the rectangle.`, {
      pRoles: { [k(r2 + 1, c2 + 1)]: 'compare' },
      signs: { [k(r2 + 1, c2 + 1)]: '+' },
      overlays: [{ id: 'region', r1: 0, c1: 0, r2, c2, role: 'compare', label: `+${big}` }, target],
      work: [{ text: name, role: 'active' }, { text: `= ${big}` }],
    });
    snap(
      4,
      r1 === 0 ? `- P[0][${c2 + 1}] = 0: there are no rows above row 0 to remove.` : `- P[${r1}][${c2 + 1}] = ${top}: remove the ${r1} row${r1 === 1 ? '' : 's'} above the rectangle.`,
      {
        pRoles: { [k(r2 + 1, c2 + 1)]: 'compare', [k(r1, c2 + 1)]: 'compare' },
        signs: { [k(r2 + 1, c2 + 1)]: '+', [k(r1, c2 + 1)]: '-' },
        overlays: [{ id: 'region', r1: 0, c1: 0, r2, c2, role: 'compare', label: `+${big}` }, ...(r1 > 0 ? [{ id: 'top', r1: 0, c1: 0, r2: r1 - 1, c2, role: 'muted' as Role, label: `-${top}` }] : []), target],
        work: [{ text: name, role: 'active' }, { text: `= ${big} - ${top}` }],
      },
    );
    snap(
      4,
      c1 === 0
        ? `- P[${r2 + 1}][0] = 0: there are no columns left of column 0 to remove.`
        : `- P[${r2 + 1}][${c1}] = ${leftV}: remove the ${c1} column${c1 === 1 ? '' : 's'} to the left. The top-left corner block has now been removed twice.`,
      {
        pRoles: { [k(r2 + 1, c2 + 1)]: 'compare', [k(r1, c2 + 1)]: 'compare', [k(r2 + 1, c1)]: 'compare' },
        signs: { [k(r2 + 1, c2 + 1)]: '+', [k(r1, c2 + 1)]: '-', [k(r2 + 1, c1)]: '-' },
        overlays: [
          { id: 'region', r1: 0, c1: 0, r2, c2, role: 'compare', label: `+${big}` },
          ...(r1 > 0 ? [{ id: 'top', r1: 0, c1: 0, r2: r1 - 1, c2, role: 'muted' as Role, label: `-${top}` }] : []),
          ...(c1 > 0 ? [{ id: 'left', r1: 0, c1: 0, r2, c2: c1 - 1, role: 'muted' as Role, label: `-${leftV}` }] : []),
          target,
        ],
        work: [{ text: name, role: 'active' }, { text: `= ${big} - ${top} - ${leftV}` }],
      },
    );
    snap(
      4,
      r1 > 0 && c1 > 0
        ? `+ P[${r1}][${c1}] = ${corner}: the block above and left of the rectangle was removed twice, so add it back once.`
        : `+ P[${r1}][${c1}] = 0: nothing was removed twice, because the rectangle touches ${r1 === 0 ? 'row 0' : 'column 0'}.`,
      {
        pRoles: { [k(r2 + 1, c2 + 1)]: 'compare', [k(r1, c2 + 1)]: 'compare', [k(r2 + 1, c1)]: 'compare', [k(r1, c1)]: 'compare' },
        signs: { [k(r2 + 1, c2 + 1)]: '+', [k(r1, c2 + 1)]: '-', [k(r2 + 1, c1)]: '-', [k(r1, c1)]: '+' },
        overlays: [
          { id: 'region', r1: 0, c1: 0, r2, c2, role: 'compare', label: `+${big}` },
          ...(r1 > 0 ? [{ id: 'top', r1: 0, c1: 0, r2: r1 - 1, c2, role: 'muted' as Role, label: `-${top}` }] : []),
          ...(c1 > 0 ? [{ id: 'left', r1: 0, c1: 0, r2, c2: c1 - 1, role: 'muted' as Role, label: `-${leftV}` }] : []),
          ...(r1 > 0 && c1 > 0 ? [{ id: 'corner', r1: 0, c1: 0, r2: r1 - 1, c2: c1 - 1, role: 'done' as Role, label: `+${corner}` }] : []),
          target,
        ],
        work: [{ text: name, role: 'active' }, { text: `= ${big} - ${top} - ${leftV} + ${corner}` }],
      },
    );
    const good = brute === value;
    answers.push(value);
    answerLines.push({ text: `${name} = ${value}`, role: good ? 'good' : 'bad' });
    snap(4, `= ${value}. Four lookups and three additions, whatever the size of the rectangle. Check: adding its ${(r2 - r1 + 1) * (c2 - c1 + 1)} cells one by one also gives ${brute}.`, {
      gridRoles: Object.fromEntries(
        Array.from({ length: r2 - r1 + 1 }, (_, dr) => Array.from({ length: c2 - c1 + 1 }, (_, dc) => [`${r1 + dr},${c1 + dc}`, 'done' as Role])).flat(),
      ),
      overlays: [{ ...target, role: good ? 'good' : 'bad', label: `= ${value}` }],
      work: [{ text: name, role: 'active' }, { text: `= ${big} - ${top} - ${leftV} + ${corner}` }, { text: `= ${value}`, role: good ? 'good' : 'bad' }],
    });
  }

  const workChars = Math.max(20, ...frames.flatMap((f) => [...f.state.work, ...f.state.answers].map((l) => l.text.length + 2)));
  for (const f of frames) f.state.workChars = workChars;
  return { frames, prefix: P, answers };
}

/* ======================================================================================
 * LCA(n, adj, root): an iterative DFS for parent[u][0] and depth, the jump table
 * parent[i][j] = parent[parent[i][j-1]][j-1], then query(u, v) by binary lifting.
 * ====================================================================================== */

export interface LcaInput {
  n: number;
  /** Edges in input order; adj[a] gets b and adj[b] gets a, in this order. */
  edges: Array<[number, number]>;
  root: number;
  queries: Array<[number, number]>;
}

export const LCA_LIMITS = { maxN: 12, maxQueries: 6, queryHi: 20 };

/** "edges 0-1 0-2 1-3 1-4 2-5; lca 3 4, lca 3 5" with optional "root 0" and "n 6". */
export function parseLca(text: string): LcaInput {
  let n: number | undefined;
  let root: number | undefined;
  const edges: Array<[number, number]> = [];
  const queries: Array<[number, number]> = [];
  for (const segment of scriptSegments(text)) {
    const tokens = segment.split(/\s+/).filter(Boolean);
    const head = tokens[0].toLowerCase().replace(/[:=]$/, '');
    const edgeTokens = head === 'edges' || head === 'edge' ? tokens.slice(1) : tokens.every((t) => /^\d+-\d+$/.test(t)) ? tokens : null;
    if (edgeTokens) {
      for (const t of edgeTokens) {
        const m = t.match(/^(\d+)-(\d+)$/);
        if (!m) throw new InputError(`"${t}" is not an edge: write it as "0-1".`);
        edges.push([Number(m[1]), Number(m[2])]);
      }
      continue;
    }
    const call = parseCall(segment);
    if (call && (call.name === 'root' || call.name === 'n') && call.args.length === 1) {
      const v = wholeNumber(call.args[0], 0, LCA_LIMITS.maxN, call.name === 'n' ? 'n' : 'The root');
      if (call.name === 'n') n = v;
      else root = v;
      continue;
    }
    if (call && ['lca', 'query', 'q'].includes(call.name)) {
      if (call.args.length !== 2) throw new InputError(`"${segment}": a query takes two nodes, as in "lca 3 4".`);
      const [u, v] = call.args.map((t) => wholeNumber(t, -9, LCA_LIMITS.queryHi, 'A node'));
      if (u < 0 || v < 0) throw new InputError(`"${segment}": query does not check its nodes, and a negative index wraps around to the end of a Python list. Use nodes from 0.`);
      queries.push([u, v]);
      continue;
    }
    throw new InputError(`Cannot read "${segment}". Write the edges and the queries: "edges 0-1 0-2 1-3; lca 3 2".`);
  }
  const size = n ?? (edges.length === 0 ? 1 : Math.max(...edges.flat()) + 1);
  if (size < 1 || size > LCA_LIMITS.maxN) throw new InputError(`Up to ${LCA_LIMITS.maxN} nodes, so the tree and its table fit on screen (got ${size}).`);
  for (const [a, b] of edges) {
    if (a >= size || b >= size) throw new InputError(`Edge ${a}-${b} uses a node outside 0..${size - 1}.`);
    if (a === b) throw new InputError(`Edge ${a}-${b} is a loop; LCA needs a tree.`);
  }
  if (edges.length !== size - 1) throw new InputError(`A tree on ${size} nodes has ${size - 1} edges (got ${edges.length}). LCA assumes a tree and does not check: other graphs give wrong parents.`);
  const adj: number[][] = Array.from({ length: size }, () => []);
  for (const [a, b] of edges) {
    adj[a].push(b);
    adj[b].push(a);
  }
  const seen = new Set([0]);
  const todo = [0];
  while (todo.length > 0) {
    for (const w of adj[todo.pop()!]) {
      if (!seen.has(w)) {
        seen.add(w);
        todo.push(w);
      }
    }
  }
  if (seen.size !== size) throw new InputError('These edges do not connect every node, so they are not a tree. LCA assumes a tree and does not check it.');
  const r = root ?? 0;
  if (r >= size) throw new InputError(`The root must be a node from 0 to ${size - 1} (got ${r}).`);
  if (queries.length > LCA_LIMITS.maxQueries) throw new InputError(`At most ${LCA_LIMITS.maxQueries} queries, please (got ${queries.length}).`);
  return { n: size, edges, root: r, queries };
}

export const LCA_CODE = [
  'LCA(n, adj, root=0): LOG = max(1, int(log2(n)) + 1); parent = [[-1] * LOG for _ in range(n)]',
  '  stack = [(root, -1, 0)]',
  '  while stack: u, p, d = stack.pop()',
  '    if visited[u]: continue',
  '    visited[u] = True; parent[u][0] = p; depth[u] = d',
  '    for v in adj[u]: if not visited[v]: stack.append((v, u, d + 1))',
  '  for j in range(1, LOG): for i in range(n):',
  '    if parent[i][j-1] != -1: parent[i][j] = parent[parent[i][j-1]][j-1]',
  'query(u, v): if depth[u] < depth[v]: u, v = v, u',
  '  diff = depth[u] - depth[v]',
  '  for i in range(LOG): if (diff >> i) & 1: u = parent[u][i]',
  '  if u == v: return u',
  '  for i in range(LOG - 1, -1, -1):',
  '    if parent[u][i] != parent[v][i]: u = parent[u][i]; v = parent[v][i]',
  '  return parent[u][0]',
];

const ordinal = (k: number) => `${k}${k === 1 ? 'st' : k === 2 ? 'nd' : 'th'}`;

export type LcaStep = ['lift', number, number] | ['down', number, number, number];
export type LcaAnswer = [number | [string, string], LcaStep[]];

export interface LcaRun {
  frames: Array<Frame<LcaState>>;
  log: number;
  pops: Array<[number, number, number]>;
  depth: number[];
  parent: number[][];
  answers: LcaAnswer[];
}

export function lcaTrace(input: LcaInput): LcaRun {
  const { n, edges, root, queries } = input;
  const adj: number[][] = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    adj[a].push(b);
    adj[b].push(a);
  }
  const LOG = Math.max(1, Math.floor(Math.log2(n)) + 1);
  const parent = Array.from({ length: n }, () => Array<number>(LOG).fill(-1));
  const depth = Array<number>(n).fill(0);
  const visited = Array<boolean>(n).fill(false);
  const written = Array.from({ length: n }, () => Array<boolean>(LOG).fill(false));
  const pops: Array<[number, number, number]> = [];
  const answers: LcaAnswer[] = [];
  const answerLines: OkText[] = [];
  const frames: Array<Frame<LcaState>> = [];
  let lookups = 0;

  // The tree that the DFS will find (unique for a tree and a root), for a stable layout.
  const treeParent = Array<number>(n).fill(-1);
  const order = [root];
  const seen = new Set([root]);
  for (let k = 0; k < order.length; k++) {
    for (const w of adj[order[k]]) {
      if (!seen.has(w)) {
        seen.add(w);
        treeParent[w] = order[k];
        order.push(w);
      }
    }
  }
  const children = Array.from({ length: n }, (_, u) => adj[u].filter((w) => treeParent[w] === u));

  const stack: Array<[number, number, number]> = [[root, -1, 0]];
  interface SnapOpts {
    nodes?: Record<number, Role>;
    cells?: Record<string, Role>;
    jumps?: LcaState['jumps'];
    pills?: LcaState['pills'];
    work?: OkText[];
    vars?: Array<[string, string | number]>;
  }
  const snap = (line: number | undefined, caption: string, o: SnapOpts = {}) => {
    frames.push({
      line,
      caption,
      vars: [...(o.vars ?? []), ['n', n], ['LOG', LOG], ['table lookups by queries', lookups]],
      state: {
        label: `Tree on ${n} nodes rooted at ${root}; parent table ${parent.map((row, i) => `${i}:[${row.join(',')}]`).join(' ')}`,
        n,
        log: LOG,
        root,
        children,
        visited: [...visited],
        nodeRoles: o.nodes ?? {},
        depth: depth.map((d, i) => (visited[i] ? d : null)),
        table: parent.map((row, i) => row.map((v, j) => ({ value: v, written: written[i][j] }))),
        cellRoles: o.cells ?? {},
        jumps: o.jumps ?? [],
        pills: o.pills ?? [],
        stack: stack.map(([a, b, c]) => `(${a}, ${b}, ${c})`),
        work: o.work ?? [],
        answers: answerLines.map((l) => ({ ...l })),
        answerRows: queries.length,
        workChars: 1,
      },
    });
  };

  snap(
    0,
    `LCA(${n}, adj, root=${root}): LOG = max(1, int(log2(${n})) + 1) = ${LOG}, so each node gets ${LOG} jump${LOG === 1 ? '' : 's'}: to its ${Array.from({ length: LOG }, (_, j) => ordinal(2 ** j)).join(', ')} ancestor. ` +
      'Every entry starts at -1 (no such ancestor). An iterative DFS from the root fills the first column and the depths.',
    { nodes: { [root]: 'compare' } },
  );

  while (stack.length > 0) {
    const [u, p, d] = stack.pop()!;
    pops.push([u, p, d]);
    if (visited[u]) {
      snap(3, `pop (${u}, ${p}, ${d}): ${u} was already visited, so skip it.`, { nodes: { [u]: 'muted' } });
      continue;
    }
    visited[u] = true;
    parent[u][0] = p;
    written[u][0] = true;
    depth[u] = d;
    const pushed: number[] = [];
    for (const v of adj[u]) {
      if (!visited[v]) {
        stack.push([v, u, d + 1]);
        pushed.push(v);
      }
    }
    snap(
      5,
      `pop (${u}, ${p}, ${d}): visit ${u}, so parent[${u}][0] = ${p}${p === -1 ? ' (the root has none)' : ''} and depth[${u}] = ${d}. ` +
        (pushed.length
          ? `Push its unvisited neighbour${pushed.length > 1 ? 's' : ''} ${pushed.join(', ')}; the last one pushed is popped next.`
          : `${u} has no unvisited neighbour: a leaf.`),
      { nodes: { [u]: 'active', ...Object.fromEntries(pushed.map((v) => [v, 'compare' as Role])) }, cells: { [`${u},0`]: 'active' }, vars: [['u', u], ['depth', d]] },
    );
  }

  for (let j = 1; j < LOG; j++) {
    for (let i = 0; i < n; i++) {
      const mid = parent[i][j - 1];
      written[i][j] = true;
      if (mid === -1) {
        snap(7, `parent[${i}][${j - 1}] is -1: ${i} has no ancestor ${2 ** (j - 1)} level${j === 1 ? '' : 's'} up, so parent[${i}][${j}] stays -1.`, {
          nodes: { [i]: 'compare' },
          cells: { [`${i},${j - 1}`]: 'compare', [`${i},${j}`]: 'muted' },
          vars: [['j', j], ['i', i]],
        });
        continue;
      }
      parent[i][j] = parent[mid][j - 1];
      const target = parent[i][j];
      snap(
        7,
        `parent[${i}][${j}] = parent[parent[${i}][${j - 1}]][${j - 1}] = parent[${mid}][${j - 1}] = ${target}: ` +
          (target === -1
            ? `${mid} has no ancestor ${2 ** (j - 1)} level${j === 1 ? '' : 's'} up, so ${i} has none ${2 ** j} levels up either.`
            : `a jump of ${2 ** j} is two jumps of ${2 ** (j - 1)}, both already in the table.`),
        {
          nodes: { [i]: 'compare', [mid]: 'compare', ...(target >= 0 ? { [target]: 'active' } : {}) },
          cells: { [`${i},${j - 1}`]: 'compare', [`${mid},${j - 1}`]: 'compare', [`${i},${j}`]: 'active' },
          jumps:
            target >= 0
              ? [
                  { from: i, to: mid, label: '', role: 'compare' },
                  { from: mid, to: target, label: '', role: 'compare' },
                  { from: i, to: target, label: `${2 ** j}`, role: 'active' },
                ]
              : [{ from: i, to: mid, label: `${2 ** (j - 1)}`, role: 'compare' }],
          vars: [['j', j], ['i', i]],
        },
      );
    }
  }

  snap(undefined, `Built: ${n} ${X} ${LOG} entries in O(n log n). A query now climbs by powers of two, at most ${LOG} jumps per phase, instead of one parent at a time.`);

  for (const [qu, qv] of queries) {
    const name = `query(${qu}, ${qv})`;
    const steps: LcaStep[] = [];
    if (qu >= n || qv >= n) {
      const bad = qu >= n ? qu : qv;
      answers.push([INDEX_ERROR, steps]);
      answerLines.push({ text: `${name}: IndexError`, role: 'bad' });
      snap(8, `${name}: depth[${bad}] does not exist (the nodes are 0..${n - 1}): IndexError: list index out of range.`, {
        work: [{ text: name, role: 'active' }, { text: `  depth[${bad}]`, role: 'bad' }, { text: '  IndexError: list index out of range', role: 'bad' }],
      });
      continue;
    }
    let u = qu;
    let v = qv;
    const pills = (): LcaState['pills'] => [
      { name: 'u', at: u, role: 'active' },
      { name: 'v', at: v, role: 'compare' },
    ];
    const swapped = depth[u] < depth[v];
    if (swapped) [u, v] = [v, u];
    snap(
      8,
      `${name}: depth[${qu}] = ${depth[qu]}, depth[${qv}] = ${depth[qv]}. ` + (swapped ? `${qu} is the shallower one, so swap: u = ${u} is now the deeper node.` : `u = ${u} is at least as deep as v = ${v}.`),
      { pills: pills(), nodes: { [u]: 'active', [v]: 'compare' }, work: [{ text: name, role: 'active' }, { text: `  u = ${u}, v = ${v}` }] },
    );
    const diff = depth[u] - depth[v];
    snap(9, `diff = ${depth[u]} - ${depth[v]} = ${diff} = ${diff.toString(2)} in binary: u climbs ${diff} level${diff === 1 ? '' : 's'}, one jump per 1 bit.`, {
      pills: pills(),
      work: [{ text: name, role: 'active' }, { text: `  diff = ${diff} = 0b${diff.toString(2)}` }],
      vars: [['diff', diff]],
    });
    const trail: LcaState['jumps'] = [];
    for (let i = 0; i < LOG; i++) {
      steps.push(['lift', i, u]);
      if ((diff >> i) & 1) {
        const to = parent[u][i];
        lookups += 1;
        trail.push({ from: u, to, label: `${2 ** i}`, role: 'active' });
        snap(10, `Bit ${i} of diff is 1: u jumps ${2 ** i} level${i === 0 ? '' : 's'} up, from ${u} to parent[${u}][${i}] = ${to}: one lookup.`, {
          pills: [
            { name: 'u', at: to, role: 'active' },
            { name: 'v', at: v, role: 'compare' },
          ],
          cells: { [`${u},${i}`]: 'active' },
          jumps: trail.map((t, k) => ({ ...t, role: k === trail.length - 1 ? 'active' : 'muted' })),
          work: [{ text: name, role: 'active' }, { text: `  u = parent[${u}][${i}] = ${to}` }],
          vars: [['i', i], ['diff', diff]],
        });
        u = to;
      } else {
        snap(10, `Bit ${i} of diff is 0: no jump of ${2 ** i}.`, { pills: pills(), jumps: trail.map((t) => ({ ...t, role: 'muted' })), vars: [['i', i], ['diff', diff]] });
      }
    }
    let result: number;
    if (u === v) {
      result = u;
      snap(11, `u and v are both at ${u} now: v was an ancestor of the deeper node, so the answer is ${u}.`, {
        pills: pills(),
        nodes: { [u]: 'good' },
        jumps: trail.map((t) => ({ ...t, role: 'muted' })),
        work: [{ text: name, role: 'active' }, { text: `  u == v: return ${u}` }],
      });
    } else {
      snap(11, `Same depth (${depth[u]}) but different nodes, ${u} and ${v}: climb both together, from the largest jump down, while their ancestors still differ.`, {
        pills: pills(),
        jumps: trail.map((t) => ({ ...t, role: 'muted' })),
      });
      for (let i = LOG - 1; i >= 0; i--) {
        steps.push(['down', i, u, v]);
        const a = parent[u][i];
        const b = parent[v][i];
        lookups += 2;
        if (a !== b) {
          trail.push({ from: u, to: a, label: `${2 ** i}`, role: 'active' }, { from: v, to: b, label: `${2 ** i}`, role: 'active' });
          snap(13, `parent[${u}][${i}] = ${a} and parent[${v}][${i}] = ${b} differ, so the common ancestor is higher still: both jump ${2 ** i} up.`, {
            pills: [
              { name: 'u', at: a, role: 'active' },
              { name: 'v', at: b, role: 'compare' },
            ],
            cells: { [`${u},${i}`]: 'active', [`${v},${i}`]: 'active' },
            jumps: trail.map((t, k) => ({ ...t, role: k >= trail.length - 2 ? 'active' : 'muted' })),
            vars: [['i', i]],
          });
          u = a;
          v = b;
        } else {
          snap(
            13,
            a === -1
              ? `parent[${u}][${i}] and parent[${v}][${i}] are both -1: a jump of ${2 ** i} leaves the tree, so do not take it.`
              : `parent[${u}][${i}] = parent[${v}][${i}] = ${a}: a common ancestor, but maybe not the lowest one, so do not jump.`,
            { pills: pills(), cells: { [`${u},${i}`]: 'compare', [`${v},${i}`]: 'compare' }, nodes: a >= 0 ? { [a]: 'compare' } : {}, jumps: trail.map((t) => ({ ...t, role: 'muted' })), vars: [['i', i]] },
          );
        }
      }
      result = parent[u][0];
      lookups += 1;
    }
    // A plain walk up the parents checks the answer.
    const up = new Set<number>();
    for (let w = qu; w !== -1; w = treeParent[w]) up.add(w);
    let naive = qv;
    while (!up.has(naive)) naive = treeParent[naive];
    answers.push([result, steps]);
    answerLines.push({ text: `${name} = ${result}`, role: naive === result ? 'good' : 'bad' });
    if (u !== v || result !== u) {
      snap(
        14,
        `u = ${u} and v = ${v} are children of the same node: return parent[${u}][0] = ${result}. ` + (naive === result ? 'Walking up one parent at a time gives the same node.' : `A plain walk up gives ${naive}: they disagree.`),
        { pills: pills(), nodes: { [result]: naive === result ? 'good' : 'bad' }, jumps: trail.map((t) => ({ ...t, role: 'muted' })), work: [{ text: name, role: 'active' }, { text: `  return ${result}`, role: naive === result ? 'good' : 'bad' }] },
      );
    }
  }
  const workChars = Math.max(
    30,
    ...frames.flatMap((f) => [...f.state.work, ...f.state.answers].map((l) => l.text.length + 2)),
    ...frames.map((f) => f.state.stack.join(', ').length + 16),
  );
  for (const f of frames) f.state.workChars = workChars;
  return { frames, log: LOG, pops, depth, parent, answers };
}
