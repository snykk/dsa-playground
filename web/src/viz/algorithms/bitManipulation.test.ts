import { describe, expect, it } from 'vitest';
import { InputError, type Frame } from '../core/types';
import { stabilizeBits, type BitRowsState } from '../renderers/BitRows';
import {
  BIT_CODE,
  BIT_LIMITS,
  bitTrace,
  formatBitResult,
  parseBitOps,
  parseSubsetN,
  runBitOp,
  SUBSET_CODE,
  subsetGeneration,
  subsetTrace,
  type BitOp,
  type BitOpName,
  type BitResult,
} from './bitManipulation';
import { FIXTURES, framesProblems, rng } from './patternsMoreTestKit';

/** Frames: unique bit ids per frame, every bit inside the window of its row (problems collected, one expect per run). */
function expectBitsWellFormed(frames: Array<Frame<BitRowsState>>, codeLines: number) {
  const problems = framesProblems(frames, codeLines);
  for (const f of stabilizeBits(frames)) {
    const ids = f.state.rows.flatMap((r) => r.bits.map((b) => b.id));
    if (new Set(ids).size !== ids.length) problems.push(`${f.caption}: repeated bit ids`);
    const keys = f.state.rows.map((r) => r.key);
    if (new Set(keys).size !== keys.length) problems.push(`${f.caption}: repeated row keys`);
    for (const r of f.state.rows) {
      if (r.bits.length !== (r.wide ? 64 : f.state.width)) problems.push(`${f.caption} ${r.label}: ${r.bits.length} bits`);
      if (Boolean(r.wide) !== (f.state.width === 64)) problems.push(`${f.caption} ${r.label}: wide is ${r.wide} at width ${f.state.width}`);
      // The drawn bits and sign spell the value (two's complement inside the window).
      const v = BigInt(r.value);
      for (const b of r.bits) if (b.v !== Number((v >> BigInt(b.pos)) & 1n)) problems.push(`${f.caption} ${r.label}: bit ${b.pos} is ${b.v}`);
      if (r.sign !== (v < 0n ? 1 : 0)) problems.push(`${f.caption} ${r.label}: sign ${r.sign}`);
    }
    if (!((f.state.rowSlots ?? -1) >= f.state.rows.length)) problems.push(`${f.caption}: ${f.state.rowSlots} row slots for ${f.state.rows.length} rows`);
  }
  expect(problems).toEqual([]);
}

/** Python's int semantics, independently: floor shifts and two's complement via modular arithmetic. */
function pythonModel(op: BitOp): BitResult {
  const [a, b] = op.args;
  const popcount = (v: bigint) => {
    let n = v < 0n ? ((v % (1n << 64n)) + (1n << 64n)) % (1n << 64n) : v;
    let c = 0n;
    for (; n > 0n; n /= 2n) c += n % 2n;
    return c;
  };
  const bitOf = (v: bigint, i: bigint) => (((v / 2n ** i) - (v < 0n && v % 2n ** i !== 0n ? 1n : 0n)) % 2n + 2n) % 2n; // floor(v / 2^i) mod 2
  const setTo = (v: bigint, i: bigint, bit: bigint) => v + (bit - bitOf(v, i)) * 2n ** i;
  switch (op.name) {
    case 'power':
      return a > 0n && popcount(a) === 1n;
    case 'count':
      return popcount(a);
    case 'get':
      return bitOf(a, b);
    case 'set':
      return setTo(a, b, 1n);
    case 'clear':
      return setTo(a, b, 0n);
    case 'toggle':
      return setTo(a, b, 1n - bitOf(a, b));
    case 'lowest': {
      if (a === 0n) return 0n;
      let i = 0n;
      while (bitOf(a, i) === 0n) i++;
      return 2n ** i;
    }
    case 'highest': {
      if (a <= 0n) return -1n;
      let i = 0n;
      while (2n ** (i + 1n) <= a) i++;
      return i;
    }
    case 'diff': {
      let c = 0n;
      for (let i = 0n; i < 64n; i++) if (bitOf(a, i) !== bitOf(b, i)) c++;
      return c;
    }
    case 'swap':
      return [b, a];
    case 'even':
      return bitOf(a, 0n) === 0n;
    case 'next': {
      let p = 1n;
      while (p < a) p *= 2n;
      return p;
    }
  }
}

const NAMES = Object.keys({ power: 1, count: 1, get: 1, set: 1, clear: 1, toggle: 1, lowest: 1, highest: 1, diff: 1, swap: 1, even: 1, next: 1 }) as BitOpName[];

describe('the bit_manipulation functions in BigInt', () => {
  it('reproduce every golden result, Kernighan round and shift', () => {
    const cases = FIXTURES.bits.filter((c) => c.op[0] !== 'subsets') as Array<{ op: [BitOpName, ...number[]]; result: string | boolean | string[]; kernighan?: string[]; shift?: string[]; double?: string[] }>;
    expect(cases.length).toBeGreaterThanOrEqual(200);
    for (const c of cases) {
      const op: BitOp = { name: c.op[0], args: c.op.slice(1).map((v) => BigInt(v as number)) };
      const rec = runBitOp(op);
      const label = JSON.stringify(c.op);
      const got = rec.result;
      expect(typeof got === 'boolean' ? got : Array.isArray(got) ? got.map(String) : String(got), label).toEqual(c.result);
      expect(rec.kernighan?.map(String), label).toEqual(c.kernighan);
      expect(rec.shift?.map(String), label).toEqual(c.shift);
      expect(rec.double?.map(String), label).toEqual(c.double);
    }
  });

  it('agree with an arithmetic model of Python ints on random operations', () => {
    const r = rng(77);
    for (let t = 0; t < 400; t++) {
      const name = r.pick(NAMES);
      const a = BigInt(r.int(BIT_LIMITS.minValue, BIT_LIMITS.maxValue));
      const args = ['get', 'set', 'clear', 'toggle'].includes(name) ? [a, BigInt(r.int(0, 15))] : ['diff', 'swap'].includes(name) ? [a, BigInt(r.int(-999, 9999))] : [a];
      const op = { name, args };
      expect(runBitOp(op).result, JSON.stringify([name, ...args.map(String)])).toEqual(pythonModel(op));
    }
  });

  it('subset_generation lists the subsets in mask order, like the Python', () => {
    for (const c of FIXTURES.bits.filter((x) => x.op[0] === 'subsets')) {
      expect(subsetGeneration(c.op[1])).toEqual(c.result);
      expect(subsetTrace(c.op[1]).result).toEqual(c.result);
    }
  });
});

describe('bitTrace', () => {
  it('shows each operation and ends on the value it returns', () => {
    const r = rng(78);
    for (let t = 0; t < 60; t++) {
      const ops: BitOp[] = Array.from({ length: r.int(1, 6) }, () => {
        const name = r.pick(NAMES);
        const a = BigInt(r.pick([r.int(-999, 9999), r.int(-20, 40)]));
        const args = ['get', 'set', 'clear', 'toggle'].includes(name) ? [a, BigInt(r.int(0, 15))] : ['diff', 'swap'].includes(name) ? [a, BigInt(r.int(-999, 9999))] : [a];
        return { name, args };
      });
      const run = bitTrace(ops);
      expectBitsWellFormed(run.frames, BIT_CODE.length);
      const returns = run.frames.flatMap((f) => (f.vars ?? []).filter(([k]) => k === 'returns').map(([, v]) => v));
      expect(returns).toEqual(run.steps.map((s) => formatBitResult(s.result)));
      // Kernighan frames show the n of every round, in order.
      run.steps.forEach((s, i) => {
        if (!s.kernighan) return;
        const name = `op`;
        const shown = run.frames.filter((f) => f.line === 2 && f.vars?.some(([k, v]) => k === name && v === `${s.op.name === 'count' ? 'count_set_bits' : 'count_differing_bits'}(${s.op.args.join(', ')})`) && f.vars?.some(([k]) => k === 'n')).map((f) => f.vars!.find(([k]) => k === 'n')![1]);
        expect(shown.slice(0, s.kernighan.length), `op ${i}`).toEqual(s.kernighan.map(String));
      });
    }
  });

  it('masks a negative count to 64 bits, as the Python does', () => {
    const run = bitTrace(parseBitOps('count -8'));
    expect(formatBitResult(run.steps[0].result)).toBe('61');
    const masked = run.frames.find((f) => f.caption.includes('(1 << 64) - 1'))!;
    expect(masked.state.width).toBe(64);
    expect(masked.state.rows[2].value).toBe('18446744073709551608');
    expect(run.frames.filter((f) => f.line === 2 && f.caption.startsWith('Round')).length).toBe(61);
  });

  it('glides the bits of a shift: n >> i keeps the bit ids of n', () => {
    const run = bitTrace(parseBitOps('get 13 2'));
    const [before, after] = run.frames.filter((f) => f.line === 3).slice(0, 2);
    const id2 = before.state.rows[0].bits.find((b) => b.pos === 2)!.id;
    expect(after.state.rows[0].bits.find((b) => b.pos === 0)!.id).toBe(id2);
    expect(formatBitResult(run.steps[0].result)).toBe('1');
  });

  it('stays under 2000 frames on the largest input', () => {
    const run = bitTrace(parseBitOps(Array.from({ length: 12 }, () => 'count -1').join(', ')));
    expect(run.frames.length).toBeLessThan(2000);
  });
});

describe('subsetTrace', () => {
  it('walks every mask and every bit, with well-formed frames', () => {
    for (let n = 0; n <= BIT_LIMITS.maxSubsetN; n++) {
      const run = subsetTrace(n);
      expectBitsWellFormed(run.frames, SUBSET_CODE.length);
      expect(run.frames.length).toBe(2 + 2 ** n * (n + 2));
    }
  });
});

describe('parsers', () => {
  it('read operations by short name or Python name, with parentheses or spaces', () => {
    expect(parseBitOps('count 13, get_bit(13, 2), is_power_of_two(16); swap 3 7')).toEqual([
      { name: 'count', args: [13n] },
      { name: 'get', args: [13n, 2n] },
      { name: 'power', args: [16n] },
      { name: 'swap', args: [3n, 7n] },
    ]);
    expect(parseSubsetN('3')).toBe(3);
    expect(parseSubsetN('n = 0')).toBe(0);
  });

  it('give friendly errors', () => {
    expect(() => parseBitOps('')).toThrow(InputError);
    expect(() => parseBitOps('spin 3')).toThrow(/Cannot read/);
    expect(() => parseBitOps('get 13')).toThrow(/bit position/);
    expect(() => parseBitOps('get 13 -1')).toThrow(/negative shift count/);
    expect(() => parseBitOps('set 1 16')).toThrow(/0 to 15/);
    expect(() => parseBitOps('count 10000')).toThrow(/-999 to 9999/);
    expect(() => parseBitOps(Array.from({ length: 13 }, () => 'even 2').join(', '))).toThrow(/At most 12/);
    expect(() => parseSubsetN('-1')).toThrow(/ValueError/);
    expect(() => parseSubsetN('6')).toThrow(/up to 5/);
  });
});
