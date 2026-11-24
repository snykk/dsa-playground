import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { HASH_CODE, HASH_DEFAULTS, HASH_LIMITS, parseStringHashing, stringHashingTrace, type HashOp } from './stringHashing';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/advancedStrings.json', import.meta.url), 'utf8'));

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

const int = (rand: () => number, lo: number, hi: number) => lo + Math.floor(rand() * (hi - lo + 1));

function toOp(kind: string, args: number[]): HashOp {
  switch (kind) {
    case 'hash':
      return { kind, l: args[0], r: args[1] };
    case 'eq':
      return { kind, i: args[0], j: args[1], length: args[2] };
    case 'lcp':
      return { kind, i: args[0], j: args[1] };
    case 'cmp':
      return { kind, l1: args[0], r1: args[1], l2: args[2], r2: args[3] };
    default:
      return { kind: 'distinct', length: args[0] };
  }
}

/** sum of c_k * base^(m-1-k) mod mod, term by term (BigInt, so no rounding). */
function definitionHash(t: string[], base: number, mod: number): number {
  const M = BigInt(mod);
  let sum = 0n;
  t.forEach((c, k) => {
    let p = 1n;
    for (let e = 0; e < t.length - 1 - k; e++) p = (p * BigInt(base)) % M;
    sum = (sum + BigInt(c.codePointAt(0)!) * p) % M;
  });
  return Number(sum);
}

const naiveLcp = (s: string[], i: number, j: number) => {
  let k = 0;
  while (i + k < s.length && j + k < s.length && s[i + k] === s[j + k]) k++;
  return k;
};

const cmpCodes = (a: string[], b: string[]) => {
  for (let k = 0; k < Math.min(a.length, b.length); k++) {
    const d = a[k].codePointAt(0)! - b[k].codePointAt(0)!;
    if (d) return Math.sign(d);
  }
  return Math.sign(a.length - b.length);
};

describe('stringHashingTrace matches the Python string_hashing module (golden fixtures)', () => {
  const cases = fixtures.hashing as Array<{
    text: string;
    base: number;
    mod: number;
    prefix: number[];
    power: number[];
    ops: Array<{ op: string; args: number[]; calls: Array<[number, number, number]>; result: number | boolean }>;
  }>;
  it('has enough cases', () => expect(cases.length).toBeGreaterThanOrEqual(50));
  it('reproduces both tables, every get call of every query and every result', () => {
    for (const c of cases) {
      const run = stringHashingTrace({ text: Array.from(c.text), base: c.base, mod: c.mod, ops: c.ops.map((o) => toOp(o.op, o.args)) });
      expect(run.prefix, c.text).toEqual(c.prefix);
      expect(run.power, c.text).toEqual(c.power);
      expect(run.ops.map((o) => o.calls), c.text).toEqual(c.ops.map((o) => o.calls));
      expect(run.ops.map((o) => o.result), c.text).toEqual(c.ops.map((o) => o.result));
    }
  });
});

describe('stringHashingTrace against the definition and brute force', () => {
  it('hashes every substring as the definition says, for small moduli that collide', () => {
    const rand = rng(31);
    for (let t = 0; t < 60; t++) {
      const text = Array.from({ length: int(rand, 0, 12) }, () => 'abcxyz'[int(rand, 0, 5)]);
      const n = text.length;
      const mod = [2, 7, 11, 97, 101, 997][int(rand, 0, 5)];
      const base = int(rand, 1, mod - 1);
      const ops: HashOp[] = [];
      for (let l = 0; l <= n; l++) for (let r = l; r <= n; r++) ops.push({ kind: 'hash', l, r });
      const run = stringHashingTrace({ text, base, mod, ops });
      run.ops.forEach((o, k) => {
        const op = ops[k] as { l: number; r: number };
        expect(o.result).toBe(definitionHash(text.slice(op.l, op.r), base, mod));
      });
      expect(run.prefix).toEqual(Array.from({ length: n + 1 }, (_, i) => definitionHash(text.slice(0, i), base, mod)));
    }
  });

  it('answers equal, lcp, compare and count_distinct like brute force with a large modulus', () => {
    const rand = rng(57);
    const mod = 1_000_003; // mod^2 < 2^53, so the products stay exact in a double
    for (let t = 0; t < 300; t++) {
      const alphabet = ['a', 'ab', 'abc', 'aZ!'][t % 4];
      const text = Array.from({ length: int(rand, 1, 12) }, () => alphabet[int(rand, 0, alphabet.length - 1)]);
      const n = text.length;
      const base = int(rand, 256, mod - 1);
      const ops: HashOp[] = [];
      const want: Array<number | boolean> = [];
      for (let q = 0; q < 6; q++) {
        const pick = int(rand, 0, 3);
        if (pick === 0) {
          const i = int(rand, 0, n);
          const j = int(rand, 0, n);
          ops.push({ kind: 'lcp', i, j });
          want.push(naiveLcp(text, i, j));
        } else if (pick === 1) {
          const length = int(rand, 0, n);
          const i = int(rand, 0, n - length);
          const j = int(rand, 0, n - length);
          ops.push({ kind: 'eq', i, j, length });
          want.push(text.slice(i, i + length).join('') === text.slice(j, j + length).join(''));
        } else if (pick === 2) {
          const l1 = int(rand, 0, n);
          const r1 = int(rand, l1, n);
          const l2 = int(rand, 0, n);
          const r2 = int(rand, l2, n);
          ops.push({ kind: 'cmp', l1, r1, l2, r2 });
          want.push(cmpCodes(text.slice(l1, r1), text.slice(l2, r2)));
        } else {
          const length = int(rand, 1, n);
          ops.push({ kind: 'distinct', length });
          want.push(new Set(Array.from({ length: n - length + 1 }, (_, i) => text.slice(i, i + length).join(''))).size);
        }
      }
      const run = stringHashingTrace({ text, base, mod, ops });
      expect(run.ops.map((o) => o.result), text.join('')).toEqual(want);
    }
  });

  it('makes at most 2 ceil(log2(limit + 1)) get calls per lcp', () => {
    const text = Array.from('aaaaaaaaaaaa');
    for (let i = 0; i <= 12; i++) {
      for (let j = 0; j <= 12; j++) {
        const run = stringHashingTrace({ text, base: 31, mod: 97, ops: [{ kind: 'lcp', i, j }] });
        const limit = Math.min(12 - i, 12 - j);
        expect(run.ops[0].calls.length).toBeLessThanOrEqual(2 * Math.ceil(Math.log2(limit + 1)));
        expect(run.ops[0].result).toBe(limit);
      }
    }
  });
});

describe('stringHashingTrace frames', () => {
  it('builds the tables with two frames per character and explains every step', () => {
    const run = stringHashingTrace(parseStringHashing('mississippi; lcp 1 4, cmp 0 4 1 5, distinct 4, eq 1 4 4'));
    expect(run.prefix).toEqual([0, 12, 89, 61, 66, 17, 60, 35, 26, 45, 52, 68]);
    expect(run.power).toEqual([1, 31, 88, 12, 81, 86, 47, 2, 62, 79, 24, 65]);
    expect(run.frames.filter((f) => f.line === 2)).toHaveLength(11);
    expect(run.frames.filter((f) => f.line === 3)).toHaveLength(11);
    for (const f of run.frames) {
      expect(f.caption.length).toBeGreaterThan(20);
      if (f.line !== undefined) expect(f.line).toBeLessThan(HASH_CODE.length);
      const prefixRow = f.state.rows.find((r) => r.kind === 'cells' && r.label === 'prefix');
      expect(prefixRow?.kind === 'cells' ? prefixRow.cells.length : 0).toBe(12);
    }
    expect(run.ops.map((o) => o.result)).toEqual([4, 1, 7, true]);
  });

  it('says so when a small modulus misleads the binary search', () => {
    const run = stringHashingTrace(parseStringHashing('abracadabra; lcp 0 4; base 7, mod 11'));
    expect(run.ops[0].result).toBe(4);
    expect(run.frames.some((f) => /collision/.test(f.caption))).toBe(true);
    expect(run.frames.some((f) => /really share 0 characters: a collision fooled the search/.test(f.caption))).toBe(true);
    // 'abracad' < 'cadabra', but the collision at length 4 makes compare read 'c' against 'b'.
    const cmp = stringHashingTrace(parseStringHashing('abracadabra; cmp 0 7 4 11; base 7, mod 11'));
    expect(cmp.ops[0].result).toBe(1);
    expect(cmp.frames.some((f) => /a collision: it is really 0/.test(f.caption))).toBe(true);
    const distinct = stringHashingTrace(parseStringHashing('abracadabra; distinct 4; base 31, mod 101'));
    expect(distinct.ops[0].result).toBe(6);
    expect(distinct.frames.some((f) => /true count is 7/.test(f.caption))).toBe(true);
  });
});

describe('parseStringHashing', () => {
  it('reads the string, the queries and the parameters', () => {
    expect(parseStringHashing('mississippi; lcp 1 4; base 31, mod 97')).toEqual({
      text: Array.from('mississippi'),
      base: 31,
      mod: 97,
      ops: [{ kind: 'lcp', i: 1, j: 4 }],
    });
    expect(parseStringHashing('abc')).toEqual({ text: ['a', 'b', 'c'], base: HASH_DEFAULTS.base, mod: HASH_DEFAULTS.mod, ops: [] });
    expect(parseStringHashing('"" ; lcp 0 0').text).toEqual([]);
    expect(parseStringHashing('ab; mod 7').base).toBe(6);
    expect(parseStringHashing('ab; hash 0 2, eq 0 1 1, cmp 0 1 1 2, distinct 1').ops).toHaveLength(4);
  });

  it('rejects bad input with a message', () => {
    const bad = [
      '',
      'a b; lcp 0 1',
      'abcdefghijklm; lcp 0 1',
      'ab; lcp 0',
      'ab; lcp 0 3',
      'ab; hash 2 1',
      'ab; eq 0 1 2',
      'ab; distinct 0',
      'ab; distinct 3',
      'ab; mod 1',
      `ab; mod ${HASH_LIMITS.maxMod + 1}`,
      'ab; base 0',
      'ab; base 97, mod 97',
      'ab; foo 1',
      'ab; lcp 0 0, lcp 0 0, lcp 0 0, lcp 0 0, lcp 0 0',
    ];
    for (const input of bad) expect(() => parseStringHashing(input), input).toThrow(InputError);
  });
});
