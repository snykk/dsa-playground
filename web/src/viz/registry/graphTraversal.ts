/** Visualization registry: Graph traversal. */
import type { AnyVizSpec } from '../core/types';
import type { VizInfo } from '../catalog';

export const entries: VizInfo[] = [
  {
    id: 'bfs',
    title: 'Breadth-First Search',
    group: 'Graphs',
    blurb: 'A FIFO queue explores the graph in rings of equal hop distance.',
    topics: ['Algorithms/Graph_Algorithms/Traversal/BFS', 'Algorithms/Graph_Algorithms/Traversal'],
  },
  {
    id: 'dfs',
    title: 'Depth-First Search',
    group: 'Graphs',
    blurb: 'Go as deep as possible, backtrack only when a vertex has no unvisited neighbors.',
    topics: ['Algorithms/Graph_Algorithms/Traversal/DFS', 'Algorithms/Graph_Algorithms/Traversal'],
  },
];

export const loaders: Record<string, () => Promise<AnyVizSpec>> = {
  bfs: () => import('../specs/graph').then((m) => m.bfs),
  dfs: () => import('../specs/graph').then((m) => m.dfs),
};
