/**
 * Lucas' theorem tracer: C(n, r) mod a prime p from the base-p digits of n and r.
 *
 * Mirrors Utilities/Optimization_Techniques/Modular_Arithmetic_Tricks/Python/modular_tricks.py:
 * lucas_nCr(n, r, p, fact_obj) with fact_obj = Factorials(p - 1, p) (or another table the reader
 * names). lucas_nCr first checks fact_obj.m == p and len(fact_obj.fact) == p and raises
 * ValueError otherwise, then returns 0 for r < 0 or r > n, then calls _lucas(n, r): r == 0 returns
 * 1; otherwise mul(_lucas(n // p, r // p), fact_obj.nCr(n % p, r % p), p). Python evaluates the
 * recursive call before the small binomial, so the table is read while the calls return, from
 * the highest digit down. The small binomial is fact[a] * inv_fact[b] % p * inv_fact[a-b] % p,
 * or 0 when the digit of r is larger than the digit of n.
 * Python ints are unbounded: n and r are BigInt (up to 10^18). Golden fixtures
 * (__fixtures__/optimizationTechniques.json) pin the table, every call and return of _lucas,
 * every small binomial, and the answer or the ValueError.
 */
import { InputError, type Frame, type Role } from '../core/types';
import type { LucasState } from '../renderers/LucasDigits';
import type { OkText } from '../renderers/OptimizationKit';
import { SYM } from '../ui/symbols';
import { MOD, powerCount } from './precomputation';

const X = SYM.times;

export interface LucasInput {
  n: bigint;
  r: bigint;
  p: number;
  /** Factorials(N) or Factorials(N, M) instead of Factorials(p - 1, p). */
  table: [number] | [number, number] | null;
}

export const LUCAS_LIMITS = { maxP: 37, maxDigits: 18, maxValue: 10n ** 18n, minValue: -99n, maxTableN: 60 };

const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37];

/** The base-p digits of x >= 0, the lowest first (BigInt's toString stops at base 36). */
export function digitsOf(x: bigint, p: number): number[] {
  if (x <= 0n) return [0];
  const out: number[] = [];
  const P = BigInt(p);
  for (let v = x; v > 0n; v /= P) out.push(Number(v % P));
  return out;
}

function bigToken(t: string, what: string): bigint {
  if (!/^[+-]?\d+$/.test(t)) throw new InputError(`"${t}" is not a whole number (${what}).`);
  const v = BigInt(t);
  if (v < LUCAS_LIMITS.minValue || v > LUCAS_LIMITS.maxValue) throw new InputError(`${what} goes from ${LUCAS_LIMITS.minValue} to 10^18 (got ${t}).`);
  return v;
}

/** "C(100, 37) mod 37", "lucas 100 37 37", "n 100 r 37 p 37" or "100 37 37"; then optionally "; table 36" or "; table 40 37". */
export function parseLucas(text: string): LucasInput {
  const [main, ...rest] = text.split(';');
  const m = main.trim();
  let nums: string[] | undefined;
  const cform = m.match(/^C\s*\(\s*([+-]?\d+)\s*,\s*([+-]?\d+)\s*\)\s*(?:mod|%)\s*(\d+)$/i);
  if (cform) nums = [cform[1], cform[2], cform[3]];
  else {
    const named = [...m.matchAll(/\b(n|r|k|p)\s*[:=]?\s*([+-]?\d+)/gi)];
    if (named.length === 3) {
      const get = (keys: string[]) => named.find((x) => keys.includes(x[1].toLowerCase()))?.[2];
      const n = get(['n']);
      const r = get(['r', 'k']);
      const p = get(['p']);
      if (n !== undefined && r !== undefined && p !== undefined) nums = [n, r, p];
    }
    if (!nums) {
      const bare = m.replace(/^(lucas(_ncr)?)\s*\(?/i, '').replace(/\)\s*$/, '');
      const parts = bare.split(/[\s,]+/).filter(Boolean);
      if (parts.length === 3) nums = parts;
    }
  }
  if (!nums) throw new InputError('Write n, r and the prime p, for example "C(100, 37) mod 37" or "lucas 1000 500 13".');
  const n = bigToken(nums[0], 'n');
  const r = bigToken(nums[1], 'r');
  if (!/^\d+$/.test(nums[2])) throw new InputError(`"${nums[2]}" is not a prime.`);
  const p = Number(nums[2]);
  if (!PRIMES.includes(p)) {
    throw new InputError(
      p > LUCAS_LIMITS.maxP && PRIMES.every((q) => p % q !== 0)
        ? `p goes up to ${LUCAS_LIMITS.maxP} here, so its whole table fits on screen (got ${p}).`
        : `p must be a prime up to ${LUCAS_LIMITS.maxP}: Lucas' theorem holds only for a prime, and lucas_nCr does not check it (got ${p}).`,
    );
  }
  const len = digitsOf(n, p).length;
  if (len > LUCAS_LIMITS.maxDigits) throw new InputError(`n has ${len} digits in base ${p}; up to ${LUCAS_LIMITS.maxDigits} fit on screen. Use a smaller n or a larger p.`);
  let table: LucasInput['table'] = null;
  for (const seg of rest.join(';').split(/[;,]/).map((x) => x.trim()).filter(Boolean)) {
    const tm = seg.match(/^(?:table|fact_obj|factorials)\s*\(?\s*(\d+)\s*(?:[\s,]\s*(\d+))?\s*\)?$/i);
    if (!tm) throw new InputError(`Cannot read "${seg}". To pass another table write "table 36" (Factorials(36), modulus 10^9 + 7) or "table 40 37".`);
    const tn = Number(tm[1]);
    if (tn > LUCAS_LIMITS.maxTableN) throw new InputError(`A table up to Factorials(${LUCAS_LIMITS.maxTableN}) here (got ${tn}).`);
    if (tm[2] !== undefined && (Number(tm[2]) < 2 || Number(tm[2]) > MOD)) throw new InputError(`The table modulus goes from 2 to 10^9 + 7 (got ${tm[2]}).`);
    table = tm[2] === undefined ? [tn] : [tn, Number(tm[2])];
  }
  return { n, r, p, table };
}

export const LUCAS_CODE = [
  'fact_obj = Factorials(p - 1, p)          # fact, inv_fact for 0..p-1 (mod p)',
  'lucas_nCr(n, r, p, fact_obj):',
  '  if fact_obj.m != p or len(fact_obj.fact) != p: raise ValueError(...)',
  '  if r < 0 or r > n: return 0',
  '  return _lucas(n, r, p, fact_obj)',
  '_lucas(n, r, p, fact_obj):',
  '  if r == 0: return 1',
  '  return mul(_lucas(n // p, r // p, p, fact_obj),     # the higher digits first',
  '             fact_obj.nCr(n % p, r % p), p)          # then this digit: a lookup',
];

/** One event of the recursion, as the fixture records them (n and r as decimal strings). */
export type LucasEvent = ['call', string, string] | ['ret', string, string, number] | ['ncr', number, number, number];

export interface LucasRun {
  frames: Array<Frame<LucasState>>;
  result: number | null;
  error: [string, string] | null;
  events: LucasEvent[];
  fact?: number[];
  invFact?: number[];
}

/** Factorials(n, m) of modular_tricks.py: fact down, one power(), inv_fact up. */
export function buildFactorials(n: number, m: number): { fact: number[]; inv: number[] } {
  const fact = Array<number>(n + 1).fill(1);
  const inv = Array<number>(n + 1).fill(1);
  for (let i = 1; i <= n; i++) fact[i] = Number((BigInt(fact[i - 1]) * BigInt(i)) % BigInt(m));
  inv[n] = powerCount(fact[n], m - 2, m)[0];
  for (let i = n - 1; i >= 0; i--) inv[i] = Number((BigInt(inv[i + 1]) * BigInt(i + 1)) % BigInt(m));
  return { fact, inv };
}

/**
 * The exact C(n, r) mod p by BigInt (a check by definition), when the smaller of r and n - r is
 * at most 2000: C(10^18, 5) is a product of five numbers and C(1000, 500) has 300 digits, but
 * C(10^18, 10^17) has more digits than there are atoms to write them with.
 */
function exactMod(n: bigint, r: bigint, p: number): number | null {
  if (r < 0n || r > n) return 0;
  const k = r < n - r ? r : n - r;
  if (k > 2000n) return null;
  let num = 1n;
  let den = 1n;
  for (let i = 1n; i <= k; i++) {
    num *= n - k + i;
    den *= i;
  }
  return Number((num / den) % BigInt(p));
}

export function lucasTrace(input: LucasInput): LucasRun {
  const { n, r, p } = input;
  const P = BigInt(p);
  const frames: Array<Frame<LucasState>> = [];
  const events: LucasEvent[] = [];
  const nDigits = digitsOf(n, p);
  const rDigits = digitsOf(r, p);
  const cols = Math.max(nDigits.length, rDigits.length, 1);
  const tableN = input.table ? input.table[0] : p - 1;
  const tableM = input.table ? (input.table[1] ?? MOD) : p;
  const goodTable = tableM === p && tableN + 1 === p;
  const built = goodTable ? buildFactorials(tableN, tableM) : null;
  const tableTitle = input.table ? `fact_obj = Factorials(${input.table.join(', ')})${input.table.length === 1 ? ', modulus 10^9 + 7' : ''}` : `fact_obj = Factorials(${p - 1}, ${p})`;

  // Display state.
  let factShown: Array<string | null> = Array<string | null>(p).fill(null);
  let invShown: Array<string | null> = Array<string | null>(p).fill(null);
  const colResults: Array<OkText | null> = Array<OkText | null>(cols).fill(null);
  const stack: Array<{ n: bigint; r: bigint; ret?: number }> = [];
  let product = '';

  interface SnapOpts {
    nRoles?: Record<number, Role>;
    rRoles?: Record<number, Role>;
    factRoles?: Record<number, Role>;
    invRoles?: Record<number, Role>;
    stackTop?: Role;
    work?: OkText[];
    vars?: Array<[string, string | number]>;
    tableRole?: Role;
  }
  const snap = (line: number | undefined, caption: string, o: SnapOpts = {}) => {
    const done = new Set(colResults.map((c, k) => (c ? k : -1)).filter((k) => k >= 0));
    frames.push({
      line,
      caption,
      vars: [...(o.vars ?? []), ['n', n.toString()], ['r', r.toString()], ['p', p], ['open calls', stack.length]],
      state: {
        label: `Lucas: C(${n}, ${r}) mod ${p}. n in base ${p}: ${[...nDigits].reverse().join(' ')}; r: ${[...rDigits].reverse().join(' ')}.`,
        p,
        cols,
        nText: n.toString(),
        rText: r.toString(),
        nDigits: Array.from({ length: cols }, (_, k) => (k < nDigits.length ? { d: nDigits[k], role: o.nRoles?.[k] ?? (done.has(k) ? ('done' as Role) : undefined) } : null)),
        rDigits: Array.from({ length: cols }, (_, k) => ({ d: k < rDigits.length ? rDigits[k] : 0, role: o.rRoles?.[k] ?? (done.has(k) ? ('done' as Role) : undefined), pad: k >= rDigits.length })),
        results: colResults.map((c) => (c ? { ...c } : null)),
        tableTitle,
        tableOk: goodTable,
        tableRole: o.tableRole,
        fact: [...factShown],
        inv: [...invShown],
        factRoles: o.factRoles ?? {},
        invRoles: o.invRoles ?? {},
        stack: stack.map((s, k) => ({
          text: `_lucas(${s.n}, ${s.r})${s.ret !== undefined ? ` ${SYM.rightArrow} ${s.ret}` : ''}`,
          role: k === stack.length - 1 ? (o.stackTop ?? 'active') : undefined,
        })),
        product,
        work: o.work ?? [],
        maxStack: 1,
      },
    });
  };

  // 1. The table.
  if (built) {
    factShown = built.fact.map(String);
    snap(0, `Factorials(${p - 1}, ${p}): fact[i] = i! mod ${p} for i = 0..${p - 1}, one multiplication per entry. A digit in base ${p} is at most ${p - 1}, so these ${p} entries cover every small binomial Lucas will need.`, {
      factRoles: Object.fromEntries(built.fact.map((_, i) => [i, 'active' as Role])),
      tableRole: 'active',
    });
    invShown[p - 1] = String(built.inv[p - 1]);
    snap(
      0,
      `The one Fermat inverse: inv_fact[${p - 1}] = power(fact[${p - 1}], ${p - 2}, ${p}) = ${built.inv[p - 1]}. (${p - 1})! is ${p - 1}, that is -1 mod ${p} (Wilson's theorem), and -1 is its own inverse.`,
      { factRoles: { [p - 1]: 'compare' }, invRoles: { [p - 1]: 'active' } },
    );
    invShown = built.inv.map(String);
    snap(0, `inv_fact[i] = inv_fact[i+1] ${X} (i+1) % ${p}, from ${p - 2} down to 0: the table is ready, and every C(a, b) with a, b < ${p} is now three lookups.`, {
      invRoles: Object.fromEntries(built.inv.map((_, i) => [i, 'active' as Role])),
    });
  } else {
    snap(
      0,
      `${tableTitle}: a table of ${tableN + 1} entr${tableN === 0 ? 'y' : 'ies'} modulo ${tableM === MOD ? '10^9 + 7' : tableM}, not the Factorials(${p - 1}, ${p}) that Lucas needs.`,
      { tableRole: 'bad' },
    );
  }

  // 2. lucas_nCr's checks.
  if (!goodTable) {
    const reason = tableM !== p ? `fact_obj.m is ${tableM === MOD ? '10^9 + 7' : tableM}, not p = ${p}` : `len(fact_obj.fact) is ${tableN + 1}, not p = ${p}`;
    snap(
      2,
      `ValueError: fact_obj must be Factorials(p - 1, p) for the same prime p. ${reason}. ` +
        (tableM !== p ? 'Binomials modulo another number say nothing about the residue mod p.' : tableN + 1 < p ? `A short table misses the digits up to ${p - 1}.` : `A table that reaches ${p} holds factorials that are 0 mod ${p}, so its inverses are wrong.`) +
        ' lucas_nCr refuses it instead of returning a wrong number.',
      { tableRole: 'bad' },
    );
    return { frames, result: null, error: ['ValueError', 'fact_obj must be Factorials(p - 1, p) for the same prime p'], events };
  }
  snap(2, `lucas_nCr checks the table first: fact_obj.m == ${p} and len(fact_obj.fact) == ${p}, so it was built for this prime and covers every digit.`, { tableRole: 'good' });
  if (r < 0n || r > n) {
    snap(3, `${r < 0n ? 'r is negative' : `r = ${r} > n = ${n}`}: there is no way to choose them, so lucas_nCr returns 0 without calling _lucas.`, {
      work: [{ text: `C(${n}, ${r}) mod ${p} = 0`, role: 'good' }],
    });
    return { frames, result: 0, error: null, events, fact: built!.fact, invFact: built!.inv };
  }
  const { fact, inv } = built!;
  snap(
    4,
    `Write n and r in base ${p}: n = ${[...nDigits].reverse().join(' ')} and r = ${[...rDigits].reverse().join(' ')} (most significant first). ` +
      `Lucas: C(n, r) mod ${p} is the product of C(n_i, r_i) over the digit pairs, so a huge binomial becomes ${cols} small ones.`,
    { vars: [['digits', cols]] },
  );

  // 3. The recursion.
  const lucas = (nn: bigint, rr: bigint, depth: number): number => {
    stack.push({ n: nn, r: rr });
    events.push(['call', nn.toString(), rr.toString()]);
    if (rr === 0n) {
      snap(
        6,
        `_lucas(${nn}, 0): r == 0, so return 1. ` +
          (nn > 0n
            ? `Every digit of r from here up is 0 and C(n_i, 0) = 1, so the remaining digits of n (what is left of it is ${nn}) need no lookup.`
            : 'Both numbers are used up.'),
        { stackTop: 'done', nRoles: Object.fromEntries(Array.from({ length: cols - depth }, (_, k) => [depth + k, 'muted' as Role])), vars: [['depth', depth]] },
      );
      stack[stack.length - 1].ret = 1;
      events.push(['ret', nn.toString(), rr.toString(), 1]);
      stack.pop();
      return 1;
    }
    const a = Number(nn % P);
    const b = Number(rr % P);
    snap(
      7,
      `_lucas(${nn}, ${rr}): r != 0. Its last digits are ${a} and ${b} (n % ${p}, r % ${p}), but Python first evaluates the call for the higher digits, _lucas(${nn / P}, ${rr / P}).`,
      { nRoles: { [depth]: 'compare' }, rRoles: { [depth]: 'compare' }, vars: [['depth', depth]] },
    );
    const high = lucas(nn / P, rr / P, depth + 1);
    // fact_obj.nCr(a, b)
    let small: number;
    if (b > a) {
      small = 0;
      events.push(['ncr', a, b, 0]);
      colResults[depth] = { text: `C(${a},${b})=0`, role: 'bad' };
      snap(8, `Back in _lucas(${nn}, ${rr}): fact_obj.nCr(${a}, ${b}) = 0 because the digit of r (${b}) is larger than the digit of n (${a}). One zero factor makes the whole product 0: p divides C(n, r).`, {
        nRoles: { [depth]: 'bad' },
        rRoles: { [depth]: 'bad' },
        vars: [['depth', depth]],
      });
    } else {
      small = Number((((BigInt(fact[a]) * BigInt(inv[b])) % P) * BigInt(inv[a - b])) % P);
      events.push(['ncr', a, b, small]);
      colResults[depth] = { text: `C(${a},${b})=${small}`, role: 'done' };
      snap(8, `Back in _lucas(${nn}, ${rr}): fact_obj.nCr(${a}, ${b}) = fact[${a}] ${X} inv_fact[${b}] ${X} inv_fact[${a - b}] % ${p} = ${fact[a]} ${X} ${inv[b]} ${X} ${inv[a - b]} % ${p} = ${small}: three lookups.`, {
        nRoles: { [depth]: 'active' },
        rRoles: { [depth]: 'active' },
        factRoles: { [a]: 'compare' },
        invRoles: { [b]: 'compare', [a - b]: 'compare' },
        vars: [['depth', depth]],
      });
    }
    const value = Number(((BigInt(high) % P) * (BigInt(small) % P)) % P);
    stack[stack.length - 1].ret = value;
    product = `${value}`;
    snap(8, `mul(${high}, ${small}, ${p}) = ${value}: _lucas(${nn}, ${rr}) returns ${value} to its caller.`, {
      stackTop: 'done',
      nRoles: { [depth]: small === 0 ? 'bad' : 'done' },
      rRoles: { [depth]: small === 0 ? 'bad' : 'done' },
      vars: [['depth', depth], ['returned', value]],
    });
    events.push(['ret', nn.toString(), rr.toString(), value]);
    stack.pop();
    return value;
  };
  const result = lucas(n, r, 0);
  const exact = exactMod(n, r, p);
  const used = colResults.filter((c): c is OkText => c !== null);
  const zeros = used.filter((c) => c.role === 'bad').length;
  snap(
    undefined,
    `C(${n}, ${r}) mod ${p} = ${result}, from ${used.length} small binomial${used.length === 1 ? '' : 's'}` +
      (zeros === 0
        ? ` read from a table of ${p} entries. `
        : `: ${used.length - zeros} read from the table of ${p} entries and ${zeros} that ${zeros === 1 ? 'is' : 'are'} 0 without a lookup, because a digit of r is larger than the digit of n. `) +
      (exact === null ? `C(${n}, ${r}) itself has far too many digits to compute here; Lucas never needs it.` : exact === result ? `Check: the exact binomial reduced mod ${p} is ${exact}, the same.` : `The exact binomial mod ${p} is ${exact}: they disagree.`),
    { work: [{ text: `C(${n}, ${r}) mod ${p} = ${result}`, role: exact === null || exact === result ? 'good' : 'bad' }] },
  );
  return { frames, result, error: null, events, fact, invFact: inv };
}

/** Every frame of a run keeps one picture size. */
export function stabilizeLucas(frames: Array<Frame<LucasState>>): Array<Frame<LucasState>> {
  const maxStack = Math.max(1, ...frames.map((f) => f.state.stack.length));
  return frames.map((f) => ({ ...f, state: { ...f.state, maxStack } }));
}
