import { timsort as traceTimsort, VIZ_MINRUN, type TimsortInput, type TimsortState } from '../algorithms/timsort';
import { InputError, parseIntList, randomInts, type VizSpec } from '../core/types';
import { TimsortBars } from '../renderers/TimsortBars';

const SAMPLE = '43, 37, 31, 24, 15, 9, 12, 40, 6, 28, 2, 5, 18, 20, 33, 35, 46, 44, 39, 30, 26, 21, 14, 3';
const GALLOP = '2, 3, 7, 10, 12, 14, 17, 22, 23, 57, 58, 5, 6, 26, 27, 33, 34, 35, 37, 45, 47, 49, 50, 54';

/** "minrun 8: 5, 3, 9" sets minrun; a plain list uses minrun 4 (CPython would use n below 64). */
export function parseTimsortInput(text: string): TimsortInput {
  const named = /^\s*minrun\s*=?\s*(-?\d+)\s*:([\s\S]*)$/i.exec(text);
  if (/^\s*[A-Za-z]/.test(text) && !named) {
    throw new InputError('Start with "minrun 8:" to choose minrun, or give just the list for minrun 4.');
  }
  let minrun = VIZ_MINRUN;
  let list = text;
  if (named) {
    minrun = Number(named[1]);
    if (minrun < 1 || minrun > 32) throw new InputError(`minrun must be between 1 and 32 (got ${named[1]}).`);
    list = named[2];
  }
  return { values: parseIntList(list, { min: 2, max: 24 }), minrun };
}

export const timsort: VizSpec<TimsortInput, TimsortState> = {
  id: 'timsort',
  title: 'Timsort',
  inputKind: 'timsort',
  inputLabel: 'Values to sort, optionally after a minrun',
  inputHelp: '2 to 24 whole numbers between -999 and 999. Start with "minrun 8:" to choose minrun (1 to 32); a plain list uses minrun 4.',
  examples: [
    { label: 'Runs, reversals and three merges', value: SAMPLE },
    { label: 'Galloping', value: GALLOP },
    { label: 'Sorted: n - 1 comparisons', value: '1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16' },
    { label: 'Reversed: n - 1 comparisons', value: '16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1' },
    { label: 'Duplicates stay in order', value: '5, 3, 5, 1, 3, 5, 1, 3, 2, 4, 2, 4' },
    { label: 'minrun 1: natural runs only', value: 'minrun 1: 9, 8, 7, 1, 2, 3, 6, 5, 4, 0, 10, 11' },
  ],
  randomInput: () => randomInts(12 + Math.floor(Math.random() * 7), 1, 99).join(', '),
  parse: parseTimsortInput,
  trace: traceTimsort,
  render: (state) => <TimsortBars state={state} />,
  pseudocode: [
    'minrun = computeMinrun(n)           // or the minrun given',
    'for each run, left to right:',
    '  run = countRun(a, lo)             // ascending, or strictly descending',
    '  if descending: reverse the run',
    '  if run < minrun: binary insertion up to min(minrun, n - lo)',
    '  push the run; mergeCollapse()',
    'mergeCollapse: if A <= B + C or W <= A + B: merge B with the smaller of A, C',
    '               elif B <= C: merge B and C; else stop',
    'mergeAt: trim A with gallopRight(B[0]), B with gallopLeft(A[-1])',
    '  copy the smaller run; mergeLo (left to right) or mergeHi (right to left)',
    '  after minGallop wins in a row: gallop and move whole blocks',
    'at the end: merge what is left on the stack, top first',
  ],
  legend: [
    { role: 'compare', label: 'being compared' },
    { role: 'active', label: 'just placed, or the run being reversed or inserted into' },
    { role: 'idle', label: 'waiting; a bracket under the bars marks each run' },
    { role: 'done', label: 'sorted' },
  ],
  complexity: {
    time: 'O(n log n) worst; O(n) on sorted or strictly descending input (n - 1 comparisons)',
    space: 'O(n) for the temporary copy',
  },
};
