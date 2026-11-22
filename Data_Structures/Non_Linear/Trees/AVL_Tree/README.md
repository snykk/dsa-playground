# AVL Tree

An AVL tree is a binary search tree that rebalances itself with rotations so that, for every node, the heights of its two subtrees differ by at most 1. Search, insert and delete are therefore O(log n) in the worst case, not just on average.

## Intuition

A plain BST is only as good as the order its keys arrive in: sorted input builds a chain and every operation becomes O(n). The AVL tree repairs the shape after every change. It stores a height in each node, and when an insert or delete makes some node lean two levels to one side, a small local rotation lifts the heavier child above its parent. The search order is untouched, but the tree gets shorter.

**Invariant:** for every node, `balance factor = height(left) - height(right)` is -1, 0 or +1. A tree of height h then holds at least N(h) = N(h-1) + N(h-2) + 1 nodes (a Fibonacci-like recurrence, exponential in h), so the height is at most about 1.44 log2(n + 2).

In this repository a leaf has height 1 and an empty subtree has height 0. Duplicates are ignored.

## Visual

```text
Right rotation at z (left-left case)

        z  (bf +2)                  y
       / \                        /   \
      y   T3        ==>          x     z
     / \                        / \   / \
    x   T2                     T0 T1 T2 T3
   / \
  T0  T1

T2 moves from y to z. Keys stay in order: T0 x T1 y T2 z T3.
```

## How It Works / Operations

Insert and delete work as in a plain BST, then walk back up the path, recompute each node's height and balance factor, and fix the first violation:

| Case | Condition | Fix |
|------|-----------|-----|
| Left-Left | bf > 1, left child bf >= 0 | rotate right at the node |
| Right-Right | bf < -1, right child bf <= 0 | rotate left at the node |
| Left-Right | bf > 1, left child bf < 0 | rotate left at the left child, then right at the node |
| Right-Left | bf < -1, right child bf > 0 | rotate right at the right child, then left at the node |

| Operation | Description | Time |
|-----------|-------------|------|
| `insert(x)` | BST insert, then rebalance on the way up; duplicates ignored | O(log n) |
| `search(x)` | walk down by comparison | O(log n) |
| `delete(x)` | BST delete (in-order successor for two children), then rebalance every ancestor | O(log n) |
| `find_min()`, `find_max()` | follow left or right links | O(log n) |
| `inorder_traversal()` | sorted output | O(n) |
| `height()`, `is_empty()` | read the root's stored height | O(1) |
| `size()`, `is_balanced()` | visit every node | O(n) |

Python also provides `preorder_traversal`, `postorder_traversal` and `level_order_traversal`. C++ and Go provide in-order only.

An insert needs at most one single or double rotation. A delete can shorten the subtree it fixes, so it may rotate on every level up to the root. When the heavy child has balance factor 0 (possible only after a delete), a single rotation is correct.

## Step-by-Step Trace

Insert 10, 20, 30, 40, 50, 25 (snapshots in level order, produced by the Python code):

| Insert | Tree after | Event |
|--------|-----------|-------|
| 10, 20 | 10, 20 | no rotation |
| 30 | 20, 10, 30 | 10 has bf -2, right-right: rotate left |
| 40 | 20, 10, 30, 40 | balanced |
| 50 | 20, 10, 40, 30, 50 | 30 has bf -2, right-right: rotate left |
| 25 | 30, 20, 40, 10, 25, 50 | 20 has bf -2, its right child 40 leans left: right-left double rotation |

Delete after inserting 2, 1, 3, 4: removing 1 leaves node 2 with an empty left side and a right subtree of height 2 (bf -2, right-right), so a left rotation at 2 gives `[3, 2, 4]`.

## Complexity

| Operation | Time | Notes |
|-----------|------|-------|
| search, insert, delete | O(log n) | one path of at most 1.44 log2(n + 2) nodes |
| rotation | O(1) | pointer changes and two height updates |
| traversals, `size`, `is_balanced` | O(n) | every node visited |

Space is O(n) for nodes plus O(log n) recursion stack (the height).

## When to Use

Use it for an ordered map or set with a worst-case guarantee, especially when lookups dominate. Prefer a Red-Black tree when updates dominate (fewer rotations per update), a hash table when no order is needed, and a B-Tree for disk-resident data.

## AVL Tree vs. Alternatives

| Structure | Search | Insert | Notes |
|-----------|--------|--------|-------|
| AVL tree | O(log n) | O(log n) | height at most 1.44 log2(n) |
| [Red-Black Tree](../Red_Black_Tree/README.md) | O(log n) | O(log n) | height up to 2 log2(n), fewer rotations on update |
| [Binary Search Tree](../Binary_Search_Tree/README.md) | O(n) worst | O(n) worst | no rebalancing |
| [Treap](../Treap/README.md) | O(log n) expected | O(log n) expected | randomized, split and merge |

Both AVL and Red-Black insert need at most one rotation case (single or double). The difference shows in delete: AVL may rotate O(log n) times, Red-Black at most 3.

## Common Pitfalls

- Update a node's height after its children changed and before computing its balance factor; in a rotation, update the lower node first.
- After a delete, choose the case from the heavy child's balance factor (0 means a single rotation), not from the deleted key.
- Keep walking to the root after a delete fix; a rotation can unbalance the parent.
- A test that reads the stored `height` cannot detect a stale height. The tests recompute heights from scratch.
- Heights here count nodes (leaf = 1); the Binary Search Tree folder counts edges (empty = -1). Do not mix them.

## Implementations

- [Python](Python/README.md)
- [C++](C++/README.md)
- [Go](Go/README.md)

The interactive visualization on the topic page animates insert, delete and every rotation.

## Practice Problems

- [Balanced Binary Tree (LeetCode 110)](https://leetcode.com/problems/balanced-binary-tree/) (check the AVL property)
- [Convert Sorted Array to Binary Search Tree (LeetCode 108)](https://leetcode.com/problems/convert-sorted-array-to-binary-search-tree/) (build a height-balanced tree)
- [Balance a Binary Search Tree (LeetCode 1382)](https://leetcode.com/problems/balance-a-binary-search-tree/)
- [Josephus Problem II (CSES 2163)](https://cses.fi/problemset/task/2163) (a balanced tree with subtree sizes)

## Related

- [Binary Search Tree](../Binary_Search_Tree/README.md): the unbalanced starting point.
- [Red-Black Tree](../Red_Black_Tree/README.md): a looser balance rule with cheaper updates.
- [Treap](../Treap/README.md): randomized balancing with split and merge.
- [Splay Tree](../Splay_Tree/README.md): amortized balancing by moving accessed keys to the root.
