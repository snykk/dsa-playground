import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { parseSieve, SIEVE_CODE, sieveTrace } from './sieveOfEratosthenes';
import { stabilizeSieve } from '../renderers/SieveGrid';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/numberTheory.json', import.meta.url), 'utf8'));

function trialPrime(n: number): boolean {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}

describe('sieveTrace', () => {
  it('agrees with trial division for every n from -5 to 300, and every lookup is right', () => {
    for (let n = -5; n <= 300; n++) {
      const queries = [-1, 0, 1, 2, n, n + 1, Math.floor(n / 2)];
      const run = sieveTrace({ n, queries });
      expect(run.flags.length).toBe(Math.max(0, n + 1));
      run.flags.forEach((f, v) => expect(f, `${v} in sieve(${n})`).toBe(trialPrime(v)));
      expect(run.primes).toEqual(Array.from({ length: Math.max(0, n + 1) }, (_, v) => v).filter(trialPrime));
      run.queries.forEach(([k, got]) => expect(got).toBe(k >= 0 && k <= n ? trialPrime(k) : false));
      // Each prime p <= sqrt(n) writes exactly the multiples p*p, p*p + p, ..., and nothing else writes.
      const expected: Array<[number, number]> = [];
      for (let i = 2; i * i <= n; i++) if (trialPrime(i)) for (let j = i * i; j <= n; j += i) expected.push([i, j]);
      expect(run.writes).toEqual(expected);
      for (const f of run.frames) {
        expect(f.caption.length).toBeGreaterThan(10);
        if (f.line !== undefined) expect(f.line).toBeLessThan(SIEVE_CODE.length);
        expect(f.state.cells.length).toBe(Math.max(0, n + 1));
      }
      expect(run.frames.length).toBeLessThan(2000);
    }
  });

  it('sieve(100) writes 104 flags to find 25 primes, as the article says', () => {
    const run = sieveTrace({ n: 100, queries: [] });
    expect(run.writes.length).toBe(104);
    expect(run.primes.length).toBe(25);
  });

  it('sieve(50): the outer loop runs i = 2..7, skips 4 and 6, and strikes 34 numbers', () => {
    const run = sieveTrace({ n: 50, queries: [17, 49, -1, 51] });
    expect(run.outer).toEqual([
      [2, true],
      [3, true],
      [4, false],
      [5, true],
      [6, false],
      [7, true],
    ]);
    const struck = new Set(run.writes.map((w) => w[1]));
    expect(struck.size).toBe(34);
    expect(run.queries).toEqual([
      [17, true],
      [49, false],
      [-1, false],
      [51, false],
    ]);
    const end = run.frames.find((f) => f.caption.startsWith('The next i would be 8'))!;
    expect(end.state.cells[8].role).toBe('compare');
  });

  it('a number struck again is written again (12 by 2, then by 3)', () => {
    const run = sieveTrace({ n: 12, queries: [] });
    expect(run.writes.filter((w) => w[1] === 12)).toEqual([
      [2, 12],
      [3, 12],
    ]);
  });
});

describe('stabilizeSieve', () => {
  it('gives every frame room for both strips at their widest, though the primes strip appears only after 2 is found', () => {
    const frames = stabilizeSieve(sieveTrace(parseSieve('n 50; is 17, is -1')).frames);
    expect(frames[0].state.strips.map((s) => s.label)).toEqual(['Lookups']);
    const slots = frames[0].state.stripSlots!;
    expect(slots.map((s) => s.key).sort()).toEqual(['Lookups', 'Primes']);
    for (const f of frames) expect(f.state.stripSlots).toBe(slots);
    // The primes strip at its widest: the label, then the 15 primes 2..47 (50 has no more).
    expect(slots.find((s) => s.key === 'Primes')!.widths.length).toBe(1 + 15);
  });
});

describe('sieveTrace matches sieve_of_eratosthenes.py (golden fixtures)', () => {
  const cases = fixtures.sieve as Array<{ n: number; outer: Array<[number, boolean]>; writes: Array<[number, number]>; primes: number[]; flags: string; queries: Array<[number, boolean]> }>;
  it('the flag of every outer index, every write, the primes, the flags and every lookup', () => {
    expect(cases.length).toBeGreaterThanOrEqual(30);
    for (const c of cases) {
      const run = sieveTrace({ n: c.n, queries: c.queries.map((q) => q[0]) });
      expect(run.outer, `n = ${c.n}`).toEqual(c.outer);
      expect(run.writes, `n = ${c.n}`).toEqual(c.writes);
      expect(run.primes, `n = ${c.n}`).toEqual(c.primes);
      expect(run.flags.map((f) => (f ? '1' : '0')).join(''), `n = ${c.n}`).toBe(c.flags);
      expect(run.queries, `n = ${c.n}`).toEqual(c.queries);
    }
  });
});

describe('parseSieve', () => {
  it('reads the limit and lookups', () => {
    expect(parseSieve('n 50; is 17, is -1, query 51 52')).toEqual({ n: 50, queries: [17, -1, 51, 52] });
    expect(parseSieve('30')).toEqual({ n: 30, queries: [] });
    expect(parseSieve('sieve(-5); is_prime(0)')).toEqual({ n: -5, queries: [0] });
  });

  it('gives friendly errors', () => {
    expect(() => parseSieve('')).toThrow(InputError);
    expect(() => parseSieve('n 301')).toThrow(/300/);
    expect(() => parseSieve('n 5; n 6')).toThrow(/once/);
    expect(() => parseSieve('is 5')).toThrow(/limit/);
    expect(() => parseSieve('n 5; prime 7')).toThrow(/Cannot read/);
    expect(() => parseSieve(`n 5; is ${Array.from({ length: 9 }, (_, i) => i).join(' ')}`)).toThrow(/At most 8/);
  });
});
