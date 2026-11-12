# Splay Tree

A splay tree is a binary search tree that moves every accessed node to the root by rotations ("splaying"). It stores no balance information, and search, insert and delete are O(log n) amortized (a single operation can take O(n)).

## Intuition

Keep recently used keys near the top. Every access ends by rotating the touched node to the root, and the rotations also roughly halve the depth of the nodes on the access path. A long path is therefore expensive once and mostly repaired afterwards.

Because of that, the guarantee is amortized: over any sequence of m operations the total cost is O((m + n) log n), but one operation may cost O(n). The proof (Sleator and Tarjan's access lemma) uses the potential function "sum over nodes of log2(subtree size)": a splay costs at most 3 log2 n + 1 amortized. The bound needs every access to splay, including failed searches and failed deletes.

## Visual

The three splay cases (x is the accessed node, A..D are subtrees):

```text
Zig (parent is the root)          Zig-zig (same direction)
     y                x                 z                 x
    / \              / \               / \               / \
   x   C    -->     A   y             y   D     -->     A   y
  / \                  / \           / \                   / \
 A   B                B   C         x   C                 B   z
                                   / \                       / \
                                  A   B                     C   D

Zig-zag (opposite directions)
     z                  x
    / \                / \
   y   D     -->      y   z
  / \                / \ / \
 A   x              A  B C  D
    / \
   B   C
```

## Operations

| Operation | What it does | Time |
| --------- | ------------ | ---- |
| `insert(key, value)` | BST insert, splay the new node; an existing key has its value overwritten and is splayed | O(log n) amortized |
| `search(key)` | find the key and splay it; on a miss splay the last visited node | O(log n) amortized |
| `delete(key)` | splay the key, split off both subtrees, join them; on a miss splay the last visited node | O(log n) amortized |
| `find_min()`, `find_max()` | walk to the end of a spine and splay it | O(log n) amortized |
| `inorder_traversal()`, `size()` | iterative | O(n) |

### Splay step

While the node has a parent, look at it, its parent p and its grandparent g:

- Zig: p is the root. Rotate at p.
- Zig-zig: node and p are both left (or both right) children. Rotate at g first, then at p.
- Zig-zag: they are opposite children. Rotate at p, then at g.

### Delete (split and join)

1. Splay the key to the root (if absent, splay the last visited node and return false).
2. Detach the left and right subtrees and clear their parent pointers.
3. If one side is empty, the other becomes the tree.
4. Otherwise splay the maximum of the left subtree to the top of that subtree. It has no right child, so attach the right subtree there.

## Step-by-Step Trace

Insert 1, 2, 3, then search for 1 (output of the Python code, level order, `-` is empty):

| Step | Tree (level order) | Note |
| ---- | ------------------ | ---- |
| insert 1 | 1 | |
| insert 2 | 2 / 1 - | zig: 2 splayed over 1 |
| insert 3 | 3 / 2 - / 1 - | zig: a left path |
| search 1 | 1 / - 2 / - 3 | zig-zig: rotate at 3, then at 2; 1 is the root |

Insert 50, 30, 70, 20, 40 gives root 40 with children 20 and 70 (30 under 20, 50 under 70). Searching 20 splays it to the root (zig), and then deleting 20 leaves 40 as the root with children 30 and 70.

## Complexity

| Operation | Amortized | Worst single operation |
| --------- | --------- | ---------------------- |
| search, insert, delete, min, max | O(log n) | O(n) |
| traversal, size | O(n) | O(n) |
| space | O(n), no recursion stack | |

## When to Use

- Access patterns are skewed or sequential, so the hot keys sit near the root.
- You want no balance fields and simple split/join logic.
- Avoid it when every single operation must be fast (real-time), when readers run concurrently (reads modify the tree), or when access is uniformly random (a red-black tree is usually faster).

## Splay Tree vs. Alternatives

| Structure | Guarantee | Extra data per node | Reads modify the tree |
| --------- | --------- | ------------------- | --------------------- |
| Splay tree | amortized O(log n) | none | yes |
| AVL tree | worst-case O(log n) | height | no |
| Red-black tree | worst-case O(log n) | 1 color bit | no |
| Treap | expected O(log n) | random priority | no |

## Common Pitfalls

- Not splaying on a miss: failed searches and deletes must splay the last visited node, or the amortized bound is lost.
- Leaving parent pointers dangling in delete: clear them on both detached subtrees before splaying inside the left one.
- Wrong zig-zig order: rotate the grandparent first.
- Recursive size or traversal on a path-shaped tree (sequential inserts make one) overflows the stack. The code here is iterative.
- Confusing amortized with average-case.

## Implementations

| Language | Folder | Main file | Notes |
| -------- | ------ | --------- | ----- |
| Python | [Python](Python/) | `splay_tree.py` | values of any type; `None` for a miss or an empty tree |
| C++ | [C++](C++/) | `splay_tree.cpp` | `std::string` values; copying deleted; `findMin` returns `-1` on an empty tree |
| Go | [Go](Go/) | `main.go` | `string` values; `Search` returns `(value, found)` |

## Practice Problems

- [LeetCode 706: Design HashMap](https://leetcode.com/problems/design-hashmap/) (any ordered map can be swapped in)
- [LeetCode 981: Time Based Key-Value Store](https://leetcode.com/problems/time-based-key-value-store/) (ordered lookup by key)
- [CSES: Sliding Window Median](https://cses.fi/problemset/task/1076) (ordered multiset)

## Related

- [Binary Search Tree](../Binary%20Search%20Tree/)
- [AVL Tree](../AVL%20Tree/)
- [Red-Black Tree](../Red-Black%20Tree/)
- [Treap](../Treap/)

## References

- Sleator and Tarjan, "Self-Adjusting Binary Search Trees", Journal of the ACM, 1985.
