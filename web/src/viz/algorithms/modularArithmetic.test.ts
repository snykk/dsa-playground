import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError, type Frame } from '../core/types';
import { MOD_CODE, modTrace, parseModular, walkPos, type ClockState, type ModOp, type ModOpKind } from './modularArithmetic';
import { pyMod } from './numberTheoryCommon';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/numberTheory.json', import.meta.url), 'utf8'));

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

/** Reference model: brute force over the residues, and bigint powers. */
function bruteInverse(a: number, m: number): number | null {
  for (let x = 0; x < m; x++) if (pyMod(a * x, m) === pyMod(1, m)) return x;
  return null;
}

function bigPow(b: number, e: number, m: number): number {
  let r = 1n;
  const M = BigInt(m);
  let base = ((BigInt(b) % M) + M) % M;
  let k = BigInt(e);
  while (k > 0n) {
    if (k & 1n) r = (r * base) % M;
    base = (base * base) % M;
    k >>= 1n;
  }
  return Number(r % M);
}

function model(op: ModOp, m: number): number | null {
  const b = op.b ?? 0;
  switch (op.kind) {
    case 'add':
      return pyMod(op.a + b, m);
    case 'sub':
      return pyMod(op.a - b, m);
    case 'mul':
      return Number(((BigInt(op.a) * BigInt(b)) % BigInt(m) + BigInt(m)) % BigInt(m));
    case 'inv':
      return bruteInverse(op.a, m);
    case 'div': {
      const inv = bruteInverse(b, m);
      return inv === null ? null : pyMod(pyMod(op.a, m) * inv, m);
    }
    default: {
      if (b >= 0) return m === 1 ? 0 : bigPow(op.a, b, m);
      const inv = bruteInverse(op.a, m);
      return inv === null ? null : m === 1 ? 0 : bigPow(inv, -b, m);
    }
  }
}

function expectWellFormed(frames: Array<Frame<ClockState>>) {
  for (const f of frames) {
    expect(f.caption.length).toBeGreaterThan(10);
    if (f.line !== undefined) {
      expect(f.line).toBeGreaterThanOrEqual(0);
      expect(f.line).toBeLessThan(MOD_CODE.length);
    }
    const ids = f.state.tokens.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    // Tokens of one frame sit on different lanes, so none covers another.
    const lanes = f.state.tokens.map((t) => t.lane);
    expect(new Set(lanes).size).toBe(lanes.length);
    for (const k of Object.keys(f.state.ticks)) expect(Number(k)).toBeLessThan(f.state.m);
  }
}

const KINDS: ModOpKind[] = ['add', 'sub', 'mul', 'div', 'inv', 'pow'];

describe('walkPos', () => {
  it('lands on the residue and keeps the direction of the walk, with at most three full turns', () => {
    for (let m = 1; m <= 13; m++) {
      for (let u = -60; u <= 60; u++) {
        const p = walkPos(u, m);
        expect(pyMod(p, m)).toBe(pyMod(u, m));
        if (u >= 0) expect(p).toBeGreaterThanOrEqual(0);
        else expect(p).toBeLessThan(0);
        expect(Math.abs(p)).toBeLessThan(4 * m + m);
      }
    }
    expect(walkPos(-4, 11)).toBe(-4);
    expect(walkPos(25, 11)).toBe(25);
    expect(walkPos(3481, 59)).toBe(3 * 59 + (3481 % 59));
  });
});

describe('modTrace', () => {
  it('agrees with brute-force inverses and bigint powers on random scripts', () => {
    const rand = rng(17);
    for (let t = 0; t < 200; t++) {
      const m = [1, 2, 3, 4, 6, 7, 8, 9, 10, 11, 12, 13, 24, 30, 37, 60][Math.floor(rand() * 16)];
      const val = () => (rand() < 0.5 ? Math.floor(rand() * 61) - 30 : Math.floor(rand() * 19999) - 9999);
      const ops: ModOp[] = Array.from({ length: 1 + Math.floor(rand() * 6) }, () => {
        const kind = KINDS[Math.floor(rand() * 6)];
        if (kind === 'inv') return { kind, a: val() };
        return { kind, a: val(), b: kind === 'pow' ? Math.floor(rand() * 81) - 20 : val() };
      });
      const run = modTrace({ m, ops });
      ops.forEach((op, i) => {
        const got = run.steps[i].result;
        expect(got, JSON.stringify({ m, op })).toBe(model(op, m));
        if (got !== null) {
          expect(got).toBeGreaterThanOrEqual(0);
          expect(got).toBeLessThan(m);
        }
        // An inverse is checked by its definition.
        if (op.kind === 'inv' && got !== null) expect(pyMod(op.a * got, m)).toBe(pyMod(1, m));
      });
      expectWellFormed(run.frames);
      expect(run.frames.length).toBeLessThan(2000);
    }
  });

  it('shows "no inverse" with the multiples of the gcd marked, and 1 crossed out', () => {
    const run = modTrace(parseModular('m 12; inv 4'));
    expect(run.steps[0].result).toBeNull();
    const none = run.frames.find((f) => f.caption.startsWith('gcd_val = 4 is not 1'))!;
    expect(none.state.ticks).toEqual({ 0: 'compare', 4: 'compare', 8: 'compare', 1: 'bad' });
  });

  it('a negative operand walks counterclockwise, and the inverse of -3 modulo 11 is 7', () => {
    const run = modTrace(parseModular('m 11; add -3 1, inv -3'));
    expect(run.steps.map((s) => s.result)).toEqual([9, 7]);
    const reduce = run.frames.find((f) => f.caption.startsWith('a % m = -3 % 11 = 8'))!;
    expect(reduce.state.tokens.find((t) => t.label === 'a')!.pos).toBe(-3);
  });

  it('the article example modulo 11', () => {
    const run = modTrace(parseModular('m 11; add 7 5, sub 3 5, mul 7 5, inv 3, div 7 5, pow 2 5, pow 2 -1'));
    expect(run.steps.map((s) => s.result)).toEqual([1, 9, 2, 4, 8, 10, 6]);
  });

  it('stays well under 2000 frames on the largest input', () => {
    const text = `m 59; ${Array.from({ length: 10 }, () => 'pow 34 -9999').join(', ')}`;
    expect(modTrace(parseModular(text)).frames.length).toBeLessThan(2000);
  });
});

describe('modTrace matches modular_arithmetic.py (golden fixtures)', () => {
  const cases = fixtures.modArith as Array<{ m: number; ops: Array<[string, number, number?]>; steps: Array<{ result: number | null; egcd: number[][]; loop: number[][] }> }>;
  it('every result, every _extended_gcd_nonneg call and the loop state of mod_power', () => {
    expect(cases.length).toBeGreaterThanOrEqual(40);
    for (const c of cases) {
      const ops: ModOp[] = c.ops.map(([kind, a, b]) => (kind === 'inv' ? { kind: 'inv', a } : { kind: kind as ModOpKind, a, b }));
      const run = modTrace({ m: c.m, ops });
      c.steps.forEach((want, i) => {
        const got = run.steps[i];
        const label = `m ${c.m}: ${JSON.stringify(c.ops[i])}`;
        expect(got.result, label).toBe(want.result);
        expect(got.egcd, label).toEqual(want.egcd);
        expect(got.loop, label).toEqual(want.loop);
      });
    }
  });
});

describe('parseModular', () => {
  it('reads the modulus, the operations and their long names', () => {
    expect(parseModular('m 7; mod_add(1, 2), subtract 3 4, times 2 3, inverse 3, divide 1 3, power 2 -3')).toEqual({
      m: 7,
      ops: [
        { kind: 'add', a: 1, b: 2 },
        { kind: 'sub', a: 3, b: 4 },
        { kind: 'mul', a: 2, b: 3 },
        { kind: 'inv', a: 3 },
        { kind: 'div', a: 1, b: 3 },
        { kind: 'pow', a: 2, b: -3 },
      ],
    });
    expect(parseModular('add 1 2').m, 'the Python demo modulus').toBe(11);
  });

  it('gives friendly errors', () => {
    expect(() => parseModular('m 11')).toThrow(InputError);
    expect(() => parseModular('m 0; add 1 2')).toThrow(/ZeroDivisionError/);
    expect(() => parseModular('m -5; add 1 2')).toThrow(/positive/);
    expect(() => parseModular('m 61; add 1 2')).toThrow(/60/);
    expect(() => parseModular('m 7; m 8; add 1 2')).toThrow(/once/);
    expect(() => parseModular('inv 1 2')).toThrow(/one number/);
    expect(() => parseModular('add 1')).toThrow(/two numbers/);
    expect(() => parseModular('add 10000 1')).toThrow(/9999/);
    expect(() => parseModular('sqrt 4')).toThrow(/Cannot read/);
    expect(() => parseModular(Array.from({ length: 11 }, () => 'add 1 1').join(', '))).toThrow(/At most 10/);
  });
});
