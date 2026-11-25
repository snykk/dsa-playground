import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { SYM } from '../ui/symbols';
import { BINOMIAL_CODE, BINOMIAL_LIMITS, binomialTrace, parseBinomial, powerCount, type BinomialInput } from './combinatorics';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/mathAndProblemTypes.json', import.meta.url), 'utf8'));

/** A seeded generator, so the caption scan is the same on every run. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

/** The exact C(n, k) by BigInt (an independent reference). */
function exactBinomial(n: number, k: number): bigint {
  if (k < 0 || k > n) return 0n;
  let v = 1n;
  for (let i = 1; i <= k; i++) v = (v * BigInt(n - k + i)) / BigInt(i);
  return v;
}

const isPrime = (n: number) => {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
};

const modPow = (b: bigint, e: bigint, m: bigint) => {
  let r = 1n % m;
  b %= m;
  while (e > 0n) {
    if (e & 1n) r = (r * b) % m;
    b = (b * b) % m;
    e >>= 1n;
  }
  return r;
};

const X = SYM.times;

let checked = 0;

/** Every sum, product, power and remainder a caption writes must be right. */
function arithmeticIssues(caption: string): string[] {
  const out: string[] = [];
  // How many expressions the scan looked at, so that a pattern which never matches fails the test.
  const count = (re: RegExp) => (checked += [...caption.matchAll(re)].length);
  count(/(\d+) \+ (\d+) = (\d+)|(\d+) mod (\d+) = (\d+)|C\((-?\d+), (-?\d+)\) = (\d+)/g);
  count(new RegExp(`(\\d+) ${X} (\\d+) (% (\\d+) )?= (\\d+)`, 'g'));
  for (const m of caption.matchAll(/(?<![\d)] ?)(\d+) \+ (\d+) = (\d+)/g)) if (Number(m[1]) + Number(m[2]) !== Number(m[3])) out.push(m[0]);
  for (const m of caption.matchAll(new RegExp(`(\\d+) ${X} (\\d+) % (\\d+) = (\\d+)`, 'g'))) {
    if ((BigInt(m[1]) * BigInt(m[2])) % BigInt(m[3]) !== BigInt(m[4])) out.push(m[0]);
  }
  for (const m of caption.matchAll(new RegExp(`(\\d+) ${X} (\\d+) = (\\d+)`, 'g'))) if (Number(m[1]) * Number(m[2]) !== Number(m[3])) out.push(m[0]);
  for (const m of caption.matchAll(/(\d+)\^(\d+) mod (\d+) = (\d+)/g)) if (modPow(BigInt(m[1]), BigInt(m[2]), BigInt(m[3])) !== BigInt(m[4])) out.push(m[0]);
  for (const m of caption.matchAll(/(?<![\^\d] ?)(\d+) mod (\d+) = (\d+)/g)) if (Number(m[1]) % Number(m[2]) !== Number(m[3])) out.push(m[0]);
  for (const m of caption.matchAll(/C\((-?\d+), (-?\d+)\) = (\d+)(?![\d ]*[+%])/g)) if (exactBinomial(Number(m[1]), Number(m[2])) !== BigInt(m[3])) out.push(m[0]);
  for (const m of caption.matchAll(/C\((\d+), (\d+)\) = C\((\d+), (\d+)\) \+ C\((\d+), (\d+)\)/g)) {
    const [r, j, a1, b1, a2, b2] = m.slice(1).map(Number);
    if (a1 !== r - 1 || b1 !== j - 1 || a2 !== r - 1 || b2 !== j) out.push(m[0]);
  }
  return out;
}

/** Wrong plurals and leftovers of string building. */
function wordingIssues(caption: string): string[] {
  const out: string[] = [];
  if (/undefined|NaN|\bnull\b|\[object/.test(caption)) out.push('a value did not print');
  if (/\b1 (additions|products|cells|queries|answers)\b/.test(caption)) out.push('plural after 1');
  if (/\b(0|[2-9]|\d{2,}) (addition|product|cell|query|answer)\b(?![s-])/.test(caption)) out.push('singular after a count');
  if (/\s{2}|\s[.,:]/.test(caption)) out.push('stray space');
  if (/\.\./.test(caption.replace(/\d\.\.\d/g, ''))) out.push('double period');
  return out;
}

const answerOf = (v: number | string) => v;

describe('binomialTrace', () => {
  it('reproduces every golden fixture: the sums in order, the tables, the power, the answers and the errors', () => {
    expect(fixtures.combinatorics.length).toBe(60);
    for (const c of fixtures.combinatorics) {
      const input: BinomialInput = { n: c.n, p: c.p, queries: c.queries.map(([n, k]: [number, number]) => ({ n, k })) };
      const run = binomialTrace(input);
      const tag = JSON.stringify(c.queries) + ` n = ${c.n}, p = ${c.p}`;
      expect(run.rows, tag).toEqual(c.rows);
      expect(run.sums, tag).toEqual(c.sums);
      expect(run.power, tag).toEqual(c.power);
      expect(run.fact, tag).toEqual(c.fact);
      expect(run.invFact, tag).toEqual(c.invFact);
      expect(run.multiplications, tag).toEqual(c.multiplications);
      expect(run.answers.map(answerOf), tag).toEqual(c.answers);
      expect(run.error, tag).toEqual(c.error);
    }
  });

  it('agrees with the exact binomial reduced mod p, for every table size and many moduli', () => {
    for (let n = 0; n <= BINOMIAL_LIMITS.maxN; n++) {
      for (const p of [2, 3, 5, 7, 11, 13, 4, 6, 9, 10, 12, 25, 101, 1_000_000_007, 2_147_483_647]) {
        const queries = Array.from({ length: n + 3 }, (_, k) => ({ n, k: k - 1 }));
        const run = binomialTrace({ n, p, queries: queries.slice(0, 4) });
        for (let r = 0; r <= n; r++) for (let j = 0; j <= r; j++) expect(BigInt(run.rows[r][j])).toBe(exactBinomial(r, j));
        expect(run.sums.length).toBe((n * (n - 1)) / 2 || 0);
        if (n >= p) {
          expect(run.error).toContain('Lucas');
          expect(run.fact).toBeNull();
        } else if (run.error === null) {
          for (let i = 0; i <= n; i++) expect((BigInt(run.fact![i]) * BigInt(run.invFact![i])) % BigInt(p)).toBe(1n % BigInt(p));
          queries.slice(0, 4).forEach((q, i) => expect(BigInt(run.answers[i] as number)).toBe(exactBinomial(q.n, q.k) % BigInt(p)));
        } else {
          expect(isPrime(p)).toBe(false);
          expect(run.error).toContain('is not prime');
        }
        if (isPrime(p) && n < p) expect(run.error).toBeNull();
      }
    }
  });

  it('builds the README example: ModBinomial(6, 13) and C(6, 2) = 2', () => {
    const run = binomialTrace(parseBinomial('C(6, 2) mod 13'));
    expect(run.fact).toEqual([1, 1, 2, 6, 11, 3, 5]);
    expect(run.invFact).toEqual([1, 1, 7, 11, 6, 9, 8]);
    expect(run.power).toEqual([5, 11, 8, 7]);
    expect(run.multiplications).toBe(19);
    expect(run.answers).toEqual([2]);
    expect(powerCount(5, 11, 13)).toEqual([8, 7]);
    const last = run.frames[run.frames.length - 1];
    expect(last.state.tables.answers).toEqual([{ text: 'C(6, 2) mod p = 2', role: 'good' }]);
    const check = run.frames.find((f) => f.caption.startsWith(`5 ${X} 7 % 13 = 9`))!;
    expect(check.caption).toContain('The triangle has C(6, 2) = 15 exactly, and 15 mod 13 = 2: the same.');
    expect(check.state.rows[6][2].role).toBe('good');
  });

  it('highlights the two cells above every sum and draws nothing else as compare', () => {
    const run = binomialTrace({ n: 7, p: 13, queries: [] });
    const sumFrames = run.frames.filter((f) => f.line === 3);
    expect(sumFrames.length).toBe(21);
    for (const f of sumFrames) {
      const [r, j] = f.state.sum!;
      const roles = f.state.rows.flatMap((row, rr) => row.map((c, jj) => [rr, jj, c.role] as const)).filter(([, , role]) => role);
      expect(roles).toEqual(
        expect.arrayContaining([
          [r - 1, j - 1, 'compare'],
          [r - 1, j, 'compare'],
          [r, j, 'active'],
        ]),
      );
      expect(roles.length).toBe(3);
      expect(f.state.rows[r][j].value).toBe(f.state.rows[r - 1][j - 1].value! + f.state.rows[r - 1][j].value!);
      // Rows below the current one are still empty placeholders.
      for (let rr = r + 1; rr <= 7; rr++) expect(f.state.rows[rr].every((c) => c.value === null)).toBe(true);
    }
  });

  it('keeps one picture size through a run and shows the tables only once they exist', () => {
    const run = binomialTrace(parseBinomial('C(10, 5), C(10, 3) mod 1000000007'));
    expect(new Set(run.frames.map((f) => `${f.state.cellChars} ${f.state.tables.valueChars} ${f.state.tables.workChars} ${f.state.tables.answerRows}`)).size).toBe(1);
    const firstTable = run.frames.findIndex((f) => f.line === 4);
    for (const f of run.frames.slice(0, firstTable)) expect(f.state.tables.fact.every((c) => c.value === '' && c.ghost)).toBe(true);
    expect(run.frames[firstTable].state.tables.fact[0]).toEqual({ value: '1', role: undefined, ghost: false });
    for (const f of run.frames) expect(f.line === undefined || f.line < BINOMIAL_CODE.length).toBe(true);
  });

  it('refuses n >= p with Lucas, a composite modulus, and a query past the table, as the Python code does', () => {
    const lucas = binomialTrace(parseBinomial('C(9, 4) mod 7'));
    expect(lucas.error).toBe("ValueError: n_max = 9 >= p = 7: p divides n! for every n >= p, so n! has no inverse modulo p; Lucas's theorem handles n >= p");
    expect(lucas.frames[lucas.frames.length - 1].caption).toContain('C(9, 4) = 126, and 126 mod 7 = 0');
    const eight = binomialTrace(parseBinomial('C(6, 3) mod 8'));
    expect(eight.error).toBe('ValueError: p = 8 is not prime: 0 * 0 % 8 = 0, so the power p - 2 did not invert 6! modulo p');
    expect(eight.answers).toEqual([]);
    const past = binomialTrace(parseBinomial('n 4; C(4, 2), C(6, 2), C(6, 7) mod 13'));
    expect(past.answers).toEqual([6, 'ValueError: n = 6 is past the table: it was built for n <= 4', 0]);
    const zero = binomialTrace(parseBinomial('n 0; C(0, 0), C(0, 1) mod 2'));
    expect(zero.answers).toEqual([1, 0]);
    expect(zero.multiplications).toBe(0);
  });

  it('writes right numbers and words in every caption over thousands of random inputs', () => {
    const rand = rng(20261125);
    const issues: string[] = [];
    let frames = 0;
    for (let t = 0; t < 2500; t++) {
      const n = Math.floor(rand() * (BINOMIAL_LIMITS.maxN + 1));
      const p = rand() < 0.75 ? [2, 3, 5, 7, 11, 13, 17, 101, 1_000_000_007, 2_147_483_647][Math.floor(rand() * 10)] : 2 + Math.floor(rand() * 60);
      const queries = Array.from({ length: Math.floor(rand() * 5) }, () => {
        const qn = Math.floor(rand() * (n + 5)) - 2;
        return { n: qn, k: Math.floor(rand() * (Math.max(qn, 0) + 5)) - 2 };
      });
      const run = binomialTrace({ n, p, queries });
      for (const f of run.frames) {
        frames += 1;
        for (const issue of [...arithmeticIssues(f.caption), ...wordingIssues(f.caption)]) issues.push(`${issue} | ${f.caption}`);
      }
    }
    expect(frames).toBeGreaterThan(50000);
    expect(checked).toBeGreaterThan(50000);
    expect(issues.slice(0, 5)).toEqual([]);
    // The scan itself catches a wrong number.
    expect(arithmeticIssues(`C(6, 2) = C(5, 1) + C(5, 2) = 5 + 10 = 16.`)).toHaveLength(1);
    expect(arithmeticIssues(`fact[4] = fact[3] ${X} 4 % p = 6 ${X} 4 % 13 = 12.`)).toHaveLength(1);
    expect(arithmeticIssues(`15 mod 13 = 3, 5^11 mod 13 = 9, C(9, 4) = 127.`)).toHaveLength(3);
    expect(wordingIssues('took 1 products and 3 addition.')).toHaveLength(2);
  });
});

describe('parseBinomial', () => {
  it('reads queries, the modulus and the size', () => {
    expect(parseBinomial('C(6, 2) mod 13')).toEqual({ n: 6, p: 13, queries: [{ n: 6, k: 2 }] });
    expect(parseBinomial('C(6, 2), C(4, 4) mod 13')).toEqual({ n: 6, p: 13, queries: [{ n: 6, k: 2 }, { n: 4, k: 4 }] });
    expect(parseBinomial('n 8; nCr 5 2; p 7')).toEqual({ n: 8, p: 7, queries: [{ n: 5, k: 2 }] });
    expect(parseBinomial('C(-3, 1) mod 5')).toEqual({ n: 0, p: 5, queries: [{ n: -3, k: 1 }] });
    expect(parseBinomial('n 3; mod 11')).toEqual({ n: 3, p: 11, queries: [] });
  });

  it('explains what it cannot read', () => {
    for (const bad of ['C(6, 2)', 'C(11, 2) mod 13', 'n 11; mod 13', 'mod 1', 'C(6, 2) mod 13; mod 7', 'C(6) mod 13', 'C(1,0), C(1,0), C(1,0), C(1,0), C(1,0) mod 3', 'mod 13', 'C(6, x) mod 13']) {
      expect(() => parseBinomial(bad), bad).toThrow(InputError);
    }
  });
});
