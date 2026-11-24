/** Visualization registry: Specialized techniques (square root decomposition, Mo's algorithm, the lowest common ancestor, heavy-light and centroid decomposition). */
import type { AnyVizSpec } from '../core/types';
import type { VizInfo } from '../catalog';

const ST = 'Algorithms/Advanced_Algorithms/Specialized_Techniques';

export const entries: VizInfo[] = [
  {
    id: 'sqrt-decomposition',
    title: 'Square Root Decomposition',
    group: 'Range Queries',
    blurb: 'Blocks of ceil(sqrt(n)) cells keep their sums: a query adds two partial blocks cell by cell and the whole blocks between in one read each.',
    topics: [`${ST}/Square_Root_Decomposition`, ST],
  },
  {
    id: 'mos-algorithm',
    title: "Mo's Algorithm",
    group: 'Range Queries',
    blurb: 'Sort offline queries by (block of l, r), then slide one window over them, adding and removing one element at a time to count distinct values.',
    topics: [`${ST}/Mos_Algorithm`, ST],
  },
  {
    id: 'lca-up-table',
    title: 'Lowest Common Ancestor (binary lifting)',
    group: 'Trees',
    blurb: 'A breadth-first walk gives parents and depths, up[k][v] doubles each jump, and a query lifts the deeper node by the bits of the depth gap, then both nodes while their ancestors differ.',
    topics: [`${ST}/Lowest_Common_Ancestor`, ST],
  },
  {
    id: 'lca-euler-tour',
    title: 'Lowest Common Ancestor (Euler tour + sparse table)',
    group: 'Trees',
    blurb: 'A depth-first walk writes every node it enters or returns to; the LCA is the shallowest node between the first visits of u and v, read from a sparse table in O(1).',
    topics: [`${ST}/Lowest_Common_Ancestor`],
  },
  {
    id: 'heavy-light-decomposition',
    title: 'Heavy-Light Decomposition',
    group: 'Trees',
    blurb: 'Subtree sizes pick a heavy child per node; heavy chains get consecutive positions, and a path query climbs one chain per jump.',
    topics: [`${ST}/Heavy_Light_Decomposition`, ST],
  },
  {
    id: 'centroid-decomposition',
    title: 'Centroid Decomposition',
    group: 'Trees',
    blurb: 'Measure the piece, walk to the node that leaves no side larger than half, remove it and recurse: the removed nodes form a tree of height O(log n).',
    topics: [`${ST}/Centroid_Decomposition`, ST],
  },
];

export const loaders: Record<string, () => Promise<AnyVizSpec>> = {
  'sqrt-decomposition': () => import('../specs/specializedTechniques').then((m) => m.sqrtDecompositionSpec),
  'mos-algorithm': () => import('../specs/specializedTechniques').then((m) => m.mosAlgorithmSpec),
  'lca-up-table': () => import('../specs/specializedTechniques').then((m) => m.lcaLiftingSpec),
  'lca-euler-tour': () => import('../specs/specializedTechniques').then((m) => m.lcaEulerSpec),
  'heavy-light-decomposition': () => import('../specs/specializedTechniques').then((m) => m.heavyLightSpec),
  'centroid-decomposition': () => import('../specs/specializedTechniques').then((m) => m.centroidSpec),
};
