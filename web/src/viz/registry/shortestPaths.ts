/** Visualization registry: Shortest paths. */
import type { AnyVizSpec } from '../core/types';
import type { VizInfo } from '../catalog';

export const entries: VizInfo[] = [
  {
    id: 'dijkstra',
    title: "Dijkstra's Shortest Paths",
    group: 'Graphs',
    blurb: 'Always settle the closest unsettled vertex, then relax its outgoing edges.',
    topics: ["Algorithms/Graph_Algorithms/Shortest_Path/Dijkstras_Algorithm", 'Algorithms/Graph_Algorithms/Shortest_Path'],
  },
  {
    id: 'zero-one-bfs',
    title: '0-1 BFS',
    group: 'Graphs',
    blurb: 'Shortest paths with weights 0 and 1: a deque replaces the heap, a weight-0 edge pushes to the front and a weight-1 edge to the back, and stale entries are skipped.',
    topics: ['Algorithms/Graph_Algorithms/Shortest_Path/0_1_BFS', 'Algorithms/Graph_Algorithms/Shortest_Path'],
  },
  {
    id: 'bellman-ford',
    title: 'Bellman-Ford Algorithm',
    group: 'Graphs',
    blurb: 'Relax every edge for V-1 rounds, then try once more: if something still improves, a negative cycle exists.',
    topics: ['Algorithms/Graph_Algorithms/Shortest_Path/Bellman_Ford_Algorithm', 'Algorithms/Graph_Algorithms/Shortest_Path'],
  },
  {
    id: 'floyd-warshall',
    title: 'Floyd-Warshall Algorithm',
    group: 'Graphs',
    blurb: 'Fill an all-pairs distance table by allowing one more intermediate vertex k per round.',
    topics: ['Algorithms/Graph_Algorithms/Shortest_Path/Floyd_Warshall_Algorithm', 'Algorithms/Graph_Algorithms/Shortest_Path'],
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
  'zero-one-bfs': () => import('../specs/shortestPaths').then((m) => m.zeroOneBfs),
  'bellman-ford': () => import('../specs/shortestPaths').then((m) => m.bellmanFord),
  'floyd-warshall': () => import('../specs/shortestPaths').then((m) => m.floydWarshall),
  'a-star': () => import('../specs/shortestPaths').then((m) => m.aStar),
};
