# Red-Black Tree

A red-black tree is a binary search tree whose nodes are colored red or black. Five color rules keep the tree roughly balanced, so search and insert run in O(log n) in the worst case, with at most two rotations per insert. This folder implements insert, search and traversals (there is no delete).

## Intuition

A plain BST turns into a linked list on sorted input. A red-black tree stops that by tracking one extra bit per node and repairing the tree after every insert. The rules:

1. Every node is red or black.
2. The root is black.
3. Every NIL leaf (empty child) is black.
4. A red node has only black children (no two reds in a row).
5. Every path from a node to a NIL leaf has the same number of black nodes (its black height).

Rule 5 fixes the number of black nodes on every path, and rule 4 means red nodes can be at most every other node. So the longest path is at most twice the shortest, and the height is at most 2 log<sub>2</sub>(n + 1). A subtree of black height bh has at least 2^bh - 1 nodes, which gives the bound.

## Visual

The tree built by inserting 10, 20, 30, 40, 50, 25 (R = red, B = black):

```text
              20B
            /     \
         10B       40R
                  /   \
               30B     50B
               /
            25R
```

Every root-to-NIL path has exactly two black nodes (20B-10B, 20B-40R-30B-25R and 20B-40R-50B), and no red node has a red child.

A left rotation on x (A, B, C are subtrees; their order is preserved):

```text
    x                  y
   / \                / \
  A   y      -->     x   C
     / \            / \
    B   C          A   B
```

## Operations

| Operation | Description | Time |
| --------- | ----------- | ---- |
| `insert(x)` | BST insert as a red node, then fix-up | O(log n) |
| `search(x)` | walk down by comparisons | O(log n) |
| inorder traversal | sorted keys | O(n) |
| `size()`, `is_empty()` | count nodes, or test for the sentinel root | O(n), O(1) |
| `height()`, `find_min()`, `find_max()` | Python only; `height()` counts nodes (empty tree 0, one node 1) | O(n), O(log n), O(log n) |

### Insert fix-up

The new node is red. While its parent is red, look at the uncle (the parent's sibling):

1. **Uncle red:** recolor parent and uncle black, grandparent red, and continue from the grandparent.
2. **Uncle black, node is an inner child (triangle):** rotate at the parent so the node becomes the outer child, then apply case 3.
3. **Uncle black, node is an outer child (line):** recolor the parent black and the grandparent red, then rotate at the grandparent. Done.

Finally, color the root black. Case 1 only recolors and may repeat up the tree. Cases 2 and 3 happen at most once, so an insert does at most two rotations.

### Delete

Not implemented in Python, C++ or Go. Delete needs a "double black" fix-up (four cases plus mirrors) and is outside what this folder covers.

## Step-by-Step Trace

Inserting 10, 20, 30, 40, 50, 25 (output of the Python implementation, level by level, `-` is NIL):

| Insert | Resulting tree | What happened |
| ------ | -------------- | ------------- |
| 10 | 10B | root recolored black |
| 20 | 10B / - 20R | red child of black parent, nothing to fix |
| 30 | 20B / 10R 30R | line case: rotate left at 10, recolor |
| 40 | 20B / 10B 30B / 40R | uncle 10 red: recolor, root stays black |
| 50 | 20B / 10B 40B / 30R 50R | line case under 30: rotate left at 30, recolor |
| 25 | 20B / 10B 40R / 30B 50B / 25R | uncle 50 red: recolor, 40 becomes red |

## Complexity

| Operation | Time | Space |
| --------- | ---- | ----- |
| search | O(log n) | O(log n) recursion in the implementations |
| insert | O(log n) | O(1) extra (iterative) |
| traversal, size | O(n) | O(log n) recursion |

All logarithmic bounds come from the height bound h <= 2 log<sub>2</sub>(n + 1).

## When to Use

- You need worst-case O(log n) lookups and updates plus sorted iteration.
- Updates are frequent: red-black trees rebalance with few rotations.
- Not the best choice if you only look up (an AVL tree is a bit shallower), or if you need simple code (a treap or skip list is shorter).

## Red-Black Tree vs. Alternatives

| Structure | Height | Insert rebalancing | Notes |
| --------- | ------ | ------------------ | ----- |
| Red-black tree | at most 2 log2(n+1) | at most 2 rotations | delete needs at most 3 rotations |
| AVL tree | at most about 1.44 log2(n+2) | at most 1 single or double rotation | delete may rotate O(log n) times |
| Splay tree | amortized only | rotates on every access | no balance data |
| Treap | expected O(log n) | randomized | simple split/merge code |

## Common Pitfalls

- Inserting new nodes black instead of red.
- Stopping the fix-up after one recolor: the grandparent may now violate rule 4.
- Forgetting to recolor the root black at the end.
- Writing the mirrored (right-parent) case with the wrong rotation direction.
- Assuming delete exists: this folder has no delete.
- Duplicates: they are inserted as extra nodes (multiset behavior), and `search` only tells you if one exists.

## Implementations

| Language | Folder | Main file | Notes |
| -------- | ------ | --------- | ----- |
| Python | [Python](Python/) | `red_black_tree.py` | also has `height`, `find_min`, `find_max` |
| C++ | [C++](C++/) | `red_black_tree.cpp` | copying deleted; `isValid()` checks the rules |
| Go | [Go](Go/) | `main.go` | `checkInvariants()` helper used by tests |

## Practice Problems

- [Validate Binary Search Tree (LeetCode 98)](https://leetcode.com/problems/validate-binary-search-tree/)
- [Kth Smallest Element in a BST (LeetCode 230)](https://leetcode.com/problems/kth-smallest-element-in-a-bst/)
- [My Calendar I (LeetCode 729)](https://leetcode.com/problems/my-calendar-i/) (insert-only ordered set)
- [Contains Duplicate III (LeetCode 220)](https://leetcode.com/problems/contains-duplicate-iii/) (ordered set)
- [Sliding Window Median (CSES 1076)](https://cses.fi/problemset/task/1076) (ordered multiset)

## Related

- [AVL Tree](../AVL_Tree/)
- [Splay Tree](../Splay_Tree/)
- [Treap](../Treap/)
- [Binary Search Tree](../Binary_Search_Tree/)
- [B-Tree](../B_Tree/)
