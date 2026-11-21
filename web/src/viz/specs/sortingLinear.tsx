import {
  LINEAR_SORTERS,
  parseCountingInput,
  parseRadixInput,
  parseUnitInput,
  randomCountingInput,
  randomRadixInput,
  randomUnitInput,
  type LinearFrame,
} from '../algorithms/sortingLinear';
import type { Role, VizSpec } from '../core/types';
import { BucketScene, type BucketSceneState } from '../renderers/BucketScene';

const render = (state: BucketSceneState) => <BucketScene state={state} />;
const trace = (id: keyof typeof LINEAR_SORTERS) => (values: number[]): LinearFrame[] => LINEAR_SORTERS[id](values);

const LEGEND: Array<{ role: Role; label: string }> = [
  { role: 'compare', label: 'being read' },
  { role: 'active', label: 'being written' },
  { role: 'muted', label: 'already handled' },
  { role: 'done', label: 'in its final position' },
];
// Radix sort's collect phase keeps the values gathered so far in this pass in the read colour.
const RADIX_LEGEND: Array<{ role: Role; label: string }> = [
  { role: 'compare', label: 'being read, or collected earlier in this pass' },
  ...LEGEND.slice(1),
];

export const countingSort: VizSpec<number[], BucketSceneState> = {
  id: 'counting-sort',
  title: 'Counting Sort',
  inputKind: 'counting-ints',
  inputLabel: 'Values to sort',
  inputHelp: '2 to 16 whole numbers (negatives allowed) whose largest and smallest are at most 24 apart.',
  examples: [
    { label: 'Textbook', value: '4, 2, 2, 8, 3, 3, 1' },
    { label: 'Duplicates', value: '5, 3, 5, 1, 3, 5, 1, 3' },
    { label: 'Negatives', value: '3, -1, 2, -4, 0, 2, -1' },
    { label: 'One value only', value: '7, 7, 7, 7' },
    { label: 'Two values', value: '2, 1' },
  ],
  randomInput: randomCountingInput,
  parse: parseCountingInput,
  trace: trace('counting-sort'),
  render,
  pseudocode: [
    'k = max - min + 1; count = [0] * k',
    'for x in a: count[x - min] += 1',
    'for j from 1 to k - 1: count[j] += count[j - 1]',
    'for i from n - 1 down to 0:',
    '  count[a[i] - min] -= 1',
    '  out[count[a[i] - min]] = a[i]     // back to front keeps it stable',
    'return out',
  ],
  legend: LEGEND,
  complexity: { time: 'O(n + k), k = max - min + 1', space: 'O(n + k)' },
};

export const radixSort: VizSpec<number[], BucketSceneState> = {
  id: 'radix-sort',
  title: 'Radix Sort (LSD)',
  inputKind: 'radix-ints',
  inputLabel: 'Values to sort',
  inputHelp: '2 to 16 whole numbers between -999 and 999 (negatives are shifted by the minimum).',
  examples: [
    { label: 'Textbook', value: '170, 45, 75, 90, 802, 24, 2, 66' },
    { label: 'Equal digits (stability)', value: '329, 457, 657, 839, 436, 720, 355' },
    { label: 'Negatives', value: '12, -4, 7, 0, -9, 300, -150' },
    { label: 'Single digit', value: '5, 3, 9, 1, 7' },
    { label: 'All zero', value: '0, 0, 0' },
  ],
  randomInput: randomRadixInput,
  parse: parseRadixInput,
  trace: trace('radix-sort'),
  render,
  pseudocode: [
    'offset = min(min(a), 0); maxKey = max(a) - offset',
    'for exp = 1, 10, 100, ... while maxKey / exp > 0:',
    '  buckets = 10 empty lists',
    '  for x in a:  append x to buckets[((x - offset) / exp) % 10]',
    '  // (the repo code does this pass with a stable counting sort on the digit)',
    '  a = buckets[0] + buckets[1] + ... + buckets[9]',
    'return a',
  ],
  legend: RADIX_LEGEND,
  complexity: { time: 'O(d * (n + b)), d digits in base b = 10', space: 'O(n + b)' },
};

export const bucketSort: VizSpec<number[], BucketSceneState> = {
  id: 'bucket-sort',
  title: 'Bucket Sort',
  inputKind: 'unit-floats',
  inputLabel: 'Decimals in [0, 1]',
  inputHelp: '2 to 16 decimals between 0 and 1 (1.0 is allowed); there is one bucket per value.',
  examples: [
    { label: 'Textbook', value: '0.78, 0.17, 0.39, 0.26, 0.72, 0.94, 0.21, 0.12, 0.23, 0.68' },
    { label: 'Clustered (one crowded bucket)', value: '0.11, 0.12, 0.13, 0.14, 0.15, 0.16, 0.9' },
    { label: 'Includes 1.0', value: '0.5, 1.0, 0.25, 0.75' },
    { label: 'Duplicates', value: '0.3, 0.3, 0.1, 0.3, 0.9' },
  ],
  randomInput: randomUnitInput,
  parse: parseUnitInput,
  trace: trace('bucket-sort'),
  render,
  pseudocode: [
    'n = len(a); buckets = n empty lists',
    'for x in a:',
    '  // bucket index',
    '  b = min(floor(n * x), n - 1)       // 1.0 goes to the last bucket',
    '  append x to buckets[b]',
    'for each bucket: insertion sort it',
    '  // shift larger values right, drop the key in',
    'concatenate buckets 0 .. n - 1',
    'return the concatenation',
  ],
  legend: [
    { role: 'compare', label: 'being read, bucket being sorted, or collected so far' },
    { role: 'active', label: 'being written' },
    { role: 'muted', label: 'already handled' },
    { role: 'done', label: 'in its final position' },
  ],
  complexity: { time: 'O(n + k) on uniform data, O(n^2) if everything lands in one bucket', space: 'O(n + k)' },
};
