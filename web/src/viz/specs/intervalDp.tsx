/**
 * Spec for Interval DP: merging piles at the minimum cost, the dp and split tables filled one
 * diagonal (one length) at a time, then the merges read back as a tree. Mirrors
 * Algorithms/Dynamic_Programming/Advanced_DP/Interval_DP/Python/interval_dp.py (see the header
 * of the tracer).
 */
import { INTERVAL_CODE, INTERVAL_LIMITS, intervalDpTrace, parseIntervalDp, type IntervalDpInput } from '../algorithms/intervalDp';
import type { VizSpec } from '../core/types';
import { IntervalDpView, type IntervalDpState } from '../renderers/IntervalDpView';

const rint = (lo: number, hi: number) => lo + Math.floor(Math.random() * (hi - lo + 1));

export const intervalDpSpec: VizSpec<IntervalDpInput, IntervalDpState> = {
  id: 'interval-dp',
  title: 'Interval DP: merging piles',
  inputKind: 'interval-dp-piles',
  inputLabel: 'Pile sizes',
  inputHelp: `Like "3, 2, 4, 1": 1 to ${INTERVAL_LIMITS.maxPiles} piles in a row, each of 0 to ${INTERVAL_LIMITS.maxSize}. Merging two neighbours costs the size of the pile it makes.`,
  examples: [
    { label: 'Four piles', value: '3, 2, 4, 1' },
    { label: 'Greedy fails', value: '3, 2, 2, 3' },
    { label: 'Equal piles (ties)', value: '1, 1, 1, 1' },
    { label: 'Eight piles', value: '5, 1, 4, 2, 8, 3, 7, 6' },
    { label: 'Two piles', value: '4, 9' },
    { label: 'One pile', value: '7' },
  ],
  randomInput: () => Array.from({ length: rint(4, 7) }, () => rint(1, 20)).join(', '),
  parse: parseIntervalDp,
  trace: (input) => intervalDpTrace(input).frames,
  render: (state) => <IntervalDpView state={state} />,
  pseudocode: INTERVAL_CODE,
  legend: [
    { role: 'active', label: 'the cell being filled, its row and column, and its best k so far' },
    { role: 'compare', label: 'dp[i][k] and dp[k+1][j], the two cells a split reads, and the piles of the range' },
    { role: 'done', label: 'a finished cell; at the end, the merges read back' },
  ],
  complexity: { time: 'O(n^3)', space: 'O(n^2)' },
};
