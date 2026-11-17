/**
 * Sieve of Eratosthenes tracer, drawn with SieveGrid: the flags 0..n as a grid of numbers; each
 * prime i strikes its multiples from i * i on (a number struck again is written again, as the code
 * does), the outer loop ends once i * i > n, the survivors are the primes, and is_prime_sieve looks
 * numbers up, also outside the list.
 *
 * Mirrors Algorithms/Mathematical_Algorithms/Number_Theory/Sieve_of_Eratosthenes/Python/sieve_of_eratosthenes.py:
 *   sieve_boolean(n)          [False] * (n + 1) for n < 2 (empty for n < 0); else is_prime = [True] * (n + 1),
 *                             is_prime[0] = is_prime[1] = False, and for i in range(2, isqrt(n) + 1):
 *                             if is_prime[i]: for j in range(i * i, n + 1, i): is_prime[j] = False
 *   sieve_of_eratosthenes(n)  the same loop, then [i for i in range(2, n + 1) if is_prime[i]]
 *   is_prime_sieve(k, sieve)  sieve[k] if 0 <= k < len(sieve), else False
 * Golden fixtures (__fixtures__/numberTheory.json, section "sieve") pin the flag of every outer
 * index, every write (i, j) in order, the primes, the flags and every query.
 *
 * Input: "n 50; is 17, is -1, is 51"   (n from -99 to 300, numbers 0 to n in the grid)
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { StripData, StripItem } from '../ui/molecules/Strip';
import { callOf, isqrt, segments, type StripSlot } from './numberTheoryCommon';

/** The horizontal ellipsis, as a code point (sources stay ASCII). */
const SYM_ELLIPSIS = String.fromCodePoint(0x2026);

export interface SieveInput {
  n: number;
  queries: number[];
}

export const SIEVE_LIMITS = { minN: -99, maxN: 300, maxQueries: 8, maxQuery: 999 };

export function parseSieve(text: string): SieveInput {
  let n: number | undefined;
  const queries: number[] = [];
  const int = (t: string, what: string, lo: number, hi: number) => {
    if (!/^[+-]?\d+$/.test(t)) throw new InputError(`"${t}" is not a whole number.`);
    const v = Number(t) || 0;
    if (v < lo || v > hi) throw new InputError(`${what} goes from ${lo} to ${hi} here (got ${t}).`);
    return v;
  };
  for (const segment of segments(text)) {
    const call = callOf(segment);
    if (/^[+-]?\d+$/.test(segment) && n === undefined) {
      n = int(segment, 'n', SIEVE_LIMITS.minN, SIEVE_LIMITS.maxN);
      continue;
    }
    if (call && ['n', 'sieve', 'sieve_boolean', 'sieve_of_eratosthenes', 'limit'].includes(call.name) && call.args.length === 1) {
      if (n !== undefined) throw new InputError('Give the limit n only once.');
      n = int(call.args[0], 'n', SIEVE_LIMITS.minN, SIEVE_LIMITS.maxN);
      continue;
    }
    if (call && ['is', 'is_prime', 'is_prime_sieve', 'query', 'check', 'q'].includes(call.name) && call.args.length >= 1) {
      for (const a of call.args) queries.push(int(a, 'A query', -SIEVE_LIMITS.maxQuery, SIEVE_LIMITS.maxQuery));
      continue;
    }
    throw new InputError(`Cannot read "${segment}". Write the limit, then lookups: "n 50; is 17, is -1, is 51".`);
  }
  if (n === undefined) throw new InputError('Give the limit, for example "n 50" (the grid shows 0 to n).');
  if (queries.length > SIEVE_LIMITS.maxQueries) throw new InputError(`At most ${SIEVE_LIMITS.maxQueries} lookups, please (got ${queries.length}).`);
  return { n, queries };
}

/* ---------- pseudocode ---------- */

export const SIEVE_CODE = [
  'sieve_boolean(n):            # sieve_of_eratosthenes runs the same loop',
  '  if n < 2: return [False] * (n + 1)',
  '  is_prime = [True] * (n + 1)',
  '  is_prime[0] = is_prime[1] = False',
  '  for i in range(2, isqrt(n) + 1):     # ends once i * i > n',
  '    if is_prime[i]:',
  '      for j in range(i * i, n + 1, i):',
  '        is_prime[j] = False',
  '  return is_prime',
  'primes = [i for i in range(2, n + 1) if is_prime[i]]',
  'is_prime_sieve(k, sieve):',
  '  if 0 <= k < len(sieve): return sieve[k]',
  '  return False                # negative, or never sieved',
];

/* ---------- state ---------- */

export interface SieveCell {
  v: number;
  /** False in the list: struck out. */
  crossed: boolean;
  /** The prime that first struck it. */
  by?: number;
  role?: Role;
}

export interface SieveState {
  n: number;
  cols: number;
  cells: SieveCell[];
  work: string[];
  /** A lookup outside the list: the number and why it is False. */
  outside?: { k: number; text: string };
  strips: StripData[];
  /** Every strip of the run at its widest (stripSlots in a stabilize step), so the strips keep their room. */
  stripSlots?: StripSlot[];
}

export interface SieveRun {
  frames: Array<Frame<SieveState>>;
  /** For each outer index: [i, is_prime[i] when checked]. */
  outer: Array<[number, boolean]>;
  /** Every write is_prime[j] = False, in order: [i, j]. */
  writes: Array<[number, number]>;
  primes: number[];
  flags: boolean[];
  queries: Array<[number, boolean]>;
}

/** Columns of the grid: 10 up to 109 (multiples of 2 and 5 line up), 20 beyond. */
export const sieveCols = (n: number) => (n <= 109 ? 10 : 20);

/** At most this many frames per prime: longer runs of multiples are struck a few per frame. */
const FRAMES_PER_PRIME = 12;

export function sieveTrace(input: SieveInput): SieveRun {
  const { n, queries } = input;
  const frames: Array<Frame<SieveState>> = [];
  const outer: SieveRun['outer'] = [];
  const writes: SieveRun['writes'] = [];
  const size = Math.max(0, n + 1);
  const flags: boolean[] = Array.from({ length: size }, () => n >= 2);
  const by: Array<number | undefined> = Array.from({ length: size }, () => undefined);
  const cols = sieveCols(Math.max(n, 0));
  let writesCount = 0;
  let fresh = 0;
  let primesFound: number[] = [];
  const answers: Array<[number, boolean]> = [];
  let currentQuery = -1;

  const queryStrip = (): StripData | null =>
    queries.length
      ? {
          label: 'Lookups',
          items: queries.map((k, i): StripItem => ({ text: i < currentQuery || (i === currentQuery && answers[i]) ? `is_prime_sieve(${k}) = ${answers[i]?.[1] ? 'True' : 'False'}` : `is_prime_sieve(${k})`, role: i === currentQuery ? 'active' : i < currentQuery ? 'muted' : undefined })),
        }
      : null;

  const snap = (line: number | undefined, caption: string, roles: Record<number, Role> = {}, work: string[] = [], outside?: SieveState['outside'], vars: Array<[string, string | number]> = []) => {
    const strips: StripData[] = [];
    if (primesFound.length) {
      // The grid shows every prime; the strip lists the first 15 so a long list does not push the picture away.
      const items: StripItem[] = primesFound.slice(0, 15).map((p) => ({ text: String(p) }));
      if (primesFound.length > 15) items.push({ text: `${SYM_ELLIPSIS} ${primesFound.length - 15} more` });
      strips.push({ label: `Primes (${primesFound.length})`, items });
    }
    const q = queryStrip();
    if (q) strips.push(q);
    frames.push({
      line,
      caption,
      vars: [['n', n], ['writes', writesCount], ['newly struck', fresh], ...vars],
      state: {
        n,
        cols,
        cells: flags.map((f, v) => ({ v, crossed: !f, by: by[v], role: roles[v] })),
        work,
        outside,
        strips,
      },
    });
  };

  if (n < 2) {
    snap(1, `sieve_boolean(${n}): n < 2, so there is no prime to find and it returns [False] * (n + 1)${n < 0 ? `, which is the empty list for n = ${n}` : ` = [${Array.from({ length: n + 1 }, () => 'False').join(', ')}]`}. sieve_of_eratosthenes(${n}) returns [].`, {}, [`n = ${n} < 2`]);
  } else {
    // Show the flags as all True for a moment, then 0 and 1 struck.
    flags[0] = true;
    flags[1] = true;
    snap(2, `is_prime = [True] * ${n + 1}: every number from 0 to ${n} starts out marked as a candidate prime.`, {}, [`${n + 1} flags`]);
    flags[0] = false;
    flags[1] = false;
    snap(3, 'is_prime[0] = is_prime[1] = False: 0 and 1 are not prime by definition.', { 0: 'active', 1: 'active' }, ['0 and 1 struck']);
    const top = isqrt(n);
    for (let i = 2; i <= top; i++) {
      outer.push([i, flags[i]]);
      if (!flags[i]) {
        snap(5, `i = ${i}: is_prime[${i}] is False, because ${by[i]} struck it (${i} = ${by[i]} * ${i / by[i]!}). Its multiples are multiples of ${by[i]} too and are already struck, so the loop skips it.`, { [i]: 'compare' }, [`i = ${i}: struck by ${by[i]}`], undefined, [['i', i]]);
        continue;
      }
      const multiples: number[] = [];
      for (let j = i * i; j <= n; j += i) multiples.push(j);
      // The strip lists i from the frame that calls it prime, as the grid colours it.
      primesFound = [...primesFound, i];
      snap(
        5,
        `i = ${i}: is_prime[${i}] is still True, so ${i} is prime (no smaller prime divides it). Strike its multiples from ${i} * ${i} = ${i * i}: a smaller multiple ${i} * k with k < ${i} has the smaller factor k and was struck already.`,
        { [i]: 'done', [i * i]: 'compare' },
        [`i = ${i} is prime`, `start at ${i}*${i} = ${i * i}`],
        undefined,
        [['i', i]],
      );
      const group = Math.ceil(multiples.length / FRAMES_PER_PRIME);
      for (let s = 0; s < multiples.length; s += group) {
        const batch = multiples.slice(s, s + group);
        const roles: Record<number, Role> = { [i]: 'done' };
        const again: number[] = [];
        for (const j of batch) {
          writes.push([i, j]);
          writesCount += 1;
          if (flags[j]) {
            flags[j] = false;
            by[j] = i;
            fresh += 1;
            roles[j] = 'active';
          } else {
            again.push(j);
            roles[j] = 'compare';
          }
        }
        const list = batch.join(', ');
        const againText = again.length ? ` ${again.length === batch.length && batch.length === 1 ? `${again[0]} was already struck by ${by[again[0]]}; the code writes False again anyway, it does not check.` : `${again.join(', ')} ${again.length === 1 ? 'was' : 'were'} already struck by a smaller prime; the code writes False again anyway.`}` : '';
        snap(
          7,
          `${batch.length === 1 ? `is_prime[${list}] = False` : `is_prime[j] = False for j = ${list}`}: ${batch.length === 1 ? `${batch[0]} = ${i} * ${batch[0] / i}` : `each is ${i} times something`}, so not prime.${againText}`,
          roles,
          [`i = ${i}: j = ${batch[0]}${batch.length > 1 ? `..${batch[batch.length - 1]}` : ''}`, `${writesCount} writes, ${fresh} new`],
          undefined,
          [['i', i], ['j', batch[batch.length - 1]]],
        );
      }
    }
    const next = top + 1;
    const survivors: Record<number, Role> = {};
    flags.forEach((f, v) => {
      if (f) survivors[v] = 'done';
    });
    snap(
      4,
      `The next i would be ${next}, but range(2, isqrt(${n}) + 1) stops at ${top}: ${next} * ${next} = ${next * next} > ${n}. Every composite up to ${n} has a prime factor at most ${top} and is struck, so every number still marked is prime.`,
      { ...survivors, ...(next <= n ? { [next]: 'compare' } : {}) },
      [`${next} * ${next} = ${next * next} > ${n}`, `${writesCount} writes, ${fresh} new`],
    );
    primesFound = flags.flatMap((f, v) => (f ? [v] : []));
    const good: Record<number, Role> = {};
    for (const p of primesFound) good[p] = 'done';
    snap(9, `[i for i in range(2, ${n + 1}) if is_prime[i]]: sieve_of_eratosthenes(${n}) returns these ${primesFound.length} primes. The loop wrote ${writesCount} flags; ${fresh} of them struck a number for the first time.`, good, [`${primesFound.length} primes up to ${n}`]);
  }

  queries.forEach((k, qi) => {
    currentQuery = qi;
    const inside = k >= 0 && k < size;
    const result = inside ? flags[k] : false;
    answers[qi] = [k, result];
    if (inside) {
      snap(11, `is_prime_sieve(${k}, sieve): 0 <= ${k} < ${size}, so it returns sieve[${k}] = ${result ? 'True' : 'False'}${result ? '' : by[k] ? ` (${k} was struck by ${by[k]})` : ` (${k} < 2)`}.`, { [k]: result ? 'good' : 'bad' }, [`is_prime_sieve(${k}) = ${result ? 'True' : 'False'}`]);
    } else {
      snap(
        12,
        k < 0
          ? `is_prime_sieve(${k}, sieve): ${k} is negative, so the range check fails and it returns False. Without the check, Python's sieve[${k}] would wrap around to ${size + k >= 0 ? `sieve[${size + k}]` : 'an IndexError'}.`
          : `is_prime_sieve(${k}, sieve): ${k} >= len(sieve) = ${size}, so ${k} was never sieved and the function returns False, which says nothing about whether ${k} is prime.`,
        {},
        [`is_prime_sieve(${k}) = False`],
        { k, text: k < 0 ? 'negative: False' : `beyond ${size - 1}: False` },
      );
    }
  });
  currentQuery = queries.length;

  return { frames, outer, writes, primes: n < 2 ? [] : primesFound, flags: flags.slice(0, size), queries: answers };
}
