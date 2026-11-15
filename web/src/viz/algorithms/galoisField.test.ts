import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError, type Frame } from '../core/types';
import type { FieldState } from '../renderers/FieldBits';
import { EXP_TABLE, FIELD_CODE, fieldTrace, LOG_TABLE, parseField, polyText, slowMultiply, type FieldOp, type FieldResult } from './galoisField';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/greedyAndField.json', import.meta.url), 'utf8'));

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

/**
 * Schoolbook reference, independent of the tables and of the shift-and-add loop: multiply the
 * two polynomials over GF(2) without carries, then take the remainder modulo x^8 + x^4 + x^3 + x + 1
 * by long division from the top bit down.
 */
function schoolMul(a: number, b: number): number {
  let product = 0;
  for (let i = 0; i < 8; i++) if ((b >> i) & 1) product ^= a << i;
  for (let bit = 15; bit >= 8; bit--) if ((product >> bit) & 1) product ^= 0x11b << (bit - 8);
  return product;
}
function schoolInv(b: number): number {
  for (let x = 1; x < 256; x++) if (schoolMul(b, x) === 1) return x;
  throw new Error('no inverse');
}
function schoolPow(a: number, n: number): number {
  const base = n < 0 ? schoolInv(a) : a;
  let r = 1;
  for (let k = 0; k < Math.abs(n) % 255; k++) r = schoolMul(r, base);
  return r;
}
/** The expected result of one operation, from schoolbook arithmetic and the Python error rules. */
function expected(op: FieldOp): FieldResult {
  switch (op.kind) {
    case 'add':
    case 'sub':
      return op.a ^ op.b;
    case 'mul':
      return schoolMul(op.a, op.b);
    case 'div':
      return op.b === 0 ? 'ZeroDivisionError' : op.a === 0 ? 0 : schoolMul(op.a, schoolInv(op.b));
    case 'inv':
      return op.b === 0 ? 'ZeroDivisionError' : schoolInv(op.b);
    default:
      return op.a === 0 ? (op.n === 0 ? 'ValueError' : 0) : schoolPow(op.a, op.n);
  }
}

function expectWellFormed(frames: Array<Frame<FieldState>>) {
  for (const f of frames) {
    expect(f.caption.length).toBeGreaterThan(15);
    if (f.line !== undefined) {
      expect(f.line).toBeGreaterThanOrEqual(0);
      expect(f.line).toBeLessThan(FIELD_CODE.length);
    }
    expect(f.state.rows.length).toBeLessThanOrEqual(4);
    const ids = f.state.rows.flatMap((r) => r.bits.map((b) => b.id));
    expect(new Set(ids).size, f.caption).toBe(ids.length);
    for (const m of f.state.ring.marks) expect(m.at >= 0 && m.at < 255).toBe(true);
    for (const a of f.state.ring.arcs) expect(Math.abs(a.len)).toBeLessThanOrEqual(255);
  }
}

function randomOps(rand: () => number, count: number): FieldOp[] {
  const byte = () => (rand() < 0.12 ? 0 : rand() < 0.1 ? 1 : Math.floor(rand() * 256));
  return Array.from({ length: count }, (): FieldOp => {
    const r = rand();
    if (r < 0.15) return { kind: 'add', a: byte(), b: byte() };
    if (r < 0.2) return { kind: 'sub', a: byte(), b: byte() };
    if (r < 0.5) return { kind: 'mul', a: byte(), b: byte() };
    if (r < 0.65) return { kind: 'div', a: byte(), b: byte() };
    if (r < 0.8) return { kind: 'inv', b: byte() };
    return { kind: 'pow', a: byte(), n: Math.floor(rand() * 1200) - 600 };
  });
}

describe('GF256 tables and operations match galois_field.py (golden fixtures)', () => {
  const field = fixtures.field as { exp: number[]; log: number[]; slow: Array<[number, number, number]>; ops: Array<[string, ...Array<number | string>]> };

  it('builds the same 512-entry exp_table and 256-entry log_table', () => {
    expect(EXP_TABLE).toEqual(field.exp);
    expect(LOG_TABLE).toEqual(field.log);
  });

  it('_slow_multiply agrees on every recorded pair', () => {
    for (const [a, b, r] of field.slow) expect(slowMultiply(a, b), `${a} * ${b}`).toBe(r);
  });

  it('every add / sub / mul / div / inv / pow gives the same byte or raises the same exception', () => {
    const ops: FieldOp[] = field.ops.map(([name, ...args]) =>
      name === 'inv' ? { kind: 'inv', b: args[0] as number } : name === 'pow' ? { kind: 'pow', a: args[0] as number, n: args[1] as number } : ({ kind: name, a: args[0], b: args[1] } as FieldOp),
    );
    const want = field.ops.map((row) => row[row.length - 1]);
    expect(ops.length).toBeGreaterThanOrEqual(300);
    // Twelve operations per run, as the input box allows.
    for (let i = 0; i < ops.length; i += 12) {
      const run = fieldTrace({ ops: ops.slice(i, i + 12) });
      expect(run.steps.map((s) => s.result)).toEqual(want.slice(i, i + 12));
    }
  });
});

describe('fieldTrace against schoolbook polynomial arithmetic', () => {
  it('the tables multiply like long multiplication mod 0x11B, for all 65536 pairs', () => {
    for (let a = 0; a < 256; a++) {
      for (let b = 0; b < 256; b++) {
        const viaTables = a && b ? EXP_TABLE[LOG_TABLE[a] + LOG_TABLE[b]] : 0;
        if (viaTables !== schoolMul(a, b) || slowMultiply(a, b) !== viaTables) expect([a, b, viaTables, slowMultiply(a, b)]).toEqual([a, b, schoolMul(a, b), schoolMul(a, b)]);
      }
    }
    // 3 generates all 255 nonzero bytes; 2 does not (order 51 under 0x11B).
    expect(new Set(EXP_TABLE.slice(0, 255)).size).toBe(255);
    let x = 2;
    let order = 1;
    while (x !== 1) {
      x = schoolMul(x, 2);
      order++;
    }
    expect(order).toBe(51);
  });

  it('agrees on random scripts, and every pass of _slow_multiply keeps result + a * b equal to the product', () => {
    const rand = rng(31);
    for (let t = 0; t < 150; t++) {
      const ops = randomOps(rand, 1 + Math.floor(rand() * 12));
      const run = fieldTrace({ ops });
      run.steps.forEach((s, i) => {
        expect(s.result, JSON.stringify(ops[i])).toEqual(expected(ops[i]));
        if (s.op.kind === 'mul') {
          const goal = schoolMul(s.op.a, s.op.b);
          for (const [a, b, r] of s.slow!) expect(schoolMul(a, b) ^ r).toBe(goal);
          expect(s.slow!.length).toBeLessThanOrEqual(8);
        }
      });
      expectWellFormed(run.frames);
    }
  });
});

describe('fieldTrace scenarios', () => {
  it('the AES vector: 0x53 * 0xCA = 0x01 through log 48 + 207 = 255 and the doubled table', () => {
    const run = fieldTrace(parseField('mul 0x53 0xCA, inv 0x53, add 0x53 0xCA'));
    expect(run.steps.map((s) => s.result)).toEqual([1, 0xca, 0x99]);
    expect(LOG_TABLE[0x53]).toBe(48);
    expect(LOG_TABLE[0xca]).toBe(207);
    expect(run.frames.some((f) => f.caption.startsWith('exp_table[255] = 0x01. The index passed 254'))).toBe(true);
    expect(polyText(0x53)).toBe('x^6 + x^4 + x + 1');
  });

  it('a shift keeps the bit ids, so the bits of a glide one place left', () => {
    const run = fieldTrace(parseField('mul 0x80 2'));
    const shift = run.frames.findIndex((f) => f.line === FIELD_CODE.indexOf('    b >>= 1; a <<= 1                        # next bit of b; a = a * x'));
    const before = run.frames[shift - 1].state.rows[0].bits.find((b) => b.pos === 7)!;
    const after = run.frames[shift].state.rows[0].bits.find((b) => b.id === before.id)!;
    expect([before.v, after.pos, after.v]).toEqual([1, 8, 1]);
    // 0x80 * x overflows into bit 8 and is reduced: 0x100 ^ 0x11B = 0x1B.
    expect(run.steps[0].result).toBe(0x1b);
    expect(run.frames.some((f) => f.caption.includes('0x100 ^ 0x11B = 0x1B'))).toBe(true);
  });

  it('errors get their own frame and the run goes on', () => {
    const run = fieldTrace(parseField('div 1 0, inv 0, pow 0 0, pow 0 -3, pow 3 -1, div 0 9'));
    expect(run.steps.map((s) => s.result)).toEqual(['ZeroDivisionError', 'ZeroDivisionError', 'ValueError', 0, schoolInv(3), 0]);
    expect(run.frames.filter((f) => /raises (ZeroDivisionError|ValueError)/.test(f.caption)).length).toBe(3);
    expect(run.frames.some((f) => f.caption.includes("Python's % is never negative"))).toBe(true);
  });

  it('stays well under 2000 frames on the largest input', () => {
    const run = fieldTrace(parseField(Array.from({ length: 12 }, () => 'mul 0xFF 0xFF').join(', ')));
    expect(run.frames.length).toBeLessThan(2000);
  });
});

describe('parseField', () => {
  it('reads names, calls, infix forms, hex and decimal', () => {
    expect(parseField('mul 0x53 0xCA; add(83, 202), 5 + 3, 0x53 * 2, 7 / 3, 3 ** -1, inv 1, sub 4 4, pow 2 8').ops).toEqual([
      { kind: 'mul', a: 0x53, b: 0xca },
      { kind: 'add', a: 83, b: 202 },
      { kind: 'add', a: 5, b: 3 },
      { kind: 'mul', a: 0x53, b: 2 },
      { kind: 'div', a: 7, b: 3 },
      { kind: 'pow', a: 3, n: -1 },
      { kind: 'inv', b: 1 },
      { kind: 'sub', a: 4, b: 4 },
      { kind: 'pow', a: 2, n: 8 },
    ]);
  });

  it('gives friendly errors', () => {
    expect(() => parseField('')).toThrow(InputError);
    expect(() => parseField('mul 256 1')).toThrow(/0 to 255/);
    expect(() => parseField('mul 1')).toThrow(/two values/);
    expect(() => parseField('inv 1 2')).toThrow(/one byte/);
    expect(() => parseField('pow 3 1000')).toThrow(/-999 to 999/);
    expect(() => parseField('frob 1 2')).toThrow(/Cannot read/);
    expect(() => parseField('mul x 2')).toThrow(/not a byte/);
    expect(() => parseField(Array.from({ length: 13 }, () => 'add 1 2').join(', '))).toThrow(/12 operations/);
  });
});
