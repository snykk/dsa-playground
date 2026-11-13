import {
  editDistanceTrace,
  matrixChainTrace,
  parseEditDistance,
  parseMatrixChain,
  type EditInput,
} from '../algorithms/dpGrid';
import type { Role, VizSpec } from '../core/types';
import { Grid, type GridState } from '../renderers/Grid';

const pick = (n: number) => Math.floor(Math.random() * n);

const GRID_LEGEND: Array<{ role: Role; label: string }> = [
  { role: 'active', label: 'cell being filled' },
  { role: 'compare', label: 'cells it depends on' },
  { role: 'done', label: 'traceback path / final' },
];

export const editDistance: VizSpec<EditInput, GridState> = {
  id: 'edit-distance',
  title: 'Edit Distance',
  inputKind: 'edit-words',
  inputLabel: 'Two words',
  inputHelp: 'Two words separated by "|", up to 10 characters each (either may be empty).',
  examples: [
    { label: 'Textbook', value: 'kitten | sitting' },
    { label: 'Identical', value: 'banana | banana' },
    { label: 'Nothing shared', value: 'abc | xyz' },
    { label: 'Empty side', value: ' | abc' },
  ],
  randomInput: () => {
    const word = (n: number) => Array.from({ length: n }, () => 'abcd'[pick(4)]).join('');
    return `${word(4 + pick(4))} | ${word(4 + pick(4))}`;
  },
  parse: (text) => parseEditDistance(text),
  trace: editDistanceTrace,
  render: (state) => <Grid state={state} />,
  pseudocode: [
    'dp[i][0] = i and dp[0][j] = j        // delete all / insert all',
    'for i from 1 to m:',
    '  for j from 1 to n:',
    '    if a[i-1] == b[j-1]: dp[i][j] = dp[i-1][j-1]',
    '    else: dp[i][j] = 1 + min(dp[i-1][j-1], dp[i-1][j], dp[i][j-1])   // replace, delete, insert',
    'answer = dp[m][n]',
    'traceback from (m, n): diagonal = keep or replace, up = delete, left = insert',
  ],
  legend: [...GRID_LEGEND, { role: 'good', label: 'letters match' }],
  complexity: { time: 'O(m * n)', space: 'O(m * n), or O(min(m, n)) for the distance only' },
};

export const matrixChain: VizSpec<number[], GridState> = {
  id: 'matrix-chain',
  title: 'Matrix Chain Multiplication',
  inputKind: 'matrix-chain',
  inputLabel: 'Dimensions p0, p1, ..., pn',
  inputHelp: 'Matrix i is p(i-1) x p(i). Between 2 and 9 numbers (1 to 8 matrices), each 1..99.',
  examples: [
    { label: 'CLRS', value: '30, 35, 15, 5, 10, 20, 25' },
    { label: 'Three matrices', value: '10, 30, 5, 60' },
    { label: 'Single matrix', value: '4, 7' },
    { label: 'Uniform', value: '5, 5, 5, 5, 5' },
  ],
  randomInput: () => Array.from({ length: 4 + pick(4) }, () => 2 + pick(40)).join(', '),
  parse: parseMatrixChain,
  trace: matrixChainTrace,
  render: (state) => <Grid state={state} />,
  pseudocode: [
    'dp[i][i] = 0                         // one matrix costs nothing',
    'for len from 2 to n:                 // chain length',
    '  for i from 1 to n-len+1:  j = i+len-1',
    '    dp[i][j] = inf',
    '    for k from i to j-1:             // split after A_k',
    '      dp[i][j] = min(dp[i][j], dp[i][k] + dp[k+1][j] + p[i-1]*p[k]*p[j])',
    'answer = dp[1][n]; the remembered splits give the order',
  ],
  legend: GRID_LEGEND,
  complexity: { time: 'O(n^3)', space: 'O(n^2)' },
};
