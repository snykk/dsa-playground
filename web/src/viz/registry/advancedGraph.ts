/** Visualization registry: Advanced graph algorithms (network flow, 2-SAT, bipartite matching). */
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
    id: 'kuhn-matching',
    title: "Kuhn's algorithm (bipartite matching)",
    group: 'Graphs',
    blurb: 'One DFS from each left vertex looks for an augmenting path, asking matched partners to move along, and flipping the path grows the matching by one.',
    topics: [`${ADV}/Bipartite_Matching`],
  },
  {
    id: 'hopcroft-karp',
    title: 'Hopcroft-Karp (bipartite matching)',
    group: 'Graphs',
    blurb: 'A BFS sorts the left vertices into layers, DFS takes vertex-disjoint shortest augmenting paths through them, and the final matching yields a minimum vertex cover.',
    topics: [`${ADV}/Bipartite_Matching`],
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
  'kuhn-matching': () => import('../specs/advancedGraph').then((m) => m.kuhnSpec),
  'hopcroft-karp': () => import('../specs/advancedGraph').then((m) => m.hopcroftKarpSpec),
  'two-sat': () => import('../specs/advancedGraph').then((m) => m.twoSatSpec),
};
