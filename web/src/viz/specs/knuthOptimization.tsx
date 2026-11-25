/**
 * Spec for Knuth's optimization: merging piles at the minimum cost, the dp and split tables of
 * Interval DP filled one diagonal at a time, with each cell trying only the splits of its window,
 * then the merges read back as a tree. Mirrors
 * Algorithms/Dynamic_Programming/DP_Optimizations/Knuth_Optimization/Python/knuth_optimization.py
 * (see the header of the tracer).
 */
import { KNUTH_CODE, KNUTH_LIMITS, knuthTrace, parseKnuth, type KnuthInput } from '../algorithms/knuthOptimization';
import type { VizSpec } from '../core/types';
import { KnuthOptimizationView, type KnuthState } from '../renderers/KnuthOptimizationView';

const rint = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));

export const knuthOptimizationSpec: VizSpec<KnuthInput, KnuthState> = {
  id: 'knuth-optimization',
  title: "Knuth's optimization: merging piles",
  inputKind: 'interval-dp-piles',
  inputLabel: 'Pile sizes',
  inputHelp: `Like "3, 2, 4, 1": 1 to ${KNUTH_LIMITS.maxPiles} piles in a row, each of 0 to ${KNUTH_LIMITS.maxSize}. Merging two neighbours costs the size of the pile it makes.`,
  examples: [
    { label: 'Four piles', value: '3, 2, 4, 1' },
    { label: 'Eight piles', value: '5, 1, 4, 2, 8, 3, 7, 6' },
    { label: 'Heavy ends (widest windows)', value: '99, 1, 1, 1, 1, 1, 1, 99' },
    { label: 'Equal piles (ties)', value: '1, 1, 1, 1, 1, 1' },
    { label: 'Two piles', value: '4, 9' },
    { label: 'One pile', value: '7' },
  ],
  randomInput: () => Array.from({ length: rint(5, 8) }, () => rint(1, 20)).join(', '),
  parse: parseKnuth,
  trace: (input) => knuthTrace(input).frames,
  render: (state) => <KnuthOptimizationView state={state} />,
  pseudocode: KNUTH_CODE,
  legend: [
    { role: 'active', label: 'the cell being filled, its row and column, and the k being tried' },
    { role: 'compare', label: 'split[i][j-1] and split[i+1][j], the ends of the window; dp[i][k] and dp[k+1][j], the two cells a split reads; the piles of the range' },
    { role: 'done', label: 'a finished cell or a split already tried; at the end, the merges read back' },
  ],
  complexity: { time: 'O(n^2)', space: 'O(n^2)' },
};
