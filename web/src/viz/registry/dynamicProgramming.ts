/** Visualization registry: Dynamic programming. */
import type { AnyVizSpec } from '../core/types';
import type { VizInfo } from '../catalog';

export const entries: VizInfo[] = [
  {
    id: 'lcs',
    title: 'Longest Common Subsequence',
    group: 'Dynamic Programming',
    blurb: 'Fill the table from its three neighbors, then trace the answer back from the corner.',
    topics: ['Algorithms/Dynamic_Programming/2D_DP/Longest_Common_Subsequence'],
  },
  {
    id: 'knapsack',
    title: '0/1 Knapsack',
    group: 'Dynamic Programming',
    blurb: 'Every cell decides skip-or-take for one item at one capacity.',
    topics: ['Algorithms/Dynamic_Programming/2D_DP/0_1_Knapsack'],
  },
  {
    id: 'fibonacci',
    title: 'Fibonacci Numbers',
    group: 'Dynamic Programming',
    blurb: "Fill the table left to right: each entry is the sum of the two before it, so nothing is computed twice.",
    topics: ['Algorithms/Dynamic_Programming/Basic_DP/Fibonacci_Numbers'],
  },
  {
    id: 'climbing-stairs',
    title: 'Climbing Stairs',
    group: 'Dynamic Programming',
    blurb: "Count the ways to reach each stair as the sum over every allowed last hop.",
    topics: ['Algorithms/Dynamic_Programming/Basic_DP/Climbing_Stairs'],
  },
  {
    id: 'coin-change',
    title: 'Coin Change (minimum coins)',
    group: 'Dynamic Programming',
    blurb: "Each amount asks which last coin leaves the cheapest smaller amount, then the answer is traced back.",
    topics: ['Algorithms/Dynamic_Programming/Linear_DP/Coin_Change'],
  },
  {
    id: 'lis',
    title: 'Longest Increasing Subsequence (O(n^2) table)',
    group: 'Dynamic Programming',
    blurb: "For every element, look back for the longest run it can extend and remember the predecessor.",
    topics: ['Algorithms/Dynamic_Programming/Linear_DP/Longest_Increasing_Subsequence'],
  },
  {
    id: 'lis-tails',
    title: 'Longest Increasing Subsequence (O(n log n) tails)',
    group: 'Dynamic Programming',
    blurb: "Keep the smallest possible tail per length and place each value by binary search.",
    topics: ['Algorithms/Dynamic_Programming/Linear_DP/Longest_Increasing_Subsequence'],
  },
  {
    id: 'kadane',
    title: "Maximum Subarray (Kadane's Algorithm)",
    group: 'Dynamic Programming',
    blurb: "Extend the running sum or restart when it goes negative, and remember the best window.",
    topics: ["Algorithms/Dynamic_Programming/Linear_DP/Maximum_Subarray_Kadanes_Algorithm"],
  },
  {
    id: 'edit-distance',
    title: 'Edit Distance',
    group: 'Dynamic Programming',
    blurb: "Each cell picks the cheapest of replace, delete and insert; the traceback reads off the edits.",
    topics: ['Algorithms/Dynamic_Programming/2D_DP/Edit_Distance'],
  },
  {
    id: 'matrix-chain',
    title: 'Matrix Chain Multiplication',
    group: 'Dynamic Programming',
    blurb: "Fill the interval table by chain length, trying every split, then recover the best bracketing.",
    topics: ['Algorithms/Dynamic_Programming/2D_DP/Matrix_Chain_Multiplication'],
  },
];

export const loaders: Record<string, () => Promise<AnyVizSpec>> = {
  lcs: () => import('../specs/dp').then((m) => m.lcs),
  knapsack: () => import('../specs/dp').then((m) => m.knapsack),
  fibonacci: () => import('../specs/dpLinear').then((m) => m.fibonacci),
  'climbing-stairs': () => import('../specs/dpLinear').then((m) => m.climbingStairs),
  'coin-change': () => import('../specs/dpLinear').then((m) => m.coinChange),
  lis: () => import('../specs/dpLinear').then((m) => m.lis),
  'lis-tails': () => import('../specs/dpLinear').then((m) => m.lisTails),
  kadane: () => import('../specs/dpLinear').then((m) => m.kadane),
  'edit-distance': () => import('../specs/dpGrid').then((m) => m.editDistance),
  'matrix-chain': () => import('../specs/dpGrid').then((m) => m.matrixChain),
};
