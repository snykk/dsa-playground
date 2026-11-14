import { BPLUS_CODE, bPlusTrace, parseBPlusTree, type BPlusInput } from '../algorithms/bPlusTree';
import { BTREE_CODE, bTreeTrace, parseBTree, type BTreeInput } from '../algorithms/bTree';
import { parseSuffixTree, SUFFIX_CODE, suffixTrace, type SuffixInput } from '../algorithms/suffixTree';
import { parseTrie, TRIE_CODE, trieTrace, type TrieOp } from '../algorithms/trie';
import type { VizSpec } from '../core/types';
import { MultiwayTreeView, stabilizeMultiway, type MwState } from '../renderers/MultiwayTreeView';
import { SYM } from '../ui/symbols';

const pick = <T,>(xs: readonly T[]): T => xs[Math.floor(Math.random() * xs.length)];
const rint = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));

/** count distinct keys in 1..99, in random order. */
function distinctKeys(count: number): number[] {
  const keys = new Set<number>();
  while (keys.size < count) keys.add(rint(1, 99));
  return [...keys];
}

/** Draw random scripts until one passes the parser's limits (a few tries at most). */
function valid(make: () => string, parse: (text: string) => unknown): string {
  for (let attempt = 0; attempt < 50; attempt++) {
    const text = make();
    try {
      parse(text);
      return text;
    } catch {
      // over a limit: draw again
    }
  }
  return make();
}

const render = (state: MwState) => <MultiwayTreeView state={state} />;

/* ---------- B-tree ---------- */

export const bTreeSpec: VizSpec<BTreeInput, MwState> = {
  id: 'b-tree',
  title: 'B-Tree',
  inputKind: 'b-tree',
  inputLabel: 'Degree and operations',
  inputHelp:
    'Optionally start with the minimum degree ("t 2"; 2 to 5, default 3 as in the Python code, so a node holds t - 1 to 2t - 1 keys), then operations separated by spaces: ' +
    '42 inserts, -42 deletes, ?42 searches (or the words insert, delete, search). Keys are 0 to 999; insert stores duplicates. Up to 30 operations and 24 keys.',
  examples: [
    { label: 'Splits on the way down (t = 2)', value: 't 2; 10 20 30 40 50 60 70 80 90 ?70' },
    { label: 'Borrow and merge (article)', value: 't 2; 10 20 25 40 50 30 35 60 -40 -10 -30 -20' },
    { label: 'Default t = 3: root split, root shrink', value: '10 20 30 40 50 60 ?40 -60 -50 -10' },
    { label: 'Middle-child merge (v0.2.0 fix)', value: '1 2 3 4 5 6 7 8 9 10 11 12 -4 ?4' },
    { label: 'Duplicates and misses', value: 't 2; 5 5 5 3 5 ?5 -5 -5 -7 ?7' },
  ],
  randomInput: () =>
    valid(() => {
      const keys = distinctKeys(rint(8, 14));
      const gone = [pick(keys), pick(keys), rint(1, 99)];
      return `t ${pick([2, 2, 3])}; ${keys.join(' ')} ${gone.map((k) => `-${k}`).join(' ')} ?${pick(keys)}`;
    }, parseBTree),
  parse: parseBTree,
  trace: (input) => stabilizeMultiway(bTreeTrace(input).frames),
  render,
  pseudocode: BTREE_CODE,
  legend: [
    { role: 'compare', label: 'keys scanned, node and path being searched' },
    { role: 'active', label: 'key on the move (inserted, median, borrowed), full node' },
    { role: 'done', label: 'result of a split, borrow or merge' },
    { role: 'good', label: `key found (${SYM.check})` },
    { role: 'bad', label: `key being deleted, or not in the tree (${SYM.cross})` },
    { role: 'muted', label: 'leaf copy of a predecessor / successor, deleted next' },
  ],
  complexity: { time: 'O(t log_t n) per operation: O(log_t n) node visits, O(t) keys scanned in each', space: 'O(n)' },
};

/* ---------- B+ tree ---------- */

export const bPlusTreeSpec: VizSpec<BPlusInput, MwState> = {
  id: 'b-plus-tree',
  title: 'B+ Tree',
  inputKind: 'b-plus-tree',
  inputLabel: 'Degree and operations',
  inputHelp:
    'Optionally start with the minimum degree ("t 2"; 2 to 5, default 3 as in the Python code), then operations separated by spaces: 42 inserts key 42 with an automatic value (a, b, c, ...), ' +
    '42=x inserts it with the value x (1 to 3 letters or digits), ?42 searches, 25..65 is range_search(25, 65), traverse walks the leaf chain. Keys are 0 to 999; the repository has no delete. ' +
    'Up to 30 operations and 24 different keys.',
  examples: [
    { label: 'Leaf split copies up (t = 3)', value: '1 2 3 4 5 6 7 8 traverse' },
    { label: 'Internal split pushes up (t = 2)', value: 't 2; 10 20 30 40 50 60 70 80 90 25..65' },
    { label: 'Range scan along next', value: 't 2; 50 10 90 30 70 20 80 40 60 15..75 ?40 ?45' },
    { label: 'Duplicate key overwrites', value: 't 2; 5 1 9 5=x 5=y ?5 5..5 traverse' },
    { label: 'Empty tree, empty range', value: '?4 1..9 4 9..1 traverse' },
  ],
  randomInput: () =>
    valid(() => {
      const keys = distinctKeys(rint(8, 14));
      const lo = rint(0, 60);
      return `t ${pick([2, 2, 3])}; ${keys.join(' ')} ?${pick(keys)} ${lo}..${lo + rint(10, 40)}`;
    }, parseBPlusTree),
  parse: parseBPlusTree,
  trace: (input) => stabilizeMultiway(bPlusTrace(input).frames),
  render,
  pseudocode: BPLUS_CODE,
  legend: [
    { role: 'compare', label: 'separators compared, path, leaf being read' },
    { role: 'active', label: 'key on the move (inserted, copied or pushed up), next pointer followed' },
    { role: 'done', label: 'result of a split' },
    { role: 'good', label: `found, or in the range (${SYM.check})` },
    { role: 'bad', label: `not found, or past the range: the scan stops (${SYM.cross})` },
    { role: 'muted', label: 'below the range: skipped' },
  ],
  complexity: { time: 'O(t log_t n) per search or insert; range: O(t log_t n + k)', space: 'O(n)' },
};

/* ---------- trie ---------- */

const TRIE_WORDS = ['a', 'an', 'and', 'ant', 'app', 'apple', 'apt', 'bat', 'bath', 'bad', 'band', 'car', 'card', 'care', 'cart', 'cat', 'do', 'dog', 'dot', 'tea', 'ten', 'to'];

export const trieSpec: VizSpec<TrieOp[], MwState> = {
  id: 'trie',
  title: 'Trie',
  inputKind: 'trie',
  inputLabel: 'Operations',
  inputHelp:
    'Operations separated by spaces: cat (or +cat) inserts, ?cat searches, ^ca is starts_with, -cat deletes, words is get_all_words (or the words insert, search, prefix, delete). ' +
    'Words are lowercase letters, up to 7; "" is the empty word. Up to 20 operations and 30 nodes. Children are drawn in insertion order, as the Python dict keeps them.',
  examples: [
    { label: 'Shared prefixes', value: 'app apple apt bat bath ?app ?ap ^ap ?bax words' },
    { label: 'Delete prunes upward', value: 'app apple apt bat bath -apple -bath -app words' },
    { label: 'Delete return value (v0.2.0 fix)', value: 'apple app dog -apple -apple -appl -cat -app' },
    { label: 'The empty word', value: '"" ?"" a ^"" -"" ?"" ?a' },
    { label: 'Re-insert goes last', value: 'car cat cab -car car words' },
  ],
  randomInput: () =>
    valid(() => {
      const words = [...TRIE_WORDS].sort(() => Math.random() - 0.5).slice(0, rint(4, 6));
      const extra = [`?${pick(words)}`, `^${pick(words).slice(0, rint(1, 2))}`, `-${pick(words)}`, `?${pick(words).slice(0, 2)}`, 'words'];
      return [...words, ...extra].join(' ');
    }, parseTrie),
  parse: parseTrie,
  trace: (ops) => stabilizeMultiway(trieTrace(ops).frames),
  render,
  pseudocode: TRIE_CODE,
  legend: [
    { role: 'compare', label: 'path walked so far' },
    { role: 'active', label: 'node created or reached' },
    { role: 'done', label: 'end flag set; words under a prefix' },
    { role: 'good', label: `word found or collected (${SYM.check})` },
    { role: 'bad', label: `missing child, not a word, or pruned (${SYM.cross})` },
    { role: 'idle', label: 'double ring: is_end_of_word (the path spells a stored word)' },
  ],
  complexity: { time: 'O(L) per insert, search, starts_with or delete (L = word length)', space: 'O(total characters)' },
};

/* ---------- suffix tree ---------- */

export const suffixTreeSpec: VizSpec<SuffixInput, MwState> = {
  id: 'suffix-tree',
  title: 'Suffix Tree',
  inputKind: 'suffix-tree',
  inputLabel: 'Text and patterns',
  inputHelp:
    'The text (lowercase letters, up to 6), a semicolon, then the patterns to search separated by spaces (up to 6; "" is the empty pattern). ' +
    'The code appends a terminator that occurs nowhere in the text (the NUL character, drawn $). Each edge shows its substring and its [start, end] indices into the text.',
  examples: [
    { label: 'banana', value: 'banana; ana na a ban x' },
    { label: 'Edge splits: abac', value: 'abac; ac a ba' },
    { label: 'Pattern ends mid-edge', value: 'abcabx; ab abx bca c' },
    { label: 'Repeats: aaaa', value: 'aaaa; a aa aaaaa' },
    { label: 'Empty pattern, mismatch', value: 'xyzzy; "" zy zz zyx' },
  ],
  randomInput: () =>
    valid(() => {
      const alphabet = pick(['ab', 'abc', 'abn']);
      const text = Array.from({ length: rint(4, 6) }, () => pick([...alphabet])).join('');
      const pats = Array.from({ length: rint(2, 3) }, () => {
        const i = rint(0, text.length - 1);
        return Math.random() < 0.75 ? text.slice(i, i + rint(1, 3)) : Array.from({ length: rint(1, 3) }, () => pick([...alphabet])).join('');
      });
      return `${text}; ${pats.join(' ')}`;
    }, parseSuffixTree),
  parse: parseSuffixTree,
  trace: (input) => stabilizeMultiway(suffixTrace(input).frames),
  render,
  pseudocode: SUFFIX_CODE,
  legend: [
    { role: 'compare', label: 'characters matched, suffix being inserted' },
    { role: 'active', label: 'node reached, new internal node from a split' },
    { role: 'done', label: 'new leaf; the subtree below a match' },
    { role: 'good', label: `leaf of an occurrence (${SYM.check})` },
    { role: 'bad', label: `mismatch, or no edge starts with the character (${SYM.cross})` },
  ],
  complexity: { time: 'build O(n^2) (suffix by suffix); search O(m + occ)', space: 'O(n) nodes, edges store [start, end]' },
};
