import { kmpTrace, parseKmp, type KmpInput } from '../algorithms/kmp';
import type { VizSpec } from '../core/types';
import { StringMatch, type StringMatchState } from '../renderers/StringMatch';

function randomKmp(): string {
  const alphabet = 'AB';
  const pick = (len: number) => Array.from({ length: len }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
  const pattern = pick(3 + Math.floor(Math.random() * 3));
  let text = pick(18 + Math.floor(Math.random() * 8));
  const at = Math.floor(Math.random() * (text.length - pattern.length));
  text = text.slice(0, at) + pattern + text.slice(at + pattern.length);
  return `${text} | ${pattern}`;
}

export const kmp: VizSpec<KmpInput, StringMatchState> = {
  id: 'kmp',
  title: 'Knuth-Morris-Pratt',
  inputKind: 'text-pattern',
  inputLabel: 'Text | pattern',
  inputHelp: 'Write the text, a "|" and the pattern. Text up to 40 characters, pattern up to 15.',
  examples: [
    { label: 'Textbook', value: 'ABABDABACDABABCABAB | ABABCABAB' },
    { label: 'Overlapping matches', value: 'AAAAAA | AAA' },
    { label: 'Long border', value: 'AABAACAADAABAABA | AABA' },
    { label: 'No match', value: 'HELLO WORLD | WORDS' },
  ],
  randomInput: randomKmp,
  parse: (text) => parseKmp(text),
  trace: kmpTrace,
  render: (state) => <StringMatch state={state} />,
  pseudocode: [
    'lps[0] = 0; len = 0; i = 1',
    'while i < m:',
    '  if p[i] == p[len]: len += 1; lps[i] = len; i += 1',
    '  elif len > 0: len = lps[len - 1]        // fall back, keep i',
    '  else: lps[i] = 0; i += 1',
    'i = 0; j = 0                              // i: text, j: pattern',
    'while i < n:',
    '  if t[i] == p[j]: i += 1; j += 1',
    '    if j == m: report i - m; j = lps[j - 1]',
    '  elif j > 0: j = lps[j - 1]               // shift pattern, keep i',
    '  else: i += 1',
  ],
  legend: [
    { role: 'good', label: 'characters match (\u2713)' },
    { role: 'bad', label: 'mismatch (\u2715)' },
    { role: 'compare', label: 'already matched' },
    { role: 'done', label: 'occurrence found / lps just set' },
  ],
  complexity: { time: 'O(n + m)', space: 'O(m) for the LPS table' },
};
