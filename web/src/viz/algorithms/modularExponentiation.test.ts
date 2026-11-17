import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError, type Frame } from '../core/types';
import { parsePow, POW_CODE, POW_REC_CODE, powRecTrace, powTrace, type PowCall, type PowState } from './modularExponentiation';
import { pyModBig } from './numberTheoryCommon';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/numberTheory.json', import.meta.url), 'utf8'));

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

/** Reference: repeated squaring written independently, plus an inverse by brute force for small moduli. */
function refPow(b: bigint, e: bigint, m: bigint): bigint | null {
  if (e < 0n) {
    let inv: bigint | null = null;
    // gcd test, then the inverse from Fermat-free search (small m) or the extended gcd via bigint search
    const g = (x: bigint, y: bigint): bigint => (y === 0n ? (x < 0n ? -x : x) : g(y, x % y));
    if (g(b, m) !== 1n) return null;
    if (m <= 5000n) {
      for (let x = 0n; x < m; x++) if (pyModBig(b * x, m) === pyModBig(1n, m)) {
        inv = x;
        break;
      }
    } else {
      // b^(phi(m)-1) needs phi; use the extended gcd by brute recursion instead
      const ext = (x: bigint, y: bigint): [bigint, bigint, bigint] => {
        if (y === 0n) return [x, 1n, 0n];
        const [gg, x1, y1] = ext(y, pyModBig(x, y));
        return [gg, y1, x1 - (x / y) * y1];
      };
      inv = pyModBig(ext(pyModBig(b, m), m)[1], m);
    }
    return refPow(inv!, -e, m);
  }
  if (m === 1n) return 0n;
  let r = 1n;
  for (let k = e.toString(2).length - 1; e > 0n && k >= 0; k--) {
    r = (r * r) % m;
    if ((e >> BigInt(k)) & 1n) r = pyModBig(r * b, m);
  }
  return e === 0n ? 1n : r;
}

function expectWellFormed(frames: Array<Frame<PowState>>, lines: number) {
  for (const f of frames) {
    expect(f.caption.length).toBeGreaterThan(10);
    if (f.line !== undefined) {
      expect(f.line).toBeGreaterThanOrEqual(0);
      expect(f.line).toBeLessThan(lines);
    }
    const ids = f.state.bits.map((b) => b.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const row of f.state.table.rows) expect(row.length).toBe(f.state.table.columns.length);
  }
}

function randomCall(rand: () => number): PowCall {
  const big = (digits: number) => {
    let s = '';
    for (let i = 0; i < digits; i++) s += Math.floor(rand() * 10);
    return BigInt(s || '0');
  };
  const modulus = [BigInt(1 + Math.floor(rand() * 20)), 1n + big(9), 1n + big(18)][Math.floor(rand() * 3)];
  const base = (rand() < 0.3 ? -1n : 1n) * [BigInt(Math.floor(rand() * 50)), big(18)][Math.floor(rand() * 2)];
  const exponent = (rand() < 0.15 ? -1n : 1n) * BigInt(rand() < 0.5 ? Math.floor(rand() * 70) : Math.floor(rand() * 1048576));
  return { base, exponent, modulus };
}

describe.each([
  ['powTrace', powTrace, POW_CODE.length],
  ['powRecTrace', powRecTrace, POW_REC_CODE.length],
] as const)('%s', (_, trace, lines) => {
  it('agrees with an independent square and multiply on random calls (bigint)', () => {
    const rand = rng(lines);
    for (let t = 0; t < 150; t++) {
      const calls = Array.from({ length: 1 + Math.floor(rand() * 3) }, () => randomCall(rand));
      const run = trace({ calls });
      calls.forEach((c, i) => {
        const want = refPow(c.base, c.exponent, c.modulus);
        expect(run.steps[i].result, `${c.base}^${c.exponent} mod ${c.modulus}`).toBe(want);
      });
      expectWellFormed(run.frames, lines);
      expect(run.frames.length).toBeLessThan(2000);
    }
  });

  it('the article example: 5^13 mod 11 = 4; 2^-1 mod 12 has no inverse; modulus 1 gives 0', () => {
    const run = trace(parsePow('5^13 mod 11, 2^-1 mod 12, 7^0 mod 1, 0^0 mod 7'));
    expect(run.steps.map((s) => s.result)).toEqual([4n, null, 0n, 1n]);
  });

  it('stays well under 2000 frames on the largest input', () => {
    const text = Array.from({ length: 4 }, () => '-999999999999999999^-1048575 mod 999999999999999989').join(', ');
    expect(trace(parsePow(text)).frames.length).toBeLessThan(2000);
  });
});

describe('powTrace pictures', () => {
  it('fills the worked example table row by row and shifts the bits right', () => {
    const run = powTrace(parsePow('5^13 mod 11'));
    const last = run.frames[run.frames.length - 1].state;
    expect(last.table.rows.map((r) => r.map((c) => c.text))).toEqual([
      ['0', '1', '5', '5'],
      ['1', '0', '3', '5'],
      ['2', '1', '9', '1'],
      ['3', '1', '4', '4'],
      ['4', '', '5', ''],
    ]);
    // The lowest bit of 13 sits in slot 0; after one shift it has left the field (slot -1).
    const first = run.frames.find((f) => f.line === 9)!.state.bits;
    const shifted = run.frames.find((f) => f.line === 11)!.state.bits;
    const id = first.find((b) => b.slot === 0)!.id;
    expect(shifted.find((b) => b.id === id)!.slot).toBe(-1);
    expect(shifted.filter((b) => b.slot >= 0).map((b) => b.v)).toEqual([1, 1, 0]);
  });

  it('the recursive version opens one call per halving or peeled factor, then returns', () => {
    const run = powRecTrace(parsePow('5^13 mod 11'));
    expect(run.steps[0].calls.map((c) => [c[1], c[3]])).toEqual([
      [13n, 4n],
      [12n, 3n],
      [6n, 5n],
      [3n, 4n],
      [2n, 3n],
      [1n, 5n],
      [0n, 1n],
    ]);
  });
});

describe('modular exponentiation matches modular_exponentiation.py (golden fixtures)', () => {
  const cases = fixtures.modExp as Array<{
    base: number | string;
    exponent: number | string;
    modulus: number | string;
    result: number | string | null;
    loop: Array<Array<number | string>>;
    egcd: Array<Array<number | string>>;
    recursive: { calls: Array<Array<number | string | null>>; result: number | string | null };
  }>;
  const S = (v: unknown) => JSON.stringify(v, (_, x) => (typeof x === 'bigint' || typeof x === 'number' ? String(x) : x));
  it('mod_pow: the result, the loop state at each iteration and the inverse; mod_pow_recursive: every call', () => {
    expect(cases.length).toBeGreaterThanOrEqual(50);
    for (const c of cases) {
      const call: PowCall = { base: BigInt(c.base), exponent: BigInt(c.exponent), modulus: BigInt(c.modulus) };
      const it = powTrace({ calls: [call] }).steps[0];
      const rec = powRecTrace({ calls: [call] }).steps[0];
      const label = `${c.base}^${c.exponent} mod ${c.modulus}`;
      expect(S(it.result), label).toBe(S(c.result));
      expect(S(it.loop), label).toBe(S(c.loop));
      expect(S(it.egcd), label).toBe(S(c.egcd));
      expect(S(rec.result), label).toBe(S(c.recursive.result));
      expect(S(rec.calls), label).toBe(S(c.recursive.calls));
    }
  });
});

describe('parsePow', () => {
  it('reads the three forms', () => {
    expect(parsePow('5^13 mod 11; pow(2, -3, 11)\n(-2)^3 % 5, 7 0 1').calls).toEqual([
      { base: 5n, exponent: 13n, modulus: 11n },
      { base: 2n, exponent: -3n, modulus: 11n },
      { base: -2n, exponent: 3n, modulus: 5n },
      { base: 7n, exponent: 0n, modulus: 1n },
    ]);
  });

  it('gives friendly errors', () => {
    expect(() => parsePow('')).toThrow(InputError);
    expect(() => parsePow('5^13')).toThrow(/Cannot read/);
    expect(() => parsePow('pow(5, 13)')).toThrow(/base, an exponent and a modulus/);
    expect(() => parsePow('5^13 mod 0')).toThrow(/ZeroDivisionError/);
    expect(() => parsePow('5^13 mod -7')).toThrow(/positive/);
    expect(() => parsePow('5^1048576 mod 7')).toThrow(/exponent/);
    expect(() => parsePow('5^3 mod 10000000000000000000')).toThrow(/19 digits/);
    expect(() => parsePow(Array.from({ length: 5 }, () => '2^3 mod 5').join(', '))).toThrow(/At most 4/);
  });
});
