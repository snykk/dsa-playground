import { StringOpsView, stabilizeStrings, type StringOpsState } from '../renderers/StringOpsView';
import type { VizSpec } from '../core/types';
import { parseBasics, stringBasicsTrace, type BasicsInput } from '../algorithms/stringBasics';
import { pick, randomWord } from '../algorithms/stringOps';

function randomScript(): string {
  const s = pick(['hello', 'Python', 'abcdef', 'data', 'strings', 'a b c']);
  let n = s.length;
  const ops: string[] = [];
  const count = 3 + Math.floor(Math.random() * 3);
  for (let k = 0; k < count; k++) {
    const r = Math.random();
    const near = () => Math.floor(Math.random() * (n + 5)) - Math.floor(n / 2) - 2;
    if (r < 0.3) ops.push(`access ${near()}`);
    else if (r < 0.55) ops.push(`substring ${near()} ${near() + 3}`);
    else if (r < 0.7 && n < 12) {
      const t = randomWord('xyz!', 1, Math.min(3, 16 - n));
      ops.push(`concat "${t}"`);
      n += t.length;
    } else if (r < 0.85) ops.push('traverse');
    else ops.push('length');
  }
  return `"${s}"; ${ops.join(', ')}`;
}

export const stringBasics: VizSpec<BasicsInput, StringOpsState> = {
  id: 'string-basics',
  title: 'String Basics',
  inputKind: 'string-basics',
  inputLabel: 'String and operations',
  inputHelp:
    'Start with a string in quotes, then operations separated by commas: access 1 (or s[1]), length, traverse, substring 1 4 (or s[1:4]), concat " world" (stores s + t back in s). Indexes may be negative (-99 to 99). Up to 12 characters and 8 operations.',
  examples: [
    { label: 'Index, slice, concatenate', value: '"hello"; access 1, access -1, substring 1 4, concat " world", length' },
    { label: 'Out of range: raise or clamp', value: '"hello"; access 7, access -6, substring 3 99, substring -9 2, substring 3 1' },
    { label: 'Traverse into a list', value: '"abc"; traverse, length' },
    { label: 'Negative indexes', value: '"Python"; s[-1], s[-6], s[-3:6], s[-3:-1]' },
    { label: 'Empty strings', value: '""; length, access 0, substring 0 0, concat "abc", concat ""' },
  ],
  randomInput: randomScript,
  parse: (text) => parseBasics(text),
  trace: (input) => stabilizeStrings(stringBasicsTrace(input).frames),
  render: (state) => <StringOpsView state={state} />,
  pseudocode: [
    'access_char(s, i): return s[i]',
    '  if i < 0: i += len(s)              # negative indexes count from the end',
    '  if not 0 <= i < len(s): raise IndexError',
    '  return the character at i          # read directly: O(1)',
    'string_length(s): return len(s)     # stored in the object: O(1)',
    'traverse_string(s): return [c for c in s]   # one step per character',
    'concatenate(s1, s2): return s1 + s2',
    '  allocate len(s1) + len(s2) characters; copy s1, then s2',
    'substring(s, start, end): return s[start:end]',
    '  a negative bound counts from the end (and stays >= 0)',
    '  a bound past the end becomes len(s)',
    "  copy s[start:end] into a new string  # '' when end <= start",
  ],
  legend: [
    { role: 'compare', label: 'being read' },
    { role: 'active', label: 'just appended' },
    { role: 'done', label: 'copied or returned' },
    { role: 'bad', label: 'no character there: IndexError' },
    { role: 'idle', label: 'untouched character' },
  ],
  complexity: { time: 'O(1) access and length; O(n) traverse; O(n + m) concatenate; O(k) substring', space: 'O(n + m) for a new string' },
};
