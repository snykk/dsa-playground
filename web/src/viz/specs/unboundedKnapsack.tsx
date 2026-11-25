/**
 * Specs for the Unbounded Knapsack: the one-row table with w going up (each item reusable) and
 * the same loop going down (each item at most once). Both mirror
 * Algorithms/Dynamic_Programming/Linear_DP/Unbounded_Knapsack/Python/unbounded_knapsack.py
 * (see the header of the tracer).
 */
import {
  DOWNWARD_CODE,
  parseUnboundedKnapsack,
  UNBOUNDED_CODE,
  unboundedKnapsackTrace,
  type UnboundedKnapsackInput,
} from '../algorithms/unboundedKnapsack';
import type { VizSpec } from '../core/types';
import { stabilizeLanes, type PatternLanesState } from '../renderers/PatternLanes';
import { UnboundedKnapsackView } from '../renderers/UnboundedKnapsackView';

const rint = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));

const EXAMPLES = [
  { label: 'Reuse pays', value: 'W=10; 1:1, 3:4, 4:5, 5:7' },
  { label: 'Reuse does not help', value: 'W=7; 1:1, 3:4, 4:5, 5:7' },
  { label: 'One item', value: 'W=4; 2:3' },
  { label: 'A tie', value: 'W=4; 2:3, 4:6' },
  { label: 'Duplicates', value: 'W=9; 3:4, 3:4' },
  { label: 'Nothing fits', value: 'W=3; 4:10, 5:12' },
];

const randomInput = () => `W=${rint(5, 10)}; ${Array.from({ length: rint(2, 4) }, () => `${rint(1, 6)}:${rint(1, 20)}`).join(', ')}`;

const INPUT = {
  inputKind: 'unbounded-knapsack',
  inputLabel: 'Capacity; items as weight:value',
  inputHelp: 'Like "W=10; 1:1, 3:4, 4:5, 5:7": capacity 0 to 12, up to 5 items, weights 1 to 12 and values 0 to 99.',
  examples: EXAMPLES,
  randomInput,
  parse: parseUnboundedKnapsack,
  render: (state: PatternLanesState) => <UnboundedKnapsackView state={state} />,
};

export const unboundedKnapsackSpec: VizSpec<UnboundedKnapsackInput, PatternLanesState> = {
  id: 'unbounded-knapsack',
  title: 'Unbounded Knapsack (w going up)',
  ...INPUT,
  trace: (input) => stabilizeLanes(unboundedKnapsackTrace(input, true).frames),
  pseudocode: UNBOUNDED_CODE,
  legend: [
    { role: 'active', label: 'dp[w] raised by the item (and its new choice)' },
    { role: 'compare', label: 'dp[w - weight] it reads, or a dp[w] that stays' },
    { role: 'done', label: 'visited earlier in this pass; at the end, dp[W] and the items read back' },
  ],
  complexity: { time: 'O(n * W)', space: 'O(W): one row and its choices' },
};

export const unboundedKnapsackDownwardSpec: VizSpec<UnboundedKnapsackInput, PatternLanesState> = {
  id: 'unbounded-knapsack-downward',
  title: 'Unbounded Knapsack (w going down)',
  ...INPUT,
  trace: (input) => stabilizeLanes(unboundedKnapsackTrace(input, false).frames),
  pseudocode: DOWNWARD_CODE,
  legend: [
    { role: 'active', label: 'dp[w] raised by the item' },
    { role: 'compare', label: 'dp[w - weight] it reads, not yet visited, or a dp[w] that stays' },
    { role: 'done', label: 'visited earlier in this pass; at the end, the answer dp[W]' },
  ],
  complexity: { time: 'O(n * W)', space: 'O(W): one row' },
};
