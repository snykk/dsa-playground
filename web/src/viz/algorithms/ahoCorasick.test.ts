import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { layoutAho, stabilizeAho } from '../renderers/AhoCorasickView';
import { AC_CODE, AC_LIMITS, acTrace, parseAho, trieSize, type AcCheck, type AcNodeDump, type AcRun } from './ahoCorasick';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/advancedStrings.json', import.meta.url), 'utf8'));

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

const word = (rand: () => number, alphabet: string, lo: number, hi: number) =>
  Array.from({ length: lo + Math.floor(rand() * (hi - lo + 1)) }, () => alphabet[Math.floor(rand() * alphabet.length)]).join('');

/** Brute force: every (end index, pattern) of every non-empty pattern copy, ends ascending, longer patterns first. */
function bruteMatches(patterns: string[], text: string): Array<[number, string]> {
  const out: Array<[number, string]> = [];
  const t = Array.from(text);
  const byLength = patterns.filter(Boolean).map((p, k) => ({ p, k })).sort((a, b) => Array.from(b.p).length - Array.from(a.p).length || a.k - b.k);
  for (let i = 0; i < t.length; i++) {
    for (const { p } of byLength) {
      const cs = Array.from(p);
      if (i + 1 >= cs.length && t.slice(i + 1 - cs.length, i + 1).join('') === p) out.push([i, p]);
    }
  }
  return out;
}

/** The node strings of a run, by id. */
const namesOf = (run: AcRun) => run.nodes.map((_, id) => {
  let s = '';
  for (let at: number | null = id; at !== null && at !== 0; at = run.nodes[at][0]) s = run.nodes[at][1] + s;
  return s;
});

function checkInvariants(patterns: string[], text: string, run: AcRun) {
  const names = namesOf(run);
  const byName = new Map(names.map((n, id) => [n, id]));
  const ends = new Set(patterns.filter(Boolean));
  // The trie holds exactly the prefixes of the non-empty patterns.
  const prefixes = new Set<string>(['']);
  for (const p of patterns) Array.from(p).forEach((_, k) => prefixes.add(Array.from(p).slice(0, k + 1).join('')));
  expect(new Set(names)).toEqual(prefixes);
  run.nodes.forEach(([, , fail, output, pats], id) => {
    expect(pats).toEqual(patterns.filter((p) => p && p === names[id]));
    if (id === 0) {
      expect(fail).toBeNull();
      return;
    }
    const cs = Array.from(names[id]);
    // fail: the longest proper suffix that is a node; output: the longest proper suffix that ends a pattern.
    let wantFail = 0;
    let wantOut: number | null = null;
    for (let k = cs.length - 1; k >= 1; k--) {
      const suf = cs.slice(cs.length - k).join('');
      if (byName.has(suf) && wantFail === 0) wantFail = byName.get(suf)!;
      if (ends.has(suf) && wantOut === null) wantOut = byName.get(suf)!;
    }
    expect(fail, names[id]).toBe(wantFail);
    expect(output, names[id]).toBe(wantOut);
  });
  // After each character the current node is the longest suffix of the text read so far that is in the trie.
  const t = Array.from(text);
  run.states.forEach((state, i) => {
    let want = 0;
    for (let k = i + 1; k >= 1; k--) {
      const suf = t.slice(i + 1 - k, i + 1).join('');
      if (byName.has(suf)) {
        want = byName.get(suf)!;
        break;
      }
    }
    expect(state, `${text} at ${i}`).toBe(want);
  });
  expect(run.matches).toEqual(bruteMatches(patterns, text));
}

function expectWellFormed(run: AcRun) {
  for (const f of run.frames) {
    expect(f.caption.length).toBeGreaterThan(20);
    if (f.line !== undefined) {
      expect(f.line).toBeGreaterThanOrEqual(0);
      expect(f.line).toBeLessThan(AC_CODE.length);
    }
    const ids = f.state.nodes.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
    const drawn = new Set(ids);
    for (const n of f.state.nodes) for (const c of n.children) expect(drawn.has(c)).toBe(true);
    for (const l of f.state.links) {
      expect(drawn.has(l.from), f.caption).toBe(true);
      expect(drawn.has(l.to), f.caption).toBe(true);
    }
    const keys = f.state.links.map((l) => `${l.kind}${l.from}`);
    expect(new Set(keys).size, f.caption).toBe(keys.length);
    for (const id of Object.keys(f.state.edgeRoles ?? {})) expect(drawn.has(Number(id))).toBe(true);
  }
}

describe('acTrace matches the Python AhoCorasick (golden fixtures)', () => {
  const cases = fixtures.aho as Array<{ patterns: string[]; text: string; nodes: AcNodeDump[]; buildChecks: AcCheck[]; scanChecks: AcCheck[]; matches: Array<[number, string]> }>;
  it('has enough cases', () => expect(cases.length).toBeGreaterThanOrEqual(60));
  it.each(cases.map((c, k) => [k, c] as const))('case %i: trie, links, every membership test, matches', (_, c) => {
    const run = acTrace({ patterns: c.patterns, text: c.text });
    expect(run.nodes).toEqual(c.nodes);
    expect(run.buildChecks).toEqual(c.buildChecks);
    expect(run.scanChecks).toEqual(c.scanChecks);
    expect(run.matches).toEqual(c.matches);
  });
});

describe('acTrace against brute force', () => {
  it('builds the right failure and output links and finds every match, in order, on random inputs', () => {
    const rand = rng(31);
    for (let t = 0; t < 200; t++) {
      const alphabet = ['ab', 'abc', 'aab', 'abcd'][Math.floor(rand() * 4)];
      const patterns: string[] = [];
      for (let k = 0; k < 1 + Math.floor(rand() * 6); k++) patterns.push(rand() < 0.05 ? '' : word(rand, alphabet, 1, 4));
      if (rand() < 0.2) patterns.push(patterns[0]);
      if (trieSize(patterns) > AC_LIMITS.maxNodes) continue;
      const text = word(rand, alphabet, 0, AC_LIMITS.textLength);
      const run = acTrace({ patterns, text });
      checkInvariants(patterns, text, run);
      expectWellFormed(run);
    }
  });

  it('handles the edge cases of the Python tests', () => {
    for (const [patterns, text] of [
      [[], 'hello'],
      [['abc'], ''],
      [['', 'a', ''], 'banana'],
      [['abc', 'abc'], 'abc'],
      [['a', 'b'], 'aabba'],
    ] as Array<[string[], string]>) {
      const run = acTrace({ patterns, text });
      checkInvariants(patterns, text, run);
      expectWellFormed(run);
    }
    expect(acTrace({ patterns: ['abc', 'abc'], text: 'abc' }).matches).toEqual([
      [2, 'abc'],
      [2, 'abc'],
    ]);
    expect(acTrace({ patterns: [], text: 'hello' }).matches).toEqual([]);
  });
});

describe('acTrace scenarios', () => {
  it('ushers: she fails to he, the output link reports he, and the scan falls back from she to he on r', () => {
    const run = acTrace(parseAho('he she his hers | ushers'));
    expect(run.matches).toEqual([
      [3, 'she'],
      [3, 'he'],
      [5, 'hers'],
    ]);
    const names = namesOf(run);
    const id = (s: string) => names.indexOf(s);
    expect(run.nodes[id('she')][2]).toBe(id('he'));
    expect(run.nodes[id('she')][3]).toBe(id('he'));
    expect(run.nodes[id('his')][2]).toBe(id('s'));
    expect(run.nodes[id('hers')][2]).toBe(id('s'));
    expect(run.states.map((s) => names[s])).toEqual(['', 's', 'sh', 'she', 'her', 'hers']);
    const fallBack = run.frames.find((f) => f.caption.startsWith("Read text[4] = 'r'. 'she' has no child 'r'"));
    expect(fallBack).toBeDefined();
    expect(fallBack!.state.links.find((l) => l.kind === 'fail' && l.from === id('she'))?.role).toBe('compare');
  });

  it('draws failure links to the root only while they matter, and keeps every other link once set', () => {
    const run = acTrace(parseAho('he she his hers | ushers'));
    const last = run.frames[run.frames.length - 1].state;
    expect(last.links.filter((l) => l.kind === 'fail' && l.to === 0)).toEqual([]);
    expect(last.links.filter((l) => l.kind === 'fail').length).toBe(4); // sh, she, his, hers
    expect(last.links.filter((l) => l.kind === 'output')).toEqual([{ from: 5, to: 2, kind: 'output', role: undefined }]);
    const depth1 = run.frames.find((f) => f.line === 7)!;
    expect(depth1.state.links.filter((l) => l.to === 0).map((l) => l.from)).toEqual([1, 3]);
  });

  it('a chain of output links reports every shorter pattern', () => {
    const run = acTrace(parseAho('a aa aaa | aaaa'));
    expect(run.matches).toEqual([
      [0, 'a'],
      [1, 'aa'],
      [1, 'a'],
      [2, 'aaa'],
      [2, 'aa'],
      [2, 'a'],
      [3, 'aaa'],
      [3, 'aa'],
      [3, 'a'],
    ]);
  });

  it('the trie grows: a new node appears in the picture as it is created', () => {
    const run = acTrace(parseAho('ab ac | abc'));
    const sizes = run.frames.map((f) => f.state.nodes.length);
    expect(sizes[0]).toBe(1);
    expect(Math.max(...sizes)).toBe(4);
    expect(sizes.every((s, k) => k === 0 || s >= sizes[k - 1])).toBe(true);
  });

  it('stabilizeAho keeps one extent for the run, wide enough for every frame', () => {
    const frames = stabilizeAho(acTrace(parseAho('he she his hers | ushers')).frames);
    const extents = new Set(frames.map((f) => JSON.stringify(f.state.extent)));
    expect(extents.size).toBe(1);
    const ext = frames[0].state.extent!;
    for (const f of frames) {
      const l = layoutAho(f.state.nodes);
      expect(l.cols).toBeLessThanOrEqual(ext.cols);
      expect(l.rows).toBeLessThanOrEqual(ext.rows);
    }
    expect(ext.textCells).toBe(6);
  });

  it('stays well under 2000 frames on the largest input', () => {
    const run = acTrace(parseAho('a aa aaa aaaa aaaaa aaaaaa b ab | aaaaaaaaaaaaaaaaaaab'));
    expect(run.frames.length).toBeLessThan(2000);
    const wide = acTrace(parseAho('abcdef bcdefa cdefab defabc | abcdefabcdefabcdefab'));
    expect(trieSize(['abcdef', 'bcdefa', 'cdefab', 'defabc'])).toBeLessThanOrEqual(AC_LIMITS.maxNodes);
    expect(wide.frames.length).toBeLessThan(2000);
  });
});

describe('parseAho', () => {
  it('reads patterns, the empty pattern and the text', () => {
    expect(parseAho('he, she his | ushers')).toEqual({ patterns: ['he', 'she', 'his'], text: 'ushers' });
    expect(parseAho('a "" b |')).toEqual({ patterns: ['a', '', 'b'], text: '' });
    expect(parseAho('| hello world')).toEqual({ patterns: [], text: 'hello world' });
  });

  it('rejects bad input with a friendly message', () => {
    expect(() => parseAho('he she')).toThrow(InputError);
    expect(() => parseAho('a | b | c')).toThrow(/single/);
    expect(() => parseAho('abcdefg | x')).toThrow(/at most 6/);
    expect(() => parseAho('a b c d e f g h i | x')).toThrow(/At most 8/);
    expect(() => parseAho('abcdef ghijkl mnopqr stuvwx yz | x')).toThrow(/nodes/);
    expect(() => parseAho(`a | ${'x'.repeat(21)}`)).toThrow(/20 characters/);
  });
});
