# Binary Tree

A binary tree is a hierarchy in which every node has at most two children, a left one and a right one. It carries no ordering rule: that is what separates it from a binary search tree.

## Intuition

Picture a family tree where everyone has at most two children, or a file of nested yes/no decisions. Each node owns two smaller trees, so almost every algorithm on it is a short recursion: handle this node, then ask the left and right subtrees to do the same.

**Invariant:** the structure is just "root + left subtree + right subtree"; the tree in this repository is additionally always **complete** (every level full except possibly the last, filled left to right) because `insert` places each value in the first free slot in level order. So its height is floor(log2 n).

Height is counted in edges: an empty tree is -1, a single node 0.

## Visual

```text
        1            in-order    4 2 5 1 6 3 7
      /   \          pre-order   1 2 4 5 3 6 7
     2     3         post-order  4 5 2 6 7 3 1
    / \   / \        level-order 1 2 3 4 5 6 7
   4   5 6   7
```

## How It Works / Operations

| Operation | Description | Time |
|-----------|-------------|------|
| `insert(x)` | breadth-first search for the first node with a free child, attach there | O(n) |
| `search(x)` | node, then left subtree, then right subtree | O(n) |
| `inorder`, `preorder`, `postorder` | recursive depth-first traversals | O(n) |
| `level_order` | queue-based breadth-first traversal | O(n) |
| `height()`, `size()` | visit every node | O(n) |
| `is_empty()` | check the root | O(1) |

The traversals differ only in when the node is visited: pre-order before its subtrees, in-order between them, post-order after them. In-order output is sorted only for a binary search tree. There is no delete, no iterative traversal and no build-from-traversals in any language.

## Step-by-Step Trace

In-order on the 7-node tree: node 1 calls node 2, which calls leaf 4 (emit 4). Node 2 emits itself (2), then goes right to leaf 5 (emit 5). Node 2 returns, node 1 emits itself (1) and goes right: 6, 3, 7.

| Step | Output so far |
|------|---------------|
| emit 4 | 4 |
| emit 2 | 4 2 |
| emit 5 | 4 2 5 |
| emit 1 | 4 2 5 1 |
| right subtree | 4 2 5 1 6 3 7 |

Insert 6 into `[1, 2, 3, 4, 5]`: node 1 has two children (queue 2, 3), node 2 has two children (queue 3, 4, 5), node 3 has a free left slot, so 6 becomes the left child of 3.

## Complexity

| Operation | Time | Extra space |
|-----------|------|-------------|
| insert | O(n) | O(n) queue |
| search | O(n) | O(h) |
| DFS traversal | O(n) | O(h) stack |
| level-order | O(n) | O(n) queue (up to about n / 2 nodes) |
| height, size | O(n) | O(h) |

Here h = floor(log2 n) because of level-order insertion. A chain would have h = n - 1.

## When to Use

Use a plain binary tree to model hierarchy (expression trees, parse trees, decision trees) and as the base for other trees. Do not use it for lookups by value: search is O(n). Add ordering (BST) for lookups or a heap rule for priorities.

## Binary Tree vs. Alternatives

| Structure | Order | Search | Best for |
|-----------|-------|--------|----------|
| Binary tree | none | O(n) | hierarchy, expression trees |
| [Binary Search Tree](../Binary%20Search%20Tree/README.md) | sorted by key | O(h) | ordered lookups |
| [Min Heap](../../Heaps/Min%20Heap/README.md) | parent vs children | O(n) | priority queue |
| Array | by index | O(n) | compact sequences |

## Common Pitfalls

- Calling in-order output sorted; that holds only for a BST.
- Mixing height in edges (empty = -1) with height in nodes (empty = 0).
- Quoting O(h) space for level-order; the queue can hold a whole level.
- Recursing on a skewed tree; very deep chains overflow stacks (not an issue for this complete tree).
- Expecting insert to keep search order; it fills slots in level order and ignores key values.

## Implementations

- [Python](Python/README.md)
- [C++](C++/README.md)
- [Go](Go/README.md)

Tree kinds: full (0 or 2 children), complete (filled left to right), perfect (all leaves at one depth, 2^(h+1) - 1 nodes), balanced (subtree heights differ by at most 1 everywhere).

## Practice Problems

- LeetCode 94, Binary Tree Inorder Traversal.
- LeetCode 144, Binary Tree Preorder Traversal.
- LeetCode 145, Binary Tree Postorder Traversal.
- LeetCode 102, Binary Tree Level Order Traversal.
- LeetCode 104, Maximum Depth of Binary Tree.
- LeetCode 226, Invert Binary Tree.

## Related

- [Binary Search Tree](../Binary%20Search%20Tree/README.md): a binary tree with an ordering rule.
- [AVL Tree](../AVL%20Tree/README.md): a self-balancing BST.
- [Min Heap](../../Heaps/Min%20Heap/README.md): a complete binary tree with the heap rule, stored in an array.
- [Cartesian Tree](../Cartesian%20Tree/README.md): a binary tree built from an array.
