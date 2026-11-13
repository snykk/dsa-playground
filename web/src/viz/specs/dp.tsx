import { knapsackTrace, lcsTrace, parseKnapsack, parseLcs, type KnapsackInput, type LcsInput } from '../algorithms/dp';
import type { Role, VizSpec } from '../core/types';
import { Grid, type GridState } from '../renderers/Grid';

const LEGEND: Array<{ role: Role; label: string }> = [
  { role: 'active', label: 'cell being filled' },
  { role: 'compare', label: 'cells it depends on' },
  { role: 'done', label: 'traceback path' },
];

export const lcs: VizSpec<LcsInput, GridState> = {
  id: 'lcs',
  title: 'Longest Common Subsequence',
  inputKind: 'two-strings',
  inputLabel: 'Two strings',
  inputHelp: 'Two strings separated by "|", up to 12 characters each.',
  examples: [
    { label: 'Textbook', value: 'ABCBDAB | BDCABA' },
    { label: 'DNA', value: 'AGGTAB | GXTXAYB' },
    { label: 'Nothing shared', value: 'ABC | XYZ' },
  ],
  randomInput: () => {
    const pick = (n: number) => Array.from({ length: n }, () => 'ABCD'[Math.floor(Math.random() * 4)]).join('');
    return `${pick(6 + Math.floor(Math.random() * 3))} | ${pick(6 + Math.floor(Math.random() * 3))}`;
  },
  parse: (text) => parseLcs(text),
  trace: lcsTrace,
  render: (state) => <Grid state={state} />,
  pseudocode: [
    'dp[i][0] = 0 and dp[0][j] = 0             // empty prefix',
    'for i from 1 to m:',
    '  for j from 1 to n:',
    '    if a[i-1] == b[j-1]: dp[i][j] = dp[i-1][j-1] + 1',
    '    else: dp[i][j] = max(dp[i-1][j], dp[i][j-1])',
    'traceback from (m, n): equal characters go diagonally (part of the LCS)',
    '  otherwise step toward the larger neighbor',
  ],
  legend: LEGEND,
  complexity: { time: 'O(m \u00b7 n)', space: 'O(m \u00b7 n), or O(min(m, n)) for the length only' },
};

export const knapsack: VizSpec<KnapsackInput, GridState> = {
  id: 'knapsack',
  title: '0/1 Knapsack',
  inputKind: 'knapsack',
  inputLabel: 'Capacity; items as weight:value',
  inputHelp: 'Like "W=7; 1:1, 3:4, 4:5, 5:7". Capacity up to 15, up to 6 items.',
  examples: [
    { label: 'Classic', value: 'W=7; 1:1, 3:4, 4:5, 5:7' },
    { label: 'Greedy fails', value: 'W=10; 6:30, 5:20, 5:20' },
    { label: 'Nothing fits', value: 'W=3; 4:10, 5:12' },
  ],
  randomInput: () => {
    const n = 3 + Math.floor(Math.random() * 3);
    const items = Array.from({ length: n }, () => `${1 + Math.floor(Math.random() * 6)}:${1 + Math.floor(Math.random() * 20)}`);
    return `W=${6 + Math.floor(Math.random() * 6)}; ${items.join(', ')}`;
  },
  parse: (text) => parseKnapsack(text),
  trace: knapsackTrace,
  render: (state) => <Grid state={state} />,
  pseudocode: [
    'dp[0][w] = 0 for every capacity w',
    'for i from 1 to k:                       // item i: weight wi, value vi',
    '  for w from 0 to W:',
    '    dp[i][w] = dp[i-1][w]                // skip item i',
    '    if wi <= w: dp[i][w] = max(dp[i][w], vi + dp[i-1][w - wi])   // take it',
    'traceback: dp[i][w] != dp[i-1][w] means item i was taken; w -= wi',
  ],
  legend: LEGEND,
  complexity: { time: 'O(k \u00b7 W) (pseudo-polynomial)', space: 'O(k \u00b7 W), or O(W) for the value only' },
};
