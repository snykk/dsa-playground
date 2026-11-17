import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { buildFactorials, LUCAS_CODE, lucasTrace, parseLucas, stabilizeLucas, type LucasInput } from './modularTricks';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/optimizationTechniques.json', import.meta.url), 'utf8'));

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

/** C(n, r) mod p from Pascal's triangle, row by row mod p (an independent reference). */
function pascalMod(n: number, r: number, p: number): number {
  if (r < 0 || r > n) return 0;
  let row = [1];
  for (let i = 1; i <= n; i++) {
    const next = [1];
    for (let j = 1; j < i; j++) next.push((row[j - 1] + row[j]) % p);
    next.push(1);
    row = next;
  }
  return row[r] % p;
}

describe('lucas_nCr', () => {
  it('matches every call, return and small binomial of the Python recursion (golden fixtures)', () => {
    const cases = fixtures.lucas as Array<Record<string, unknown>>;
    expect(cases.length).toBeGreaterThanOrEqual(60);
    for (const c of cases) {
      const input: LucasInput = { n: BigInt(c.n as string), r: BigInt(c.r as string), p: c.p as number, table: (c.table as LucasInput['table']) ?? null };
      const run = lucasTrace(input);
      const where = JSON.stringify([c.n, c.r, c.p, c.table]);
      expect(run.error, where).toEqual(c.error);
      if (c.error) continue;
      expect(run.result, where).toBe(c.result);
      expect(run.events, where).toEqual(c.events);
      expect(run.fact, where).toEqual(c.fact);
      expect(run.invFact, where).toEqual(c.invFact);
    }
  });

  it("agrees with Pascal's triangle mod p for every n up to 120 and every prime", () => {
    for (const p of [2, 3, 5, 7, 11, 13, 37]) {
      for (let n = 0; n <= 120; n += p < 7 ? 1 : 3) {
        for (let r = -1; r <= n + 1; r += Math.max(1, Math.floor(n / 9))) {
          const run = lucasTrace({ n: BigInt(n), r: BigInt(r), p, table: null });
          expect(run.result, `${n} ${r} ${p}`).toBe(pascalMod(n, r, p));
        }
      }
    }
  });

  it('builds Factorials(p - 1, p) with inverses that check by definition', () => {
    for (const p of [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]) {
      const { fact, inv } = buildFactorials(p - 1, p);
      for (let i = 0; i < p; i++) expect((fact[i] * inv[i]) % p).toBe(1 % p);
    }
  });

  it('keeps the frames well-formed and one size, on random huge inputs', () => {
    const rand = rng(17);
    const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37];
    for (let t = 0; t < 150; t++) {
      const p = primes[Math.floor(rand() * primes.length)];
      const digits = 1 + Math.floor(rand() * 12);
      let n = 0n;
      for (let d = 0; d < digits; d++) n = n * BigInt(p) + BigInt(Math.floor(rand() * p));
      if (n > 10n ** 18n) n = 10n ** 18n;
      let r = 0n;
      for (let d = 0; d < digits; d++) r = r * BigInt(p) + BigInt(Math.floor(rand() * p));
      if (rand() < 0.8 && r > n) r = n / 2n;
      const frames = stabilizeLucas(lucasTrace({ n, r, p, table: null }).frames);
      expect(frames.length).toBeLessThan(2000);
      const size = frames[0].state.maxStack;
      for (const f of frames) {
        expect(f.caption.length).toBeGreaterThan(10);
        if (f.line !== undefined) expect(f.line).toBeLessThan(LUCAS_CODE.length);
        expect(f.state.maxStack).toBe(size);
        expect(f.state.stack.length).toBeLessThanOrEqual(size);
        expect(f.state.nDigits.length).toBe(f.state.cols);
        expect(f.state.rDigits.length).toBe(f.state.cols);
      }
    }
  });

  it('reads the table while the calls return, highest digit first', () => {
    const run = lucasTrace(parseLucas('C(1000, 500) mod 13'));
    // 1000 = 5 11 12 and 500 = 2 12 6 in base 13: the digit pair (12, 6) is read last.
    const ncr = run.events.filter((e) => e[0] === 'ncr');
    expect(ncr).toEqual([
      ['ncr', 5, 2, 10],
      ['ncr', 11, 12, 0],
      ['ncr', 12, 6, 924 % 13],
    ]);
    expect(run.result).toBe(0);
    // (11, 12) is 0 by the r > n test of nCr, before any lookup.
    expect(run.frames[run.frames.length - 1].caption).toMatch(/from 3 small binomials: 2 read from the table of 13 entries and 1 that is 0 without a lookup.*Check: the exact binomial reduced mod 13 is 0, the same\./);
  });

  it('checks a huge n against the exact binomial when r is small', () => {
    const run = lucasTrace(parseLucas('C(1000000000000000000, 7) mod 37'));
    let num = 1n;
    for (let i = 1n; i <= 7n; i++) num = (num * (10n ** 18n - 7n + i)) / i;
    expect(run.result).toBe(Number(num % 37n));
    const last = run.frames[run.frames.length - 1];
    expect(last.caption).toMatch(/Check: the exact binomial reduced mod 37 is \d+, the same\./);
    expect(last.state.work[0].role).toBe('good');
    // With r near n / 2 the exact binomial is out of reach, and the caption says so.
    expect(lucasTrace(parseLucas('C(1000000000000000000, 500000000000000000) mod 37')).frames.at(-1)!.caption).toMatch(/far too many digits/);
  });

  it('refuses a table built for another modulus or size, as Python does', () => {
    for (const text of ['C(36, 18) mod 37; table 36', 'C(36, 18) mod 37; table 10 37', 'C(36, 18) mod 37; table 40 37']) {
      const run = lucasTrace(parseLucas(text));
      expect(run.error).toEqual(['ValueError', 'fact_obj must be Factorials(p - 1, p) for the same prime p']);
      expect(run.frames[run.frames.length - 1].caption).toMatch(/^ValueError/);
    }
  });

  it('parses several spellings, with friendly errors', () => {
    expect(parseLucas('C(100, 37) mod 37')).toEqual({ n: 100n, r: 37n, p: 37, table: null });
    expect(parseLucas('lucas 1000 500 13')).toEqual({ n: 1000n, r: 500n, p: 13, table: null });
    expect(parseLucas('n 100 r 37 p 37')).toEqual({ n: 100n, r: 37n, p: 37, table: null });
    expect(parseLucas('1000000000000000000 5 13').n).toBe(10n ** 18n);
    expect(parseLucas('C(36, 18) mod 37; table 40 37').table).toEqual([40, 37]);
    expect(() => parseLucas('C(10, 3) mod 4')).toThrow(/prime/);
    expect(() => parseLucas('C(10, 3) mod 41')).toThrow(/up to 37/);
    expect(() => parseLucas('C(500000, 3) mod 2')).toThrow(/digits in base 2/);
    expect(() => parseLucas('C(10, 3)')).toThrow(InputError);
    expect(() => parseLucas('C(10, 3) mod 7; tables')).toThrow(/Cannot read/);
  });
});
