import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { stabilizeSuffixArray } from '../renderers/SuffixArrayView';
import { compareCodes, parseSuffixArray, SA_CODE, SA_LIMITS, saTrace, type SaOp, type SaRun } from './suffixArray';

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

const startsAt = (text: string[], p: string[], i: number) => p.every((c, k) => text[i + k] === c) && i + p.length <= text.length;

function expectWellFormed(run: SaRun, n: number) {
  for (const f of run.frames) {
    expect(f.caption.length).toBeGreaterThan(20);
    if (f.line !== undefined) {
      expect(f.line).toBeGreaterThanOrEqual(0);
      expect(f.line).toBeLessThan(SA_CODE.length);
    }
    const ids = f.state.rows.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    const slots = f.state.rows.map((r) => r.slot);
    expect(new Set(slots).size).toBe(slots.length);
    for (const r of f.state.rows) {
      expect(r.slot >= 0 && r.slot < n).toBe(true);
      expect(r.cells.map((c) => c.ch)).toEqual([...f.state.text.map((c) => c.ch)].slice(r.id));
      const tags = (r.tags ?? []).map((t) => t.text);
      expect(new Set(tags).size).toBe(tags.length);
    }
  }
}

describe('saTrace matches the Python suffix_array module (golden fixtures)', () => {
  const cases = fixtures.suffix as Array<{
    text: string;
    sa: number[];
    searches: Array<{ pattern: string; reads: number[]; result: number[] }>;
    lcp: Array<[number, number, number]>;
  }>;
  it('has enough cases', () => expect(cases.length).toBeGreaterThanOrEqual(50));
  it('reproduces the suffix array, every probe and block read, every search and lcp result', () => {
    for (const c of cases) {
      const ops: SaOp[] = [
        ...c.searches.map((s): SaOp => ({ kind: 'search', pattern: Array.from(s.pattern) })),
        ...c.lcp.map(([i, j]): SaOp => ({ kind: 'lcp', i, j })),
      ];
      const run = saTrace({ text: Array.from(c.text), ops });
      expect(run.sa, c.text).toEqual(c.sa);
      expect(run.searches, c.text).toEqual(c.searches);
      expect(run.lcp, c.text).toEqual(c.lcp);
    }
  });
});

describe('saTrace against brute force', () => {
  it('sorts the suffixes, finds every occurrence and every common prefix on random scripts', () => {
    const rand = rng(67);
    for (let t = 0; t < 250; t++) {
      const alphabet = ['ab', 'abc', 'aab', 'ab$', 'aB'][Math.floor(rand() * 5)];
      const text = word(rand, alphabet, 0, SA_LIMITS.textLength);
      const n = text.length;
      const ops: SaOp[] = [];
      for (let k = 0; k < 1 + Math.floor(rand() * SA_LIMITS.maxOps); k++) {
        if (n && rand() < 0.3) ops.push({ kind: 'lcp', i: Math.floor(rand() * n), j: Math.floor(rand() * n) });
        else ops.push({ kind: 'search', pattern: word(rand, alphabet, 0, 4) });
      }
      const run = saTrace({ text, ops });
      const want = Array.from({ length: n }, (_, i) => i).sort((a, b) => compareCodes(text.slice(a), text.slice(b)));
      expect(run.sa).toEqual(want);
      let s = 0;
      let l = 0;
      for (const op of ops) {
        if (op.kind === 'search') {
          const found = Array.from({ length: n }, (_, i) => i).filter((i) => startsAt(text, op.pattern, i));
          expect(run.searches[s++].result, `${text.join('')} ? ${op.pattern.join('')}`).toEqual(found);
        } else {
          let k = 0;
          while (op.i + k < n && op.j + k < n && text[op.i + k] === text[op.j + k]) k++;
          expect(run.lcp[l++]).toEqual([op.i, op.j, k]);
        }
      }
      expectWellFormed(run, n);
    }
  });

  it('compares strings by code point, as Python does', () => {
    expect(compareCodes(['B'], ['a'])).toBeLessThan(0);
    expect(compareCodes(['a'], ['a', 'n', 'a'])).toBeLessThan(0);
    expect(compareCodes(['$'], ['a'])).toBeLessThan(0);
    expect(compareCodes(['b'], ['a', 'z'])).toBeGreaterThan(0);
  });
});

describe('saTrace scenarios', () => {
  it('banana: the rows glide from text order to SA = [5, 3, 1, 0, 4, 2]', () => {
    const run = saTrace(parseSuffixArray('banana; ana'));
    expect(run.sa).toEqual([5, 3, 1, 0, 4, 2]);
    const sortFrame = run.frames.findIndex((f) => f.caption.startsWith('suffixes.sort()'));
    const before = run.frames[sortFrame - 1].state.rows.map((r) => [r.id, r.slot]);
    const after = run.frames[sortFrame].state.rows.map((r) => [r.id, r.slot]);
    expect(before).toEqual([0, 1, 2, 3, 4, 5].map((i) => [i, i]));
    expect(after).toEqual([
      [0, 3],
      [1, 2],
      [2, 5],
      [3, 1],
      [4, 4],
      [5, 0],
    ]);
    expect(run.searches[0]).toEqual({ pattern: 'ana', reads: [2, 0, 1, 3, 1, 2, 1, 2], result: [1, 3] });
  });

  it('the suffixes appear one at a time, then every neighbour pair is explained', () => {
    const run = saTrace(parseSuffixArray('banana'));
    const counts = run.frames.map((f) => f.state.rows.length);
    expect(counts.slice(0, 7)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    expect(run.frames.filter((f) => f.caption.startsWith('Why is')).length).toBe(5);
    expect(run.frames.some((f) => f.caption.includes("'ana' is a prefix of 'anana'"))).toBe(true);
  });

  it('a missing pattern, the empty pattern and the empty text', () => {
    expect(saTrace(parseSuffixArray('banana; xyz')).searches[0].result).toEqual([]);
    expect(saTrace(parseSuffixArray('banana; ""')).searches[0].result).toEqual([0, 1, 2, 3, 4, 5]);
    const empty = saTrace(parseSuffixArray('""; a'));
    expect(empty.sa).toEqual([]);
    expect(empty.searches[0]).toEqual({ pattern: 'a', reads: [], result: [] });
  });

  it('binary-search pointers sit on the rows and the ruled-out ranks fade', () => {
    const run = saTrace(parseSuffixArray('mississippi; issi'));
    const probe = run.frames.find((f) => f.line === 7 || f.line === 6 || f.line === 5)!;
    const tags = probe.state.rows.flatMap((r) => (r.tags ?? []).map((t) => t.text));
    expect(tags).toEqual(expect.arrayContaining(['left', 'mid', 'right']));
    const later = run.frames.filter((f) => f.line !== undefined && f.line >= 5 && f.line <= 7)[1];
    expect(later.state.rows.some((r) => r.role === 'muted')).toBe(true);
  });

  it('stabilizeSuffixArray reserves the pattern row for the whole run', () => {
    const frames = stabilizeSuffixArray(saTrace(parseSuffixArray('banana; ana, lcp 1 3')).frames);
    expect(new Set(frames.map((f) => JSON.stringify(f.state.extent))).size).toBe(1);
    expect(frames[0].state.extent).toEqual({ slots: 6, pattern: true });
  });

  it('stays well under 2000 frames on the largest input', () => {
    const run = saTrace(parseSuffixArray('aaaaaaaaaaa; "", a, aaaaaa, lcp 0 1, lcp 0 0, aaaaab'));
    expect(run.frames.length).toBeLessThan(300);
  });
});

describe('parseSuffixArray', () => {
  it('reads the text, patterns, the empty pattern, search and lcp', () => {
    expect(parseSuffixArray('banana; ana, search na "" lcp 1 3')).toEqual({
      text: [...'banana'],
      ops: [
        { kind: 'search', pattern: [...'ana'] },
        { kind: 'search', pattern: [...'na'] },
        { kind: 'search', pattern: [] },
        { kind: 'lcp', i: 1, j: 3 },
      ],
    });
    expect(parseSuffixArray('abc')).toEqual({ text: [...'abc'], ops: [] });
  });

  it('rejects bad input with a friendly message', () => {
    expect(() => parseSuffixArray('; a')).toThrow(InputError);
    expect(() => parseSuffixArray('ban ana; a')).toThrow(/without spaces/);
    expect(() => parseSuffixArray('abcdefghijkl; a')).toThrow(/11 characters/);
    expect(() => parseSuffixArray('banana; abcdefg')).toThrow(/at most 6/);
    expect(() => parseSuffixArray('banana; lcp 1')).toThrow(/lcp i j/);
    expect(() => parseSuffixArray('banana; lcp 1 6')).toThrow(/0 to 5/);
    expect(() => parseSuffixArray('banana; a b c d e f g')).toThrow(/At most 6/);
    expect(() => parseSuffixArray('""; lcp 0 0')).toThrow(/non-empty/);
  });
});
