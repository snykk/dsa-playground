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
    topics: [`${ADV}/Topological_Sort`, ADV],
  },
  {
    id: 'kosaraju',
    title: "Kosaraju's SCC Algorithm",
    group: 'Graphs',
    blurb: 'Two DFS passes: record finish order on G, then flood the transpose in reverse finish order.',
    topics: [`${SCC}/Kosarajus_Algorithm`, SCC, ADV],
  },
  {
    id: 'tarjan-scc',
    title: "Tarjan's SCC Algorithm",
    group: 'Graphs',
    blurb: 'One DFS with disc / low values and a stack; when low equals disc, the stack pops one component.',
    topics: [`${SCC}/Tarjans_Algorithm`, SCC, ADV],
  },
  {
    id: 'bridges-articulation',
    title: 'Bridges and Articulation Points',
    group: 'Graphs',
    blurb: 'One DFS with disc / low values finds every edge and vertex whose removal disconnects the graph.',
    topics: [`${ADV}/Tarjan_Bridges_Articulation`, ADV],
  },
  {
    id: 'union-find',
    title: 'Union-Find (Disjoint Sets)',
    group: 'Graphs',
    blurb: 'Trees of parent pointers: union by rank keeps them short and path compression flattens them.',
    topics: [
      'Data_Structures/Advanced_Structures/Disjoint_Set_Union',
      'Problem_Patterns/Union_Find_Applications',
      'Data_Structures/Advanced_Structures',
      'Problem_Patterns',
    ],
  },
  {
    id: 'adjacency-list',
    title: 'Adjacency List',
    group: 'Graphs',
    blurb: 'A dict from each vertex to its neighbor list: add_edge replaces an existing entry, and an undirected edge sits in both lists.',
    topics: ['Data_Structures/Non_Linear/Graph/Adjacency_List', 'Data_Structures/Non_Linear/Graph'],
  },
  {
    id: 'adjacency-matrix',
    title: 'Adjacency Matrix',
    group: 'Graphs',
    blurb: 'A V x V table plus a presence table: one cell answers has_edge, a whole row lists the neighbors.',
    topics: ['Data_Structures/Non_Linear/Graph/Adjacency_Matrix', 'Data_Structures/Non_Linear/Graph'],
  },
  {
    id: 'edge-list',
    title: 'Edge List',
    group: 'Graphs',
    blurb: 'One flat list of (u, v) tuples: every add, remove and lookup reads the whole list.',
    topics: ['Data_Structures/Non_Linear/Graph/Edge_List', 'Data_Structures/Non_Linear/Graph'],
  },
  {
    id: 'directed-undirected',
    title: 'Directed and Undirected Graphs',
    group: 'Graphs',
    blurb: 'The same edges stored once (directed) or once per direction (undirected), and what that does to degree.',
    topics: ['Data_Structures/Non_Linear/Graph/Directed_and_Undirected', 'Data_Structures/Non_Linear/Graph'],
  },
  {
    id: 'weighted-unweighted',
    title: 'Weighted and Unweighted Graphs',
    group: 'Graphs',
    blurb: '(neighbor, weight) tuples: an edge without a weight gets 1.0, a repeated edge replaces its weight.',
    topics: ['Data_Structures/Non_Linear/Graph/Weighted_and_Unweighted', 'Data_Structures/Non_Linear/Graph'],
  },
];

export const loaders: Record<string, () => Promise<AnyVizSpec>> = {
  'topological-sort': () => import('../specs/graphStructure').then((m) => m.topologicalSortSpec),
  kosaraju: () => import('../specs/graphStructure').then((m) => m.kosarajuSpec),
  'tarjan-scc': () => import('../specs/graphStructure').then((m) => m.tarjanSccSpec),
  'bridges-articulation': () => import('../specs/graphStructure').then((m) => m.bridgesSpec),
  'union-find': () => import('../specs/unionFind').then((m) => m.unionFind),
  'adjacency-list': () => import('../specs/graphRepresentations').then((m) => m.adjacencyListSpec),
  'adjacency-matrix': () => import('../specs/graphRepresentations').then((m) => m.adjacencyMatrixSpec),
  'edge-list': () => import('../specs/graphRepresentations').then((m) => m.edgeListSpec),
  'directed-undirected': () => import('../specs/graphRepresentations').then((m) => m.directedUndirectedSpec),
  'weighted-unweighted': () => import('../specs/graphRepresentations').then((m) => m.weightedUnweightedSpec),
};
