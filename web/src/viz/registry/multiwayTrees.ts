/** Visualization registry: multiway and string trees (B-Tree, B+ Tree, Trie, Suffix Tree), drawn with MultiwayTreeView. */
import type { AnyVizSpec } from '../core/types';
import type { VizInfo } from '../catalog';

const T = 'Data_Structures/Non_Linear/Trees';

export const entries: VizInfo[] = [
  {
    id: 'b-tree',
    title: 'B-Tree',
    group: 'Trees',
    blurb: 'Nodes of t - 1 to 2t - 1 keys: full nodes split on the way down, and delete borrows or merges before it descends.',
    topics: [`${T}/B_Tree`, T],
  },
  {
    id: 'b-plus-tree',
    title: 'B+ Tree',
    group: 'Trees',
    blurb: 'Values live in linked leaves: a leaf split copies a key up, an internal split pushes one up, and a range query walks next.',
    topics: [`${T}/B_Plus_Tree`],
  },
  {
    id: 'trie',
    title: 'Trie',
    group: 'Trees',
    blurb: 'One character per edge and an end-of-word flag: insert, search, prefix search, and a delete that prunes back up.',
    topics: [`${T}/Trie`],
  },
  {
    id: 'suffix-tree',
    title: 'Suffix Tree',
    group: 'Trees',
    blurb: 'Insert every suffix of the text, splitting edges where they diverge; a search collects the leaves below the pattern.',
    topics: [`${T}/Suffix_Tree`],
  },
];

export const loaders: Record<string, () => Promise<AnyVizSpec>> = {
  'b-tree': () => import('../specs/multiwayTrees').then((m) => m.bTreeSpec),
  'b-plus-tree': () => import('../specs/multiwayTrees').then((m) => m.bPlusTreeSpec),
  trie: () => import('../specs/multiwayTrees').then((m) => m.trieSpec),
  'suffix-tree': () => import('../specs/multiwayTrees').then((m) => m.suffixTreeSpec),
};
