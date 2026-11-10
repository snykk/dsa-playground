import { avlTrace, bstTrace, parseOps, type Op } from '../algorithms/tree';
import type { VizSpec } from '../core/types';
import { TreeView, type TreeState } from '../renderers/TreeView';

const HELP = 'Keys 0..999 separated by spaces: 42 inserts, -42 deletes, ?42 searches. Up to 30 operations.';

function randomOps(): string {
  const keys = new Set<number>();
  while (keys.size < 9) keys.add(1 + Math.floor(Math.random() * 98));
  const list = [...keys];
  const victim = list[Math.floor(Math.random() * list.length)];
  return `${list.join(' ')} -${victim} ?${list[0]}`;
}

export const bst: VizSpec<Op[], TreeState> = {
  id: 'bst',
  title: 'Binary Search Tree',
  inputKind: 'tree-ops',
  inputLabel: 'Operations',
  inputHelp: HELP,
  examples: [
    { label: 'Build + delete', value: '50 30 70 20 40 60 80 -30 ?60' },
    { label: 'Two-child delete', value: '50 30 70 60 80 65 -50' },
    { label: 'Sorted input (degenerates)', value: '10 20 30 40 50 60' },
    { label: 'Search miss', value: '40 20 60 10 30 ?35' },
  ],
  randomInput: randomOps,
  parse: (text) => parseOps(text),
  trace: bstTrace,
  render: (state) => <TreeView state={state} />,
  pseudocode: [
    'insert(k): start at the root and walk down:',
    '  k < node.key ? go left : go right      // equal: already present',
    '  attach k at the first empty spot',
    'search(k): walk down until node.key == k or the spot is empty',
    'delete(k): find the node z that holds k',
    '  z is a leaf: remove it',
    '  z has one child: splice that child into z\'s place',
    '  z has two children: find the successor (leftmost node of z.right)',
    '    the successor takes z\'s place',
  ],
  legend: [
    { role: 'active', label: 'current node' },
    { role: 'compare', label: 'path taken' },
    { role: 'done', label: 'inserted / moved' },
    { role: 'good', label: 'found (\u2713)' },
    { role: 'bad', label: 'being deleted (\u2715)' },
  ],
  complexity: { time: 'O(h): O(log n) if balanced, O(n) if degenerate', space: 'O(n)' },
};

export const avl: VizSpec<Op[], TreeState> = {
  id: 'avl',
  title: 'AVL Tree',
  inputKind: 'tree-ops',
  inputLabel: 'Operations',
  inputHelp: HELP,
  examples: [
    { label: 'Left-Left', value: '30 20 10' },
    { label: 'Left-Right', value: '30 10 20' },
    { label: 'Sorted input stays balanced', value: '10 20 30 40 50 60 70' },
    { label: 'Delete rebalances', value: '40 20 60 10 30 50 70 5 -50 -70' },
  ],
  randomInput: randomOps,
  parse: (text) => parseOps(text),
  trace: avlTrace,
  render: (state) => <TreeView state={state} />,
  pseudocode: [
    'insert / delete k as in a plain BST, then walk back up to the root:',
    '  height = 1 + max(h(left), h(right)); bf = h(left) - h(right)',
    '  if -1 <= bf <= 1: nothing to fix here',
    '  bf > 1  and bf(left) >= 0:  rotateRight(node)                         // Left-Left',
    '  bf < -1 and bf(right) <= 0: rotateLeft(node)                          // Right-Right',
    '  bf > 1  and bf(left) < 0:   rotateLeft(node.left); rotateRight(node)  // Left-Right',
    '  bf < -1 and bf(right) > 0:  rotateRight(node.right); rotateLeft(node) // Right-Left',
  ],
  legend: [
    { role: 'active', label: 'current node' },
    { role: 'compare', label: 'path / moved child' },
    { role: 'done', label: 'new subtree root' },
    { role: 'bad', label: 'unbalanced or deleted (\u2715)' },
    { role: 'good', label: 'found (\u2713)' },
  ],
  complexity: { time: 'O(log n) per operation', space: 'O(n)' },
};
