/** Visualization registry: Advanced graph algorithms (network flow, 2-SAT). */
import type { AnyVizSpec } from '../core/types';
import type { VizInfo } from '../catalog';

const ADV = 'Algorithms/Graph_Algorithms/Advanced_Graph';
const FLOW = `${ADV}/Network_Flow`;

export const entries: VizInfo[] = [
  {
    id: 'ford-fulkerson',
    title: 'Ford-Fulkerson (DFS)',
    group: 'Graphs',
    blurb: 'A DFS finds any path with room left, the bottleneck flows along it, and reverse edges let later paths cancel it; the last search marks a minimum cut.',
    topics: [`${FLOW}/Ford_Fulkerson`, FLOW],
  },
  {
    id: 'edmonds-karp',
    title: 'Edmonds-Karp (BFS)',
    group: 'Graphs',
    blurb: 'The same augmenting loop, but BFS layer by layer, so every path is a shortest one and the number of rounds no longer depends on the capacities.',
    topics: [`${FLOW}/Edmonds_Karp`, FLOW],
  },
  {
    id: 'two-sat',
    title: '2-SAT (implication graph + Tarjan)',
    group: 'Graphs',
    blurb: 'Every clause becomes two implications; Tarjan splits the graph into components, and x shares one with ~x exactly when the formula is unsatisfiable.',
    topics: [`${ADV}/2_SAT`, ADV],
  },
];

export const loaders: Record<string, () => Promise<AnyVizSpec>> = {
  'ford-fulkerson': () => import('../specs/advancedGraph').then((m) => m.fordFulkersonSpec),
  'edmonds-karp': () => import('../specs/advancedGraph').then((m) => m.edmondsKarpSpec),
  'two-sat': () => import('../specs/advancedGraph').then((m) => m.twoSatSpec),
};
