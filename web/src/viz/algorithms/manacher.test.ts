import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { MANACHER_CODE, MANACHER_MAX, manacherTrace, parseManacher, type ManacherResult, type ManacherRun } from './manacher';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/advancedStrings.json', import.meta.url), 'utf8'));

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

const word = (rand: () => number, alphabet: string, lo: number, hi: number) =>
  Array.from({ length: lo + Math.floor(rand() * (hi - lo + 1)) }, () => alphabet[Math.floor(rand() * alphabet.length)]);

/** Brute force: the radius at every center of the transformed string, and the first longest palindrome of s. */
function brute(s: string[]): { p: number[]; result: ManacherResult } {
  const t = ['#'];
  for (const c of s) t.push(c, '#');
  const p = t.map((_, i) => {
    let r = 0;
    while (i - r - 1 >= 0 && i + r + 1 < t.length && t[i - r - 1] === t[i + r + 1]) r++;
    return r;
  });
  let best: ManacherResult = ['', 0, 0];
  for (let a = 0; a < s.length; a++) {
    for (let b = a + 1; b <= s.length; b++) {
      const sub = s.slice(a, b);
      if (sub.join('') === [...sub].reverse().join('') && b - a > best[2]) best = [sub.join(''), a, b - a];
    }
  }
  return { p: s.length ? p : [], result: best };
}

function expectWellFormed(run: ManacherRun) {
  const n = run.transformed.length;
  for (const f of run.frames) {
    expect(f.caption.length).toBeGreaterThan(20);
    if (f.line !== undefined) {
      expect(f.line).toBeGreaterThanOrEqual(0);
      expect(f.line).toBeLessThan(MANACHER_CODE.length);
    }
    const labels = f.state.rows.flatMap((r) => (r.kind === 'gap' ? [] : [r.label]));
    expect(new Set(labels).size).toBe(labels.length);
    for (const r of f.state.rows) {
      if (r.kind === 'cells') expect((r.offset ?? 0) + r.cells.length).toBeLessThanOrEqual(n);
    }
  }
}

describe('manacherTrace matches the Python manacher (golden fixtures)', () => {
  const cases = fixtures.manacher as Array<{ s: string; transformed: string; p: number[]; starts: Array<[number, number]>; result: ManacherResult }>;
  it('has enough cases', () => expect(cases.length).toBeGreaterThanOrEqual(50));
  it('reproduces the transformed string, every radius, (center, right) at every iteration and the tuple', () => {
    for (const c of cases) {
      const run = manacherTrace({ s: Array.from(c.s) });
      expect(run.transformed.join(''), c.s).toBe(c.transformed);
      expect(run.p, c.s).toEqual(c.p);
      expect(run.starts, c.s).toEqual(c.starts);
      expect(run.result, c.s).toEqual(c.result);
    }
  });
});

describe('manacherTrace against brute force', () => {
  it('agrees on random strings, and the expansion stays linear', () => {
    const rand = rng(53);
    for (let t = 0; t < 300; t++) {
      const alphabet = ['ab', 'aab', 'abc', 'a', 'ab#', 'ab^$'][Math.floor(rand() * 6)];
      const s = word(rand, alphabet, 0, MANACHER_MAX);
      const run = manacherTrace({ s });
      const want = brute(s);
      expect(run.p).toEqual(want.p);
      expect(run.result).toEqual(want.result);
      // Successful comparisons push right forward; each index fails at most once.
      expect(run.comparisons).toBeLessThanOrEqual(2 * run.transformed.length);
      expectWellFormed(run);
    }
  });
});

describe('manacherTrace scenarios', () => {
  it('babad: radii [0,1,0,3,0,3,0,1,0,1,0], the first maximum wins', () => {
    const run = manacherTrace(parseManacher('babad'));
    expect(run.p).toEqual([0, 1, 0, 3, 0, 3, 0, 1, 0, 1, 0]);
    expect(run.result).toEqual(['bab', 0, 3]);
  });

  it('the mirror copy glides from the mirror to i, then stays put while i expands', () => {
    const run = manacherTrace(parseManacher('abacaba'));
    const k = run.frames.findIndex((f) => f.line === 4);
    const row = (f: number) => run.frames[f].state.rows.find((r) => r.kind === 'cells' && r.label === 'mirror copy');
    const a = row(k)!;
    const b = row(k + 1)!;
    expect(a.kind === 'cells' && b.kind === 'cells').toBe(true);
    if (a.kind !== 'cells' || b.kind !== 'cells') return;
    expect(a.slide && b.slide).toBe(true);
    expect(a.cells.length).toBeGreaterThan(0);
    expect(b.offset).toBeGreaterThan(a.offset!);
    // Other frames never slide, so the copy cannot glide in from a stale position.
    run.frames.forEach((f, idx) => {
      const r = f.state.rows.find((x) => x.kind === 'cells' && x.label === 'mirror copy');
      if (r?.kind === 'cells' && r.slide) expect([4, 5]).toContain(f.line);
      if (idx > 0 && f.line === 4) {
        const prev = run.frames[idx - 1].state.rows.find((x) => x.kind === 'cells' && x.label === 'mirror copy');
        expect(prev?.kind === 'cells' && prev.slide).toBe(false);
      }
    });
  });

  it('a copy that is already exact fails its first comparison (the linear-time argument)', () => {
    const run = manacherTrace(parseManacher('abacaba'));
    expect(run.frames.some((f) => f.caption.includes('This was certain'))).toBe(true);
  });

  it('former sentinel characters are ordinary characters', () => {
    expect(manacherTrace(parseManacher('b^a^b^a')).result).toEqual(['b^a^b', 0, 5]);
    expect(manacherTrace(parseManacher('$a')).result).toEqual(['$', 0, 1]);
    expect(manacherTrace(parseManacher('a#a')).result).toEqual(['a#a', 0, 3]);
  });

  it('the empty string returns at once', () => {
    const run = manacherTrace(parseManacher('""'));
    expect(run.result).toEqual(['', 0, 0]);
    expect(run.frames.length).toBe(1);
  });

  it('stays well under 2000 frames on the largest input', () => {
    expect(manacherTrace(parseManacher('a'.repeat(MANACHER_MAX))).frames.length).toBeLessThan(400);
    expect(manacherTrace(parseManacher('abacabadabacaba')).frames.length).toBeLessThan(400);
  });
});

describe('parseManacher', () => {
  it('reads a string, keeping inner spaces', () => {
    expect(parseManacher(' a b ')).toEqual({ s: ['a', ' ', 'b'] });
    expect(parseManacher("''")).toEqual({ s: [] });
  });
  it('rejects bad input', () => {
    expect(() => parseManacher('   ')).toThrow(InputError);
    expect(() => parseManacher('a'.repeat(MANACHER_MAX + 1))).toThrow(/15 characters/);
  });
});
