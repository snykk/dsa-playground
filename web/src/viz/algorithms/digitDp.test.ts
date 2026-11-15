import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { DIGIT_CODE, digitBrute, digitFrameCount, digitTrace, parseDigit, type DigitRun } from './digitDp';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/advancedDp.json', import.meta.url), 'utf8'));

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

function expectWellFormed(run: DigitRun) {
  const shape = (i: number) => JSON.stringify(run.frames[i].state.tables.map((t) => [t.rowHeaders, t.colHeaders]));
  for (let i = 0; i < run.frames.length; i++) {
    const f = run.frames[i];
    expect(f.caption.length).toBeGreaterThan(20);
    if (f.line !== undefined) {
      expect(f.line).toBeGreaterThanOrEqual(0);
      expect(f.line).toBeLessThan(DIGIT_CODE.length);
    }
    expect(shape(i), 'the memo table keeps one size').toBe(shape(0));
  }
}

/** Brute force: how many k-digit strings (leading zeros allowed) have each digit sum. */
const strings: number[][] = [];
for (let k = 0; k <= 5; k++) {
  const counts = Array(46).fill(0);
  for (let x = 0; x < 10 ** k; x++) {
    let s = 0;
    for (const ch of String(x)) s += Number(ch);
    counts[s] += 1;
  }
  strings.push(counts);
}

/** What memo[(pos, tight, sum)] must hold: completions of the remaining positions that reach the target. */
function memoBrute(n: number, target: number, pos: number, tight: boolean, sum: number): number {
  const digits = String(n);
  const rest = digits.length - pos;
  const need = target - sum;
  if (need < 0) return 0;
  if (!tight) return strings[rest][need] ?? 0;
  const bound = Number(digits.slice(pos));
  let c = 0;
  for (let x = 0; x <= bound; x++) {
    let s = 0;
    for (const ch of String(x)) s += Number(ch);
    if (s === need) c++;
  }
  return c;
}

describe('digitTrace matches count_numbers_with_digit_sum (golden fixtures)', () => {
  it('makes the same calls in the same order, fills the memo in the same order and returns the same count', () => {
    const cases = fixtures.digit as Array<{
      n: number;
      target: number;
      calls: Array<[number, number, number, number]>;
      memo: Array<[number, number, number, number]>;
      count: number;
    }>;
    expect(cases.length).toBeGreaterThanOrEqual(50);
    for (const c of cases) {
      const run = digitTrace({ n: c.n, target: c.target });
      const label = `n ${c.n}, target ${c.target}`;
      expect(
        run.calls.map((k) => [k.pos, k.tight ? 1 : 0, k.sum, k.value]),
        label,
      ).toEqual(c.calls);
      expect(
        run.memo.map(([p, t, s, v]) => [p, t ? 1 : 0, s, v]),
        label,
      ).toEqual(c.memo);
      expect(run.count).toBe(c.count);
    }
  });
});

describe('digitTrace against brute force', () => {
  it('counts like a loop over 0..n, and every memo entry counts the right completions', () => {
    const rand = rng(7);
    for (let t = 0; t < 150; t++) {
      const n = [Math.floor(rand() * 120) - 5, Math.floor(rand() * 1000), Math.floor(rand() * 10000), Math.floor(rand() * 100000)][Math.floor(rand() * 4)];
      const target = Math.floor(rand() * 21);
      if (digitFrameCount({ n, target }) > 2000) continue;
      const run = digitTrace({ n, target });
      expect(run.count, `n ${n}, target ${target}`).toBe(n < 0 ? 0 : digitBrute(n, target));
      for (const [pos, tight, sum, value] of run.memo) expect(value, `memo (${pos}, ${tight}, ${sum})`).toBe(memoBrute(n, target, pos, tight, sum));
      expect(run.frames.length).toBe(digitFrameCount({ n, target }));
      expectWellFormed(run);
    }
  });

  it('computes each state once: a second visit is a memo hit', () => {
    const run = digitTrace({ n: 345, target: 6 });
    const computed = run.calls.filter((c) => c.kind === 'computed').map((c) => `${c.pos},${c.tight},${c.sum}`);
    expect(new Set(computed).size).toBe(computed.length);
    expect(run.calls.some((c) => c.kind === 'memo')).toBe(true);
    const hit = run.frames.find((f) => f.line === 6)!;
    expect(hit.caption).toMatch(/already in memo/);
    expect(hit.state.tables[0].cells.flat().some((c) => c?.role === 'good')).toBe(true);
  });
});

describe('digitTrace scenarios', () => {
  it('the article example: 0..25 with digit sum 5 is 3, with the memo the article lists', () => {
    const run = digitTrace(parseDigit('n 25, target 5'));
    expect(run.count).toBe(3);
    expect(run.memo.map(([p, t, s, v]) => `${p},${t ? 'T' : 'F'},${s}=${v}`).sort()).toEqual(['0,T,0=3', '1,F,0=1', '1,F,1=1', '1,T,2=1']);
  });

  it('a negative bound returns 0 before any call, and an unreachable sum counts nothing', () => {
    const neg = digitTrace(parseDigit('n -1, target 0'));
    expect([neg.count, neg.calls.length, neg.frames.length]).toEqual([0, 0, 1]);
    expect(digitTrace(parseDigit('99 19')).count).toBe(0);
    expect(digitTrace(parseDigit('n 0, target 0')).count).toBe(1);
    expect(digitTrace(parseDigit('n 1000, target 0')).count).toBe(1);
  });

  it('prunes a digit whose sum would pass the target, in one frame', () => {
    const run = digitTrace(parseDigit('n 25, target 5'));
    const pruned = run.frames.filter((f) => f.line === 10);
    expect(pruned.length).toBeGreaterThan(0);
    expect(pruned[0].caption).toMatch(/no call is made/);
  });
});

describe('parseDigit', () => {
  it('reads named and bare forms', () => {
    expect(parseDigit('n 25, target 5')).toEqual({ n: 25, target: 5 });
    expect(parseDigit('25 5')).toEqual({ n: 25, target: 5 });
    expect(parseDigit('n=100 target=10')).toEqual({ n: 100, target: 10 });
  });

  it('gives friendly errors', () => {
    expect(() => parseDigit('25')).toThrow(InputError);
    expect(() => parseDigit('n 100000, target 3')).toThrow(/99999/);
    expect(() => parseDigit('n 50, target 30')).toThrow(/0 to 20/);
  });

  it('keeps the largest inputs well under 2000 steps', () => {
    let most = 0;
    for (const n of [99999, 99989, 98999, 90909, 89999, 59999, 9999, 9039]) {
      for (let s = 0; s <= 20; s++) most = Math.max(most, digitFrameCount({ n, target: s }));
    }
    expect(most).toBeGreaterThan(500);
    expect(most).toBeLessThan(1000);
    expect(digitTrace(parseDigit('n 99999, target 20')).frames.length).toBe(digitFrameCount({ n: 99999, target: 20 }));
  });
});
