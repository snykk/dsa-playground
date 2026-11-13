import { RopeView, stabilizeRope, type RopeViewState } from '../renderers/RopeView';
import type { VizSpec } from '../core/types';
import { parseRope, ropeTrace, type RopeInput } from '../algorithms/rope';
import { pick, randomWord } from '../algorithms/stringOps';

const TEXTS = ['Hello World!', 'Hello, World! Nice to meet you!', 'abcdefghijklmnopqrstuvwxyz', 'the quick brown fox', 'rope'];

function randomScript(): string {
  for (let attempt = 0; attempt < 20; attempt++) {
    const text = pick(TEXTS);
    let length = text.length;
    const ops: string[] = [];
    const count = 3 + Math.floor(Math.random() * 3);
    for (let k = 0; k < count; k++) {
      const pos = Math.floor(Math.random() * (length + 1));
      const r = Math.random();
      if (r < 0.3) {
        const add = randomWord('XYZ!-', 1, 6);
        ops.push(Math.random() < 0.3 ? `insert end "${add}"` : `insert ${pos} "${add}"`);
        length += add.length;
      } else if (r < 0.5) {
        const n = 1 + Math.floor(Math.random() * 6);
        ops.push(`delete ${pos} ${n}`);
        length -= Math.min(n, length - pos);
      } else if (r < 0.65) {
        const add = randomWord('xyz', 1, 4);
        ops.push(`concat "${add}"`);
        length += add.length;
      } else if (r < 0.85) {
        ops.push(`index ${Math.floor(Math.random() * (length + 2))}`);
      } else {
        ops.push(`split ${pos}`);
      }
    }
    const script = `"${text}"; ${ops.join(', ')}`;
    try {
      parseRope(script);
      return script;
    } catch {
      // too long or too many leaves for the screen: draw again
    }
  }
  return '"Hello World!"; insert 5 ",", index 6, delete 5 2';
}

export const rope: VizSpec<RopeInput, RopeViewState> = {
  id: 'rope',
  title: 'Rope',
  inputKind: 'rope-script',
  inputLabel: 'Text and operations',
  inputHelp:
    'Start with the text in quotes, then operations separated by commas: index 4, split 6, insert 5 ",", insert end "!", delete 5 2, concat " more". Positions count characters from 0. Up to 40 characters and 8 operations.',
  examples: [
    { label: 'Insert a comma', value: '"Hello World!"; insert 5 ",", index 6, delete 5 2' },
    { label: 'Index by the weights', value: '"Hello, World! Nice to meet you!"; index 20, index 0, index 30, index 31, index -1' },
    { label: 'Typing at the end (single rotation)', value: '"Hello, World! Nice to meet you!"; insert end "!", insert end "?", insert end "#"' },
    { label: 'A long insert (double rotation)', value: '"[]"; insert 1 "hello world"' },
    { label: 'Split, then concat', value: '"Hello, World! Nice to meet you!"; split 7, split 20, concat " Bye!"' },
  ],
  randomInput: randomScript,
  parse: (text) => parseRope(text),
  trace: (input) => stabilizeRope(ropeTrace(input).frames),
  render: (state) => <RopeView state={state} />,
  pseudocode: [
    'index(i): at a node, i < weight ? go left : go right with i - weight',
    '  at a leaf: return data[i]          # IndexError outside the leaf',
    'split(i): walk down by the weights; a leaf the cut falls inside becomes two leaves',
    '  bottom up, each level joins its hanging subtree onto its half',
    'join(a, b): heights within 1 -> _make(a, b)   # weight = len(a)',
    '  else walk down the taller rope\'s facing spine to a similar height',
    '  on the way up: _make(sibling, joined) while heights stay within 1',
    '  else rotate: single if the outer side is at least as tall, else double',
    'insert(i, text): l, r = split(i); root = join(join(l, Rope(text)), r)',
    'delete(i, n): l, rest = split(i); _, r = rest.split(n); root = join(l, r)',
    'concat(other): return Rope(join(root, other.root))',
    'Rope(text): halve until every piece has <= 10 characters, then _make',
  ],
  legend: [
    { role: 'active', label: 'current node, or a node the code just built' },
    { role: 'compare', label: 'on the walk, or the other rope of a join' },
    { role: 'done', label: 'the character found' },
    { role: 'bad', label: 'out of range, or two levels out of balance' },
    { role: 'muted', label: 'deleted text' },
    { role: 'idle', label: 'untouched, shared node' },
  ],
  complexity: { time: 'O(log n) per index, split, join; insert adds O(len(text))', space: 'O(n)' },
};
