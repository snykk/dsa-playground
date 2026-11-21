/**
 * Miller-Rabin tracers, drawn with WitnessChains: n - 1 split into d * 2^r one halving at a time,
 * then one row per witness a with its chain a^d, a^(2d), a^(4d), ... mod n, and why the witness
 * passes (the chain starts at 1 or reaches n - 1) or proves n composite (it never reaches n - 1).
 *
 * Mirrors Algorithms/Mathematical_Algorithms/Number_Theory/Miller_Rabin_Primality_Test/Python/miller_rabin.py:
 *   miller_rabin(n, k=5)           False for n < 2, True for 2 and 3, False for even n; d, r with
 *                                  n - 1 = d * 2^r; k times a = random.randrange(2, n - 1),
 *                                  x = pow(a, d, n), pass on 1 or n - 1, else square up to r - 1
 *                                  times and pass on n - 1, else return False; then True
 *   miller_rabin_deterministic(n)  the same checks with the bases 2, 3, 5, ..., 37 (a >= n skipped)
 * (is_prime_miller_rabin repeats the first checks and calls miller_rabin.)
 * The random draws are Python's: random.Random(seed) ported bit for bit (randomizedDraws.ts,
 * several 32-bit words for ranges past 2^32), as if random.seed(seed) had run before the calls;
 * one generator serves every number of a script, as the module's random does.
 * Golden fixtures (__fixtures__/numberTheory.json, sections "millerRabin" and
 * "millerRabinDeterministic") pin every draw, every pow(...) call with its value and the verdicts.
 *
 * Input: "561, 97, 2047; k 5; seed 1"   (n up to 24 digits; k from 1 to 16, Python's default 5)
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { StripData, StripItem } from '../ui/molecules/Strip';
import { abbreviate, parseBig, segments, type StripSlot } from './numberTheoryCommon';
import { PyRandom } from './randomizedDraws';

export interface MrInput {
  numbers: bigint[];
  k: number;
  seed: number;
}

export const MR_LIMITS = { maxN: 10n ** 24n - 1n, maxNumbers: 4, maxK: 16, maxFrames: 2000 };
export const MR_BASES = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n];
/** Below this bound no composite passes all twelve bases (the docstring's limit). */
export const MR_BOUND = 318665857834031151167461n;

export type MrVariant = 'random' | 'deterministic';

/** Parse "561, 97; k 5; seed 1". The deterministic test accepts k and seed and ignores them. */
export function parseMillerRabin(text: string, variant: MrVariant): MrInput {
  const numbers: bigint[] = [];
  let k: number | undefined;
  let seed: number | undefined;
  for (const segment of segments(text)) {
    const kk = segment.match(/^k\s*[:=]?\s*([+-]?\d+)$/i);
    if (kk) {
      if (k !== undefined) throw new InputError('Give the number of witnesses ("k 5") only once.');
      k = Number(kk[1]);
      if (k < 1 || k > MR_LIMITS.maxK) throw new InputError(`k (the number of random witnesses) goes from 1 to ${MR_LIMITS.maxK} here (got ${kk[1]}); Python's default is 5.`);
      continue;
    }
    const ss = segment.match(/^seed\s*[:=]?\s*([+-]?\d+)$/i);
    if (ss) {
      if (seed !== undefined) throw new InputError('Give the seed only once.');
      const v = Number(ss[1]);
      if (!Number.isSafeInteger(v) || Math.abs(v) > 2 ** 32 - 1) throw new InputError('The seed goes from 0 to 4294967295.');
      seed = Math.abs(v);
      continue;
    }
    for (const token of segment.split(/\s+/).filter(Boolean)) {
      const t = token.replace(/^(?:n|test|is_prime)\s*[:=]?/i, '');
      if (!t) continue;
      numbers.push(parseBig(t, 'A number to test', -MR_LIMITS.maxN, MR_LIMITS.maxN, 'at most 24 digits long'));
    }
  }
  if (numbers.length === 0) throw new InputError('Add a number to test, for example "561" or "561, 97; k 5; seed 1".');
  if (numbers.length > MR_LIMITS.maxNumbers) throw new InputError(`At most ${MR_LIMITS.maxNumbers} numbers per run, please (got ${numbers.length}).`);
  const input = { numbers, k: k ?? 5, seed: seed ?? 1 };
  const frames = (variant === 'random' ? mrTrace(input) : mrDetTrace(input)).frames.length;
  if (frames > MR_LIMITS.maxFrames) {
    throw new InputError(`This run would take ${frames} steps, more than ${MR_LIMITS.maxFrames}: test fewer numbers, use a smaller k, or pick numbers whose n - 1 has fewer factors of 2.`);
  }
  return input;
}

/* ---------- pseudocode ---------- */

export const MR_CODE = [
  'miller_rabin(n, k=5):',
  '  if n < 2: return False',
  '  if n == 2 or n == 3: return True',
  '  if n % 2 == 0: return False',
  '  d, r = n - 1, 0',
  '  while d % 2 == 0: d //= 2; r += 1',
  '  for _ in range(k):',
  '    a = random.randrange(2, n - 1)',
  '    x = pow(a, d, n)',
  '    if x == 1 or x == n - 1: continue',
  '    for _ in range(r - 1):',
  '      x = pow(x, 2, n)',
  '      if x == n - 1: break',
  '    else: return False          # never reached n - 1',
  '  return True                   # probably prime',
];

export const MR_DET_CODE = [
  'miller_rabin_deterministic(n):',
  '  if n < 2: return False',
  '  if n == 2 or n == 3: return True',
  '  if n % 2 == 0: return False',
  '  d, r = n - 1, 0',
  '  while d % 2 == 0: d //= 2; r += 1',
  '  for a in [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]:',
  '    if a >= n: continue',
  '    x = pow(a, d, n)',
  '    if x == 1 or x == n - 1: continue',
  '    composite = True',
  '    for _ in range(r - 1):',
  '      x = pow(x, 2, n)',
  '      if x == n - 1: composite = False; break',
  '    if composite: return False',
  '  return True',
];

/* ---------- state ---------- */

export interface ChainCell {
  text: string;
  role?: Role;
}

export interface WitnessRow {
  key: string;
  label: string;
  cells: ChainCell[];
  verdict?: { text: string; role: Role };
  role?: Role;
}

export interface MrState {
  /** Which number of the script: rows of another number never glide into these. */
  test: number;
  n: string;
  /** n - 1 = d * 2^r, as far as the halving has got. */
  split?: { d: string; r: number; role: Role };
  rows: WitnessRow[];
  verdict?: { text: string; role: Role };
  strips: StripData[];
  /** Every strip of the run at its widest (stripSlots in a stabilize step), so the strips keep their room. */
  stripSlots?: StripSlot[];
  /** Same for every frame of a run (stabilizeWitness): rows, chain cells and characters per cell. */
  layout?: { rows: number; cells: number; chars: number };
}

export type MrEvent = ['draw', bigint, bigint, bigint] | ['pow', bigint, bigint, bigint, bigint];

export interface MrStep {
  n: bigint;
  result: boolean;
  events: MrEvent[];
}

export interface MrRun {
  frames: Array<Frame<MrState>>;
  steps: MrStep[];
}

/* ---------- tracer ---------- */

/** pow(b, e, n) for n >= 1, e >= 0, b >= 0, by square and multiply on bigints. */
export function powMod(b: bigint, e: bigint, n: bigint): bigint {
  if (n === 1n) return 0n;
  let result = 1n;
  let base = b % n;
  while (e > 0n) {
    if (e & 1n) result = (result * base) % n;
    base = (base * base) % n;
    e >>= 1n;
  }
  return result;
}

const MAX_CHARS = 11;

function trace(input: MrInput, variant: MrVariant): MrRun {
  const frames: Array<Frame<MrState>> = [];
  const steps: MrStep[] = [];
  const rng = variant === 'random' ? new PyRandom(input.seed) : null;
  const { numbers, k } = input;
  let current = -1;
  let drawCount = 0;
  const results: Array<boolean | undefined> = numbers.map(() => undefined);
  const code = variant === 'random' ? 0 : 1;
  const line = (rnd: number, det: number) => (code === 0 ? rnd : det);

  const numbersStrip = (): StripData => ({
    label: 'Numbers',
    items: numbers.map((n, i): StripItem => {
      const r = results[i];
      return { text: r === undefined || i === current ? String(n) : `${n}: ${r ? 'True' : 'False'}`, role: i === current ? 'active' : i < current ? 'muted' : undefined };
    }),
  });

  numbers.forEach((n, ti) => {
    current = ti;
    const events: MrEvent[] = [];
    const nm1 = n - 1n;
    const ns = String(n);
    const cell = (x: bigint, role?: Role): ChainCell => ({ text: x === 1n ? '1' : x === nm1 ? 'n-1' : abbreviate(String(x), MAX_CHARS), role });
    let rows: WitnessRow[] = [];
    let split: MrState['split'];
    const baseStrip = (states: Record<number, Role>): StripData => ({
      label: 'Bases',
      items: MR_BASES.map((a, i): StripItem => ({ text: String(a), role: states[i] })),
    });
    let extra: StripData | null = variant === 'deterministic' ? baseStrip({}) : null;
    const snap = (ln: number | undefined, caption: string, verdict?: MrState['verdict'], vars: Array<[string, string | number]> = []) => {
      frames.push({
        line: ln,
        caption,
        vars: [['n', ns], ...(split ? [['d, r', `${split.d}, ${split.r}`] as [string, string]] : []), ...vars],
        state: {
          test: ti,
          n: ns,
          split: split ? { ...split } : undefined,
          rows: rows.map((r) => ({ ...r, cells: r.cells.map((c) => ({ ...c })) })),
          verdict,
          strips: [numbersStrip(), ...(extra ? [{ ...extra, items: extra.items.map((it) => ({ ...it })) }] : [])],
        },
      });
    };
    const finish = (result: boolean) => {
      results[ti] = result;
      steps.push({ n, result, events });
    };

    const fn = variant === 'random' ? `miller_rabin(${ns}, ${k})` : `miller_rabin_deterministic(${ns})`;
    if (n < 2n) {
      snap(1, `${fn}: n = ${ns} is below 2, and primes start at 2, so it returns False.`, { text: `${ns}: not prime`, role: 'bad' });
      finish(false);
      return;
    }
    if (n === 2n || n === 3n) {
      snap(2, `${fn}: 2 and 3 are prime, and the witness range 2..n-2 would be empty for them, so the code answers True directly.`, { text: `${ns}: prime`, role: 'good' });
      finish(true);
      return;
    }
    if (n % 2n === 0n) {
      snap(3, `${fn}: ${ns} is even and larger than 2, so 2 divides it: False.`, { text: `${ns} = 2 * ${n / 2n}: composite`, role: 'bad' });
      finish(false);
      return;
    }

    // n - 1 = d * 2^r
    let d = nm1;
    let r = 0;
    split = { d: String(d), r, role: 'active' };
    snap(4, `${fn}: n is odd, so n - 1 = ${nm1} is even. Pull the factors of 2 out of it: d = n - 1, r = 0.${variant === 'deterministic' && (k !== 5 || input.seed !== 1) ? ' (k and seed do not apply here: the bases are fixed.)' : ''}`);
    while (d % 2n === 0n) {
      const before = d;
      d /= 2n;
      r += 1;
      split = { d: String(d), r, role: d % 2n === 0n ? 'active' : 'done' };
      snap(5, `d = ${before} is even: halve it to ${d} and count r = ${r}.${d % 2n === 0n ? '' : ` d = ${d} is odd, so n - 1 = ${d} * 2^${r}: the chain a^d, a^(2d), ... has ${r} term${r === 1 ? '' : 's'}.`}`);
    }

    const witnesses: Array<{ a: bigint; index: number; draw?: string }> = [];
    if (variant === 'random') {
      for (let t = 0; t < k; t++) witnesses.push({ a: 0n, index: t });
    } else {
      MR_BASES.forEach((a, i) => witnesses.push({ a, index: i }));
    }
    const baseRoles: Record<number, Role> = {};
    let verdict: boolean | null = null;
    let skipped: number[] = [];
    const flushSkipped = () => {
      if (!skipped.length) return;
      for (const i of skipped) baseRoles[i] = 'muted';
      extra = baseStrip(baseRoles);
      const list = skipped.map((i) => MR_BASES[i]).join(', ');
      snap(7, `a >= n for ${skipped.length === 1 ? `the base ${list}` : `the bases ${list}`}: a base must lie in 2..n-2, so ${skipped.length === 1 ? 'it is' : 'they are'} skipped (continue).`);
      skipped = [];
    };

    for (const w of witnesses) {
      if (variant === 'random') {
        const a = rng!.randrangeBig(2n, nm1);
        drawCount += 1;
        events.push(['draw', 2n, nm1, a]);
        w.a = a;
        const earlier: StripItem[] = (extra?.items ?? []).map((it) => ({ text: it.text }));
        extra = { label: `Draws from random.Random(${input.seed})`, items: [...earlier, { text: `randrange(2, ${nm1}) = ${a}`, role: 'active' as Role }].slice(-4) };
      } else {
        if (w.a >= n) {
          skipped.push(w.index);
          continue;
        }
        flushSkipped();
        baseRoles[w.index] = 'active';
        extra = baseStrip(baseRoles);
      }
      const a = w.a;
      const row: WitnessRow = { key: `${ti}-${w.index}`, label: `a = ${abbreviate(String(a), MAX_CHARS)}`, cells: [], role: 'active' };
      rows.forEach((rr) => {
        rr.role = undefined;
      });
      rows.push(row);
      let x = powMod(a, d, n);
      events.push(['pow', a, d, n, x]);
      row.cells.push(cell(x, x === 1n || x === nm1 ? 'good' : 'active'));
      const pick =
        variant === 'random'
          ? `a = random.randrange(2, ${nm1}) = ${a} (draw ${drawCount} of random.Random(${input.seed})). `
          : `a = ${a}${w.index === 0 ? ', the first of the twelve bases' : ''}. `;
      if (x === 1n || x === nm1) {
        row.verdict = { text: x === 1n ? 'passes: a^d = 1' : 'passes: a^d = n-1', role: 'good' };
        if (variant === 'deterministic') {
          baseRoles[w.index] = 'done';
          extra = baseStrip(baseRoles);
        }
        snap(
          line(9, 9),
          `${pick}x = pow(${a}, ${d}, ${ns}) = ${x}. ${x === 1n ? 'x = 1, so every later square is 1 as well and the chain never shows a square root of 1 other than 1 and n - 1:' : 'x = n - 1 = -1, and its square is 1, as it must be for a prime:'} a passes, try the next witness.`,
          undefined,
          [['a', String(a)], ['x', String(x)]],
        );
        continue;
      }
      snap(line(8, 8), `${pick}x = pow(${a}, ${d}, ${ns}) = ${x}, which is neither 1 nor n - 1, so square it${r > 1 ? ` up to ${r - 1} time${r - 1 === 1 ? '' : 's'}` : ''} and look for n - 1.${r === 1 ? ' But r = 1 leaves no squaring to try.' : ''}`, undefined, [
        ['a', String(a)],
        ['x', String(x)],
      ]);
      row.cells[0].role = undefined;
      let passed = false;
      for (let i = 1; i < r; i++) {
        const prev = x;
        x = powMod(x, 2n, n);
        events.push(['pow', prev, 2n, n, x]);
        row.cells.forEach((c) => {
          if (c.role === 'active') c.role = undefined;
        });
        row.cells.push(cell(x, x === nm1 ? 'good' : x === 1n ? 'bad' : 'active'));
        if (x === nm1) {
          passed = true;
          row.verdict = { text: `passes at x${i} = n-1`, role: 'good' };
          if (variant === 'deterministic') {
            baseRoles[w.index] = 'done';
            extra = baseStrip(baseRoles);
          }
          snap(line(12, 13), `x = pow(${prev}, 2, ${ns}) = ${x} = n - 1, which is -1 modulo n: the next square would be 1, reached through -1 exactly as a prime allows. a passes (break).`, undefined, [
            ['a', String(a)],
            ['x', String(x)],
          ]);
          break;
        }
        snap(
          line(11, 12),
          x === 1n && prev === 1n
            ? `x = pow(1, 2, ${ns}) = 1: once the chain is at 1 it stays there, so it can no longer reach n - 1.`
            : x === 1n
              ? `x = pow(${prev}, 2, ${ns}) = 1, but ${prev} was neither 1 nor n - 1: it is a square root of 1 that a prime cannot have. The chain can no longer reach n - 1.`
              : `x = pow(${prev}, 2, ${ns}) = ${x}: not n - 1 yet${i < r - 1 ? ', square again' : ''}.`,
          undefined,
          [
            ['a', String(a)],
            ['x', String(x)],
            ['squarings left', r - 1 - i],
          ],
        );
      }
      if (!passed) {
        row.verdict = { text: 'witness: composite', role: 'bad' };
        if (variant === 'deterministic') baseRoles[w.index] = 'bad';
        extra = variant === 'deterministic' ? baseStrip(baseRoles) : extra;
        snap(
          line(13, 14),
          r === 1
            ? `With r = 1 there is no square to take, and a^d = ${x} is neither 1 nor n - 1. If n were prime, (a^d)^2 = a^(n-1) = 1 would make a^d a square root of 1, so 1 or n - 1. So a = ${a} proves ${ns} composite: return False.`
            : `The chain a^d, ..., a^(2^${r - 1} d) never reached n - 1. If n were prime, a^(n-1) = 1 would force it to (the only square roots of 1 modulo a prime are 1 and n - 1). So a = ${a} proves ${ns} composite: return False.`,
          { text: `${ns}: composite`, role: 'bad' },
          [['returns', 'False']],
        );
        verdict = false;
        break;
      }
    }
    if (verdict === null) {
      flushSkipped();
      const tried = rows.length;
      snap(
        line(14, 15),
        variant === 'random'
          ? `All ${k} witnesses passed: ${ns} is probably prime (True). A composite passes one random witness with probability at most 1/4, so all ${k} with probability at most 4^-${k}.`
          : n < MR_BOUND
            ? `All ${tried} bases below n passed: ${ns} is prime (True). No composite below 318665857834031151167461 passes all twelve bases, so the answer is exact.`
            : `All twelve bases passed, so the code returns True. But ${ns} is not below 318665857834031151167461, where twelve bases stop being a proof: this answer can be wrong${n === MR_BOUND ? ', and here it is: 318665857834031151167461 = 399165290221 * 798330580441' : ''}.`,
        variant === 'deterministic' && n >= MR_BOUND
          ? { text: `${ns}: True, but past the bound this is no proof`, role: 'compare' }
          : { text: `${ns}: ${variant === 'random' ? 'probably prime' : 'prime'}`, role: 'good' },
        [['returns', 'True']],
      );
      verdict = true;
    }
    finish(verdict);
  });
  return { frames, steps };
}

export const mrTrace = (input: MrInput): MrRun => trace(input, 'random');
export const mrDetTrace = (input: MrInput): MrRun => trace(input, 'deterministic');
