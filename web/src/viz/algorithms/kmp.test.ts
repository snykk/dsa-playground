import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { kmpTrace, parseKmp } from './kmp';

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

function naive(text: string[], pattern: string[]): number[] {
  const out: number[] = [];
  for (let s = 0; s + pattern.length <= text.length; s++) {
    if (pattern.every((c, k) => text[s + k] === c)) out.push(s);
  }
  return out;
}

function bruteLps(p: string[]): number[] {
  return p.map((_, i) => {
    for (let len = i; len > 0; len--) {
      if (p.slice(0, len).join('\0') === p.slice(i + 1 - len, i + 1).join('\0')) return len;
    }
    return 0;
  });
}

describe('KMP', () => {
  it('finds exactly the naive matches (including overlaps) and builds the true LPS table', () => {
    const rand = rng(3);
    for (let t = 0; t < 400; t++) {
      const alpha = rand() < 0.5 ? 'AB' : 'ABC';
      const pick = (len: number) => Array.from({ length: len }, () => alpha[Math.floor(rand() * alpha.length)]);
      const text = pick(1 + Math.floor(rand() * 40));
      const pattern = pick(1 + Math.floor(rand() * 8));
      const frames = kmpTrace({ text, pattern });
      const last = frames[frames.length - 1].state;
      expect(last.matches).toEqual(naive(text, pattern));
      expect(last.lps).toEqual(bruteLps(pattern));
    }
  });

  it('never moves the text pointer backwards and needs at most 2n comparisons', () => {
    const rand = rng(8);
    for (let t = 0; t < 200; t++) {
      const pick = (len: number) => Array.from({ length: len }, () => 'AB'[Math.floor(rand() * 2)]);
      const text = pick(5 + Math.floor(rand() * 35));
      const frames = kmpTrace({ text, pattern: pick(1 + Math.floor(rand() * 6)) });
      let prev = -1;
      for (const f of frames) {
        if (f.state.phase !== 'search' || f.state.i === undefined || f.state.done) continue;
        expect(f.state.i).toBeGreaterThanOrEqual(prev - 0); // non-decreasing
        prev = Math.max(prev, f.state.i);
      }
      const comparisons = Number(Object.fromEntries(frames.at(-2)?.vars ?? []).comparisons ?? 0);
      expect(comparisons).toBeLessThanOrEqual(2 * text.length);
    }
  });

  it('parses "text | pattern" and rejects bad input', () => {
    expect(parseKmp('ab ab | ab')).toEqual({ text: ['a', 'b', ' ', 'a', 'b'], pattern: ['a', 'b'] });
    for (const bad of ['no bar', ' | x', 'x | ', `${'a'.repeat(41)} | a`]) expect(() => parseKmp(bad)).toThrow(InputError);
  });
});
