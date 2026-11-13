import { describe, expect, it } from 'vitest';
import { InputError, type Frame } from '../core/types';
import fixtures from './__fixtures__/strings.json';
import {
  badCharTable,
  boyerMooreTrace,
  naiveTrace,
  parseSearch,
  rabinKarpTrace,
  RK_DEFAULT_MOD,
  type SearchInput,
  type SearchState,
} from './stringSearch';
import { parseZ, zSearchTrace, zTrace, Z_MAX_PATTERN, Z_MAX_TEXT } from './zAlgorithm';

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

const chars = (s: string) => Array.from(s);

function bruteMatches(text: string[], pattern: string[]): number[] {
  const out: number[] = [];
  for (let s = 0; s + pattern.length <= text.length; s++) {
    if (pattern.every((c, k) => text[s + k] === c)) out.push(s);
  }
  return out;
}

function bruteZ(s: string[]): number[] {
  return s.map((_, i) => {
    if (i === 0) return 0;
    let k = 0;
    while (i + k < s.length && s[k] === s[i + k]) k++;
    return k;
  });
}

function randomCase(rand: () => number, maxText = 40, maxPattern = 15): SearchInput {
  const alpha = ['AB', 'ABC', 'ABCD', 'AB$', 'ACGT'][Math.floor(rand() * 5)];
  const pick = (len: number) => Array.from({ length: len }, () => alpha[Math.floor(rand() * alpha.length)]);
  const text = pick(1 + Math.floor(rand() * maxText));
  const pattern = pick(1 + Math.floor(rand() * Math.min(maxPattern, 8)));
  if (rand() < 0.5 && pattern.length <= text.length) {
    const at = Math.floor(rand() * (text.length - pattern.length + 1));
    text.splice(at, pattern.length, ...pattern);
  }
  return { text, pattern, mod: [101, 7, 2, 13, 997][Math.floor(rand() * 5)] };
}

function wellFormed(frames: Array<Frame<SearchState>>, lines: number) {
  expect(frames.length).toBeGreaterThan(0);
  expect(frames.length).toBeLessThan(2000);
  for (const f of frames) {
    expect(f.caption.length).toBeGreaterThan(10);
    if (f.line !== undefined) {
      expect(f.line).toBeGreaterThanOrEqual(0);
      expect(f.line).toBeLessThan(lines);
    }
    expect(f.state.rows.length).toBeGreaterThan(0);
  }
}

const finalMatches = (frames: Array<Frame<SearchState>>) => frames[frames.length - 1].state.matches;

describe('naive search', () => {
  it('matches brute force on random inputs and stays well-formed', () => {
    const rand = rng(11);
    for (let t = 0; t < 300; t++) {
      const input = randomCase(rand);
      const frames = naiveTrace(input);
      expect(finalMatches(frames)).toEqual(bruteMatches(input.text, input.pattern));
      wellFormed(frames, 5);
    }
  });

  it('reproduces the Python reads (golden fixtures)', () => {
    expect(fixtures.naive.length).toBeGreaterThan(50);
    for (const c of fixtures.naive) {
      const log: number[] = [];
      const frames = naiveTrace({ text: chars(c.text), pattern: chars(c.pattern), mod: RK_DEFAULT_MOD }, log);
      expect(finalMatches(frames)).toEqual(c.matches);
      expect(log).toEqual(c.reads);
    }
  });

  it('handles the edge cases', () => {
    const run = (t: string, p: string) => naiveTrace({ text: chars(t), pattern: chars(p), mod: 101 });
    expect(finalMatches(run('AAAAAA', 'AAA'))).toEqual([0, 1, 2, 3]);
    expect(run('ABC', 'ABCD')).toHaveLength(1);
    expect(finalMatches(run('ABC', 'ABCD'))).toEqual([]);
    expect(finalMatches(run('a', 'a'))).toEqual([0]);
  });
});

describe('Rabin-Karp', () => {
  it('matches brute force for any modulus, including tiny ones that force spurious hits', () => {
    const rand = rng(12);
    for (let t = 0; t < 300; t++) {
      const input = randomCase(rand);
      const frames = rabinKarpTrace(input);
      expect(finalMatches(frames)).toEqual(bruteMatches(input.text, input.pattern));
      wellFormed(frames, 7);
    }
  });

  it('reproduces the Python reads and results (golden fixtures)', () => {
    expect(fixtures.rabin_karp.length).toBeGreaterThan(50);
    for (const c of fixtures.rabin_karp) {
      const log: number[] = [];
      const frames = rabinKarpTrace({ text: chars(c.text), pattern: chars(c.pattern), mod: c.mod }, log);
      expect(finalMatches(frames)).toEqual(c.matches);
      expect(log).toEqual(c.reads);
    }
  });

  it('reports spurious hits when the modulus is small', () => {
    const input = parseSearch('ABCDEFGHIJKLMNOPQRST | HIJ | mod 7');
    expect(input.mod).toBe(7);
    const last = rabinKarpTrace(input).at(-1)!;
    expect(last.caption).toMatch(/spurious/);
    expect(last.state.matches).toEqual([7]);
  });
});

describe('Boyer-Moore', () => {
  it('matches brute force on random inputs and stays well-formed', () => {
    const rand = rng(13);
    for (let t = 0; t < 300; t++) {
      const input = randomCase(rand);
      const frames = boyerMooreTrace(input);
      expect(finalMatches(frames)).toEqual(bruteMatches(input.text, input.pattern));
      wellFormed(frames, 10);
    }
  });

  it('reproduces the Python reads and bad-character table (golden fixtures)', () => {
    expect(fixtures.boyer_moore.length).toBeGreaterThan(50);
    for (const c of fixtures.boyer_moore) {
      const log: number[] = [];
      const pattern = chars(c.pattern);
      const frames = boyerMooreTrace({ text: chars(c.text), pattern, mod: 101 }, log);
      expect(finalMatches(frames)).toEqual(c.matches);
      expect(log).toEqual(c.reads);
      expect([...badCharTable(pattern)]).toEqual(c.table);
    }
  });

  it('skips most of the text on a friendly input', () => {
    const frames = boyerMooreTrace({ text: chars('ABCXABCXABCXABC'), pattern: chars('ABC'), mod: 101 });
    expect(finalMatches(frames)).toEqual([0, 4, 8, 12]);
  });
});

describe('Z-algorithm', () => {
  it('computes the true Z-array on random strings', () => {
    const rand = rng(14);
    for (let t = 0; t < 200; t++) {
      const alpha = ['AB', 'ABC', 'A$B'][Math.floor(rand() * 3)];
      const s = Array.from({ length: 1 + Math.floor(rand() * 40) }, () => alpha[Math.floor(rand() * alpha.length)]);
      const frames = zTrace(s, null);
      expect(frames[frames.length - 1].state.z).toEqual(bruteZ(s));
    }
  });

  it('finds exactly the brute-force matches, also when the separator occurs in the input', () => {
    const rand = rng(15);
    for (let t = 0; t < 300; t++) {
      const { text, pattern } = randomCase(rand, Z_MAX_TEXT, Z_MAX_PATTERN);
      const frames = zSearchTrace({ text, pattern });
      expect(finalMatches(frames as Array<Frame<SearchState>>)).toEqual(bruteMatches(text, pattern));
      expect(frames.length).toBeLessThan(2000);
      for (const f of frames) expect(f.caption.length).toBeGreaterThan(10);
    }
    expect(finalMatches(zSearchTrace({ text: chars('a$a'), pattern: chars('a') }) as Array<Frame<SearchState>>)).toEqual([0, 2]);
    expect(finalMatches(zSearchTrace({ text: chars('$$'), pattern: chars('$') }) as Array<Frame<SearchState>>)).toEqual([0, 1]);
  });

  it('reproduces the Python Z-arrays, reads and search results (golden fixtures)', () => {
    expect(fixtures.z_array.length).toBeGreaterThan(50);
    for (const c of fixtures.z_array) {
      const log: number[] = [];
      const frames = zTrace(chars(c.s), null, log);
      expect(frames[frames.length - 1].state.z).toEqual(c.z);
      expect(log).toEqual(c.reads);
    }
    for (const c of fixtures.z_search) {
      const frames = zSearchTrace({ text: chars(c.text), pattern: chars(c.pattern) });
      expect(frames[frames.length - 1].state.matches).toEqual(c.matches);
    }
  });

  it('reports a pattern longer than the text in one frame', () => {
    expect(zSearchTrace({ text: chars('AB'), pattern: chars('ABC') })).toHaveLength(1);
  });
});

describe('input parsing', () => {
  it('rejects bad input with friendly messages', () => {
    expect(() => parseSearch('no bar')).toThrow(InputError);
    expect(() => parseSearch('abc |')).toThrow(InputError);
    expect(() => parseSearch('abc | b | mod x')).toThrow(InputError);
    expect(() => parseSearch('abc | b | mod 0')).toThrow(InputError);
    expect(() => parseSearch(`${'a'.repeat(41)} | a`)).toThrow(InputError);
    expect(() => parseZ(`${'a'.repeat(31)} | a`)).toThrow(InputError);
    expect(() => parseZ(`aaaa | ${'a'.repeat(11)}`)).toThrow(InputError);
  });

  it('reads the optional modulus', () => {
    expect(parseSearch('abc | b').mod).toBe(RK_DEFAULT_MOD);
    expect(parseSearch('abc | b | q = 13').mod).toBe(13);
  });

  it('keeps the largest inputs under the frame cap', () => {
    const text = chars('A'.repeat(39) + 'B');
    const pattern = chars('A'.repeat(14) + 'B');
    for (const frames of [naiveTrace({ text, pattern, mod: 101 }), rabinKarpTrace({ text, pattern, mod: 1 }), boyerMooreTrace({ text, pattern, mod: 101 })]) {
      expect(frames.length).toBeLessThan(2000);
    }
  });
});
