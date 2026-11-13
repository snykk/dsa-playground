/** Visualization registry: Shortest paths. */
import type { AnyVizSpec } from '../core/types';
import type { VizInfo } from '../catalog';

export const entries: VizInfo[] = [
  {
    id: 'dijkstra',
    title: "Dijkstra's Shortest Paths",
    group: 'Graphs',
    blurb: 'Always settle the closest unsettled vertex, then relax its outgoing edges.',
    topics: ["Algorithms/Graph_Algorithms/Shortest_Path/Dijkstra's_Algorithm", 'Algorithms/Graph_Algorithms/Shortest_Path'],
  },
  {
    id: 'bellman-ford',
    title: 'Bellman-Ford Algorithm',
    group: 'Graphs',
    blurb: 'Relax every edge for V-1 rounds, then try once more: if something still improves, a negative cycle exists.',
    topics: ['Algorithms/Graph_Algorithms/Shortest_Path/Bellman-Ford_Algorithm', 'Algorithms/Graph_Algorithms/Shortest_Path'],
  },
  {
    id: 'floyd-warshall',
    title: 'Floyd-Warshall Algorithm',
    group: 'Graphs',
    blurb: 'Fill an all-pairs distance table by allowing one more intermediate vertex k per round.',
    topics: ['Algorithms/Graph_Algorithms/Shortest_Path/Floyd-Warshall_Algorithm', 'Algorithms/Graph_Algorithms/Shortest_Path'],
  },
  {
    id: 'a-star',
    title: 'A* Search',
    group: 'Graphs',
    blurb: 'Dijkstra guided by a heuristic: expand the open cell with the smallest g + h on a grid map with walls.',
    topics: ['Algorithms/Graph_Algorithms/Shortest_Path/A_Star_Search_Algorithm', 'Algorithms/Graph_Algorithms/Shortest_Path'],
  },
];

export const loaders: Record<string, () => Promise<AnyVizSpec>> = {
  dijkstra: () => import('../specs/graph').then((m) => m.dijkstra),
  'bellman-ford': () => import('../specs/shortestPaths').then((m) => m.bellmanFord),
  'floyd-warshall': () => import('../specs/shortestPaths').then((m) => m.floydWarshall),
  'a-star': () => import('../specs/shortestPaths').then((m) => m.aStar),
};
