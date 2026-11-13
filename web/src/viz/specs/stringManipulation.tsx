import { StringOpsView, stabilizeStrings, type StringOpsState } from '../renderers/StringOpsView';
import type { VizSpec } from '../core/types';
import { parseManip, stringManipulationTrace, type ManipInput } from '../algorithms/stringManipulation';
import { pick, randomWord } from '../algorithms/stringOps';

const render = (state: StringOpsState) => <StringOpsView state={state} />;

const legend: VizSpec<ManipInput, StringOpsState>['legend'] = [
  { role: 'compare', label: 'being read' },
  { role: 'active', label: 'being written, or the separator found' },
  { role: 'done', label: 'written, part of the result' },
  { role: 'good', label: 'match' },
  { role: 'bad', label: 'mismatch, or the call raises' },
  { role: 'muted', label: 'skipped' },
];

export const stringReverse: VizSpec<ManipInput, StringOpsState> = {
  id: 'string-reverse',
  title: 'Reverse and Palindrome',
  inputKind: 'string-reverse',
  inputLabel: 'String and operations',
  inputHelp: 'A string in quotes, then reverse and palindrome separated by commas (with none, both run). Up to 16 characters.',
  examples: [
    { label: 'Palindrome', value: '"racecar"' },
    { label: 'Not a palindrome', value: '"hello"' },
    { label: 'Mismatch in the middle', value: '"abca"; palindrome' },
    { label: 'Case counts', value: '"Aa"' },
    { label: 'Empty string', value: '""' },
  ],
  randomInput: () => {
    const half = randomWord('abcr', 1, 4);
    const s = Math.random() < 0.5 ? half + [...half].reverse().join('').slice(Math.random() < 0.5 ? 1 : 0) : randomWord('abcder', 2, 8);
    return `"${s}"`;
  },
  parse: (text) => parseManip(text, 'reverse'),
  trace: (input) => stabilizeStrings(stringManipulationTrace(input, 'reverse').frames),
  render,
  pseudocode: [
    'reverse_string(s): return s[::-1]',
    '  allocate len(s) characters; start reading at index len(s) - 1',
    '  copy s[i] to the next position, then i -= 1     # step -1',
    'is_palindrome(s): return s == s[::-1]',
    '  r = s[::-1]                  # the whole reversed copy, first',
    '  compare s and r from the left; stop at the first difference',
  ],
  legend,
  complexity: { time: 'O(n)', space: 'O(n): the reversed copy' },
};

export const stringCountReplace: VizSpec<ManipInput, StringOpsState> = {
  id: 'string-count-replace',
  title: 'Vowels, Replace and Case',
  inputKind: 'string-count-replace',
  inputLabel: 'String and operations',
  inputHelp:
    'A string in quotes, then operations separated by commas: vowels, replace "old" "new", upper, lower (with none: vowels, upper and lower). Up to 16 characters.',
  examples: [
    { label: 'Count vowels', value: '"Hello World"; vowels' },
    { label: 'Replace a letter', value: '"hello"; replace "l" "L"' },
    { label: 'Replace without overlaps', value: '"aaaa"; replace "aa" "b"' },
    { label: 'Replace the empty string', value: '"abc"; replace "" "-"' },
    { label: 'Change case', value: '"Hello World 123"; upper, lower' },
  ],
  randomInput: () => {
    const s = pick(['Hello World', 'banana', 'Mississippi', 'abc ABC', 'Python 3']);
    const old = pick(['a', 'l', 'ss', 'an', 'o']);
    return `"${s}"; ${pick(['vowels', `replace "${old}" "${randomWord('XY', 1, 2)}"`, 'upper', 'lower'])}, ${pick(['vowels', 'upper', 'lower'])}`;
  },
  parse: (text) => parseManip(text, 'count'),
  trace: (input) => stabilizeStrings(stringManipulationTrace(input, 'count').frames),
  render,
  pseudocode: [
    'count_vowels(s): return sum(1 for c in s if c in "aeiouAEIOU")',
    '  for each c in s: if c in vowels: count += 1',
    'replace_char(s, old, new): return s.replace(old, new)',
    '  j = s.find(old, i)                        # leftmost match at or after i',
    '  copy s[i:j], write new; i = j + len(old)  # matches never overlap',
    '  no match left: copy s[i:]',
    '  old == "": write new before every character and at the end',
    'to_upper(s): return s.upper()   |   to_lower(s): return s.lower()',
    '  map each letter to the other case; copy every other character',
  ],
  legend,
  complexity: { time: 'O(n) per call', space: 'O(n) for a new string; O(1) to count' },
};

export const stringSplitJoin: VizSpec<ManipInput, StringOpsState> = {
  id: 'string-split-join',
  title: 'Split and Join',
  inputKind: 'string-split-join',
  inputLabel: 'String and operations',
  inputHelp:
    'A string in quotes, then operations separated by commas: split " " (or another separator in quotes), join "-" (joins the parts of the last split), or join ["a", "b"] "-". With none: split " ", then join " ". Up to 16 characters.',
  examples: [
    { label: 'Split, then join', value: '"a b c"; split " ", join "-"' },
    { label: 'Empty fields', value: '"a  b "; split " ", join " "' },
    { label: 'Longer separator', value: '"a--b---c"; split "--", join "+"' },
    { label: 'Join a list', value: '""; join ["ab", "cd", "ef"] ", ", join [] "-", join ["x"] "-"' },
    { label: 'Empty separator', value: '"abc"; split "", split ","' },
  ],
  randomInput: () => {
    const sep = pick([' ', ',', '-']);
    const fields = Array.from({ length: 2 + Math.floor(Math.random() * 3) }, () => randomWord('abc', 0, 3));
    return `"${fields.join(sep)}"; split "${sep}", join "${pick(['-', '+', ' '])}"`;
  },
  parse: (text) => parseManip(text, 'split'),
  trace: (input) => stabilizeStrings(stringManipulationTrace(input, 'split').frames),
  render,
  pseudocode: [
    'split_string(s, sep=" "): return s.split(sep)',
    '  j = s.find(sep, i)                        # the next separator at or after i',
    '  parts.append(s[i:j]); i = j + len(sep)    # a field; empty when j == i',
    '  no separator left: parts.append(s[i:])    # the last field, maybe empty',
    'join_string(lst, sep=" "): return sep.join(lst)',
    '  total = sum(len(x) for x in lst) + (len(lst) - 1) * len(sep)',
    '  allocate total characters, once',
    '  copy lst[0]; then sep and lst[k] for every next item',
  ],
  legend,
  complexity: { time: 'O(n) split; O(total length) join', space: 'O(n)' },
};
