import {
  differenceArrayTrace,
  kDistinctTrace,
  nextGreaterTrace,
  parseKDistinct,
  parseRangeQueries,
  parseRangeUpdates,
  parseShip,
  parseTwoPointers,
  parseValues,
  parseWindow,
  prefixSumTrace,
  shipCapacityTrace,
  twoPointersTrace,
  windowMaxTrace,
  type KDistinctInput,
  type RangeQueryInput,
  type RangeUpdateInput,
  type ShipInput,
  type TwoPointersInput,
  type WindowInput,
} from '../algorithms/patterns';
import { randomInts, type Role, type VizSpec } from '../core/types';
import { ArrayScene, type ArraySceneState } from '../renderers/ArrayScene';

const render = (state: ArraySceneState) => <ArrayScene state={state} />;
const pick = (n: number) => Math.floor(Math.random() * n);
const sorted = (values: number[]) => [...values].sort((a, b) => a - b);

export const twoPointers: VizSpec<TwoPointersInput, ArraySceneState> = {
  id: 'two-pointers',
  title: 'Two Pointers',
  inputKind: 'two-pointers',
  inputLabel: 'Values and target',
  inputHelp: '2 to 16 whole numbers between -99 and 99 (sorted for you if needed), then "; target X".',
  examples: [
    { label: 'Classic', value: '2, 7, 11, 15; target 9' },
    { label: 'Pair in the middle', value: '1, 3, 4, 6, 8, 10, 13; target 14' },
    { label: 'No pair', value: '1, 2, 4, 8, 16; target 7' },
    { label: 'Duplicates and negatives', value: '-5, -1, 0, 3, 3, 9; target 6' },
    { label: 'Two values (edge case)', value: '4, 5; target 9' },
  ],
  randomInput: () => {
    const values = sorted(randomInts(6 + pick(5), -20, 40));
    const target = Math.random() < 0.7 ? values[pick(values.length - 1)] + values[values.length - 1 - pick(3)] : randomInts(1, -10, 60)[0];
    return `${values.join(', ')}; target ${target}`;
  },
  parse: parseTwoPointers,
  trace: twoPointersTrace,
  render,
  pseudocode: [
    'L = 0; R = n - 1                 // a is sorted',
    'while L < R:                     // invariant: a pair, if any, lies in [L, R]',
    '  s = a[L] + a[R]',
    '  if s == target: return (L, R)',
    '  elif s < target: L += 1        // a[L] is too small for every partner',
    '  else: R -= 1                   // a[R] is too big for every partner',
    'return None',
  ],
  legend: [
    { role: 'compare', label: 'a[L] and a[R] being added' },
    { role: 'active', label: 'pointer that just moved' },
    { role: 'muted', label: 'ruled out for good' },
    { role: 'done', label: 'the pair' },
  ],
  complexity: { time: 'O(n) after sorting: each step rules out one value', space: 'O(1)' },
};

export const slidingWindow: VizSpec<KDistinctInput, ArraySceneState> = {
  id: 'sliding-window',
  title: 'Sliding Window',
  inputKind: 'k-distinct',
  inputLabel: 'Text and k',
  inputHelp: 'Up to 24 letters or digits without spaces, then "; k N" (1 to 10): the most distinct characters a window may hold.',
  examples: [
    { label: 'Classic', value: 'eceba; k 2' },
    { label: 'Shrinks a lot', value: 'abaccc; k 2' },
    { label: 'Everything fits', value: 'abc; k 5' },
    { label: 'One distinct (edge case)', value: 'aabbbcc; k 1' },
    { label: 'Longer text', value: 'abcabcbbacdd; k 3' },
  ],
  randomInput: () => {
    const alpha = ['ab', 'abc', 'abcd'][pick(3)];
    const s = Array.from({ length: 8 + pick(9) }, () => alpha[pick(alpha.length)]).join('');
    return `${s}; k ${1 + pick(3)}`;
  },
  parse: parseKDistinct,
  trace: kDistinctTrace,
  render,
  pseudocode: [
    'left = 0; best = 0; count = {}',
    'for right in 0 .. n - 1:         // expand',
    '  count[s[right]] += 1',
    '  while distinct(count) > k:     // the window is invalid',
    '    count[s[left]] -= 1; left += 1   // shrink',
    '  best = max(best, right - left + 1)  // the window is valid again',
    'return best',
  ],
  legend: [
    { role: 'compare', label: 'inside the window' },
    { role: 'active', label: 'entering or leaving' },
    { role: 'muted', label: 'left behind' },
    { role: 'done', label: 'best window so far' },
  ],
  complexity: { time: 'O(n): left and right each move at most n times', space: 'O(k) for the counts' },
};

export const prefixSum: VizSpec<RangeQueryInput, ArraySceneState> = {
  id: 'prefix-sum',
  title: 'Prefix Sum',
  inputKind: 'range-queries',
  inputLabel: 'Values and range queries',
  inputHelp: '1 to 16 whole numbers between -99 and 99, then "; queries l-r, l-r" (up to 6 inclusive index ranges).',
  examples: [
    { label: 'Classic', value: '3, 1, 4, 1, 5; queries 1-3, 0-4' },
    { label: 'Negatives', value: '5, -2, 7, -4, 1, 3; queries 0-2, 2-4, 3-5' },
    { label: 'Single cell', value: '2, 9, 4; queries 1-1, 0-0' },
    { label: 'Whole array and a prefix', value: '1, 2, 3, 4, 5, 6, 7, 8; queries 0-7, 0-3, 4-7' },
  ],
  randomInput: () => {
    const values = randomInts(6 + pick(5), -9, 20);
    const qs = Array.from({ length: 3 }, () => {
      const l = pick(values.length);
      return `${l}-${l + pick(values.length - l)}`;
    });
    return `${values.join(', ')}; queries ${qs.join(', ')}`;
  },
  parse: parseRangeQueries,
  trace: prefixSumTrace,
  render,
  pseudocode: [
    'P[0] = 0                          // the empty prefix',
    'for i in 0 .. n - 1: P[i + 1] = P[i] + a[i]',
    'query(l, r):                      // sum of a[l..r]',
    '  return P[r + 1] - P[l]',
  ],
  legend: [
    { role: 'active', label: 'being written or looked up' },
    { role: 'compare', label: 'the queried range' },
    { role: 'done', label: 'answered' },
    { role: 'muted', label: 'outside the range' },
  ],
  complexity: { time: 'O(n) to build, O(1) per query', space: 'O(n)' },
};

export const differenceArray: VizSpec<RangeUpdateInput, ArraySceneState> = {
  id: 'difference-array',
  title: 'Difference Array',
  inputKind: 'range-updates',
  inputLabel: 'Values and range updates',
  inputHelp: '1 to 16 whole numbers between -99 and 99, then "; add l-r +v, l-r -v" (up to 6 updates, amounts -50..50).',
  examples: [
    { label: 'Classic', value: '0, 0, 0, 0, 0; add 0-2 +5, 1-3 +3' },
    { label: 'Update to the end', value: '1, 2, 3, 4; add 1-3 +10' },
    { label: 'Subtract', value: '10, 10, 10, 10, 10, 10; add 0-5 -2, 2-3 -5' },
    { label: 'Single cell', value: '4, 4, 4; add 1-1 +7' },
  ],
  randomInput: () => {
    const values = randomInts(6 + pick(5), 0, 9);
    const ups = Array.from({ length: 3 }, () => {
      const l = pick(values.length);
      const v = 1 + pick(9);
      return `${l}-${l + pick(values.length - l)} ${Math.random() < 0.3 ? '-' : '+'}${v}`;
    });
    return `${values.join(', ')}; add ${ups.join(', ')}`;
  },
  parse: parseRangeUpdates,
  trace: differenceArrayTrace,
  render,
  pseudocode: [
    'D = [0] * (n + 1)                 // one spare slot',
    'for each update (l, r, v):',
    '  D[l] += v                       // the change starts at l',
    '  D[r + 1] -= v                   // and is cancelled after r',
    'cur = 0; for i in 0 .. n - 1:     // one sweep applies everything',
    '  cur += D[i]; a[i] += cur',
  ],
  legend: [
    { role: 'active', label: 'cell being written or swept' },
    { role: 'compare', label: 'the updated range' },
    { role: 'done', label: 'final value' },
  ],
  complexity: { time: 'O(1) per update, O(n) to apply them all', space: 'O(n)' },
};

export const monotonicStack: VizSpec<number[], ArraySceneState> = {
  id: 'monotonic-stack',
  title: 'Monotonic Stack',
  inputKind: 'pattern-values',
  inputLabel: 'Values',
  inputHelp: '1 to 16 whole numbers between -99 and 99. The answer for each is the first strictly bigger value to its right.',
  examples: [
    { label: 'Classic', value: '2, 1, 2, 4, 3' },
    { label: 'Daily temperatures', value: '73, 74, 75, 71, 69, 72, 76, 73' },
    { label: 'Decreasing (nothing pops)', value: '9, 7, 5, 3, 1' },
    { label: 'Duplicates', value: '3, 3, 3, 5' },
    { label: 'Single value (edge case)', value: '7' },
  ],
  randomInput: () => randomInts(8 + pick(5), 1, 20).join(', '),
  parse: parseValues,
  trace: nextGreaterTrace,
  render,
  pseudocode: [
    'stack = []                        // indices; values never increase upward',
    'for i in 0 .. n - 1:',
    '  while stack and a[stack.top] < a[i]:',
    '    answer[stack.pop()] = a[i]    // a[i] is the first bigger value to the right',
    '  stack.push(i)',
    'indices left on the stack keep answer -1',
  ],
  legend: [
    { role: 'active', label: 'index arriving' },
    { role: 'compare', label: 'waiting on the stack' },
    { role: 'done', label: 'answered' },
  ],
  complexity: { time: 'O(n): every index is pushed and popped at most once', space: 'O(n)' },
};

export const monotonicQueue: VizSpec<WindowInput, ArraySceneState> = {
  id: 'monotonic-queue',
  title: 'Monotonic Queue',
  inputKind: 'window-max',
  inputLabel: 'Values and window size',
  inputHelp: '1 to 16 whole numbers between -99 and 99, then "; k N" with N from 1 up to the number of values.',
  examples: [
    { label: 'Classic', value: '1, 3, -1, -3, 5, 3, 6, 7; k 3' },
    { label: 'Duplicates trap', value: '5, 5, 1, 1, 4; k 2' },
    { label: 'Increasing (back pops)', value: '1, 2, 3, 4, 5, 6; k 3' },
    { label: 'Decreasing (front expires)', value: '9, 8, 7, 6, 5, 4; k 3' },
    { label: 'k = 1 (edge case)', value: '4, 2, 9; k 1' },
  ],
  randomInput: () => {
    const values = randomInts(8 + pick(5), -5, 20);
    return `${values.join(', ')}; k ${2 + pick(3)}`;
  },
  parse: parseWindow,
  trace: windowMaxTrace,
  render,
  pseudocode: [
    'dq = []                           // indices; values strictly decrease front to back',
    'for i in 0 .. n - 1:',
    '  while dq and dq[0] <= i - k: dq.popleft()      // left the window',
    '  while dq and a[dq[-1]] <= a[i]: dq.pop()       // can never be the maximum',
    '  dq.append(i)',
    '  if i >= k - 1: result.append(a[dq[0]])         // the front is the maximum',
  ],
  legend: [
    { role: 'active', label: 'index entering' },
    { role: 'compare', label: 'in the deque' },
    { role: 'done', label: 'front: the window maximum' },
    { role: 'muted', label: 'outside the window' },
  ],
  complexity: { time: 'O(n): every index enters and leaves the deque once', space: 'O(k)' },
};

export const binarySearchOnAnswer: VizSpec<ShipInput, ArraySceneState> = {
  id: 'binary-search-on-answer',
  title: 'Binary Search on Answer',
  inputKind: 'ship-capacity',
  inputLabel: 'Package weights and days',
  inputHelp: '1 to 12 weights between 1 and 50, then "; days D" (0 to 20): the least ship capacity that moves every package, in order, within D days.',
  examples: [
    { label: 'Classic', value: '1, 2, 3, 4, 5, 6, 7, 8, 9, 10; days 5' },
    { label: 'One day', value: '3, 2, 2, 4, 1, 4; days 1' },
    { label: 'Many days', value: '3, 2, 2, 4, 1, 4; days 3' },
    { label: 'Days = packages (edge case)', value: '5, 9, 2; days 3' },
    { label: 'No capacity works', value: '4, 6; days 0' },
  ],
  randomInput: () => `${randomInts(6 + pick(6), 1, 30).join(', ')}; days ${2 + pick(4)}`,
  parse: parseShip,
  trace: shipCapacityTrace,
  render,
  pseudocode: [
    'lo = max(w); hi = sum(w); answer = -1',
    'while lo <= hi:                   // yes/no line: no no no yes yes yes',
    '  mid = lo + (hi - lo) // 2',
    '  if can_ship(mid): answer = mid; hi = mid - 1   // look for a smaller one',
    '  else: lo = mid + 1',
    'return answer',
    'can_ship(c): days = 1; load = 0',
    '  for each weight x: if load + x > c: days += 1; load = x',
    '    else: load += x',
    '  return days <= D',
  ],
  legend: [
    { role: 'active', label: 'capacity being tried' },
    { role: 'bad', label: 'too small' },
    { role: 'good', label: 'works' },
    { role: 'done', label: 'the least working capacity' },
  ] as Array<{ role: Role; label: string }>,
  complexity: { time: 'O(n log(sum(w))): log(range) probes, each an O(n) check', space: 'O(1)' },
};
