/** Visualization registry: Trees. */
import type { AnyVizSpec } from '../core/types';
import type { VizInfo } from '../catalog';

export const entries: VizInfo[] = [
  {
    id: 'bst',
    title: 'Binary Search Tree',
    group: 'Trees',
    blurb: 'Insert, search and delete by walking left or right; deletion uses the in-order successor.',
    topics: ['Data_Structures/Non_Linear/Trees/Binary_Search_Tree'],
  },
  {
    id: 'avl',
    title: 'AVL Tree',
    group: 'Trees',
    blurb: 'Watch balance factors and the four rotation cases keep the height logarithmic.',
    topics: ['Data_Structures/Non_Linear/Trees/AVL_Tree'],
  },
];

export const loaders: Record<string, () => Promise<AnyVizSpec>> = {
  bst: () => import('../specs/tree').then((m) => m.bst),
  avl: () => import('../specs/tree').then((m) => m.avl),
};
