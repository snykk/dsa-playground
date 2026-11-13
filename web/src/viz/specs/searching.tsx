import {
  binarySearch as binaryTrace,
  interpolationSearch as interpolationTrace,
  linearSearch as linearTrace,
  parseSearch,
  randomSearchInput,
  ternarySearch as ternaryTrace,
  type SearchInput,
} from '../algorithms/searching';
import type { Role, VizSpec } from '../core/types';
import { SearchBars, type SearchState } from '../renderers/SearchBars';

const render = (state: SearchState) => <SearchBars state={state} />;

const SORTED_HELP = 'Up to 32 whole numbers between -999 and 999 in ascending order (duplicates are fine), then "; target X".';

const CLASSIC = '2, 5, 8, 12, 16, 23, 38, 56, 72, 91';

const RANGE_LEGEND: Array<{ role: Role; label: string }> = [
  { role: 'idle', label: 'still in the search range [lo..hi]' },
  { role: 'muted', label: 'ruled out' },
  { role: 'good', label: 'found' },
];

export const linearSearch: VizSpec<SearchInput, SearchState> = {
  id: 'linear-search',
  title: 'Linear Search',
  inputKind: 'search-any-order',
  inputLabel: 'Values and target',
  inputHelp: 'Up to 32 whole numbers between -999 and 999 in any order, then "; target X".',
  examples: [
    { label: 'Found', value: '38, 27, 43, 3, 9, 82, 10, 55, 19, 64; target 82' },
    { label: 'Missing (worst case)', value: '38, 27, 43, 3, 9, 82, 10, 55, 19, 64; target 50' },
    { label: 'Duplicates', value: '4, 7, 1, 7, 9, 7, 2; target 7' },
    { label: 'First value (best case)', value: '12, 5, 8, 3; target 12' },
  ],
  randomInput: () => randomSearchInput('linear'),
  parse: (text) => parseSearch(text, { sorted: false }),
  trace: linearTrace,
  render,
  pseudocode: ['for i from 0 to n - 1:', '  if a[i] == target:', '    return i              // the first match wins', 'return -1                 // compared all n values'],
  legend: [
    { role: 'compare', label: 'being compared' },
    { role: 'idle', label: 'not compared yet' },
    { role: 'muted', label: 'ruled out' },
    { role: 'good', label: 'match' },
  ],
  complexity: { time: 'O(n); (n + 1) / 2 comparisons on average when present', space: 'O(1)' },
};

export const binarySearch: VizSpec<SearchInput, SearchState> = {
  id: 'binary-search',
  title: 'Binary Search',
  inputKind: 'search-sorted',
  inputLabel: 'Sorted values and target',
  inputHelp: SORTED_HELP,
  examples: [
    { label: 'README example', value: '1, 2, 3, 4, 5, 6, 7, 8, 9, 10; target 7' },
    { label: 'Classic', value: `${CLASSIC}; target 23` },
    { label: 'Missing', value: `${CLASSIC}; target 40` },
    { label: 'Duplicates', value: '1, 2, 2, 2, 2, 3, 4; target 2' },
    { label: '31 values', value: `${Array.from({ length: 31 }, (_, i) => 2 * i + 1).join(', ')}; target 37` },
  ],
  randomInput: () => randomSearchInput('sorted'),
  parse: (text) => parseSearch(text, { sorted: true }),
  trace: binaryTrace,
  render,
  pseudocode: [
    'lo = 0; hi = n - 1',
    'while lo <= hi:',
    '  mid = lo + floor((hi - lo) / 2)',
    '  if a[mid] == target: return mid',
    '  elif a[mid] < target: lo = mid + 1     // drop the left half',
    '  else: hi = mid - 1                     // drop the right half',
    'return -1                                // lo > hi: nothing left',
  ],
  legend: [{ role: 'compare', label: 'mid: the probe' }, ...RANGE_LEGEND],
  complexity: { time: 'O(log n): at most floor(log2 n) + 1 probes', space: 'O(1)' },
};

export const ternarySearch: VizSpec<SearchInput, SearchState> = {
  id: 'ternary-search',
  title: 'Ternary Search',
  inputKind: 'search-sorted',
  inputLabel: 'Sorted values and target',
  inputHelp: SORTED_HELP,
  examples: [
    { label: 'README example', value: '1, 2, 3, 4, 5, 6, 7, 8, 9, 10; target 5' },
    { label: 'Classic', value: `${CLASSIC}; target 23` },
    { label: 'Missing', value: `${CLASSIC}; target 40` },
    { label: 'Duplicates', value: '1, 3, 3, 3, 3, 3, 8; target 3' },
    { label: '27 values', value: `${Array.from({ length: 27 }, (_, i) => 3 * (i + 1)).join(', ')}; target 51` },
  ],
  randomInput: () => randomSearchInput('sorted'),
  parse: (text) => parseSearch(text, { sorted: true }),
  trace: ternaryTrace,
  render,
  pseudocode: [
    'lo = 0; hi = n - 1',
    'while lo <= hi:',
    '  m1 = lo + floor((hi - lo) / 3); m2 = hi - floor((hi - lo) / 3)',
    '  if a[m1] == target: return m1',
    '  if a[m2] == target: return m2',
    '  if target < a[m1]: hi = m1 - 1             // left third',
    '  elif target > a[m2]: lo = m2 + 1           // right third',
    '  else: lo = m1 + 1; hi = m2 - 1             // middle third',
    'return -1',
  ],
  legend: [{ role: 'compare', label: 'm1, m2: the probes' }, ...RANGE_LEGEND],
  complexity: { time: 'O(log n), but about 1.26 log2 n probes: more than binary search', space: 'O(1)' },
};

export const interpolationSearch: VizSpec<SearchInput, SearchState> = {
  id: 'interpolation-search',
  title: 'Interpolation Search',
  inputKind: 'search-sorted',
  inputLabel: 'Sorted values and target',
  inputHelp: SORTED_HELP,
  examples: [
    { label: 'Evenly spread', value: '10, 20, 30, 40, 50, 60, 70, 80, 90, 100; target 70' },
    { label: 'Nearly even', value: '3, 9, 14, 21, 26, 33, 38, 45, 51, 57, 62, 70, 75, 81, 88, 94; target 62' },
    { label: 'Doubling (slow)', value: '1, 2, 4, 8, 16, 32, 64, 128, 256, 512; target 128' },
    { label: 'Missing', value: '10, 20, 30, 40, 50, 60, 70, 80, 90, 100; target 55' },
    { label: 'All equal (was a crash)', value: '7, 7, 7, 7, 7; target 7' },
  ],
  randomInput: () => randomSearchInput('interpolation'),
  parse: (text) => parseSearch(text, { sorted: true }),
  trace: interpolationTrace,
  render,
  pseudocode: [
    'lo = 0; hi = n - 1',
    'while lo <= hi and a[lo] <= target <= a[hi]:',
    '  if lo == hi or a[lo] == a[hi]:        // nothing to interpolate',
    '    return lo if a[lo] == target else -1',
    '  pos = lo + floor((target - a[lo]) * (hi - lo) / (a[hi] - a[lo]))',
    '  if a[pos] == target: return pos',
    '  if a[pos] > target: hi = pos - 1',
    '  else: lo = pos + 1',
    'return -1',
  ],
  legend: [{ role: 'active', label: 'line from a[lo] to a[hi]' }, { role: 'compare', label: 'pos: the probe' }, ...RANGE_LEGEND],
  complexity: { time: 'O(log log n) on evenly spread values, O(n) worst case', space: 'O(1)' },
};
