import { bloomTrace, BLOOM_CODE, parseBloom, type BloomInput } from '../algorithms/bloomFilter';
import { CHAIN_CODE, chainTrace, parseChain, type ChainInput, type ChainMode } from '../algorithms/hashTable';
import { openPseudocode, openTrace, parseOpen, type OpenInput, type ProbeMode } from '../algorithms/openAddressing';
import type { Example, VizSpec } from '../core/types';
import { BloomBitArray, type BloomState } from '../renderers/BloomBitArray';
import { ChainView, stabilizeChain, type ChainState } from '../renderers/ChainView';
import { OpenAddressingTable, type ProbeTableState } from '../renderers/OpenAddressingTable';
import { SYM } from '../ui/symbols';

const pick = <T,>(xs: readonly T[]): T => xs[Math.floor(Math.random() * xs.length)];
const rint = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));

/** Draw random scripts until one passes the parser's limits (a few tries at most). */
function valid(make: () => string, parse: (text: string) => unknown): string {
  for (let attempt = 0; attempt < 50; attempt++) {
    const text = make();
    try {
      parse(text);
      return text;
    } catch {
      // too many keys or buckets: draw again
    }
  }
  return make();
}

const WORDS = ['cat', 'dog', 'owl', 'ant', 'bee', 'fox', 'emu', 'yak', 'elk', 'hen', 'cow', 'pig'];

function randomChainScript(mode: ChainMode): string {
  const cap = pick([2, 4, 4, 8, 16]);
  const step = pick([cap, 1, 3]);
  // The parser allows 12 keys; a handful keeps a random run short.
  const keys = Array.from({ length: rint(3, 8) }, (_, i) => (Math.random() < 0.2 ? pick(WORDS) : String(rint(0, 3) + i * step)));
  const ops: string[] = [];
  let letter = 0;
  const value = () => 'abcdefghijklmnopqrstuvwxyz'[letter++ % 26];
  for (const k of keys) ops.push(mode === 'set' ? `add ${k}` : `put ${k} ${value()}`);
  for (let i = 0; i < rint(3, 5); i++) {
    const k = Math.random() < 0.8 ? pick(keys) : String(rint(0, 40));
    const r = Math.random();
    if (mode === 'set') ops.push(r < 0.4 ? `contains ${k}` : r < 0.7 ? `remove ${k}` : `add ${k}`);
    else if (mode === 'table') ops.push(r < 0.35 ? `get ${k}` : r < 0.6 ? `remove ${k}` : r < 0.8 ? `contains ${k}` : `put ${k} ${value()}`);
    else ops.push(r < 0.45 ? `get ${k}` : r < 0.75 ? `remove ${k}` : `put ${k} ${value()}`);
  }
  return `cap ${cap}; ${ops.join(', ')}`;
}

interface ChainMeta {
  id: string;
  title: string;
  inputKind: string;
  examples: Example[];
  help: string;
  random?: () => string;
}

function chainSpec(mode: ChainMode, meta: ChainMeta): VizSpec<ChainInput, ChainState> {
  const parse = (text: string) => parseChain(text, mode);
  return {
    id: meta.id,
    title: meta.title,
    inputKind: meta.inputKind,
    inputLabel: 'Capacity and operations',
    inputHelp: meta.help,
    examples: meta.examples,
    randomInput: () => valid(meta.random ?? (() => randomChainScript(mode)), parse),
    parse,
    trace: (input) => stabilizeChain(chainTrace(input).frames),
    render: (state) => <ChainView state={state} />,
    pseudocode: CHAIN_CODE[mode].lines,
    legend: [
      { role: 'compare', label: 'bucket being searched, key being compared' },
      { role: 'active', label: mode === 'set' ? 'key just added or moved' : 'pair just added, updated or moved' },
      { role: 'good', label: `key found (${SYM.check})` },
      { role: 'bad', label: `key not in its bucket, or just removed (${SYM.cross})` },
      ...(mode === 'fixed' ? [] : [{ role: 'muted' as const, label: 'waiting in the old buckets during a resize' }]),
    ],
    complexity:
      mode === 'fixed'
        ? { time: 'O(1 + n / capacity) per operation (no resize)', space: 'O(capacity + n)' }
        : { time: 'O(1) average, O(n) worst; resize O(n), amortized O(1)', space: 'O(capacity + n)' },
  };
}

export const hashTableSpec = chainSpec('table', {
  id: 'hash-table',
  title: 'Hash Table (separate chaining)',
  inputKind: 'hash-map',
  help:
    'Start with the number of buckets ("cap 4", 1 to 16; 16, the Python default, if you leave it out), then operations separated by commas: ' +
    '"put 5 a", "get 5", "remove 5", "contains 5" (p, g, rm, has for short). Keys are integers (-99 to 999) or words of up to 4 letters; a word in quotes, like \'5\', is a string. ' +
    'Values are integers or words of up to 3 letters. Up to 30 operations, and the table may not grow past 16 buckets (at most 12 keys).',
  examples: [
    { label: 'Resize: chains move', value: 'cap 4; put 5 a, put 9 b, put 13 c, put 2 d, put 7 e, get 13, remove 9' },
    { label: 'Word keys, update, miss', value: 'cap 8; put cat 1, put dog 2, put cat 3, get cat, get owl, contains dog, remove dog' },
    { label: 'Bad keys: one long chain', value: 'cap 8; put 0 a, put 8 b, put 16 c, put 24 d, put 32 e, put 40 f, get 40, get 48' },
    { label: 'Negative keys', value: 'cap 4; put -1 a, put -5 b, put 3 c, get -5, remove -1, get 3' },
    { label: 'Remove from a chain', value: 'cap 8; put 1 a, put 9 b, put 17 c, put 25 d, remove 9, get 25, get 9' },
  ],
});

export const hashSetSpec = chainSpec('set', {
  id: 'hash-set',
  title: 'Hash Set',
  inputKind: 'hash-set',
  help:
    'Start with the number of buckets ("cap 4", 1 to 16; 16, the Python default, if you leave it out), then operations separated by commas: ' +
    '"add 5", "remove 5", "contains 5" (a, rm, has for short). Elements are integers (-99 to 999) or words of up to 4 letters. ' +
    'Up to 30 operations, and the set may not grow past 16 buckets (at most 12 elements).',
  examples: [
    { label: 'Add and resize', value: 'cap 4; add 10, add 14, add 18, add 3, add 7, add 14, remove 18' },
    { label: 'Duplicates and misses', value: 'cap 8; add cat, add dog, add cat, contains owl, contains dog, remove owl' },
    { label: 'Long chain', value: 'cap 8; add 0, add 8, add 16, add 24, contains 24, remove 8, contains 8' },
    { label: 'Grow twice', value: 'cap 2; add 1, add 2, add 3, add 4, add 5, add 6' },
  ],
});

function randomCollisionScript(): string {
  const cap = pick([4, 8, 8]);
  const keys = Array.from({ length: rint(3, Math.min(6, cap)) }, () => pick([0, 1, 3]) + cap * rint(0, 4));
  const ops = keys.map((k, i) => `put ${k} ${'abcdefgh'[i]}`);
  for (let i = 0; i < rint(3, 5); i++) {
    const k = Math.random() < 0.8 ? pick(keys) : rint(0, 40);
    const r = Math.random();
    ops.push(r < 0.4 ? `remove ${k}` : r < 0.7 ? `get ${k}` : `put ${k} ${'xyz'[i % 3]}`);
  }
  return `cap ${cap}; ${ops.join(', ')}`;
}

const COLLISION_HELP =
  'The same script runs in every tab. Start with the number of slots ("cap 8", 1 to 16; 16, the Python default, if you leave it out), ' +
  'then operations separated by commas: "put 17 b", "get 17", "remove 17" (p, g, rm for short). Keys are integers (-99 to 999) or words of up to 4 letters, values integers or words of up to 3. ' +
  'Up to 30 operations and 12 keys. Nothing resizes.';

const COLLISION_EXAMPLES: Example[] = [
  { label: 'Clusters (textbook)', value: 'cap 8; put 3 a, put 11 b, put 19 c, put 6 d, put 14 e, get 19' },
  { label: 'Remove, then insert', value: 'cap 8; put 3 a, put 11 b, put 19 c, remove 11, get 19, put 27 d' },
  { label: 'Re-put after a remove', value: 'cap 8; put 1 a, put 17 b, remove 1, put 17 B, get 17, remove 17, get 17' },
  { label: 'Table fills up', value: 'cap 4; put 3 a, put 7 b, put 11 c, put 15 d, put 19 e, remove 7, put 19 e, get 19' },
  { label: 'Same home slot', value: 'cap 8; put 0 a, put 8 b, put 16 c, put 24 d, put 32 e, get 32' },
];

export const separateChainingSpec = chainSpec('fixed', {
  id: 'separate-chaining',
  title: 'Separate chaining',
  inputKind: 'collision',
  help: COLLISION_HELP,
  examples: COLLISION_EXAMPLES,
  random: randomCollisionScript,
});

function probeSpec(mode: ProbeMode): VizSpec<OpenInput, ProbeTableState> {
  const parse = (text: string) => parseOpen(text, mode);
  return {
    id: mode === 'linear' ? 'linear-probing' : 'quadratic-probing',
    title: mode === 'linear' ? 'Linear probing' : 'Quadratic probing',
    inputKind: 'collision',
    inputLabel: 'Capacity and operations',
    inputHelp: COLLISION_HELP,
    examples:
      mode === 'linear'
        ? COLLISION_EXAMPLES
        : [...COLLISION_EXAMPLES.slice(0, 3), COLLISION_EXAMPLES[4], { label: 'Capacity 6: unreachable slots', value: 'cap 6; put 0 a, put 6 b, put 12 c, put 18 d, put 24 e, get 24' }],
    randomInput: () => valid(randomCollisionScript, parse),
    parse,
    trace: (input) => openTrace(input).frames,
    render: (state) => <OpenAddressingTable state={state} />,
    pseudocode: openPseudocode(mode),
    legend: [
      { role: 'compare', label: 'slot on the probe sequence' },
      { role: 'active', label: 'slot just written' },
      { role: 'good', label: `key found (${SYM.check})` },
      { role: 'bad', label: `empty slot ends the walk, or the table is full (${SYM.cross})` },
      { role: 'muted', label: 'tombstone (DEL, hatched): walked past, reusable' },
    ],
    complexity: { time: 'O(1) expected at a low load, O(capacity) per operation worst case', space: 'O(capacity)' },
  };
}

export const linearProbingSpec = probeSpec('linear');
export const quadraticProbingSpec = probeSpec('quadratic');

const BLOOM_WORDS = ['cat', 'dog', 'owl', 'aoo', 'fox', 'bee', 'ant', 'emu', 'yak', 'elk', 'hen', 'cow', 'pig', 'rat', 'bat', 'eel'];

function randomBloomScript(): string {
  const words = [...BLOOM_WORDS].sort(() => Math.random() - 0.5);
  const added = words.slice(0, rint(2, 4));
  const asked = [pick(added), ...words.slice(4, 4 + rint(2, 3))];
  return `n 5, p 0.1; ${[...added.map((w) => `add ${w}`), ...asked.map((w) => `contains ${w}`)].join(', ')}`;
}

export const bloomFilterSpec: VizSpec<BloomInput, BloomState> = {
  id: 'bloom-filter',
  title: 'Bloom Filter',
  inputKind: 'bloom',
  inputLabel: 'Size and operations',
  inputHelp:
    'Start with the expected number of items and the target false positive rate ("n 5, p 0.1"; p defaults to 0.01), then operations separated by commas: "add cat", "contains cat". ' +
    'Items are words of up to 8 letters or digits. The filter may have up to 64 bits and 20 operations.',
  examples: [
    { label: 'False positive', value: 'n 5, p 0.1; add cat, add dog, contains cat, contains owl, contains aoo' },
    { label: 'Two hashes, one bit', value: 'n 5, p 0.1; add bee, add ant, contains bee, contains fox' },
    { label: 'Overfilled', value: 'n 3, p 0.1; add cat, add dog, add owl, add fox, add bee, add ant, contains emu, contains pig, contains bat, contains koi' },
    { label: 'Tiny filter (k = 1)', value: 'n 2, p 0.5; add a, contains b, contains never' },
    { label: 'Default 1%', value: 'n 5; add apple, add pear, contains plum, contains apple' },
  ],
  randomInput: () => valid(randomBloomScript, parseBloom),
  parse: parseBloom,
  trace: (input) => bloomTrace(input).frames,
  render: (state) => <BloomBitArray state={state} />,
  pseudocode: BLOOM_CODE,
  legend: [
    { role: 'compare', label: 'the k positions of the item' },
    { role: 'active', label: 'bit being set' },
    { role: 'done', label: 'bit is 1' },
    { role: 'good', label: `checked bit is 1 (${SYM.check})` },
    { role: 'bad', label: `checked bit is 0: definitely absent (${SYM.cross})` },
  ],
  complexity: { time: 'O(k) per add or contains (k md5 hashes)', space: 'O(m) bits' },
};
