/**
 * Spec for the Divide and Conquer Optimization: one layer of the DP at a time, solved by the
 * recursion, then the groups read back. Mirrors
 * Algorithms/Dynamic_Programming/DP_Optimizations/Divide_and_Conquer_Optimization/Python/divide_and_conquer_optimization.py
 * (see the header of the tracer).
 */
import { DNC_CODE, dncTrace, parseDnc, type DncInput } from '../algorithms/dncOptimization';
import type { VizSpec } from '../core/types';
import { DncLayerView, type DncState } from '../renderers/DncLayerView';

const rint = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));

function randomInput(): string {
  const n = rint(5, 10);
  const values = Array.from({ length: n }, () => rint(0, 9));
  return `k=${rint(2, Math.min(4, n))}; ${values.join(' ')}`;
}

export const dncOptimizationSpec: VizSpec<DncInput, DncState> = {
  id: 'dnc-optimization',
  title: 'Divide and Conquer Optimization',
  inputKind: 'dnc-partition',
  inputLabel: 'k; the values',
  inputHelp:
    'Like "k=3; 3 1 4 1 5 9 2 6": split the values into exactly k contiguous groups, minimizing the sum of (group sum)^2. ' +
    'Up to 12 values from -30 to 30, and k from 1 to 5 (at most the number of values). ' +
    'min_cost_partition raises ValueError for a negative value; the player runs it through partition_dp, which does not check, to show the wrong answer.',
  examples: [
    { label: 'Pi digits, three groups (article)', value: 'k=3; 3 1 4 1 5 9 2 6' },
    { label: 'Two groups', value: 'k=2; 3 1 4 1 5 9 2 6' },
    { label: 'Twelve values, four groups', value: 'k=4; 5 2 8 1 9 3 7 4 6 2 8 5' },
    { label: 'Equal values: ties', value: 'k=3; 1 1 1 1 1 1 1' },
    { label: 'A negative value: wrong answer', value: 'k=2; 1 2 4 -5' },
    { label: 'One group', value: 'k=1; 3 1 4 1 5 9 2 6' },
  ],
  randomInput,
  parse: parseDnc,
  trace: (input) => dncTrace(input).frames,
  render: (state) => <DncLayerView state={state} />,
  pseudocode: DNC_CODE,
  legend: [
    { role: 'active', label: 'the cell being solved, its range of j, and its best j so far' },
    { role: 'compare', label: 'the j being tried: dp[g-1][j], the group values[j:mid] and P[j], P[mid]' },
    { role: 'done', label: 'a solved cell, or a finished call of the recursion; at the end, the groups' },
    { role: 'idle', label: 'a call waiting its turn (dashed), with the j it will try' },
  ],
  complexity: { time: 'O(k n log n): at most m (log2(m) + 2) cost evaluations for a layer of m cells', space: 'O(k n): the best j of every cell' },
};
