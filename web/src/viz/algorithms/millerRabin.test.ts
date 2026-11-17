import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError, type Frame } from '../core/types';
import { MR_CODE, MR_DET_CODE, mrDetTrace, mrTrace, parseMillerRabin, powMod, type MrState } from './millerRabin';
import { PyRandom } from './randomizedDraws';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/numberTheory.json', import.meta.url), 'utf8'));
const S = (v: unknown) => JSON.stringify(v, (_, x) => (typeof x === 'bigint' || typeof x === 'number' ? String(x) : x));

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

function trialPrime(n: number): boolean {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
  return true;
}

function expectWellFormed(frames: Array<Frame<MrState>>, lines: number) {
  for (const f of frames) {
    expect(f.caption.length).toBeGreaterThan(10);
    if (f.line !== undefined) {
      expect(f.line).toBeGreaterThanOrEqual(0);
      expect(f.line).toBeLessThan(lines);
    }
    const keys = f.state.rows.map((r) => r.key);
    expect(new Set(keys).size).toBe(keys.length);
  }
}

describe('PyRandom past 32 bits (golden fixtures)', () => {
  it('getrandbits(k) joins 32-bit words for k > 32, and randrange(start, stop) draws on ranges up to 10^24', () => {
    const list = fixtures.draws as Array<{ seed: number; bits: Array<[number, number | string]>; ranges: Array<Array<number | string>> }>;
    expect(list.length).toBeGreaterThanOrEqual(5);
    for (const c of list) {
      const r = new PyRandom(c.seed);
      for (const [k, want] of c.bits) expect(String(r.getrandbitsBig(k)), `seed ${c.seed}, k ${k}`).toBe(String(want));
      for (const [start, stop, want] of c.ranges) expect(String(r.randrangeBig(BigInt(start), BigInt(stop))), `seed ${c.seed}, randrange(${start}, ${stop})`).toBe(String(want));
    }
  });

  it('the number form agrees with the bigint form, and randrange(start, stop) shifts randbelow', () => {
    const a = new PyRandom(9);
    const b = new PyRandom(9);
    for (let t = 0; t < 50; t++) expect(a.randrange(2, 2 ** 40)).toBe(Number(b.randrangeBig(2n, 2n ** 40n)));
    const c = new PyRandom(3);
    const d = new PyRandom(3);
    expect(c.randrange(2, 560)).toBe(2 + d.randrange(558));
  });
});

describe.each([
  ['random', mrTrace, MR_CODE.length],
  ['deterministic', mrDetTrace, MR_DET_CODE.length],
] as const)('Miller-Rabin (%s)', (_, trace, lines) => {
  it('agrees with trial division for every n up to 3000 (k = 10)', () => {
    const numbers = Array.from({ length: 3002 }, (_, i) => BigInt(i - 1));
    for (let i = 0; i < numbers.length; i += 4) {
      const chunk = numbers.slice(i, i + 4);
      const run = trace({ numbers: chunk, k: 10, seed: i });
      chunk.forEach((n, j) => expect(run.steps[j].result, String(n)).toBe(trialPrime(Number(n))));
    }
  });

  it('never rejects a prime and proves composites on random scripts; every pow is right', () => {
    const rand = rng(lines);
    const primes = [97n, 65537n, 4294967291n, 1000000000039n, 2n ** 61n - 1n, 2n ** 64n - 59n, 170141183460469231731687303715884105727n % 10n ** 24n];
    for (let t = 0; t < 120; t++) {
      const numbers = Array.from({ length: 1 + Math.floor(rand() * 3) }, () => {
        const r = rand();
        return r < 0.4 ? BigInt(Math.floor(rand() * 5000)) : r < 0.7 ? primes[Math.floor(rand() * 5)] : BigInt(Math.floor(rand() * 2 ** 40)) * 2n + 1n;
      });
      const run = trace({ numbers, k: 1 + Math.floor(rand() * 8), seed: Math.floor(rand() * 1000) });
      numbers.forEach((n, i) => {
        const step = run.steps[i];
        if (n < 5000n) expect(step.result).toBe(trialPrime(Number(n)));
        if (primes.slice(0, 6).includes(n)) expect(step.result).toBe(true);
        for (const ev of step.events) {
          if (ev[0] === 'pow') expect(ev[4]).toBe(powMod(ev[1], ev[2], ev[3]));
          else {
            expect(ev[3] >= 2n && ev[3] <= n - 2n).toBe(true);
          }
        }
      });
      expectWellFormed(run.frames, lines);
      expect(run.frames.length).toBeLessThan(2000);
    }
  });
});

describe('Miller-Rabin scenarios', () => {
  it('561 (Carmichael): base 2 meets 67, a square root of 1, and proves it composite', () => {
    const run = mrDetTrace(parseMillerRabin('561', 'deterministic'));
    expect(run.steps[0].result).toBe(false);
    const pows = run.steps[0].events.filter((e) => e[0] === 'pow').map((e) => e[4]);
    expect(pows).toEqual([263n, 166n, 67n, 1n]);
    const last = run.frames[run.frames.length - 1].state;
    expect(last.rows.map((r) => r.cells.map((c) => c.text))).toEqual([['263', '166', '67', '1']]);
    expect(last.rows[0].cells[3].role).toBe('bad');
    expect(last.split).toEqual({ d: '35', r: 4, role: 'done' });
  });

  it('2047 fools base 2 and base 3 catches it; 3825123056546413051 fools the bases 2..31 and 37 catches it', () => {
    const run = mrDetTrace(parseMillerRabin('2047, 3825123056546413051', 'deterministic'));
    expect(run.steps.map((s) => s.result)).toEqual([false, false]);
    expect(run.steps[0].events.length).toBe(2);
    expect(run.steps[1].events.map((e) => (e[0] === 'pow' ? e[1] : 0n))).toEqual([2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n]);
  });

  it('beyond the bound the twelve bases are fooled, as the Python tests record', () => {
    const run = mrDetTrace(parseMillerRabin('318665857834031151167461', 'deterministic'));
    expect(run.steps[0].result).toBe(true);
    expect(run.frames[run.frames.length - 1].caption).toContain('can be wrong');
  });

  it('small n: the checks before the loop, and bases a >= n skipped', () => {
    const run = mrDetTrace(parseMillerRabin('-7, 1, 2, 5', 'deterministic'));
    expect(run.steps.map((s) => s.result)).toEqual([false, false, true, true]);
    expect(run.frames.some((f) => f.caption.startsWith('a >= n for the bases 5, 7, 11'))).toBe(true);
  });

  it('the random test draws from random.Random(seed) like Python, one generator for the whole script', () => {
    const run = mrTrace(parseMillerRabin('561, 97; k 3; seed 1', 'random'));
    const r = new PyRandom(1);
    const draws = run.steps.flatMap((s) => s.events.filter((e) => e[0] === 'draw').map((e) => e[3]));
    expect(draws[0]).toBe(r.randrangeBig(2n, 560n));
    expect(draws.length).toBeGreaterThanOrEqual(2);
    // As the article says: for 561 the first witness, 139, squares 10, 100, 463, 67 and never meets 560.
    const first = run.steps[0].events;
    expect(first[0]).toEqual(['draw', 2n, 560n, 139n]);
    expect(first.filter((e) => e[0] === 'pow').map((e) => e[4])).toEqual([10n, 100n, 463n, 67n]);
    expect(run.steps[0].result).toBe(false);
  });
});

describe('Miller-Rabin matches miller_rabin.py (golden fixtures)', () => {
  type Case = { numbers: Array<number | string>; k?: number; seed?: number; steps: Array<{ n: number | string; result: boolean; events: Array<Array<number | string>> }> };
  it('miller_rabin: every draw, every pow and the verdicts', () => {
    const list = fixtures.millerRabin as Case[];
    expect(list.length).toBeGreaterThanOrEqual(20);
    for (const c of list) {
      const run = mrTrace({ numbers: c.numbers.map((n) => BigInt(n)), k: c.k!, seed: c.seed! });
      c.steps.forEach((want, i) => {
        expect(run.steps[i].result, String(want.n)).toBe(want.result);
        expect(S(run.steps[i].events), String(want.n)).toBe(S(want.events));
      });
    }
  });

  it('miller_rabin_deterministic: every pow and the verdicts', () => {
    const list = fixtures.millerRabinDeterministic as Case[];
    expect(list.length).toBeGreaterThanOrEqual(20);
    for (const c of list) {
      const run = mrDetTrace({ numbers: c.numbers.map((n) => BigInt(n)), k: 5, seed: 1 });
      c.steps.forEach((want, i) => {
        expect(run.steps[i].result, String(want.n)).toBe(want.result);
        expect(S(run.steps[i].events), String(want.n)).toBe(S(want.events));
      });
    }
  });
});

describe('parseMillerRabin', () => {
  it('reads numbers, k and seed', () => {
    expect(parseMillerRabin('561, 97 2047; k 3; seed 7', 'random')).toEqual({ numbers: [561n, 97n, 2047n], k: 3, seed: 7 });
    expect(parseMillerRabin('97', 'random'), 'Python default k = 5').toEqual({ numbers: [97n], k: 5, seed: 1 });
  });

  it('gives friendly errors', () => {
    expect(() => parseMillerRabin('', 'random')).toThrow(InputError);
    expect(() => parseMillerRabin('5; k 0', 'random')).toThrow(/1 to 16/);
    expect(() => parseMillerRabin('5; k 3; k 4', 'random')).toThrow(/once/);
    expect(() => parseMillerRabin('1000000000000000000000001', 'random')).toThrow(/24 digits/);
    expect(() => parseMillerRabin('1, 2, 3, 4, 5', 'random')).toThrow(/At most 4/);
    expect(() => parseMillerRabin('x', 'random')).toThrow(/whole number/);
    // The prime 5 * 2^75 + 1 has r = 75: sixteen witnesses with long chains each are too many steps.
    expect(() => parseMillerRabin('188894659314785808547841, 188894659314785808547841, 188894659314785808547841; k 16', 'random')).toThrow(/steps/);
  });
});
