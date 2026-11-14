/** Visualization registry: Trees. */
import type { AnyVizSpec } from '../core/types';
import type { VizInfo } from '../catalog';

export const entries: VizInfo[] = [
  {
    id: 'bst',
    title: 'Binary Search Tree',
    group: 'Trees',
    blurb: 'Insert, search and delete by walking left or right; deletion uses the in-order successor.',
    topics: ['Data_Structures/Non_Linear/Trees/Binary_Search_Tree', 'Data_Structures/Non_Linear/Trees'],
  },
  {
    id: 'avl',
    title: 'AVL Tree',
    group: 'Trees',
    blurb: 'Watch balance factors and the four rotation cases keep the height logarithmic.',
    topics: ['Data_Structures/Non_Linear/Trees/AVL_Tree', 'Data_Structures/Non_Linear/Trees'],
  },
  {
    id: 'binary-tree-traversals',
    title: 'Binary Tree',
    group: 'Trees',
    blurb: 'Level-order insert, then pre-, in-, post- and level-order walks with the call stack or queue and the output growing node by node.',
    topics: ['Data_Structures/Non_Linear/Trees/Binary_Tree'],
  },
  {
    id: 'red-black-tree',
    title: 'Red-Black Tree',
    group: 'Trees',
    blurb: 'Insert as a red leaf, then the fix-up: recolor when the uncle is red, rotate on a triangle or a line, color the root black.',
    topics: ['Data_Structures/Non_Linear/Trees/Red_Black_Tree', 'Data_Structures/Non_Linear/Trees'],
  },
  {
    id: 'splay-tree',
    title: 'Splay Tree',
    group: 'Trees',
    blurb: 'Every access splays to the root by zig, zig-zig and zig-zag; a miss splays the last node, delete splits and joins.',
    topics: ['Data_Structures/Non_Linear/Trees/Splay_Tree', 'Data_Structures/Non_Linear/Trees'],
  },
  {
    id: 'treap',
    title: 'Treap',
    group: 'Trees',
    blurb: 'A BST on keys and a max-heap on seeded random priorities: insert and delete are a split and two merges.',
    topics: ['Data_Structures/Non_Linear/Trees/Treap', 'Data_Structures/Non_Linear/Trees'],
  },
  {
    id: 'cartesian-tree',
    title: 'Cartesian Tree',
    group: 'Trees',
    blurb: 'Build from an array in O(n) with a stack of the right spine, then answer range minimums by walking to the LCA.',
    topics: ['Data_Structures/Non_Linear/Trees/Cartesian_Tree'],
  },
  {
    id: 'interval-tree',
    title: 'Interval Tree',
    group: 'Trees',
    blurb: 'A BST on low ends with each subtree\'s max high: overlap queries skip every subtree that ends too early.',
    topics: ['Data_Structures/Non_Linear/Trees/Interval_Tree'],
  },
];

export const loaders: Record<string, () => Promise<AnyVizSpec>> = {
  bst: () => import('../specs/tree').then((m) => m.bst),
  avl: () => import('../specs/tree').then((m) => m.avl),
  'binary-tree-traversals': () => import('../specs/binaryTrees').then((m) => m.binaryTreeSpec),
  'red-black-tree': () => import('../specs/binaryTrees').then((m) => m.redBlackSpec),
  'splay-tree': () => import('../specs/binaryTrees').then((m) => m.splaySpec),
  treap: () => import('../specs/binaryTrees').then((m) => m.treapSpec),
  'cartesian-tree': () => import('../specs/binaryTrees').then((m) => m.cartesianSpec),
  'interval-tree': () => import('../specs/binaryTrees').then((m) => m.intervalSpec),
};
