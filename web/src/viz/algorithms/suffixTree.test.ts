import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { expectWellFormed, rng } from './multiwayTreesTestKit';
import { parseSuffixTree, SUFFIX_CODE, SUFFIX_LIMITS, suffixTrace, TERMINATOR, type SuffixDump } from './suffixTree';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/multiwayTrees.json', import.meta.url), 'utf8'));

/** Every start index of pattern in text, overlaps included; the code returns [] for an empty pattern. */
function bruteForce(text: string, p: string): number[] {
  if (p === '') return [];
  const out: number[] = [];
  for (let i = 0; i + p.length <= text.length; i++) if (text.startsWith(p, i)) out.push(i);
  return out;
}

/**
 * Compressed-trie invariants of the tree after inserting the suffixes 0..upTo-1: siblings start
 * with distinct characters (the dict key is the label's first character), every internal node
 * but the root branches, and each leaf's path spells its suffix.
 */
function checkTree(tree: SuffixDump, text: string, upTo: number) {
  const full = text + TERMINATOR;
  const leaves: number[] = [];
  const walk = ([start, end, suffix, children]: SuffixDump, spelled: string, isRoot: boolean) => {
    if (!isRoot) {
      expect(start).not.toBeNull();
      expect(end!).toBeGreaterThanOrEqual(start!);
    }
    const label = isRoot ? '' : full.slice(start!, end! + 1);
    const path = spelled + label;
    if (suffix !== -1) {
      expect(children.length).toBe(0);
      expect(path).toBe(full.slice(suffix));
      leaves.push(suffix);
    } else if (!isRoot) expect(children.length).toBeGreaterThanOrEqual(2);
    const firsts = children.map(([ch]) => ch);
    expect(new Set(firsts).size).toBe(firsts.length);
    for (const [ch, c] of children) {
      expect(full[c[0]!]).toBe(ch);
      walk(c, path, false);
    }
  };
  walk(tree, '', true);
  expect(leaves.sort((a, b) => a - b)).toEqual(Array.from({ length: upTo }, (_, i) => i));
}

describe('suffixTrace against brute force', () => {
  it('builds a valid suffix tree after every suffix and finds every occurrence', () => {
    const rand = rng(9);
    for (let trial = 0; trial < 200; trial++) {
      const alphabet = rand() < 0.5 ? 'ab' : 'abc';
      const text = Array.from({ length: 1 + Math.floor(rand() * SUFFIX_LIMITS.textLength) }, () => alphabet[Math.floor(rand() * alphabet.length)]).join('');
      const patterns = Array.from({ length: Math.floor(rand() * 6) }, () =>
        rand() < 0.6 ? text.slice(Math.floor(rand() * text.length)).slice(0, 1 + Math.floor(rand() * 4)) : Array.from({ length: 1 + Math.floor(rand() * 3) }, () => 'abc'[Math.floor(rand() * 3)]).join(''),
      );
      const run = suffixTrace({ text, patterns });
      expect(run.build.length).toBe(text.length + 1);
      run.build.forEach((b, i) => checkTree(b.tree, text, i + 1));
      run.searches.forEach(([p, r]) => expect(r, `${text} / ${p}`).toEqual(bruteForce(text, p)));
      expectWellFormed(run.frames, SUFFIX_CODE.length);
    }
  });
});

describe('suffixTrace matches suffix_tree.py (golden fixtures)', () => {
  it('the tree after each suffix, every edge split and every search result', () => {
    const cases = fixtures.suffixTree as Array<{ text: string; build: Array<{ tree: SuffixDump; splits: number[][] }>; searches: Array<[string, number[]]> }>;
    expect(cases.length).toBeGreaterThanOrEqual(40);
    for (const c of cases) {
      const run = suffixTrace({ text: c.text, patterns: c.searches.map(([p]) => p) });
      expect(run.build, c.text).toEqual(c.build);
      expect(run.searches, c.text).toEqual(c.searches);
    }
  });
});

describe('suffixTrace scenarios', () => {
  it('banana: 7 leaves, 3 internal nodes, and ana occurs at 1 and 3', () => {
    const run = suffixTrace(parseSuffixTree('banana; ana a nab ""'));
    const last = run.frames[run.frames.length - 1].state;
    expect(last.nodes.filter((n) => n.label !== undefined).length).toBe(7);
    expect(last.nodes.length).toBe(1 + 7 + 3);
    expect(run.searches).toEqual([
      ['ana', [1, 3]],
      ['a', [1, 3, 5]],
      ['nab', []],
      ['', []],
    ]);
    // Children keep dict order: b, a, n, then the terminator.
    expect(run.build[6].tree[3].map(([ch]) => ch)).toEqual(['b', 'a', 'n', TERMINATOR]);
  });

  it('an edge split puts a new internal node above the old child, which keeps its id one level lower', () => {
    const run = suffixTrace(parseSuffixTree('abac'));
    const at = run.frames.findIndex((f) => f.caption.startsWith('_split_edge'));
    const before = run.frames[at - 1].state;
    const after = run.frames[at].state;
    const depth = (s: typeof before, id: string): number => {
      const parent = s.nodes.find((n) => n.children.includes(id));
      return parent ? 1 + depth(s, parent.id) : 0;
    };
    const old = before.nodes.find((n) => n.label === '0')!;
    expect(depth(after, old.id)).toBe(depth(before, old.id) + 1);
    expect(after.nodes.find((n) => n.id === old.id)!.edge!.text).toBe('bac$');
    expect(run.build[2].splits).toEqual([[1, 3, 2]]);
  });

  it('stays under 2000 frames on the largest input', () => {
    const run = suffixTrace(parseSuffixTree('aabaab; aab ab b abab aaa ba'));
    expect(run.frames.length).toBeLessThan(2000);
  });
});

describe('parseSuffixTree', () => {
  it('reads the text and the patterns', () => {
    expect(parseSuffixTree('banana; ana, ?na x ""')).toEqual({ text: 'banana', patterns: ['ana', 'na', 'x', ''] });
    expect(parseSuffixTree('text abc; search b')).toEqual({ text: 'abc', patterns: ['b'] });
    expect(parseSuffixTree('abc')).toEqual({ text: 'abc', patterns: [] });
  });

  it('gives friendly errors', () => {
    expect(() => parseSuffixTree('')).toThrow(InputError);
    expect(() => parseSuffixTree('ban$ana')).toThrow(/terminator/);
    expect(() => parseSuffixTree('Banana')).toThrow(/lowercase/);
    expect(() => parseSuffixTree('abcdefg')).toThrow(/at most 6/);
    expect(() => parseSuffixTree('abc; a1')).toThrow(/not a pattern/);
    expect(() => parseSuffixTree('abc; a b c a b c a')).toThrow(/At most 6/);
  });
});
