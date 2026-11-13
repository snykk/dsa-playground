import {
  coinChangeTrace,
  fibonacciTrace,
  kadaneTrace,
  lisTailsTrace,
  lisTrace,
  parseCoinChange,
  parseFibonacci,
  parseKadane,
  parseSequence,
  parseStairs,
  stairsTrace,
  type CoinInput,
  type StairsInput,
} from '../algorithms/dpLinear';
import { randomInts, type Role, type VizSpec } from '../core/types';
import { ArrayScene, type ArraySceneState } from '../renderers/ArrayScene';

const render = (state: ArraySceneState) => <ArrayScene state={state} />;
const pick = (n: number) => Math.floor(Math.random() * n);

export const fibonacci: VizSpec<number, ArraySceneState> = {
  id: 'fibonacci',
  title: 'Fibonacci Numbers',
  inputKind: 'fibonacci-n',
  inputLabel: 'n',
  inputHelp: 'A whole number from 0 to 20.',
  examples: [
    { label: 'F(10)', value: '10' },
    { label: 'Base case', value: '0' },
    { label: 'One addition', value: '2' },
    { label: 'Largest', value: '20' },
  ],
  randomInput: () => String(2 + pick(15)),
  parse: parseFibonacci,
  trace: fibonacciTrace,
  render,
  pseudocode: [
    'create a table dp[0..n]',
    'dp[0] = 0; dp[1] = 1                 // base cases',
    'for i from 2 to n:',
    '  dp[i] = dp[i-1] + dp[i-2]          // reuse, never recompute',
    'return dp[n]',
  ],
  legend: [
    { role: 'active', label: 'entry being filled' },
    { role: 'compare', label: 'the two entries it adds' },
    { role: 'done', label: 'filled (final)' },
  ],
  complexity: { time: 'O(n)', space: 'O(n) for the table, O(1) with two variables' },
};

export const climbingStairs: VizSpec<StairsInput, ArraySceneState> = {
  id: 'climbing-stairs',
  title: 'Climbing Stairs',
  inputKind: 'stairs',
  inputLabel: 'Stairs n | allowed steps',
  inputHelp: 'Like "7 | 1, 2": n up to 20, then up to 4 step sizes (1..6). Steps default to 1, 2.',
  examples: [
    { label: '1 or 2 steps', value: '7 | 1, 2' },
    { label: '1, 2 or 3 steps', value: '8 | 1, 2, 3' },
    { label: 'Zero stairs', value: '0 | 1, 2' },
    { label: 'Only even hops', value: '9 | 2, 4' },
  ],
  randomInput: () => {
    const steps = [1, 2, 3, 4].slice(0, 2 + pick(3));
    return `${3 + pick(10)} | ${steps.join(', ')}`;
  },
  parse: parseStairs,
  trace: stairsTrace,
  render,
  pseudocode: [
    'ways[0] = 1                           // one way to stand on the ground',
    'for i from 1 to n:',
    '  for each allowed step s with s <= i:',
    '    ways[i] += ways[i - s]            // the last hop was s',
    'return ways[n]',
  ],
  legend: [
    { role: 'active', label: 'stair being counted' },
    { role: 'compare', label: 'stairs a last hop can start from' },
    { role: 'done', label: 'counted (final)' },
  ],
  complexity: { time: 'O(n * k) for k step sizes', space: 'O(n)' },
};

export const coinChange: VizSpec<CoinInput, ArraySceneState> = {
  id: 'coin-change',
  title: 'Coin Change (minimum coins)',
  inputKind: 'coin-change',
  inputLabel: 'Amount | coins',
  inputHelp: 'Like "11 | 1, 2, 5": amount up to 30, up to 5 distinct coin values (1..30).',
  examples: [
    { label: 'Classic', value: '11 | 1, 2, 5' },
    { label: 'Greedy fails', value: '6 | 1, 3, 4' },
    { label: 'Impossible', value: '7 | 2, 4' },
    { label: 'Amount zero', value: '0 | 1, 2' },
  ],
  randomInput: () => {
    const coins = Array.from(new Set(randomInts(2 + pick(3), 1, 9))).sort((a, b) => a - b);
    return `${5 + pick(20)} | ${coins.join(', ')}`;
  },
  parse: parseCoinChange,
  trace: coinChangeTrace,
  render,
  pseudocode: [
    'dp[0] = 0; dp[a] = inf for a > 0',
    'for a from 1 to amount:',
    '  for each coin c with c <= a:',
    '    dp[a] = min(dp[a], dp[a - c] + 1)',
    'answer = dp[amount]  (or -1 if it is inf)',
    'walk back: coin c was used when dp[a - c] + 1 == dp[a]',
  ],
  legend: [
    { role: 'active', label: 'amount being solved' },
    { role: 'compare', label: 'smaller amount plus one coin' },
    { role: 'muted', label: 'unreachable (inf)' },
    { role: 'done', label: 'final answer / coins used' },
  ],
  complexity: { time: 'O(amount * coins)', space: 'O(amount)' },
};

const LIS_LEGEND: Array<{ role: Role; label: string }> = [
  { role: 'active', label: 'element being placed' },
  { role: 'compare', label: 'earlier element / tail probed' },
  { role: 'muted', label: 'already handled / out of search range' },
  { role: 'done', label: 'part of the answer' },
];

const SEQ_EXAMPLES = [
  { label: 'Textbook', value: '10, 9, 2, 5, 3, 7, 101, 18' },
  { label: 'Duplicates', value: '3, 3, 3, 3' },
  { label: 'Already sorted', value: '1, 2, 3, 4, 5, 6' },
  { label: 'Descending', value: '9, 7, 5, 3, 1' },
  { label: 'Negatives', value: '-2, -5, 0, -1, 3, -4, 6' },
];
const seqRandom = () => randomInts(7 + pick(4), -20, 30).join(', ');

export const lis: VizSpec<number[], ArraySceneState> = {
  id: 'lis',
  title: 'Longest Increasing Subsequence (O(n^2) table)',
  inputKind: 'int-sequence',
  inputLabel: 'Numbers',
  inputHelp: 'Up to 14 whole numbers between -999 and 999, separated by commas or spaces.',
  examples: SEQ_EXAMPLES,
  randomInput: seqRandom,
  parse: parseSequence,
  trace: lisTrace,
  render,
  pseudocode: [
    'length[i] = 1, prev[i] = none for every i',
    'for i from 1 to n-1:',
    '  for j from 0 to i-1:',
    '    if arr[j] < arr[i] and length[j] + 1 > length[i]:',
    '      length[i] = length[j] + 1; prev[i] = j',
    'end = index of the largest length',
    'follow prev from end back to the start',
  ],
  legend: LIS_LEGEND,
  complexity: { time: 'O(n^2)', space: 'O(n)' },
};

export const lisTails: VizSpec<number[], ArraySceneState> = {
  id: 'lis-tails',
  title: 'Longest Increasing Subsequence (O(n log n) tails)',
  inputKind: 'int-sequence',
  inputLabel: 'Numbers',
  inputHelp: 'Up to 14 whole numbers between -999 and 999, separated by commas or spaces.',
  examples: SEQ_EXAMPLES,
  randomInput: seqRandom,
  parse: parseSequence,
  trace: lisTailsTrace,
  render,
  pseudocode: [
    'tails = []                           // tails[k] = smallest last value of a run of length k+1',
    'for each x in arr:',
    '  lo = 0; hi = len(tails)',
    '  binary search: first pos with tails[pos] >= x',
    '  if pos == len(tails): append x     // a longer run exists',
    '  else: tails[pos] = x               // a smaller tail for the same length',
  ],
  legend: LIS_LEGEND,
  complexity: { time: 'O(n log n)', space: 'O(n)' },
};

export const kadane: VizSpec<number[], ArraySceneState> = {
  id: 'kadane',
  title: "Maximum Subarray (Kadane's Algorithm)",
  inputKind: 'kadane',
  inputLabel: 'Numbers',
  inputHelp: 'Up to 16 whole numbers between -99 and 99, separated by commas or spaces.',
  examples: [
    { label: 'Textbook', value: '-2, 1, -3, 4, -1, 2, 1, -5, 4' },
    { label: 'All negative', value: '-8, -3, -6, -2, -5' },
    { label: 'All positive', value: '3, 1, 4, 1, 5' },
    { label: 'Single element', value: '7' },
  ],
  randomInput: () => randomInts(8 + pick(6), -9, 9).join(', '),
  parse: parseKadane,
  trace: kadaneTrace,
  render,
  pseudocode: [
    'cur = best = arr[0]',
    'for i from 1 to n-1:',
    '  if cur < 0:                         // the old run only hurts',
    '    cur = arr[i]; run starts at i',
    '  else: cur = cur + arr[i]            // keep extending',
    '  if cur > best: best = cur; remember the window',
    'return best and its window [start, end]',
  ],
  legend: [
    { role: 'active', label: 'current run' },
    { role: 'done', label: 'best window so far' },
    { role: 'muted', label: 'left behind' },
  ],
  complexity: { time: 'O(n)', space: 'O(1)' },
};
