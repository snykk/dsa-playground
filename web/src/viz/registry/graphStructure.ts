/** Visualization registry: Graph structure (topological order, SCC, bridges, union-find). */
import type { AnyVizSpec } from '../core/types';
import type { VizInfo } from '../catalog';

const ADV = 'Algorithms/Graph_Algorithms/Advanced_Graph';
const SCC = `${ADV}/Strongly_Connected_Components`;

export const entries: VizInfo[] = [
  {
    id: 'topological-sort',
    title: 'Topological Sort (Kahn)',
    group: 'Graphs',
    blurb: 'Repeatedly place a vertex with no unplaced prerequisites; a leftover cycle shows up as a stuck queue.',
    topics: [`${ADV}/Topological_Sort`],
  },
  {
    id: 'kosaraju',
    title: "Kosaraju's SCC Algorithm",
    group: 'Graphs',
    blurb: 'Two DFS passes: record finish order on G, then flood the transpose in reverse finish order.',
    topics: [`${SCC}/Kosaraju's_Algorithm`, SCC],
  },
  {
    id: 'tarjan-scc',
    title: "Tarjan's SCC Algorithm",
    group: 'Graphs',
    blurb: 'One DFS with disc / low values and a stack; when low equals disc, the stack pops one component.',
    topics: [`${SCC}/Tarjan's_Algorithm`, SCC],
  },
  {
    id: 'bridges-articulation',
    title: 'Bridges and Articulation Points',
    group: 'Graphs',
    blurb: 'One DFS with disc / low values finds every edge and vertex whose removal disconnects the graph.',
    topics: [`${ADV}/Tarjan_Bridges_Articulation`],
  },
  {
    id: 'union-find',
    title: 'Union-Find (Disjoint Sets)',
    group: 'Graphs',
    blurb: 'Trees of parent pointers: union by rank keeps them short and path compression flattens them.',
    topics: [`${ADV}/Union-Find_DSU`, 'Problem_Patterns/Union-Find Applications', 'Data Structures/Advanced_Structures/Disjoint Set Union'],
  },
];

export const loaders: Record<string, () => Promise<AnyVizSpec>> = {
  'topological-sort': () => import('../specs/graphStructure').then((m) => m.topologicalSortSpec),
  kosaraju: () => import('../specs/graphStructure').then((m) => m.kosarajuSpec),
  'tarjan-scc': () => import('../specs/graphStructure').then((m) => m.tarjanSccSpec),
  'bridges-articulation': () => import('../specs/graphStructure').then((m) => m.bridgesSpec),
  'union-find': () => import('../specs/unionFind').then((m) => m.unionFind),
};
