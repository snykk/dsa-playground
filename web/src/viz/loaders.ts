/**
 * Code-split loaders: a page only downloads the visualizations it shows.
 * Every id in catalog.ts must have an entry here (enforced by catalog.test.ts).
 */
import type { AnyVizSpec } from './core/types';

export const VIZ_LOADERS: Record<string, () => Promise<AnyVizSpec>> = {
  'bubble-sort': () => import('./specs/sorting').then((m) => m.bubbleSort),
  'insertion-sort': () => import('./specs/sorting').then((m) => m.insertionSort),
  'selection-sort': () => import('./specs/sorting').then((m) => m.selectionSort),
  'merge-sort': () => import('./specs/sorting').then((m) => m.mergeSort),
  'quick-sort': () => import('./specs/sorting').then((m) => m.quickSort),
  'heap-sort': () => import('./specs/sorting').then((m) => m.heapSort),
  bfs: () => import('./specs/graph').then((m) => m.bfs),
  dfs: () => import('./specs/graph').then((m) => m.dfs),
  dijkstra: () => import('./specs/graph').then((m) => m.dijkstra),
  bst: () => import('./specs/tree').then((m) => m.bst),
  avl: () => import('./specs/tree').then((m) => m.avl),
  kmp: () => import('./specs/strings').then((m) => m.kmp),
  lcs: () => import('./specs/dp').then((m) => m.lcs),
  knapsack: () => import('./specs/dp').then((m) => m.knapsack),
  'reed-solomon': () => import('./specs/codingTheory').then((m) => m.reedSolomon),
};
