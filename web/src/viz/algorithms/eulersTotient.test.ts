import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { SYM } from '../ui/symbols';
import {
  eratosthenesWrites,
  parseTotientFactor,
  parseTotientSieve,
  TOTIENT_FACTOR_CODE,
  TOTIENT_SIEVE_CODE,
  totientFactorTrace,
  totientSieveTrace,
} from './eulersTotient';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/numberTheory.json', import.meta.url), 'utf8'));

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
const phiByGcd = (n: number) => Array.from({ length: n }, (_, k) => k + 1).filter((k) => gcd(k, n) === 1).length;
const isPrime = (n: number) => {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
};

/** A seeded generator, so the caption scan is the same on every run. */
function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

const X = SYM.times;

/** Every "a x b = c", "a // b = c" and "a - b = c" a caption writes must be right. */
function arithmeticIssues(caption: string): string[] {
  const out: string[] = [];
  for (const m of caption.matchAll(new RegExp(`(\\d+) ${X} (\\d+) = (\\d+)`, 'g'))) if (Number(m[1]) * Number(m[2]) !== Number(m[3])) out.push(m[0]);
  for (const m of caption.matchAll(/(\d+) \/\/ (\d+) = (\d+)/g)) if (Math.floor(Number(m[1]) / Number(m[2])) !== Number(m[3])) out.push(m[0]);
  for (const m of caption.matchAll(/(?<![(\d/] ?)(\d+) - (\d+) = (\d+)/g)) if (Number(m[1]) - Number(m[2]) !== Number(m[3])) out.push(m[0]);
  return out;
}

/** Wrong plurals and leftovers of string building. */
function wordingIssues(caption: string): string[] {
  const out: string[] = [];
  // "phi(0) is undefined" is a sentence; a bare undefined, NaN or null is a value that did not print.
  if (/(?<!is )undefined|NaN|\bnull\b|\[object/.test(caption)) out.push('a value did not print');
  if (/\b1 (crossings|composites|primes|candidates|divisors)\b/.test(caption)) out.push('plural after 1');
  if (/\b(0|[2-9]|\d{2,}) (crossing|composite|prime|candidate|divisor)\b(?![s-])/.test(caption)) out.push('singular after a count');
  if (/\s{2}|\s[.,:]/.test(caption)) out.push('stray space');
  return out;
}

describe('totientSieveTrace', () => {
  it('reproduces every golden fixture: the crossings in order and the tables', () => {
    expect(fixtures.totientSieve.length).toBe(30);
    for (const c of fixtures.totientSieve) {
      const run = totientSieveTrace({ n: c.n });
      expect(run.crossings, `n = ${c.n}`).toEqual(c.crossings);
      expect(run.phi).toEqual(c.phi);
      expect(run.spf).toEqual(c.spf);
      expect(run.primes).toEqual(c.primes);
      expect(run.crossings.length).toBe(c.count);
    }
  });

  it('agrees with the gcd count, crosses out each composite once by its smallest prime, for every n up to 100', () => {
    for (let n = 0; n <= 100; n++) {
      const run = totientSieveTrace({ n });
      for (let x = 1; x <= n; x++) expect(run.phi[x], `phi(${x})`).toBe(phiByGcd(x));
      const crossed = run.crossings.map(([i, p]) => i * p).sort((a, b) => a - b);
      const composites = Array.from({ length: n + 1 }, (_, x) => x).filter((x) => x >= 4 && !isPrime(x));
      expect(crossed).toEqual(composites);
      for (const [i, p] of run.crossings) {
        expect(p).toBeLessThanOrEqual(run.spf[i]);
        expect(run.spf[i * p]).toBe(p);
      }
      expect(run.stops.map(([i]) => i)).toEqual(Array.from({ length: Math.max(0, n - 1) }, (_, k) => k + 2));
      const last = run.frames[run.frames.length - 1];
      expect(last.state.crossings).toBe(composites.length);
      for (const f of run.frames) {
        expect(f.line).toBeLessThan(TOTIENT_SIEVE_CODE.length);
        expect(f.state.cells.length).toBe(n + 1);
      }
    }
  });

  it('n = 30: 19 crossings for 19 composites, against 24 writes of the Sieve of Eratosthenes', () => {
    const run = totientSieveTrace({ n: 30 });
    expect(run.crossings.length).toBe(19);
    expect(run.crossings.slice(0, 6).map(([i, p]) => [i * p, i, p])).toEqual([
      [4, 2, 2],
      [6, 3, 2],
      [9, 3, 3],
      [8, 4, 2],
      [10, 5, 2],
      [15, 5, 3],
    ]);
    expect(eratosthenesWrites(30)).toBe(24);
    expect(eratosthenesWrites(100)).toBe(104);
    expect(totientSieveTrace({ n: 100 }).crossings.length).toBe(74);
    const end = run.frames[run.frames.length - 1];
    expect(end.caption).toContain('19 crossings for the 19 composites up to 30');
    expect(end.caption).toContain('writes 24 times');
    // The step that crosses out 8 says why 4 stops: 4 x 3 = 12 belongs to 6 x 2.
    const eight = run.frames.find((f) => f.caption.startsWith(`4 ${X} 2 = 8`))!;
    expect(eight.caption).toContain(`Next p = 3 > spf[4] = 2: stop. 4 ${X} 3 = 12 has the smaller prime 2, so 6 ${X} 2 crosses it out later.`);
  });

  it('shows phi only once it is known, and the crossing pair on every crossed-out cell', () => {
    const run = totientSieveTrace({ n: 20 });
    const first = run.frames[0].state;
    expect(first.cells.filter((c) => c.phi !== null).map((c) => c.x)).toEqual([1]);
    const last = run.frames[run.frames.length - 1].state;
    expect(last.cells.slice(1).every((c) => c.phi !== null)).toBe(true);
    expect(last.cells[12].by).toEqual([6, 2]);
    expect(last.cells[13].by).toBeNull();
    expect(new Set(run.frames.map((f) => f.state.workChars)).size).toBe(1);
  });
});

describe('totientFactorTrace', () => {
  it('reproduces every golden fixture: the candidates, the factors, phi and the inverses', () => {
    expect(fixtures.totientFactor.length).toBe(50);
    for (const c of fixtures.totientFactor) {
      const run = totientFactorTrace({ n: c.n, inverses: c.inverses.map((pair: [number, unknown]) => pair[0]) });
      expect(run.tried, `n = ${c.n}`).toEqual(c.tried);
      expect(run.factors).toEqual(c.factors);
      expect(run.phi).toEqual(c.phi);
      expect(run.inverses).toEqual(c.inverses);
    }
  });

  it('agrees with the gcd count for every n up to 3000, and inverts every coprime a up to 60', () => {
    for (let n = 1; n <= 3000; n++) {
      const run = totientFactorTrace({ n, inverses: n <= 60 ? Array.from({ length: n }, (_, a) => a) : [] });
      expect(run.phi, `phi(${n})`).toBe(phiByGcd(n));
      for (const [a, inv] of run.inverses) {
        if (gcd(a, n) === 1) expect((a * (inv as number)) % n).toBe(1 % n);
        else expect(inv).toBe('ValueError');
      }
      for (const f of run.frames) expect(f.line).toBeLessThan(TOTIENT_FACTOR_CODE.length);
    }
  });

  it('phi(360): two candidates, three primes, and the divisor sum 360', () => {
    const run = totientFactorTrace(parseTotientFactor('phi 360; inverse 7, inverse 6'));
    expect(run.tried).toEqual([
      [2, 3],
      [3, 2],
    ]);
    expect(run.factors).toEqual([
      [2, 3],
      [3, 2],
      [5, 1],
    ]);
    expect(run.phi).toBe(96);
    expect(run.inverses).toEqual([
      [7, 103],
      [6, 'ValueError'],
    ]);
    const last = run.frames[run.frames.length - 1].state;
    expect(last.ladder.map((r) => r.value)).toEqual([360, 45, 5, 1]);
    expect(last.candidates.map((c) => c.label)).toEqual(['2', '3', '4']);
    expect(run.frames.some((f) => f.caption.includes('the 24 divisors d of 360 have phi(d) adding up to 360'))).toBe(true);
  });

  it('groups a run of candidates that divide nothing into one box', () => {
    const run = totientFactorTrace({ n: 97, inverses: [] });
    const last = run.frames[run.frames.length - 1].state;
    expect(last.candidates.map((c) => c.label)).toEqual(['2-9', '10']);
    expect(run.tried.map(([p]) => p)).toEqual([2, 3, 4, 5, 6, 7, 8, 9]);
    // The run is described with the n it was tried on, not with what is left after the next prime.
    const sq = totientFactorTrace({ n: 49, inverses: [] });
    expect(sq.frames.some((f) => f.caption.startsWith('p = 2 to 6: none of these 5 candidates divides 49'))).toBe(true);
    const six = totientFactorTrace({ n: 30030, inverses: [] });
    expect(six.frames.some((f) => f.caption.startsWith('p = 4: 4 <= 5005 // 4 = 1251, but 4 does not divide 5005'))).toBe(true);
    const roles = six.frames[six.frames.length - 1].state.candidates.map((c) => `${c.label}:${c.role ?? 'idle'}`);
    expect(roles).toEqual(['2:done', '3:done', '4:idle', '5:done', '6:idle', '7:done', '8-10:idle', '11:done', '12:idle']);
  });

  it('raises ValueError for n < 1, and gives 0 modulo 1', () => {
    expect(totientFactorTrace({ n: 0, inverses: [3] })).toMatchObject({ factors: 'ValueError', phi: 'ValueError', inverses: [[3, 'ValueError']] });
    expect(totientFactorTrace({ n: 1, inverses: [5, 0] }).inverses).toEqual([
      [5, 0],
      [0, 0],
    ]);
  });
});

describe('captions', () => {
  it('have right arithmetic and wording over a few thousand random inputs', () => {
    const next = rng(20261124);
    const issues: string[] = [];
    for (let n = 0; n <= 100; n++) {
      for (const f of totientSieveTrace({ n }).frames) {
        for (const issue of [...arithmeticIssues(f.caption), ...wordingIssues(f.caption)]) issues.push(`sieve ${n}: ${issue}: ${f.caption}`);
      }
    }
    for (let t = 0; t < 3000; t++) {
      const n = t < 300 ? t - 9 : 1 + Math.floor(next() * 99999);
      const inverses = Array.from({ length: Math.floor(next() * 4) }, () => Math.floor(next() * 2 * Math.max(n, 2)) - Math.max(n, 2));
      for (const f of totientFactorTrace({ n, inverses }).frames) {
        for (const issue of [...arithmeticIssues(f.caption), ...wordingIssues(f.caption)]) issues.push(`n = ${n}: ${issue}: ${f.caption}`);
      }
    }
    expect(issues.slice(0, 5)).toEqual([]);
  });
});

describe('parsers', () => {
  it('read the limit and the inverses', () => {
    expect(parseTotientSieve('n 30')).toEqual({ n: 30 });
    expect(parseTotientSieve('64')).toEqual({ n: 64 });
    expect(parseTotientFactor('phi 360; inverse 7, inverse 6')).toEqual({ n: 360, inverses: [7, 6] });
    expect(parseTotientFactor('97, inv 3 5')).toEqual({ n: 97, inverses: [3, 5] });
  });

  it('reject what the tracers cannot show', () => {
    for (const bad of ['', 'n 101', 'n -1', 'n 5; n 6', 'grid 5']) expect(() => parseTotientSieve(bad), bad).toThrow(InputError);
    for (const bad of ['', 'phi 100000', 'phi 10; phi 11', 'inverse 3', 'phi 10; inverse 1 2 3 4 5', 'phi 10; inverse 100000']) expect(() => parseTotientFactor(bad), bad).toThrow(InputError);
  });
});
