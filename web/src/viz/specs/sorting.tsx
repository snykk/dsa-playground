import { SORTERS } from '../algorithms/sorting';
import { parseIntList, randomInts, type Role, type VizSpec } from '../core/types';
import { ArrayBars, type ArrayState } from '../renderers/ArrayBars';

type SortId = keyof typeof SORTERS;

const EXAMPLES = [
  { label: 'Random', value: '38, 27, 43, 3, 9, 82, 10, 55, 19, 64' },
  { label: 'Nearly sorted', value: '1, 2, 4, 3, 5, 6, 8, 7, 9, 10' },
  { label: 'Reversed', value: '10, 9, 8, 7, 6, 5, 4, 3, 2, 1' },
  { label: 'Duplicates', value: '5, 3, 5, 1, 3, 5, 1, 3' },
  { label: 'Negatives', value: '12, -4, 7, 0, -9, 3, 15, -1' },
];

const LEGEND: Array<{ role: Role; label: string }> = [
  { role: 'compare', label: 'being compared' },
  { role: 'active', label: 'moving / selected' },
  { role: 'done', label: 'in its final position' },
  { role: 'idle', label: 'not placed yet' },
];

function sortSpec(
  id: SortId,
  title: string,
  pseudocode: string[],
  complexity: { time: string; space: string },
): VizSpec<number[], ArrayState> {
  return {
    id,
    title,
    inputKind: 'int-array',
    inputLabel: 'Values to sort',
    inputHelp: '2 to 24 whole numbers between -999 and 999, separated by commas or spaces.',
    examples: EXAMPLES,
    randomInput: () => randomInts(10 + Math.floor(Math.random() * 5), 1, 99).join(', '),
    parse: (text) => parseIntList(text, { min: 2, max: 24 }),
    trace: SORTERS[id],
    render: (state) => <ArrayBars state={state} />,
    pseudocode,
    legend: LEGEND,
    complexity,
  };
}

export const bubbleSort = sortSpec(
  'bubble-sort',
  'Bubble Sort',
  [
    'for i from 0 to n - 2:',
    '  swapped = false',
    '  for j from 0 to n - 2 - i:',
    '    if a[j] > a[j + 1]:',
    '      swap a[j], a[j + 1]; swapped = true',
    '  // a[n - 1 - i] is now in its final place',
    '  if not swapped: stop early',
  ],
  { time: 'O(n\u00b2), O(n) if already sorted', space: 'O(1)' },
);

export const insertionSort = sortSpec(
  'insertion-sort',
  'Insertion Sort',
  [
    'for i from 1 to n - 1:',
    '  key = a[i]',
    '  j = i - 1',
    '  while j >= 0 and a[j] > key:',
    '    a[j + 1] = a[j]        // shift right',
    '    j = j - 1',
    '  a[j + 1] = key',
  ],
  { time: 'O(n\u00b2), O(n) if already sorted', space: 'O(1)' },
);

export const selectionSort = sortSpec(
  'selection-sort',
  'Selection Sort',
  [
    'for i from 0 to n - 2:',
    '  min = i',
    '  for j from i + 1 to n - 1:',
    '    if a[j] < a[min]:',
    '      min = j',
    '  swap a[i], a[min]         // a[i] is final',
  ],
  { time: 'O(n\u00b2) always', space: 'O(1)' },
);

export const mergeSort = sortSpec(
  'merge-sort',
  'Merge Sort',
  [
    'mergeSort(a, lo, hi):',
    '  if lo >= hi: return          // one value is sorted',
    '  mid = (lo + hi) / 2',
    '  mergeSort(a, lo, mid)',
    '  mergeSort(a, mid + 1, hi)',
    '  merge(a, lo, mid, hi):',
    '    repeatedly take the smaller head (ties: left)',
  ],
  { time: 'O(n log n) always', space: 'O(n) buffer' },
);

export const quickSort = sortSpec(
  'quick-sort',
  'Quick Sort',
  [
    'quickSort(a, lo, hi):',
    '  if lo >= hi: return',
    '  pivot = a[hi]',
    '  i = lo - 1',
    '  for j from lo to hi - 1:',
    '    if a[j] <= pivot:',
    '      i = i + 1; swap a[i], a[j]',
    '  swap a[i + 1], a[hi]        // pivot is final',
    '  quickSort(a, lo, i); quickSort(a, i + 2, hi)',
  ],
  { time: 'O(n log n) average, O(n\u00b2) worst (sorted or all-equal input)', space: 'O(log n) stack on average' },
);

export const heapSort = sortSpec(
  'heap-sort',
  'Heap Sort',
  [
    'for i from n/2 - 1 down to 0: siftDown(i, n)   // build max-heap',
    'for end from n - 1 down to 1:',
    '  swap a[0], a[end]            // max is final',
    '  siftDown(0, end)',
    'siftDown(i, size):',
    '  largest = largest of a[i], a[2i + 1], a[2i + 2] (within size)',
    '  if largest != i: swap a[i], a[largest]; continue at largest',
  ],
  { time: 'O(n log n) always', space: 'O(1)' },
);
