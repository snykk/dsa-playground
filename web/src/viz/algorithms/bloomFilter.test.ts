import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { BLOOM_CODE, bloomHashes, bloomSize, bloomTrace, parseBloom, pyRound, type BloomOp, type BloomStep } from './bloomFilter';
import { md5Hex } from './md5';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/hashing.json', import.meta.url), 'utf8'));

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

describe('md5', () => {
  it('passes the RFC 1321 test suite', () => {
    expect(md5Hex('')).toBe('d41d8cd98f00b204e9800998ecf8427e');
    expect(md5Hex('a')).toBe('0cc175b9c0f1b6a831c399e269772661');
    expect(md5Hex('abc')).toBe('900150983cd24fb0d6963f7d28e17f72');
    expect(md5Hex('message digest')).toBe('f96b697d7cb7938d525a2f31aaf161d0');
    expect(md5Hex('abcdefghijklmnopqrstuvwxyz')).toBe('c3fcd3d76192e4007dfb496cca67e13b');
    expect(md5Hex('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789')).toBe('d174ab98d277d9f5a5611c2c9f419d9f');
    expect(md5Hex('1234567890'.repeat(8))).toBe('57edf4a22be3c955ac49da2e2107b67a');
  });

  it("matches Python's hashlib on the fixture strings (padding at every block boundary)", () => {
    const pairs = fixtures.md5 as Array<[string, string]>;
    expect(pairs.length).toBeGreaterThan(30);
    for (const [text, digest] of pairs) expect(md5Hex(text), text).toBe(digest);
  });
});

describe('Bloom filter sizing', () => {
  it("rounds a half to even, like Python's round()", () => {
    expect([0.5, 1.5, 2.5, 3.5, 2.4999, 2.5001, 6.65].map(pyRound)).toEqual([0, 2, 2, 4, 2, 3, 7]);
  });

  it('computes m and k exactly as BloomFilter.__init__ (golden fixtures)', () => {
    expect(bloomSize(100, 0.01)).toEqual({ m: 959, k: 7 });
    expect(bloomSize(2, 0.5)).toEqual({ m: 3, k: 1 });
    const rows = fixtures.bloomSize as Array<[number, number, number, number]>;
    expect(rows.length).toBeGreaterThanOrEqual(400);
    for (const [capacity, rate, m, k] of rows) expect(bloomSize(capacity, rate), `${capacity}, ${rate}`).toEqual({ m, k });
  });
});

describe('bloomTrace', () => {
  it('matches the Python BloomFilter (golden fixtures): m, k, positions, results and set bits', () => {
    const cases = fixtures.bloom as Array<{ capacity: number; error_rate: number; m: number; k: number; ops: Array<[string, string]>; steps: BloomStep[] }>;
    expect(cases.length).toBeGreaterThanOrEqual(40);
    for (const c of cases) {
      const ops = c.ops.map(([kind, item]): BloomOp => ({ kind: kind as BloomOp['kind'], item }));
      const run = bloomTrace({ capacity: c.capacity, errorRate: c.error_rate, ops });
      expect([run.m, run.k]).toEqual([c.m, c.k]);
      c.steps.forEach((want, i) => {
        expect(run.steps[i].positions, c.ops[i][1]).toEqual(want.positions);
        expect(run.steps[i].result).toBe(want.result);
        expect(run.steps[i].set).toEqual(want.set);
      });
    }
  });

  it('never gives a false negative, and contains is exactly "all k bits set" (random scripts)', () => {
    const rand = rng(31);
    const words = Array.from({ length: 40 }, (_, i) => `w${i}`);
    for (let t = 0; t < 120; t++) {
      const capacity = 1 + Math.floor(rand() * 10);
      const errorRate = [0.5, 0.3, 0.1, 0.05][Math.floor(rand() * 4)];
      const { m, k } = bloomSize(capacity, errorRate);
      if (m > 64) continue;
      const ops = Array.from({ length: 1 + Math.floor(rand() * 15) }, (): BloomOp => ({ kind: rand() < 0.5 ? 'add' : 'contains', item: words[Math.floor(rand() * words.length)] }));
      const run = bloomTrace({ capacity, errorRate, ops });
      const set = new Set<number>();
      const added = new Set<string>();
      ops.forEach((op, i) => {
        const positions = bloomHashes(op.item, k, m).map((h) => h.pos);
        expect(run.steps[i].positions).toEqual(positions);
        if (op.kind === 'add') {
          positions.forEach((p) => set.add(p));
          added.add(op.item);
        } else {
          expect(run.steps[i].result).toBe(positions.every((p) => set.has(p)));
          if (added.has(op.item)) expect(run.steps[i].result).toBe(true);
        }
        expect(run.steps[i].set).toEqual([...set].sort((a, b) => a - b));
      });
      for (const f of run.frames) {
        expect(f.caption.length).toBeGreaterThan(10);
        if (f.line !== undefined) expect(f.line).toBeLessThan(BLOOM_CODE.length);
        expect(f.state.bits.length).toBe(m);
      }
      expect(run.frames.length).toBeLessThan(2000);
    }
  });

  it('shows the article example: a definite no and a false positive', () => {
    const run = bloomTrace(parseBloom('n 5, p 0.1; add cat, add dog, contains cat, contains owl, contains aoo'));
    expect([run.m, run.k]).toEqual([24, 3]);
    expect(run.steps.map((s) => s.positions)).toEqual([
      [20, 7, 2],
      [17, 7, 15],
      [20, 7, 2],
      [21, 1, 2],
      [17, 2, 20],
    ]);
    expect(run.steps.map((s) => s.result)).toEqual([null, null, true, false, true]);
    const last = run.frames[run.frames.length - 2];
    expect(last.caption).toMatch(/false positive/);
    // The definite no stops at the first 0 bit.
    expect(run.frames.filter((f) => f.caption.includes("'owl' was definitely never added")).length).toBe(1);
  });
});

describe('parseBloom', () => {
  it('reads the size in several spellings and the operations', () => {
    expect(parseBloom('n 5, p 0.1; add cat, contains dog')).toEqual({ capacity: 5, errorRate: 0.1, ops: [{ kind: 'add', item: 'cat' }, { kind: 'contains', item: 'dog' }] });
    expect(parseBloom('capacity 5 error_rate 10%; a x, check y, has z')).toMatchObject({ capacity: 5, errorRate: 0.1 });
    expect(parseBloom("add('cat')").ops).toEqual([{ kind: 'add', item: 'cat' }]);
    expect(parseBloom('add cat')).toMatchObject({ capacity: 5, errorRate: 0.01 });
  });

  it('gives friendly errors', () => {
    expect(() => parseBloom('')).toThrow(InputError);
    expect(() => parseBloom('n 0; add cat')).toThrow(/ValueError/);
    expect(() => parseBloom('n 5, p 1; add cat')).toThrow(/strictly between 0 and 1/);
    expect(() => parseBloom('n 50, p 0.01; add cat')).toThrow(/m = 480 bits/);
    expect(() => parseBloom('n 5; remove cat')).toThrow(/Cannot read/);
    expect(() => parseBloom('n 5; add toolongitem')).toThrow(/1 to 8/);
  });
});
