import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { LCSUB_CODE, LCSUB_MAX, lcsubTrace, parseLcsub, type LcsubResult, type LcsubRun } from './longestCommonSubstring';

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

/** Brute force: try every pair of end positions in row-major order; the first longest common run wins. */
function brute(s1: string[], s2: string[]): { result: LcsubResult; dp: number[][] } {
  const dp = Array.from({ length: s1.length + 1 }, () => Array.from({ length: s2.length + 1 }, () => 0));
  let best: LcsubResult = ['', 0, 0, 0];
  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      let k = 0;
      while (k < i && k < j && s1[i - 1 - k] === s2[j - 1 - k]) k++;
      dp[i][j] = k;
      if (k > best[1]) best = [s1.slice(i - k, i).join(''), k, i - k, j - k];
    }
  }
  return { result: best, dp };
}

/** Every common substring, by brute force: the longest length. */
function longestByEnumeration(s1: string[], s2: string[]): number {
  const all = new Set<string>();
  for (let a = 0; a < s2.length; a++) for (let b = a + 1; b <= s2.length; b++) all.add(s2.slice(a, b).join(''));
  let best = 0;
  for (let a = 0; a < s1.length; a++) for (let b = a + 1; b <= s1.length; b++) if (all.has(s1.slice(a, b).join(''))) best = Math.max(best, b - a);
  return best;
}

function expectWellFormed(run: LcsubRun, m: number, n: number) {
  for (const f of run.frames) {
    expect(f.caption.length).toBeGreaterThan(20);
    if (f.line !== undefined) {
      expect(f.line).toBeGreaterThanOrEqual(0);
      expect(f.line).toBeLessThan(LCSUB_CODE.length);
    }
    expect(f.state.cells.length).toBe(m + 1);
    for (const row of f.state.cells) expect(row.length).toBe(n + 1);
    for (const key of Object.keys(f.state.roles)) {
      const [r, c] = key.split(',').map(Number);
      expect(r >= 0 && r <= m && c >= 0 && c <= n, key).toBe(true);
    }
  }
}

describe('lcsubTrace matches the Python longest_common_substring (golden fixtures)', () => {
  const cases = fixtures.lcs as Array<{ s1: string; s2: string; dp: number[][]; result: LcsubResult }>;
  it('has enough cases', () => expect(cases.length).toBeGreaterThanOrEqual(50));
  it('reproduces every dp cell and the returned tuple', () => {
    for (const c of cases) {
      const run = lcsubTrace({ s1: Array.from(c.s1), s2: Array.from(c.s2) });
      expect(run.dp, `${c.s1} | ${c.s2}`).toEqual(c.dp);
      expect(run.result).toEqual(c.result);
    }
  });
});

describe('lcsubTrace against brute force', () => {
  it('agrees on random string pairs, including the tie-break', () => {
    const rand = rng(41);
    for (let t = 0; t < 300; t++) {
      const alphabet = ['ab', 'abc', 'ACGT', 'aab'][Math.floor(rand() * 4)];
      const s1 = word(rand, alphabet, 0, LCSUB_MAX);
      const s2 = word(rand, alphabet, 0, LCSUB_MAX);
      const run = lcsubTrace({ s1, s2 });
      const want = brute(s1, s2);
      expect(run.dp).toEqual(want.dp);
      expect(run.result).toEqual(want.result);
      expect(run.result[1]).toBe(longestByEnumeration(s1, s2));
      if (run.result[1] > 0) {
        expect(s1.slice(run.result[2], run.result[2] + run.result[1]).join('')).toBe(run.result[0]);
        expect(s2.slice(run.result[3], run.result[3] + run.result[1]).join('')).toBe(run.result[0]);
      }
      expectWellFormed(run, s1.length, s2.length);
    }
  });

  it('fills the table cell by cell in row-major order, one frame per cell', () => {
    const run = lcsubTrace(parseLcsub('ABABC | BABCA'));
    const filled = run.frames.map((f) => f.state.cells.flat().filter((v) => v !== null).length);
    const base = 6 + 5; // row 0 and column 0
    expect(filled[0]).toBe(base);
    for (let k = 1; k < filled.length; k++) expect(filled[k] - filled[k - 1]).toBeGreaterThanOrEqual(0);
    expect(filled[filled.length - 1]).toBe(36);
    const cellFrames = run.frames.filter((f) => f.line === 5 || f.line === 7);
    expect(cellFrames.length).toBe(25);
  });
});

describe('lcsubTrace scenarios', () => {
  it('ABABC, BABCA: the run 1, 2, 3, 4 on the diagonal ends at (5, 4)', () => {
    const run = lcsubTrace(parseLcsub('ABABC | BABCA'));
    expect(run.result).toEqual(['BABC', 4, 1, 0]);
    const last = run.frames[run.frames.length - 1].state;
    expect(Object.entries(last.roles).filter(([, r]) => r === 'done').map(([k]) => k).sort()).toEqual(['2,1', '3,2', '4,3', '5,4']);
    // A match reads the diagonal cell and shows it as compare.
    const match = run.frames.find((f) => f.line === 5 && f.vars?.some(([k, v]) => k === 'i' && v === 5))!;
    expect(Object.values(match.state.roles)).toContain('compare');
  });

  it('a tie does not replace the best: abc wins over xyz', () => {
    const run = lcsubTrace(parseLcsub('abcxyz | xyzabc'));
    expect(run.result).toEqual(['abc', 3, 0, 3]);
    expect(run.frames.some((f) => f.caption.includes('only ties max_len = 3'))).toBe(true);
  });

  it('nothing shared, and empty strings, return the empty tuple', () => {
    expect(lcsubTrace(parseLcsub('ABC | XYZ')).result).toEqual(['', 0, 0, 0]);
    expect(lcsubTrace(parseLcsub(' | ABC')).result).toEqual(['', 0, 0, 0]);
    expect(lcsubTrace(parseLcsub('|')).frames.length).toBe(2);
  });

  it('stays well under 2000 frames on the largest input', () => {
    const run = lcsubTrace(parseLcsub(`${'a'.repeat(12)} | ${'a'.repeat(12)}`));
    expect(run.frames.length).toBeLessThan(400);
  });
});

describe('parseLcsub', () => {
  it('reads two strings, either may be empty', () => {
    expect(parseLcsub(' ab c | d ')).toEqual({ s1: ['a', 'b', ' ', 'c'], s2: ['d'] });
    expect(parseLcsub('|')).toEqual({ s1: [], s2: [] });
  });
  it('rejects bad input', () => {
    expect(() => parseLcsub('abc')).toThrow(InputError);
    expect(() => parseLcsub('a | b | c')).toThrow(InputError);
    expect(() => parseLcsub(`${'a'.repeat(13)} | b`)).toThrow(/12 characters/);
  });
});
