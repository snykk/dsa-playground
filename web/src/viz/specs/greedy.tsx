import {
  activitySelection as activityTrace,
  fractionalKnapsack as fractionalTrace,
  parseActivities,
  parseFractional,
  type Activity,
  type FractionalInput,
} from '../algorithms/greedy';
import { randomInts, type VizSpec } from '../core/types';
import { IntervalTimeline, type IntervalTimelineState } from '../renderers/IntervalTimeline';
import { KnapsackFill, type KnapsackFillState } from '../renderers/KnapsackFill';

export const activitySelection: VizSpec<Activity[], IntervalTimelineState> = {
  id: 'activity-selection',
  title: 'Activity Selection',
  inputKind: 'intervals',
  inputLabel: 'Activities as start-finish',
  inputHelp: 'Pairs like "1-4, 3-5, 0-6"; an activity occupies [start, finish). Up to 14 activities, times -99..999 (write negatives like "-4--2").',
  examples: [
    { label: 'Classic (CLRS)', value: '1-4, 3-5, 0-6, 5-7, 3-9, 5-9, 6-10, 8-11, 8-12, 2-14, 12-16' },
    { label: 'Earliest-start trap', value: '0-10, 1-3, 4-6, 7-9, 2-5' },
    { label: 'Back to back', value: '0-2, 2-4, 1-3, 4-6, 3-5' },
    { label: 'Negative times', value: '-6--3, -5--1, -2-1, -1-2, 1-4, 3-6' },
    { label: 'All overlap', value: '1-5, 2-6, 3-7, 4-8' },
  ],
  randomInput: () => {
    const n = 8 + Math.floor(Math.random() * 3);
    return randomInts(n, 0, 14)
      .map((s) => `${s}-${s + 1 + Math.floor(Math.random() * 6)}`)
      .join(', ');
  },
  parse: (text) => parseActivities(text),
  trace: activityTrace,
  render: (state) => <IntervalTimeline state={state} />,
  pseudocode: [
    'sort activities by finish time (earliest first)',
    'select the first; last_finish = its finish',
    'for each remaining activity (start, finish) in that order:',
    '  if start >= last_finish:',
    '    select it; last_finish = finish',
    '  else: skip it                  // it overlaps the last selected one',
  ],
  legend: [
    { role: 'compare', label: 'being checked' },
    { role: 'good', label: 'fits: start >= last_finish' },
    { role: 'bad', label: 'overlaps (hatched part)' },
    { role: 'done', label: 'selected' },
    { role: 'muted', label: 'skipped' },
    { role: 'idle', label: 'not checked yet' },
  ],
  complexity: { time: 'O(n log n) for the sort, then one O(n) pass', space: 'O(n) for the sorted copy' },
};

export const fractionalKnapsack: VizSpec<FractionalInput, KnapsackFillState> = {
  id: 'fractional-knapsack',
  title: 'Fractional Knapsack',
  inputKind: 'knapsack',
  inputLabel: 'Capacity; items as weight:value',
  inputHelp: 'Like "W=50; 10:60, 20:100, 30:120" (the same notation as 0/1 knapsack). Capacity 1..500, up to 8 items; weight 0 is allowed (a free item).',
  examples: [
    { label: 'Classic', value: 'W=50; 10:60, 20:100, 30:120' },
    { label: 'Greedy fails for 0/1', value: 'W=10; 6:30, 5:20, 5:20' },
    { label: 'Free item (weight 0)', value: 'W=5; 0:10, 10:60' },
    { label: 'Everything fits', value: 'W=20; 5:10, 10:20' },
  ],
  randomInput: () => {
    const n = 4 + Math.floor(Math.random() * 3);
    const weights = randomInts(n, 2, 20);
    const values = randomInts(n, 5, 90);
    const total = weights.reduce((s, w) => s + w, 0);
    const capacity = Math.max(1, Math.round(total * (0.35 + Math.random() * 0.35)));
    return `W=${capacity}; ${weights.map((w, i) => `${w}:${values[i]}`).join(', ')}`;
  },
  parse: (text) => parseFractional(text),
  trace: fractionalTrace,
  render: (state) => <KnapsackFill state={state} />,
  pseudocode: [
    'ratio = value / weight for every item   // weight 0: ratio = infinity',
    'sort items by ratio, highest first; remaining = W',
    'for each item (value, weight) in that order:',
    '  if remaining <= 0: break             // the knapsack is full',
    '  if weight <= remaining: take all of it; remaining -= weight',
    '  else: take remaining / weight of it; remaining = 0',
  ],
  legend: [
    { role: 'compare', label: 'being considered' },
    { role: 'active', label: 'just packed' },
    { role: 'done', label: 'in the knapsack' },
    { role: 'muted', label: 'left out' },
    { role: 'idle', label: 'not considered yet' },
  ],
  complexity: { time: 'O(n log n) for the sort by ratio', space: 'O(n) for the sorted copy' },
};
