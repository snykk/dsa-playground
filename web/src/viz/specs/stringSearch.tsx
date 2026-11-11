import { boyerMooreTrace, naiveTrace, parseSearch, rabinKarpTrace, type SearchInput, type SearchState } from '../algorithms/stringSearch';
import { parseZ, zSearchTrace, type ZInput, type ZState } from '../algorithms/zAlgorithm';
import type { Role, VizSpec } from '../core/types';
import { StringScan } from '../renderers/StringScan';
import { SYM } from '../ui/symbols';

const TEXT_HELP = 'Write the text, a "|" and the pattern. Text up to 40 characters, pattern up to 15.';

function pick(alphabet: string, len: number): string {
  return Array.from({ length: len }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
}

/** "text | pattern" with the pattern planted once in the text. */
function randomPair(alphabet: string, textLen: [number, number], patLen: [number, number]): string {
  const between = ([lo, hi]: [number, number]) => lo + Math.floor(Math.random() * (hi - lo + 1));
  const pattern = pick(alphabet, between(patLen));
  let text = pick(alphabet, between(textLen));
  const at = Math.floor(Math.random() * (text.length - pattern.length + 1));
  text = text.slice(0, at) + pattern + text.slice(at + pattern.length);
  return `${text} | ${pattern}`;
}

const render = (state: SearchState) => <StringScan state={state} />;

const WINDOW_LEGEND: Array<{ role: Role; label: string }> = [
  { role: 'good', label: `characters match (${SYM.check})` },
  { role: 'bad', label: `mismatch (${SYM.cross})` },
  { role: 'compare', label: 'matched so far / current window' },
  { role: 'done', label: 'occurrence found' },
  { role: 'muted', label: 'already passed' },
];

export const naiveSearch: VizSpec<SearchInput, SearchState> = {
  id: 'naive-search',
  title: 'Naive Pattern Search',
  inputKind: 'text-pattern',
  inputLabel: 'Text | pattern',
  inputHelp: TEXT_HELP,
  examples: [
    { label: 'Textbook', value: 'AABAACAADAABAABA | AABA' },
    { label: 'Worst case', value: 'AAAAAAAAAAAAAAAAAAAB | AAAAB' },
    { label: 'Overlapping matches', value: 'AAAAAA | AAA' },
    { label: 'No match', value: 'HELLO WORLD | WORDS' },
    { label: 'Pattern longer than text', value: 'ABC | ABCD' },
  ],
  randomInput: () => randomPair('AB', [16, 26], [2, 4]),
  parse: (text) => parseSearch(text),
  trace: (input) => naiveTrace(input),
  render,
  pseudocode: [
    'for i in 0 .. n - m:',
    '  j = 0',
    '  while j < m and text[i + j] == pattern[j]:',
    '    j += 1',
    '  if j == m: report i',
  ],
  legend: WINDOW_LEGEND,
  complexity: { time: 'O(n * m) worst case, O(n + m) typical', space: 'O(1)' },
};

export const rabinKarp: VizSpec<SearchInput, SearchState> = {
  id: 'rabin-karp',
  title: 'Rabin-Karp',
  inputKind: 'text-pattern',
  inputLabel: 'Text | pattern [| mod q]',
  inputHelp: `${TEXT_HELP} Optionally add "| mod 7" to shrink the hash modulus (default 101) and provoke spurious hits.`,
  examples: [
    { label: 'Textbook', value: 'ABABDABACDABABCABC | ABABCABC' },
    { label: 'Spurious hits (small modulus)', value: 'ABCDEFGHIJKLMNOPQRST | HIJ | mod 7' },
    { label: 'Overlapping matches', value: 'AAAAAA | AAA' },
    { label: 'Single character', value: 'BANANA | A' },
    { label: 'No match', value: 'HELLO WORLD | WORDS' },
  ],
  randomInput: () => randomPair('ABC', [16, 26], [2, 4]),
  parse: (text) => parseSearch(text),
  trace: (input) => rabinKarpTrace(input),
  render,
  pseudocode: [
    'h = 256^(m-1) mod q',
    'p = hash(pattern); t = hash(text[0..m-1])        // Horner, mod q',
    'for i in 0 .. n - m:',
    '  if p == t:                                     // hash hit',
    '    verify text[i..i+m-1] == pattern; if equal: report i',
    '  if i < n - m:',
    '    t = (256 * (t - text[i] * h) + text[i+m]) mod q   // roll',
  ],
  legend: [
    { role: 'good', label: `hashes equal / characters match (${SYM.check})` },
    { role: 'bad', label: `hashes differ or characters differ (${SYM.cross})` },
    { role: 'compare', label: 'current window' },
    { role: 'active', label: 'character leaving / entering the window' },
    { role: 'done', label: 'occurrence found' },
  ],
  complexity: { time: 'O(n + m) expected, O(n * m) worst case', space: 'O(1)' },
};

export const boyerMoore: VizSpec<SearchInput, SearchState> = {
  id: 'boyer-moore',
  title: 'Boyer-Moore (bad character)',
  inputKind: 'text-pattern',
  inputLabel: 'Text | pattern',
  inputHelp: TEXT_HELP,
  examples: [
    { label: 'Textbook', value: 'HERE IS A SIMPLE EXAMPLE | EXAMPLE' },
    { label: 'Big skips', value: 'ABCXABCXABCXABC | ABC' },
    { label: 'Worst case', value: 'AAAAAAAAAAAAAAAAAAAA | BAAA' },
    { label: 'Overlapping matches', value: 'AAAAAA | AAA' },
    { label: 'No match', value: 'HELLO WORLD | WORDS' },
  ],
  randomInput: () => randomPair('ABCD', [18, 28], [3, 5]),
  parse: (text) => parseSearch(text),
  trace: (input) => boyerMooreTrace(input),
  render,
  pseudocode: [
    'last[c] = index of the rightmost c in pattern (else -1)',
    's = 0                                   // pattern sits under text[s..]',
    'while s <= n - m:',
    '  j = m - 1',
    '  while j >= 0 and pattern[j] == text[s + j]: j -= 1   // right to left',
    '  if j < 0:',
    '    report s',
    '    s += m - last[text[s + m]]  if s + m < n else 1',
    '  else:',
    '    s += max(1, j - last[text[s + j]])                 // bad-character rule',
  ],
  legend: [
    { role: 'good', label: `characters match (${SYM.check})` },
    { role: 'bad', label: `mismatch, the bad character (${SYM.cross})` },
    { role: 'compare', label: 'suffix already matched' },
    { role: 'active', label: 'character looked up / lined up' },
    { role: 'done', label: 'occurrence found' },
  ],
  complexity: { time: 'O(n * m) worst case, about O(n / m) best case', space: 'O(m + alphabet)' },
};

export const zAlgorithm: VizSpec<ZInput, ZState> = {
  id: 'z-algorithm',
  title: 'Z-Algorithm',
  inputKind: 'text-pattern-short',
  inputLabel: 'Text | pattern',
  inputHelp: 'Write the text, a "|" and the pattern. Text up to 30 characters, pattern up to 10. The search runs on pattern + "$" + text.',
  examples: [
    { label: 'Textbook', value: 'AABAACAADAABAABA | AABA' },
    { label: 'Overlapping matches', value: 'AAAAAA | AAA' },
    { label: 'Separator inside the input', value: 'a$a | a' },
    { label: 'No match', value: 'HELLO WORLD | WORDS' },
    { label: 'Pattern longer than text', value: 'AB | ABC' },
  ],
  randomInput: () => randomPair('AB', [14, 22], [2, 4]),
  parse: (text) => parseZ(text),
  trace: (input) => zSearchTrace(input),
  render: (state) => <StringScan state={state} />,
  pseudocode: [
    's = pattern + "$" + text; z = [0] * len(s); l = r = 0',
    'for i in 1 .. len(s) - 1:',
    '  if i <= r: z[i] = min(r - i + 1, z[i - l])      // reuse the Z-box',
    '  while i + z[i] < len(s) and s[z[i]] == s[i + z[i]]: z[i] += 1',
    '  if i + z[i] - 1 > r: l = i; r = i + z[i] - 1    // new Z-box',
    'report i - m - 1 for every i > m with z[i] >= m',
  ],
  legend: [
    { role: 'active', label: 'position i being computed' },
    { role: 'compare', label: 'Z-box [l, r]' },
    { role: 'good', label: `characters match (${SYM.check})` },
    { role: 'bad', label: `mismatch (${SYM.cross})` },
    { role: 'done', label: 'z >= m: occurrence' },
  ],
  complexity: { time: 'O(n + m)', space: 'O(n + m)' },
};
