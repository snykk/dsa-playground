/** Visualization registry: Dynamic programming. */
import type { AnyVizSpec } from '../core/types';
import type { VizInfo } from '../catalog';

export const entries: VizInfo[] = [
  {
    id: 'lcs',
    title: 'Longest Common Subsequence',
    group: 'Dynamic Programming',
    blurb: 'Fill the table from its three neighbors, then trace the answer back from the corner.',
    topics: ['Algorithms/Dynamic_Programming/2D DP/Longest Common Subsequence'],
  },
  {
    id: 'knapsack',
    title: '0/1 Knapsack',
    group: 'Dynamic Programming',
    blurb: 'Every cell decides skip-or-take for one item at one capacity.',
    topics: ['Algorithms/Dynamic_Programming/2D DP/0-1 Knapsack'],
  },
];

export const loaders: Record<string, () => Promise<AnyVizSpec>> = {
  lcs: () => import('../specs/dp').then((m) => m.lcs),
  knapsack: () => import('../specs/dp').then((m) => m.knapsack),
};
