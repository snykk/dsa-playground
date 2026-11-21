import { AC_CODE, acTrace, parseAho, trieSize, AC_LIMITS, type AcInput } from '../algorithms/ahoCorasick';
import { LCSUB_CODE, lcsubTrace, parseLcsub, type LcsubInput } from '../algorithms/longestCommonSubstring';
import { MANACHER_CODE, manacherTrace, parseManacher, type ManacherInput, type ManacherState } from '../algorithms/manacher';
import { parseSuffixArray, SA_CODE, saTrace, type SaInput } from '../algorithms/suffixArray';
import type { VizSpec } from '../core/types';
import { AhoCorasickView, stabilizeAho, type AcState } from '../renderers/AhoCorasickView';
import { Grid, type GridState } from '../renderers/Grid';
import { StringScan } from '../renderers/StringScan';
import { stabilizeSuffixArray, SuffixArrayView, type SaState } from '../renderers/SuffixArrayView';
import { SYM } from '../ui/symbols';

const pick = <T,>(xs: readonly T[]): T => xs[Math.floor(Math.random() * xs.length)];
const rint = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));
const word = (alphabet: string, len: number) => Array.from({ length: len }, () => pick([...alphabet])).join('');

/* ---------- Aho-Corasick ---------- */

function randomAho(): string {
  for (let attempt = 0; attempt < 50; attempt++) {
    const alphabet = pick(['ab', 'abc', 'ach', 'aeh']);
    const patterns = Array.from({ length: rint(2, 4) }, () => word(alphabet, rint(1, 3)));
    if (trieSize(patterns) > AC_LIMITS.maxNodes) continue;
    let text = word(alphabet, rint(8, 14));
    const p = pick(patterns);
    const at = rint(0, text.length - p.length);
    text = text.slice(0, at) + p + text.slice(at + p.length);
    return `${patterns.join(' ')} | ${text}`;
  }
  return 'he she his hers | ushers';
}

export const ahoCorasickSpec: VizSpec<AcInput, AcState> = {
  id: 'aho-corasick',
  title: 'Aho-Corasick',
  inputKind: 'aho-corasick',
  inputLabel: 'Patterns | text',
  inputHelp:
    'The patterns separated by spaces or commas, a "|", then the text. Up to 8 patterns of up to 6 characters ("" is the empty pattern, which is skipped), a trie of at most 24 nodes, and a text of up to 20 characters. ' +
    'Children are drawn in insertion order, as the Python dict keeps them.',
  examples: [
    { label: 'Textbook: ushers', value: 'he she his hers | ushers' },
    { label: 'Output links chain', value: 'a aa aaa | aaaa' },
    { label: 'Overlapping matches', value: 'ab bc abc | abcabc' },
    { label: 'Duplicates and empty', value: 'abc abc "" | xabcabc' },
    { label: 'Long failure walk', value: 'acc atc cat gcg | gcatcg' },
  ],
  randomInput: randomAho,
  parse: parseAho,
  trace: (input) => stabilizeAho(acTrace(input).frames),
  render: (state) => <AhoCorasickView state={state} />,
  pseudocode: AC_CODE,
  legend: [
    { role: 'active', label: 'current node, new node or link, character read' },
    { role: 'compare', label: 'path walked, failure candidate, link followed' },
    { role: 'done', label: 'pattern stored or reported, link target' },
    { role: 'bad', label: `node has no child for the character (${SYM.cross})` },
    { role: 'muted', label: 'text already read' },
  ],
  complexity: { time: 'O(n + m + z): build O(m), scan O(n + z)', space: 'O(m) trie nodes' },
};

/* ---------- longest common substring ---------- */

export const longestCommonSubstringSpec: VizSpec<LcsubInput, GridState> = {
  id: 'longest-common-substring',
  title: 'Longest Common Substring',
  inputKind: 'two-strings',
  inputLabel: 'Two strings',
  inputHelp: 'Two strings separated by "|", up to 12 characters each; either may be empty. Characters are compared exactly, so "a" and "A" differ.',
  examples: [
    { label: 'Textbook: ABABC, BABCA', value: 'ABABC | BABCA' },
    { label: 'Tie: the earlier run wins', value: 'abcxyz | xyzabc' },
    { label: 'Nothing shared', value: 'ABC | XYZ' },
    { label: 'Substring, not subsequence', value: 'abcde | ace' },
    { label: 'Empty string', value: ' | ABC' },
  ],
  randomInput: () => {
    const alphabet = pick(['AB', 'ABC', 'ACGT']);
    return `${word(alphabet, rint(5, 9))} | ${word(alphabet, rint(5, 9))}`;
  },
  parse: parseLcsub,
  trace: (input) => lcsubTrace(input).frames,
  render: (state) => <Grid state={state} />,
  pseudocode: LCSUB_CODE,
  legend: [
    { role: 'active', label: 'cell being filled, characters compared' },
    { role: 'compare', label: 'diagonal cell it extends' },
    { role: 'done', label: 'longest run so far' },
  ],
  complexity: { time: 'O(m * n)', space: 'O(m * n) (two rows would do)' },
};

/* ---------- Manacher ---------- */

export const manacherSpec: VizSpec<ManacherInput, ManacherState> = {
  id: 'manacher',
  title: "Manacher's Algorithm",
  inputKind: 'palindrome',
  inputLabel: 'String',
  inputHelp: 'A string of up to 15 characters ("" for the empty string). The transformed string puts a # between the characters and at both ends; # in the input is safe, because real characters only ever meet real characters.',
  examples: [
    { label: 'Textbook: babad', value: 'babad' },
    { label: 'Long reuse: abacaba', value: 'abacaba' },
    { label: 'Even palindrome: cbbd', value: 'cbbd' },
    { label: 'All equal: aaaa', value: 'aaaa' },
    { label: 'Former sentinels: b^a^b^a', value: 'b^a^b^a' },
  ],
  randomInput: () => word(pick(['ab', 'aab', 'abc']), rint(6, 12)),
  parse: parseManacher,
  trace: (input) => manacherTrace(input).frames,
  render: (state) => <StringScan state={state} />,
  pseudocode: MANACHER_CODE,
  legend: [
    { role: 'active', label: 'index i and its radius' },
    { role: 'compare', label: 'rightmost palindrome (center C, right R), mirror i\' and its copy' },
    { role: 'good', label: `characters agree (${SYM.check})` },
    { role: 'bad', label: `characters differ (${SYM.cross})` },
    { role: 'done', label: 'longest palindrome' },
  ],
  complexity: { time: 'O(n)', space: 'O(n)' },
};

/* ---------- suffix array ---------- */

function randomSuffixArray(): string {
  const text = word(pick(['ab', 'abc', 'abn', 'ab$']), rint(5, 9));
  const ops: string[] = [];
  for (let k = 0; k < rint(2, 3); k++) {
    const i = rint(0, text.length - 1);
    ops.push(Math.random() < 0.75 ? text.slice(i, i + rint(1, 3)) : word('abc', rint(1, 3)));
  }
  if (Math.random() < 0.5) ops.push(`lcp ${rint(0, text.length - 1)} ${rint(0, text.length - 1)}`);
  return `${text}; ${ops.join(', ')}`;
}

export const suffixArraySpec: VizSpec<SaInput, SaState> = {
  id: 'suffix-array',
  title: 'Suffix Array',
  inputKind: 'suffix-array',
  inputLabel: 'Text; operations',
  inputHelp:
    'The text (up to 11 characters, no spaces; "" for the empty text), a ";", then operations separated by commas or spaces: a pattern to search (up to 6 characters, "" for the empty pattern, or "search ana") ' +
    'and "lcp i j" for the common prefix of the suffixes starting at i and j. Up to 6 operations.',
  examples: [
    { label: 'Textbook: banana', value: 'banana; ana, nan, x, lcp 1 3' },
    { label: 'mississippi', value: 'mississippi; issi, i, p' },
    { label: 'Repeats: aaaa', value: 'aaaa; aa, aaaaa, lcp 0 1' },
    { label: 'Empty pattern', value: 'banana; ""' },
    { label: 'Code points: Banana', value: 'Banana; a, B, b' },
  ],
  randomInput: randomSuffixArray,
  parse: parseSuffixArray,
  trace: (input) => stabilizeSuffixArray(saTrace(input).frames),
  render: (state) => <SuffixArrayView state={state} />,
  pseudocode: SA_CODE,
  legend: [
    { role: 'active', label: 'suffix made, moved or probed (mid); first differing character' },
    { role: 'compare', label: 'pair being explained, common prefix' },
    { role: 'good', label: `characters agree (${SYM.check})` },
    { role: 'bad', label: `characters differ (${SYM.cross})` },
    { role: 'done', label: 'suffix array, block of matches' },
    { role: 'muted', label: 'ranks the binary search ruled out' },
  ],
  complexity: { time: 'build O(n^2 log n) here; search O(m log n + k log k) for k matches', space: 'O(n^2) while building (copied suffixes), O(n) after' },
};
