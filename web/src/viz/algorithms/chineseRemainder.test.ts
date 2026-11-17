import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError, type Frame } from '../core/types';
import { CRT_CODE, crtTrace, parseCrt, type CrtState } from './chineseRemainder';
import { pyModBig } from './numberTheoryCommon';
import { stabilizeCombs } from '../renderers/CongruenceCombs';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/numberTheory.json', import.meta.url), 'utf8'));
const S = (v: unknown) => JSON.stringify(v, (_, x) => (typeof x === 'bigint' || typeof x === 'number' ? String(x) : x));

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

/** Reference: the smallest x in 0..lcm-1 that satisfies every congruence, by direct search. */
function bruteCrt(rs: bigint[], ms: bigint[]): bigint | null {
  if (rs.length !== ms.length || ms.some((m) => m <= 0n)) return null;
  let lcm = 1n;
  const g = (a: bigint, b: bigint): bigint => (b === 0n ? a : g(b, a % b));
  for (const m of ms) lcm = (lcm / g(lcm, m)) * m;
  // The random systems keep lcm and the remainders small, so the search runs on plain numbers.
  const r = rs.map(Number);
  const m = ms.map(Number);
  for (let x = 0; x < Number(lcm); x++) if (r.every((ri, i) => (((x - ri) % m[i]) + m[i]) % m[i] === 0)) return BigInt(x);
  return null;
}

function expectWellFormed(frames: Array<Frame<CrtState>>) {
  for (const f of frames) {
    expect(f.caption.length).toBeGreaterThan(10);
    if (f.line !== undefined) {
      expect(f.line).toBeGreaterThanOrEqual(0);
      expect(f.line).toBeLessThan(CRT_CODE.length);
    }
    const keys = [...f.state.rows.map((r) => r.key), f.state.merged.key];
    expect(new Set(keys).size).toBe(keys.length);
    for (const row of [...f.state.rows, f.state.merged]) {
      const at = row.points.map((p) => p.at);
      expect(new Set(at).size).toBe(at.length);
      // One assertion per row (not per point) keeps 300 random runs fast under a loaded CI.
      expect(at.filter((p) => !Number.isInteger(p) || p < 0 || p >= f.state.window), `${row.key} in 0..${f.state.window - 1}`).toEqual([]);
    }
  }
}

describe('crtTrace', () => {
  it('agrees with a direct search on random systems, coprime or not, and the answer satisfies every congruence', () => {
    const rand = rng(23);
    for (let t = 0; t < 300; t++) {
      const size = [6, 12, 20][Math.floor(rand() * 3)];
      const ms = Array.from({ length: 1 + Math.floor(rand() * 4) }, () => BigInt(1 + Math.floor(rand() * size)));
      const rs = ms.map(() => BigInt(Math.floor(rand() * 61) - 30));
      const run = crtTrace({ remainders: rs, moduli: ms });
      const want = bruteCrt(rs, ms);
      expect(run.step.result, `${rs} / ${ms}`).toBe(want);
      if (want !== null) rs.forEach((r, i) => expect(pyModBig(want - r, ms[i])).toBe(0n));
      expectWellFormed(run.frames);
      expect(run.frames.length).toBeLessThan(2000);
    }
  });

  it('the classic system 2, 3, 2 modulo 3, 5, 7 merges to 8 (mod 15), then 23 (mod 105)', () => {
    const run = crtTrace(parseCrt('2 mod 3, 3 mod 5, 2 mod 7'));
    expect(run.step.result).toBe(23n);
    expect(run.step.merges.map((m) => m[4])).toEqual([
      [2n, 3n],
      [8n, 15n],
      [23n, 105n],
    ]);
    const last = run.frames[run.frames.length - 1].state;
    expect(last.merged.points.map((p) => p.at)).toEqual([23]);
  });

  it('non-coprime moduli: solvable (1 mod 4, 3 mod 6 gives 9 mod 12) and contradictory (1 mod 4, 2 mod 6)', () => {
    expect(crtTrace(parseCrt('1 mod 4, 3 mod 6')).step.result).toBe(9n);
    const none = crtTrace(parseCrt('1 mod 4, 2 mod 6'));
    expect(none.step.result).toBeNull();
    expect(none.frames[none.frames.length - 1].state.verdict?.role).toBe('bad');
  });

  it('guards: lengths that differ, a modulus <= 0, and an empty system', () => {
    expect(crtTrace(parseCrt('r 1 2; m 3')).step).toEqual({ merges: [], egcd: [], result: null });
    expect(crtTrace(parseCrt('r 1 2; m 3 0')).step.result).toBeNull();
    expect(crtTrace(parseCrt('r; m')).step.result).toBe(0n);
  });

  it('large moduli stay exact: the Python test with 10^9 + 7 and 998244353', () => {
    const run = crtTrace(parseCrt('1000000006 mod 1000000007, 998244352 mod 998244353'));
    expect(run.step.result).toBe(998244359987710470n);
  });

  it('the largest input: the picture shortens numbers past 13 characters, the captions keep every digit, one stage size', () => {
    const moduli = [999999999989n, 999999999961n, 999999999959n, 999999999937n, 999999999899n, 999999999877n];
    const remainders = [-999999999999n, 123456789012n, -500000000000n, 999999999999n, 7n, -1000000000000n];
    const run = crtTrace(parseCrt(moduli.map((m, i) => `${remainders[i]} mod ${m}`).join(', ')));
    const x = run.step.result!;
    remainders.forEach((r, i) => expect(pyModBig(x - r, moduli[i])).toBe(0n));
    expect(String(x).length).toBeGreaterThan(60);
    expect(run.frames[run.frames.length - 1].caption).toContain(String(x));
    const frames = stabilizeCombs(run.frames);
    for (const f of frames) {
      const texts = [...f.state.rows.map((r) => r.label), f.state.merged.label, ...f.state.work, ...(f.state.checks ?? []), f.state.verdict?.text ?? ''];
      const long = texts.flatMap((t) => (t.match(/-?\d+/g) ?? []).filter((d) => d.length > 13));
      expect(long, f.caption).toEqual([]);
      expect(f.state.layout).toEqual(frames[0].state.layout);
    }
    expect(frames[0].state.layout?.verdict).toBe(true);
    // The last frame checks the answer against all six congruences.
    expect(frames[frames.length - 1].state.checks).toHaveLength(6);
  });

  it('words the merged comb with ordinals and checks the answer against every congruence', () => {
    const run = crtTrace(parseCrt('2 mod 3, 3 mod 5, 2 mod 7'));
    const merges = run.frames.filter((f) => f.line === 14).map((f) => f.caption.replace(/.*now keeps /, ''));
    expect(merges).toEqual([
      'every 3rd point: those satisfy the first congruence.',
      'every 15th point: those satisfy the first 2 congruences at once.',
      'every 105th point: those satisfy the first 3 congruences at once.',
    ]);
    expect(run.frames[run.frames.length - 1].state.checks).toEqual(['23 = 2 (mod 3)', '23 = 3 (mod 5)', '23 = 2 (mod 7)']);
    expect(crtTrace(parseCrt('5 mod 1')).frames.find((f) => f.line === 14)!.caption).toContain('now keeps every point');
  });
});

describe('crtTrace matches chinese_remainder_theorem.py (golden fixtures)', () => {
  const cases = fixtures.crt as Array<{ remainders: Array<number | string>; moduli: Array<number | string>; result: number | string | null; merges: unknown[]; egcd: unknown[] }>;
  it('every _merge and extended_gcd call, and the answer', () => {
    expect(cases.length).toBeGreaterThanOrEqual(60);
    for (const c of cases) {
      const run = crtTrace({ remainders: c.remainders.map((v) => BigInt(v)), moduli: c.moduli.map((v) => BigInt(v)) });
      const label = `${c.remainders} / ${c.moduli}`;
      expect(S(run.step.result), label).toBe(S(c.result));
      expect(S(run.step.merges), label).toBe(S(c.merges));
      expect(S(run.step.egcd), label).toBe(S(c.egcd));
    }
  });
});

describe('parseCrt', () => {
  it('reads congruences and the two lists', () => {
    expect(parseCrt('x = 2 (mod 3), 3 mod 5')).toEqual({ remainders: [2n, 3n], moduli: [3n, 5n] });
    expect(parseCrt('r 2, 3, 2; m 3, 5, 7')).toEqual({ remainders: [2n, 3n, 2n], moduli: [3n, 5n, 7n] });
    expect(parseCrt('remainders [1, 2]\nmoduli [3]')).toEqual({ remainders: [1n, 2n], moduli: [3n] });
  });

  it('gives friendly errors', () => {
    expect(() => parseCrt('')).toThrow(InputError);
    expect(() => parseCrt('2 mod')).toThrow(/Cannot read/);
    expect(() => parseCrt('r 1; r 2; m 3')).toThrow(/only once/);
    expect(() => parseCrt('2 mod 10000000000000')).toThrow(/10\^12/);
    expect(() => parseCrt(Array.from({ length: 7 }, (_, i) => `${i} mod ${i + 2}`).join(', '))).toThrow(/At most 6/);
  });
});
