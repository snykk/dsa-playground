/** Visualization registry: Range queries (segment tree, lazy segment tree, Fenwick tree, sparse table) and the K-D tree. */
import type { AnyVizSpec } from '../core/types';
import type { VizInfo } from '../catalog';

const T = 'Data_Structures/Non_Linear/Trees';

export const entries: VizInfo[] = [
  {
    id: 'segment-tree',
    title: 'Segment Tree',
    group: 'Range Queries',
    blurb: 'Two pointers climb from the leaves and add the blocks their parents cannot; an update recomputes one block per level.',
    topics: [`${T}/Segment_Tree`],
  },
  {
    id: 'segment-tree-lazy',
    title: 'Lazy Segment Tree',
    group: 'Range Queries',
    blurb: 'A range add tags the fully covered nodes and stops; a later query pushes each tag down one level when it passes through.',
    topics: [`${T}/Segment_Tree_Lazy_Propagation`],
  },
  {
    id: 'fenwick-tree',
    title: 'Fenwick Tree',
    group: 'Range Queries',
    blurb: 'Each cell covers lowbit(i) elements: an update climbs with i += i & -i, a prefix sum descends with i -= i & -i.',
    topics: [`${T}/Fenwick_Tree`],
  },
  {
    id: 'sparse-table',
    title: 'Sparse Table',
    group: 'Range Queries',
    blurb: 'Every level doubles the window from two halves below; a query reads two overlapping windows of 2^k.',
    topics: [`${T}/Sparse_Table`],
  },
  {
    id: 'k-d-tree',
    title: 'K-D Tree',
    group: 'Trees',
    blurb: 'Split on x, then y: the plane and the tree side by side, with nearest and range searches pruning whole regions.',
    topics: [`${T}/K_D_Tree`],
  },
];

export const loaders: Record<string, () => Promise<AnyVizSpec>> = {
  'segment-tree': () => import('../specs/rangeQueries').then((m) => m.segmentTreeSpec),
  'segment-tree-lazy': () => import('../specs/rangeQueries').then((m) => m.segmentTreeLazySpec),
  'fenwick-tree': () => import('../specs/rangeQueries').then((m) => m.fenwickTreeSpec),
  'sparse-table': () => import('../specs/rangeQueries').then((m) => m.sparseTableSpec),
  'k-d-tree': () => import('../specs/rangeQueries').then((m) => m.kdTreeSpec),
};
