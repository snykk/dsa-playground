/** Visualization registry: Greedy algorithms. */
import type { AnyVizSpec } from '../core/types';
import type { VizInfo } from '../catalog';

const MST = 'Algorithms/Greedy/Minimum Spanning Tree';

export const entries: VizInfo[] = [
  {
    id: 'kruskal',
    title: "Kruskal's Algorithm",
    group: 'Greedy',
    blurb: 'Try edges from lightest to heaviest and keep each one that joins two different trees; union-find spots cycles.',
    topics: [`${MST}/Kruskal's Algorithm`, "Algorithms/Graph_Algorithms/Minimum_Spanning_Tree/Kruskal's_Algorithm", MST],
  },
  {
    id: 'prim',
    title: "Prim's Algorithm",
    group: 'Greedy',
    blurb: 'Grow one tree from a start vertex, always adding the cheapest edge that crosses from the tree to the rest.',
    topics: [`${MST}/Prim's Algorithm`, "Algorithms/Graph_Algorithms/Minimum_Spanning_Tree/Prim's_Algorithm", MST],
  },
  {
    id: 'activity-selection',
    title: 'Activity Selection',
    group: 'Greedy',
    blurb: 'Sort by finish time, then keep every activity that starts after the last chosen one ends.',
    topics: ['Algorithms/Greedy/Activity Selection'],
  },
  {
    id: 'fractional-knapsack',
    title: 'Fractional Knapsack',
    group: 'Greedy',
    blurb: 'Pack the most value per unit of weight first and cut the last item to fit, unlike 0/1 knapsack.',
    topics: ['Algorithms/Greedy/Fractional Knapsack'],
  },
];

export const loaders: Record<string, () => Promise<AnyVizSpec>> = {
  kruskal: () => import('../specs/mst').then((m) => m.kruskal),
  prim: () => import('../specs/mst').then((m) => m.prim),
  'activity-selection': () => import('../specs/greedy').then((m) => m.activitySelection),
  'fractional-knapsack': () => import('../specs/greedy').then((m) => m.fractionalKnapsack),
};
