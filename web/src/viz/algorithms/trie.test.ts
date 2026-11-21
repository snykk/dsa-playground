import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { InputError } from '../core/types';
import { rng, wellFormedProblems } from './multiwayTreesTestKit';
import { parseTrie, TRIE_CODE, trieTrace, type TrieDump, type TrieOp } from './trie';

const fixtures = JSON.parse(readFileSync(new URL('./__fixtures__/multiwayTrees.json', import.meta.url), 'utf8'));

/** The words of a dumped trie in get_all_words order; a dead end is reported in problems. */
function wordsOf(trie: TrieDump, problems: string[]): string[] {
  const out: string[] = [];
  const walk = ([end, children]: TrieDump, prefix: string, isRoot: boolean) => {
    // After delete's pruning, a non-root node either ends a word or leads to one.
    if (!isRoot && !(end || children.length > 0)) problems.push(`the node for "${prefix}" is a dead end`);
    if (end) out.push(prefix);
    for (const [ch, c] of children) walk(c, prefix + ch, false);
  };
  walk(trie, '', true);
  return out;
}

function nodeCount([, children]: TrieDump): number {
  return 1 + children.reduce((s, [, c]) => s + nodeCount(c), 0);
}

const WORDS = ['a', 'an', 'and', 'ant', 'app', 'apple', 'apt', 'bat', 'bath', 'bad', 'car', 'cart', 'cat', 'do', 'dog', ''];

function randomOps(rand: () => number, count: number): TrieOp[] {
  const pick = () => WORDS[Math.floor(rand() * WORDS.length)];
  const ops: TrieOp[] = [];
  for (let i = 0; i < count; i++) {
    const r = rand();
    const w = pick();
    if (r < 0.45) ops.push({ kind: 'insert', word: w });
    else if (r < 0.6) ops.push({ kind: 'search', word: w });
    else if (r < 0.7) ops.push({ kind: 'prefix', word: w.slice(0, Math.floor(rand() * (w.length + 1))) });
    else if (r < 0.93) ops.push({ kind: 'delete', word: rand() < 0.2 ? w.slice(0, 1 + Math.floor(rand() * w.length)) : w });
    else ops.push({ kind: 'words' });
  }
  return ops;
}

describe('trieTrace against a set of words', () => {
  it('stores exactly the inserted words, prunes dead ends and answers like the set', () => {
    const rand = rng(5);
    for (let trial = 0; trial < 200; trial++) {
      const ops = randomOps(rand, 1 + Math.floor(rand() * 20));
      const run = trieTrace(ops);
      const model: string[] = [];
      const problems: string[] = [];
      const sameWords = (a: string[], b: string[]) => JSON.stringify([...a].sort()) === JSON.stringify([...b].sort());
      ops.forEach((op, i) => {
        const step = run.steps[i];
        const at = `op ${i} (${op.kind}${'word' in op ? ` "${op.word}"` : ''})`;
        const answer = (want: unknown) => {
          if (step.result !== want) problems.push(`${at}: returned ${JSON.stringify(step.result)}, the set says ${JSON.stringify(want)}`);
        };
        if (op.kind === 'insert') {
          if (!model.includes(op.word)) model.push(op.word);
          answer(null);
        } else if (op.kind === 'search') answer(model.includes(op.word));
        // The root always exists, so starts_with('') is True even for an empty trie.
        else if (op.kind === 'prefix') answer(op.word === '' || model.some((w) => w.startsWith(op.word)));
        else if (op.kind === 'delete') {
          answer(model.includes(op.word));
          if (model.includes(op.word)) model.splice(model.indexOf(op.word), 1);
        } else if (!sameWords(step.result as string[], model)) problems.push(`${at}: listed ${JSON.stringify(step.result)}, the set holds ${JSON.stringify(model)}`);
        const words = wordsOf(step.trie, problems);
        if (!sameWords(words, model)) problems.push(`${at}: the trie stores ${JSON.stringify(words)}, the set holds ${JSON.stringify(model)}`);
        // One node per distinct prefix of a stored word, plus the root.
        const prefixes = new Set(model.flatMap((w) => Array.from({ length: w.length }, (_, k) => w.slice(0, k + 1))));
        if (nodeCount(step.trie) !== prefixes.size + 1) problems.push(`${at}: ${nodeCount(step.trie)} nodes, want ${prefixes.size + 1} (the root and one per prefix)`);
      });
      problems.push(...wellFormedProblems(run.frames, TRIE_CODE.length));
      expect(problems, `trial ${trial}`).toEqual([]);
    }
  });
});

describe('trieTrace matches trie.py (golden fixtures)', () => {
  it('the trie in dict order and every result after each operation', () => {
    const cases = fixtures.trie as Array<{ ops: string[][]; steps: Array<{ result: unknown; trie: TrieDump }> }>;
    expect(cases.length).toBeGreaterThanOrEqual(30);
    for (const c of cases) {
      const ops = c.ops.map((o): TrieOp => (o[0] === 'words' ? { kind: 'words' } : ({ kind: o[0], word: o[1] } as TrieOp)));
      const run = trieTrace(ops);
      c.steps.forEach((want, i) => {
        const where = JSON.stringify(c.ops.slice(0, i + 1));
        expect(run.steps[i].trie, where).toEqual(want.trie);
        expect(run.steps[i].result, where).toEqual(want.result);
      });
    }
  });
});

describe('trieTrace scenarios', () => {
  it('delete prunes upward until a node that is a word, and the pruned nodes fade first', () => {
    const run = trieTrace(parseTrie('app apple -apple'));
    expect(run.steps[2].result).toBe(true);
    const pruned = run.frames.filter((f) => f.line === TRIE_CODE.indexOf('    parent, char = path.pop(); del parent.children[char]; node = parent'));
    expect(pruned.length).toBe(2);
    for (const f of pruned) expect(f.state.nodes.some((n) => n.ghost)).toBe(true);
    const last = run.frames[run.frames.length - 1].state;
    expect(last.nodes.length).toBe(4);
    expect(last.nodes.filter((n) => n.marked).length).toBe(1);
  });

  it('the empty word marks the root, and a prefix is not a word', () => {
    const run = trieTrace(parseTrie('"" ?"" ap ?a ^a -a -""'));
    expect(run.steps.map((s) => s.result)).toEqual([null, true, null, false, true, false, true]);
    expect(run.steps[6].trie[0]).toBe(false);
  });

  it('stays under 2000 frames on the largest input', () => {
    const text = 'apple apply apt bat bath bad band cart care cat ^ap ?bat words -apple -bath -band -cart -care words ^c';
    const run = trieTrace(parseTrie(text));
    expect(run.steps.length).toBe(20);
    expect(run.frames.length).toBeLessThan(2000);
  });
});

describe('parseTrie', () => {
  it('reads the short forms, the words and the empty word', () => {
    expect(parseTrie('cat +dog ?ca ^ca -cat words insert "" search do prefix d delete dog')).toEqual([
      { kind: 'insert', word: 'cat' },
      { kind: 'insert', word: 'dog' },
      { kind: 'search', word: 'ca' },
      { kind: 'prefix', word: 'ca' },
      { kind: 'delete', word: 'cat' },
      { kind: 'words' },
      { kind: 'insert', word: '' },
      { kind: 'search', word: 'do' },
      { kind: 'prefix', word: 'd' },
      { kind: 'delete', word: 'dog' },
    ]);
  });

  it('gives friendly errors', () => {
    expect(() => parseTrie('')).toThrow(InputError);
    expect(() => parseTrie('Cat')).toThrow(/lowercase/);
    expect(() => parseTrie('c4t')).toThrow(/not an operation/);
    expect(() => parseTrie('abcdefgh')).toThrow(/at most 7/);
    expect(() => parseTrie('search')).toThrow(/needs a word/);
    expect(() => parseTrie('+')).toThrow(/empty word/);
    expect(() => parseTrie('abcdefg bcdefga cdefgab defgabc efgabcd')).toThrow(/36 nodes/);
  });
});
