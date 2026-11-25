/**
 * Euler's totient tracers, drawn with TotientView (TotientSieveGrid and TotientFactorView).
 *
 * Mirrors Algorithms/Mathematical_Algorithms/Number_Theory/Eulers_Totient/Python/eulers_totient.py:
 *   linear_sieve(n)          phi = [0] * (n + 1), spf = [0] * (n + 1), primes = [], phi[1] = 1;
 *                            for i in 2..n: if spf[i] == 0: spf[i] = i, phi[i] = i - 1, primes.append(i);
 *                            for p in primes: if p > spf[i] or p > n // i: break; _cross_out(i, p):
 *                            spf[i*p] = p, phi[i*p] = phi[i] * p if p == spf[i] else phi[i] * (p - 1)
 *   prime_factors(n)         p = 2; while p <= n // p: n, k = _divide_out(n, p); if k: factors.append((p, k));
 *                            p += 1; then (n, 1) if n > 1; ValueError for n < 1
 *   phi(n)                   result = n; for p, _ in prime_factors(n): result -= result // p
 *   mod_inverse_euler(a, n)  r = a % n; ValueError unless gcd(r, n) == 1; pow(r, phi(n) - 1, n)
 * Golden fixtures (__fixtures__/numberTheory.json, sections "totientSieve" and "totientFactor")
 * pin every crossing (i, p, phi[i * p]) in order with the tables, and every candidate p with
 * the times it divided, the factors, phi and the inverses.
 *
 * Inputs: "n 30" for the sieve (0 to 100); "phi 360; inverse 7, inverse 6" for one number
 * (n from -9 to 99999, up to 4 inverses with a from -99999 to 99999).
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { OkText } from '../renderers/OptimizationKit';
import { SYM } from '../ui/symbols';
import { callOf, parseNum, pyMod, segments } from './numberTheoryCommon';

const X = SYM.times;

/* ================= the linear sieve ================= */

export interface TotientSieveInput {
  n: number;
}

export const TOTIENT_SIEVE_LIMITS = { minN: 0, maxN: 100 };

export function parseTotientSieve(text: string): TotientSieveInput {
  let n: number | undefined;
  for (const segment of segments(text)) {
    const call = callOf(segment);
    const token = /^[+-]?\d+$/.test(segment) ? segment : call && ['n', 'sieve', 'linear_sieve', 'limit'].includes(call.name) && call.args.length === 1 ? call.args[0] : null;
    if (token === null) throw new InputError(`Cannot read "${segment}". Write the limit, for example "n 30".`);
    if (n !== undefined) throw new InputError('Give the limit n only once.');
    n = parseNum(token, 'The limit n', TOTIENT_SIEVE_LIMITS.minN, TOTIENT_SIEVE_LIMITS.maxN);
  }
  if (n === undefined) throw new InputError('Give the limit, for example "n 30" (the grid shows 0 to n).');
  return { n };
}

export const TOTIENT_SIEVE_CODE = [
  'linear_sieve(n):',
  '  phi = [0] * (n + 1); spf = [0] * (n + 1); primes = []',
  '  if n >= 1: phi[1] = 1',
  '  for i in range(2, n + 1):',
  '    if spf[i] == 0:                     # nothing crossed i out',
  '      spf[i] = i; phi[i] = i - 1; primes.append(i)',
  '    for p in primes:',
  '      if p > spf[i] or p > n // i: break    # i * p > n',
  '      spf[i * p] = p                    # crossed out once, by its smallest prime',
  '      phi[i * p] = phi[i] * p if p == spf[i] else phi[i] * (p - 1)',
  '  return phi, spf, primes, crossings',
];

export interface TotientCell {
  x: number;
  /** The smallest prime factor once known (0 for 0, 1 and numbers not reached yet). */
  spf: number;
  /** phi(x) once computed; null before (and for 0, where phi is undefined). */
  phi: number | null;
  /** For a crossed-out composite: the pair i x p that crossed it out. */
  by: [number, number] | null;
  role?: Role;
}

export interface TotientSieveState {
  kind: 'sieve';
  label: string;
  n: number;
  cells: TotientCell[];
  work: OkText[];
  /** The widest work line of the run, so the picture keeps one size. */
  workChars: number;
  primes: number[];
  crossings: number;
}

/** One crossing as the fixture records it: [i, p, phi[i * p]]. */
export type TotientCrossing = [number, number, number];

export interface TotientSieveRun {
  frames: Array<Frame<TotientSieveState>>;
  crossings: TotientCrossing[];
  /** For every i from 2 to n: the reason its inner loop stopped. */
  stops: Array<[number, 'spf' | 'bound' | 'end']>;
  phi: number[];
  spf: number[];
  primes: number[];
}

/** The writes the Sieve of Eratosthenes makes up to n (sieve_of_eratosthenes.py), for comparison. */
export function eratosthenesWrites(n: number): number {
  const flags = Array.from({ length: Math.max(0, n + 1) }, () => true);
  let writes = 0;
  for (let i = 2; i * i <= n; i++) {
    if (!flags[i]) continue;
    for (let j = i * i; j <= n; j += i) {
      flags[j] = false;
      writes += 1;
    }
  }
  return writes;
}

const plural = (k: number, one: string, many = `${one}s`) => `${k} ${k === 1 ? one : many}`;

export function totientSieveTrace(input: TotientSieveInput): TotientSieveRun {
  const { n } = input;
  const phi = Array.from({ length: n + 1 }, () => 0);
  const spf = Array.from({ length: n + 1 }, () => 0);
  const known = Array.from({ length: n + 1 }, () => false);
  const by: Array<[number, number] | null> = Array.from({ length: n + 1 }, () => null);
  const primes: number[] = [];
  const crossings: TotientCrossing[] = [];
  const stops: TotientSieveRun['stops'] = [];
  const frames: Array<Frame<TotientSieveState>> = [];
  const work: OkText[][] = [];

  const snap = (line: number, caption: string, roles: Record<number, Role>, lines: OkText[], vars: Array<[string, string | number]> = []) => {
    work.push(lines);
    frames.push({
      line,
      caption,
      vars: [['n', n], ...vars, ['crossings', crossings.length]],
      state: {
        kind: 'sieve',
        label: `Linear sieve up to ${n}: ${phi.map((v, x) => (known[x] ? `phi(${x}) = ${v}` : null)).filter(Boolean).join(', ') || 'no value yet'}`,
        n,
        cells: phi.map((v, x) => ({ x, spf: spf[x], phi: known[x] ? v : null, by: by[x], role: roles[x] })),
        work: lines,
        workChars: 0,
        primes: [...primes],
        crossings: crossings.length,
      },
    });
  };

  if (n >= 1) {
    phi[1] = 1;
    known[1] = true;
  }
  snap(
    n >= 1 ? 2 : 1,
    n >= 1
      ? `phi = [0] * ${n + 1} and spf = [0] * ${n + 1}: a 0 in spf means "not crossed out yet". phi[1] = 1, because 1 shares no factor with itself. Index 0 keeps 0: phi(0) is undefined.`
      : 'linear_sieve(0): the tables are [0] and [0], and the loop from 2 never runs. Index 0 keeps 0: phi(0) is undefined.',
    {},
    [{ text: `tables for 0..${n}`, role: 'active' }, { text: n >= 1 ? 'phi[1] = 1' : 'nothing to sieve' }],
  );

  const half = Math.floor(n / 2);
  const tailPrimes: number[] = [];
  for (let i = 2; i <= n; i++) {
    const isPrime = spf[i] === 0;
    if (isPrime) {
      spf[i] = i;
      phi[i] = i - 1;
      known[i] = true;
      primes.push(i);
    }
    const inTail = i > half;
    if (inTail && isPrime) tailPrimes.push(i);
    if (!inTail) {
      snap(
        isPrime ? 5 : 4,
        isPrime
          ? `i = ${i}: spf[${i}] is still 0, so nothing crossed ${i} out and no smaller prime divides it: ${i} is prime. spf[${i}] = ${i}, phi[${i}] = ${i} - 1 = ${i - 1}, and ${i} joins the primes.`
          : `i = ${i}: spf[${i}] = ${spf[i]}, set when ${by[i]![0]} ${X} ${by[i]![1]} crossed it out, so ${i} is composite and phi[${i}] = ${phi[i]} is already known. ${i} still crosses out multiples of its own.`,
        { [i]: 'active' },
        [{ text: `i = ${i}`, role: 'active' }, { text: `spf[${i}] = ${spf[i]}${isPrime ? ' (prime)' : ''}, phi[${i}] = ${phi[i]}` }],
        [['i', i]],
      );
    }
    for (let k = 0; k < primes.length; k++) {
      const p = primes[k];
      if (p > spf[i] || p > Math.floor(n / i)) {
        stops.push([i, p > spf[i] ? 'spf' : 'bound']);
        break;
      }
      const m = i * p;
      const same = p === spf[i];
      spf[m] = p;
      phi[m] = same ? phi[i] * p : phi[i] * (p - 1);
      known[m] = true;
      by[m] = [i, p];
      crossings.push([i, p, phi[m]]);
      // Why the loop stops after this crossing, said with it.
      const next = primes[k + 1];
      let after = '';
      if (next === undefined) {
        after = ` ${p} was the last prime in the list, and a larger one would exceed spf[${i}] = ${spf[i]} anyway: the loop ends.`;
      } else if (next > spf[i]) {
        const later = (i * next) / spf[i];
        after = ` Next p = ${next} > spf[${i}] = ${spf[i]}: stop. ${i} ${X} ${next} = ${i * next} has the smaller prime ${spf[i]}${i * next <= n ? `, so ${later} ${X} ${spf[i]} crosses it out later` : ''}.`;
      } else if (next > Math.floor(n / i)) {
        after = ` Next p = ${next}: ${i} ${X} ${next} = ${i * next} > ${n}, past the end: stop.`;
      }
      const formula = same ? `phi[${i}] ${X} ${p} = ${phi[i]} ${X} ${p} = ${phi[m]}` : `phi[${i}] ${X} (${p} - 1) = ${phi[i]} ${X} ${p - 1} = ${phi[m]}`;
      snap(
        9,
        `${i} ${X} ${p} = ${m}: ${p} <= spf[${i}] = ${spf[i]}, so ${p} is the smallest prime factor of ${m}; spf[${m}] = ${p}. ${same ? `${p} divides ${i}, so phi gains a factor ${p}` : `${p} does not divide ${i}, so phi is multiplied by phi(${p}) = ${p - 1}`}: phi[${m}] = ${formula}.${after}`,
        { [i]: 'compare', [m]: 'active' },
        [
          { text: `i = ${i}, p = ${p}`, role: 'active' },
          { text: `cross out ${i} ${X} ${p} = ${m}` },
          { text: `phi[${m}] = ${formula}` },
        ],
        [['i', i], ['p', p]],
      );
      if (next === undefined) stops.push([i, 'end']);
    }
  }

  if (n >= 2) {
    const from = half + 1;
    const roles: Record<number, Role> = {};
    for (const p of tailPrimes) roles[p] = 'active';
    snap(
      5,
      from === n
        ? `i = ${n}: ${n} ${X} 2 > ${n}, so it crosses nothing out. ${tailPrimes.length ? `spf[${n}] was still 0, so ${n} is prime: phi[${n}] = ${n - 1}.` : `It was crossed out already.`}`
        : `From i = ${from} on, i ${X} 2 > ${n}, so the inner loop stops before crossing anything out. Each remaining i whose spf is still 0 is prime and gets phi[i] = i - 1: ${tailPrimes.length ? tailPrimes.join(', ') : 'none here'}.`,
      roles,
      [{ text: `i = ${from}..${n}: i ${X} 2 > ${n}`, role: 'active' }, { text: tailPrimes.length ? `prime: ${tailPrimes.join(' ')}` : 'no new prime' }],
      [['i', n]],
    );
  }

  const composites = Math.max(0, n - 1) - primes.length;
  const doneRoles: Record<number, Role> = {};
  for (const p of primes) doneRoles[p] = 'done';
  const era = eratosthenesWrites(n);
  snap(
    10,
    n < 4
      ? `Done: there is no composite up to ${n}, so nothing was crossed out. ${plural(primes.length, 'prime')}.`
      : `Done: ${plural(crossings.length, 'crossing')} for the ${plural(composites, 'composite')} up to ${n}, each crossed out exactly once, by its smallest prime factor (the Sieve of Eratosthenes writes ${era} times up to ${n}). ${plural(primes.length, 'prime')}, and phi of every number from 1 to ${n}.`,
    doneRoles,
    [{ text: `${crossings.length} crossings, ${composites} composites`, role: 'done' }, { text: `${primes.length} primes` }],
  );

  // The widest line of the run: a work line, or the list of primes the picture writes under the grid.
  const width = Math.max(primesLine(primes).length, ...work.map((ls) => Math.max(...ls.map((l) => l.text.length))));
  for (const f of frames) f.state.workChars = width;
  return { frames, crossings, stops, phi, spf, primes };
}

/** The line under the grid that lists the primes found so far. */
export const primesLine = (primes: number[]) => `primes: ${primes.length ? primes.join(' ') : 'none yet'}`;

/* ================= phi(n) by trial division ================= */

export interface TotientFactorInput {
  n: number;
  inverses: number[];
}

export const TOTIENT_FACTOR_LIMITS = { minN: -9, maxN: 99999, maxA: 99999, maxInverses: 4 };

export function parseTotientFactor(text: string): TotientFactorInput {
  let n: number | undefined;
  const inverses: number[] = [];
  for (const segment of segments(text)) {
    const call = callOf(segment);
    if (/^[+-]?\d+$/.test(segment) && n === undefined) {
      n = parseNum(segment, 'n', TOTIENT_FACTOR_LIMITS.minN, TOTIENT_FACTOR_LIMITS.maxN);
      continue;
    }
    if (call && ['phi', 'n', 'prime_factors', 'factor'].includes(call.name) && call.args.length === 1) {
      if (n !== undefined) throw new InputError('Give n only once.');
      n = parseNum(call.args[0], 'n', TOTIENT_FACTOR_LIMITS.minN, TOTIENT_FACTOR_LIMITS.maxN);
      continue;
    }
    if (call && ['inverse', 'inv', 'mod_inverse_euler', 'a'].includes(call.name) && call.args.length >= 1) {
      for (const t of call.args) inverses.push(parseNum(t, 'a', -TOTIENT_FACTOR_LIMITS.maxA, TOTIENT_FACTOR_LIMITS.maxA));
      continue;
    }
    throw new InputError(`Cannot read "${segment}". Write n, then inverses to find: "phi 360; inverse 7, inverse 6".`);
  }
  if (n === undefined) throw new InputError('Give n, for example "phi 360" (from 1 to 99999).');
  if (inverses.length > TOTIENT_FACTOR_LIMITS.maxInverses) throw new InputError(`At most ${TOTIENT_FACTOR_LIMITS.maxInverses} inverses, please (got ${inverses.length}).`);
  return { n, inverses };
}

export const TOTIENT_FACTOR_CODE = [
  'prime_factors(n):                       # ValueError for n < 1',
  '  factors = []; p = 2',
  '  while p <= n // p:                    # p * p <= n, without forming p * p',
  '    n, k = _divide_out(n, p)            # divide p out as often as it goes',
  '    if k: factors.append((p, k))',
  '    p += 1',
  '  if n > 1: factors.append((n, 1))      # the one prime left above the root',
  '  return factors',
  'phi(n):',
  '  result = n',
  '  for p, _ in prime_factors(n):',
  '    result -= result // p               # result * (1 - 1/p)',
  '  return result',
  'mod_inverse_euler(a, n):',
  '  r = a % n; if gcd(r, n) != 1: raise ValueError',
  '  return pow(r, phi(n) - 1, n)',
];

/** One candidate box: a single p, or a run of candidates that divide nothing. */
export interface TotientCandidate {
  label: string;
  sub: string;
  role?: Role;
}

/** Width in px of a candidate box: room for its label in the 12px monospace font. */
export const candidateBoxW = (label: string) => Math.max(44, Math.round(label.length * 12 * 0.61 + 16));

/** One rung of the ladder of what is left of n. */
export interface TotientRung {
  value: number;
  /** How the rung was reached from the one before: "/ 2^3", or "prime" for the leftover. */
  via?: string;
  role?: Role;
}

export interface TotientFactorState {
  kind: 'factor';
  label: string;
  n: number;
  ladder: TotientRung[];
  candidates: TotientCandidate[];
  formula: OkText[];
  answers: OkText[];
  /** The most rungs, candidates, formula lines and answers of the run, and the widest line, so the picture keeps one size. */
  slots: { rungs: number; candidatesW: number; formula: number; answers: number; chars: number };
}

/** Everything the fixture pins for one n. */
export interface TotientFactorRun {
  frames: Array<Frame<TotientFactorState>>;
  /** Every candidate p prime_factors tried, with the times it divided: [p, k]. */
  tried: Array<[number, number]>;
  factors: Array<[number, number]> | 'ValueError';
  phi: number | 'ValueError';
  /** [a, inverse] or [a, 'ValueError']. */
  inverses: Array<[number, number | 'ValueError']>;
}

const gcd = (a: number, b: number): number => {
  while (b) [a, b] = [b, a % b];
  return a;
};

/** pow(base, e, m) for m <= 99999: every product stays below 2^53. */
function powMod(base: number, e: number, m: number): number {
  let result = 1 % m;
  let b = base % m;
  while (e > 0) {
    if (e & 1) result = (result * b) % m;
    b = (b * b) % m;
    e = Math.floor(e / 2);
  }
  return result;
}

/** The gap in px between two candidate boxes. */
export const CANDIDATE_GAP = 6;

const powText = (p: number, k: number) => (k === 1 ? `${p}` : `${p}^${k}`);

export function totientFactorTrace(input: TotientFactorInput): TotientFactorRun {
  const { n: n0, inverses } = input;
  const frames: Array<Frame<TotientFactorState>> = [];
  const tried: Array<[number, number]> = [];
  const answersOut: TotientFactorRun['inverses'] = [];
  const ladder: TotientRung[] = [{ value: n0 }];
  const candidates: TotientCandidate[] = [];
  let formula: OkText[] = [];
  const answers: OkText[] = [];

  const snap = (line: number, caption: string, vars: Array<[string, string | number]> = []) => {
    frames.push({
      line,
      caption,
      vars: [['n', n0], ...vars],
      state: {
        kind: 'factor',
        label: `phi(${n0}): what is left of n ${ladder.map((r) => r.value).join(', ')}; ${formula.map((l) => l.text).join('; ')}`,
        n: n0,
        ladder: ladder.map((r) => ({ ...r })),
        candidates: candidates.map((c) => ({ ...c })),
        formula: formula.map((l) => ({ ...l })),
        answers: answers.map((l) => ({ ...l })),
        slots: { rungs: 0, candidatesW: 0, formula: 0, answers: 0, chars: 0 },
      },
    });
  };
  const settle = () => {
    // A prime that divided stays coloured; a candidate that divided nothing, and the one that stopped the loop, go back to idle.
    for (const c of candidates) if (c.role === 'active' || c.role === 'compare') c.role = c.sub.startsWith(X) && c.sub !== `${X}0` ? 'done' : undefined;
    for (const r of ladder) if (r.role === 'active') r.role = undefined;
  };

  if (n0 < 1) {
    ladder[0].role = 'bad';
    answers.push({ text: `phi(${n0}): ValueError`, role: 'bad' });
    snap(0, `prime_factors(${n0}) raises ValueError: phi is defined for n >= 1 only. phi(0) is undefined, and the code says so instead of returning 0 or 1.`);
    for (const a of inverses) answersOut.push([a, 'ValueError']);
    return finish({ frames, tried, factors: 'ValueError', phi: 'ValueError', inverses: answersOut });
  }

  // prime_factors: trial division.
  let left = n0;
  let p = 2;
  const factors: Array<[number, number]> = [];
  ladder[0].role = 'active';
  snap(1, `prime_factors(${n0}): factors = [], p = 2. Candidates are tried while p ${X} p <= what is left of n; the test is written p <= n // p so that it cannot overflow 64 bits in C++ and Go.`, [['p', 2]]);
  let run: number[] = [];
  // What was left of n while the run of candidates was tried: it does not change until one divides.
  let runLeft = left;
  const flushRun = () => {
    if (!run.length) return;
    const [a, b] = [run[0], run[run.length - 1]];
    const left = runLeft;
    settle();
    candidates.push({ label: a === b ? `${a}` : `${a}-${b}`, sub: `${X}0`, role: 'compare' });
    snap(
      3,
      a === b
        ? `p = ${a}: ${a} <= ${left} // ${a} = ${Math.floor(left / a)}, but ${a} does not divide ${left}${a > 3 && !isPrimeSmall(a) ? ` (a composite candidate never does: its prime factors are gone already)` : ''}. p = ${a + 1}.`
        : `p = ${a} to ${b}: none of these ${b - a + 1} candidates divides ${left}${run.some((q) => !isPrimeSmall(q)) ? ' (the composite ones never can: their prime factors are gone already)' : ''}. p = ${b + 1}.`,
      [['p', b + 1]],
    );
    run = [];
  };
  while (p <= Math.floor(left / p)) {
    let k = 0;
    const before = left;
    while (left % p === 0) {
      left /= p;
      k += 1;
    }
    tried.push([p, k]);
    if (k === 0) {
      if (!run.length) runLeft = left;
      run.push(p);
    } else {
      flushRun();
      settle();
      factors.push([p, k]);
      candidates.push({ label: `${p}`, sub: `${X}${k}`, role: 'active' });
      ladder.push({ value: left, via: `/ ${powText(p, k)}`, role: 'active' });
      const chain = [before];
      for (let j = 0, v = before; j < k; j++) chain.push((v /= p));
      snap(
        4,
        `p = ${p}: ${p} <= ${before} // ${p} = ${Math.floor(before / p)}, and ${p} divides ${before} ${k === 1 ? 'once' : k === 2 ? 'twice' : `${k} times`}: ${chain.join(` ${SYM.rightArrow} `)}. Record (${p}, ${k}); what is left is ${left}.`,
        [['p', p], ['k', k]],
      );
    }
    p += 1;
  }
  flushRun();
  settle();
  // The loop test that failed.
  candidates.push({ label: `${p}`, sub: 'stop', role: 'compare' });
  if (left > 1) {
    factors.push([left, 1]);
    ladder.push({ value: 1, via: 'prime', role: 'active' });
  }
  snap(
    6,
    `p = ${p}: ${p} > ${left} // ${p} = ${Math.floor(left / p)}, so ${p} ${X} ${p} > ${left} and the loop stops. ${
      left > 1
        ? `${left} > 1 is left: it has no factor up to its square root, so it is prime. Record (${left}, 1).`
        : n0 === 1
          ? '1 has no prime factor.'
          : `1 is left: every prime factor was divided out.`
    } prime_factors(${n0}) = [${factors.map(([q, k]) => `(${q}, ${k})`).join(', ')}].`,
    [['p', p]],
  );
  settle();

  // phi: the product formula.
  let result = n0;
  formula = [{ text: `result = ${n0}`, role: 'active' }];
  snap(9, `phi(${n0}): result starts at ${n0}, then loses the fraction 1/p of itself for each distinct prime p.`, [['result', result]]);
  for (const [q] of factors) {
    const cut = Math.floor(result / q);
    const next = result - cut;
    formula = formula.map((l) => ({ ...l, role: undefined }));
    formula.push({ text: `p = ${q}: ${result} - ${result} // ${q} = ${next}`, role: 'active' });
    snap(11, `p = ${q}: result -= result // ${q}, that is ${result} ${X} (1 - 1/${q}) = ${result} - ${cut} = ${next}. The division is exact: ${q} divides n, and no earlier step removed it.`, [['p', q], ['result', next]]);
    result = next;
  }
  // The divisor sum, as a check.
  const divisors = divisorsOf(factors);
  const divSum = divisors.reduce((s, d) => s + phiFromFactors(d, factors), 0);
  formula = formula.map((l) => ({ ...l, role: undefined }));
  formula.push({ text: `phi(${n0}) = ${result}`, role: 'good' });
  formula.push({ text: `sum of phi(d), d | ${n0}: ${divSum}`, role: divSum === n0 ? 'good' : 'bad' });
  snap(
    12,
    factors.length
      ? `phi(${n0}) = ${n0} ${factors.map(([q]) => `${X} (1 - 1/${q})`).join(' ')} = ${result}. Check: the ${divisors.length} divisors d of ${n0} have phi(d) adding up to ${divSum}${divSum === n0 ? `, which is ${n0} itself, as it must be` : ''}.`
      : `phi(1) = 1: no prime factor, so result stays 1. The only divisor of 1 is 1, and phi(1) = 1.`,
    [['result', result]],
  );

  // mod_inverse_euler for each a.
  for (const a of inverses) {
    const r = pyMod(a, n0);
    const g = gcd(r, n0);
    if (g !== 1) {
      answersOut.push([a, 'ValueError']);
      answers.push({ text: `inverse of ${a}: ValueError, gcd = ${g}`, role: 'bad' });
      snap(14, `mod_inverse_euler(${a}, ${n0}): gcd(${r}, ${n0}) = ${g}, not 1, so ${a} has no inverse modulo ${n0}: ${r} ${X} k mod ${n0} is always a multiple of ${g}, never 1. ValueError.`, [['a', a]]);
      continue;
    }
    const inv = powMod(r, result - 1, n0);
    answersOut.push([a, inv]);
    answers.push({ text: `inverse of ${a} = ${r}^${result - 1} mod ${n0} = ${inv}`, role: 'good' });
    snap(
      15,
      n0 === 1
        ? `mod_inverse_euler(${a}, 1): every number is 0 modulo 1, so the answer is ${r}^0 mod 1 = 0.`
        : `mod_inverse_euler(${a}, ${n0}): gcd(${r}, ${n0}) = 1, so by Euler's theorem ${r}^${result} = 1 (mod ${n0}), and ${r}^(${result} - 1) mod ${n0} = ${inv} is the inverse: ${r} ${X} ${inv} = ${r * inv} = ${Math.floor((r * inv) / n0)} ${X} ${n0} + 1.`,
      [['a', a]],
    );
  }

  return finish({ frames, tried, factors, phi: result, inverses: answersOut });
}

/** Give every frame room for the largest ladder, candidate row, formula and answers of the run. */
function finish(run: TotientFactorRun): TotientFactorRun {
  const slots = { rungs: 1, candidatesW: 0, formula: 0, answers: 0, chars: 0 };
  for (const f of run.frames) {
    const s = f.state;
    slots.rungs = Math.max(slots.rungs, s.ladder.length);
    slots.candidatesW = Math.max(slots.candidatesW, s.candidates.reduce((w, c) => w + candidateBoxW(c.label) + CANDIDATE_GAP, 0));
    slots.formula = Math.max(slots.formula, s.formula.length);
    slots.answers = Math.max(slots.answers, s.answers.length);
    slots.chars = Math.max(slots.chars, ...s.formula.map((l) => l.text.length), ...s.answers.map((l) => l.text.length));
  }
  for (const f of run.frames) f.state.slots = slots;
  return run;
}

function isPrimeSmall(v: number): boolean {
  if (v < 2) return false;
  for (let d = 2; d * d <= v; d++) if (v % d === 0) return false;
  return true;
}

function divisorsOf(factors: Array<[number, number]>): number[] {
  let ds = [1];
  for (const [p, k] of factors) {
    const next: number[] = [];
    for (const d of ds) for (let e = 0, v = d; e <= k; e++, v *= p) next.push(v);
    ds = next;
  }
  return ds.sort((a, b) => a - b);
}

/** phi(d) for a divisor d of n, from the primes of n. */
function phiFromFactors(d: number, factors: Array<[number, number]>): number {
  let r = d;
  for (const [p] of factors) if (d % p === 0) r -= r / p;
  return r;
}
