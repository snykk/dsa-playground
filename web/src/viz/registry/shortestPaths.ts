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
];

export const loaders: Record<string, () => Promise<AnyVizSpec>> = {
  dijkstra: () => import('../specs/graph').then((m) => m.dijkstra),
};
