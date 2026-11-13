# Binary Search Tree

A binary search tree (BST) is a binary tree whose keys are ordered so that each comparison discards a whole subtree. Search, insert and delete cost O(h), where h is the height: O(log n) for a balanced tree, O(n) for a chain.

## Intuition

Think of a number-guessing game: you ask "is it smaller or larger than this?" and throw away one side. A BST stores that game in its shape. Every node splits the remaining keys into those smaller (left) and those larger (right).

**Invariant:** for every node, ALL keys in its left subtree are smaller and ALL keys in its right subtree are larger. Checking only the two children is not enough (a deeper descendant can be on the wrong side of an ancestor). A consequence: the in-order traversal is strictly increasing.

In this repository duplicates are ignored, and height is counted in edges (empty tree = -1, single node = 0; the AVL Tree folder counts nodes instead).

## Visual

```text
        50                 in-order: 20 30 40 50 60 70 80
      /    \
    30      70             search 60: 50 -> 70 -> 60   (3 steps, not 7)
   /  \    /  \            insert 65: 50 -> 70 -> 60 -> right child of 60
  20  40  60  80
```

## How It Works / Operations

| Operation | Description | Time |
|-----------|-------------|------|
| `insert(x)` | search for `x`, attach a new leaf where the search ends; duplicates ignored | O(h) |
| `search(x)` | go left if `x` is smaller, right if larger | O(h) |
| `delete(x)` | leaf: drop it; one child: splice the child in; two children: copy the in-order successor (smallest key of the right subtree) into the node and delete the successor | O(h) |
| `find_min()`, `find_max()` | follow left (right) links | O(h) |
| `inorder`, `preorder`, `postorder`, `level_order` | traversals | O(n) |
| `height()`, `size()` | visit every node | O(n) |
| `is_empty()` | check the root | O(1) |

## Step-by-Step Trace

Insert 50, 30, 70, 20, 40, 60, 80, then delete 20, 30 and 50 (level orders from the Python code):

| Step | Level order | Note |
|------|-------------|------|
| build | 50, 30, 70, 20, 40, 60, 80 | height 2 |
| delete 20 | 50, 30, 70, 40, 60, 80 | leaf |
| delete 30 | 50, 40, 70, 60, 80 | one child: 40 takes its place |
| delete 50 | 60, 40, 70, 80 | two children: successor 60 moves to the root |

Sorted insertion degenerates: inserting 10, 20, 30, 40, 50, 60 gives a chain of height 5.

## Complexity

| Case | Search / insert / delete | Shape |
|------|--------------------------|-------|
| Average (random order) | O(log n) | balanced-ish, height O(log n) |
| Worst | O(n) | sorted or reverse-sorted input: a chain |

Space is O(n) for nodes. The recursive C++ and Go versions use O(h) stack. The Python version is iterative, including all traversals, so a 5,000-node chain does not raise `RecursionError`.

## When to Use

Use it when you need ordered keys with insert and delete, and the input order is not adversarial: ordered sets in small programs, range queries, successor and predecessor lookups. When you need a worst-case guarantee, use a balanced variant. When you need no order, use a hash table.

## BST vs. Alternatives

| Structure | Search | Insert | Notes |
|-----------|--------|--------|-------|
| BST | O(log n) avg, O(n) worst | O(log n) avg, O(n) worst | ordered, simple |
| [AVL Tree](../AVL%20Tree/README.md) | O(log n) | O(log n) | strictly balanced by rotations |
| [Red-Black Tree](../Red-Black%20Tree/README.md) | O(log n) | O(log n) | looser balance, fewer rotations |
| [Treap](../Treap/README.md) | O(log n) expected | O(log n) expected | randomized priorities |
| [Splay Tree](../Splay%20Tree/README.md) | O(log n) amortized | O(log n) amortized | self-adjusting |
| Sorted array | O(log n) | O(n) | binary search, shifting on insert |
| Unsorted array | O(n) | O(1) append | no order |
| Hash table | O(1) avg | O(1) avg | no order |

B-Trees are not binary search trees; they hold many keys per node.

## Common Pitfalls

- Validating a BST by comparing each node only with its children. Pass (low, high) bounds down the tree, or check that the in-order output is increasing.
- Assuming O(log n). Sorted input gives a chain.
- Mixing duplicate policies. This code ignores duplicates; pick one policy and keep it.
- Two-child delete: replace with the in-order successor (or predecessor), then delete that node, which has at most one child.
- Recursion depth on a chain: a recursive version overflows on very deep trees (Python's limit is about 1,000 frames).

## Implementations

- [Python](Python/README.md): iterative operations and traversals.
- [C++](C++/README.md): raw pointers, not copyable.
- [Go](Go/README.md): idiomatic recursive version.

The topic page has an interactive visualization of insert, search and delete.

## Practice Problems

- LeetCode 98, Validate Binary Search Tree.
- LeetCode 700, Search in a Binary Search Tree.
- LeetCode 701, Insert into a Binary Search Tree.
- LeetCode 450, Delete Node in a BST.
- LeetCode 230, Kth Smallest Element in a BST.
- LeetCode 235, Lowest Common Ancestor of a Binary Search Tree.

## Related

- [Binary Tree](../Binary%20Tree/README.md): the shape without the ordering rule.
- [AVL Tree](../AVL%20Tree/README.md): a BST that keeps itself balanced.
- [Red-Black Tree](../Red-Black%20Tree/README.md), [Treap](../Treap/README.md), [Splay Tree](../Splay%20Tree/README.md): other ways to avoid the chain.
