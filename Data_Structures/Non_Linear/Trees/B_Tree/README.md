# B-Tree

A B-tree is a balanced search tree whose nodes hold many sorted keys, so the tree stays very shallow. Search, insert and delete take O(log n) comparisons and only O(log<sub>t</sub> n) node visits, which is what matters when a node is a disk page.

## Intuition

A binary search tree asks one question per node: left or right. A B-tree node holds up to `2t - 1` sorted keys, so one visit asks "which of these `2t` ranges?" and the tree is about log<sub>t</sub> n levels deep instead of log<sub>2</sub> n. When reading a node is expensive (a disk block), few visits is what you want.

Invariants for minimum degree `t >= 2`:

- A node with `k` keys has `k + 1` children, separated by the keys.
- Every node except the root has between `t - 1` and `2t - 1` keys; the root has 1 to `2t - 1` (0 when empty).
- All leaves are at the same depth.

Every node stores real keys, internal nodes included. (A B+ tree keeps data only in the leaves; see [B+ Tree](../B_Plus_Tree/README.md).) The default here is `t = 3`: 2 to 5 keys per node. Height is at most log<sub>t</sub>((n + 1) / 2).

## Visual

A `t = 2` tree (1 to 3 keys per node):

```text
              [ 20 | 40 ]
             /     |     \
      [ 5 | 10 ] [25|30|35] [50|60|70]
```

Search for 30: 30 > 20 and 30 < 40, so take the middle child; found as its second key.

## Operations

| Operation | What it does | Time |
| --------- | ------------ | ---- |
| `search(key)` | descend, choosing the child between two neighbouring keys | O(log n) |
| `insert(key)` | one downward pass; a full node is split before the pass enters it | O(log n) |
| `delete(key)` | one downward pass; a minimal node is topped up or merged before the pass enters it | O(log n) |
| `traverse()` | in-order walk, returns all keys sorted | O(n) |

### Insert: split on the way down

A full node (`2t - 1` keys) is split around its median before the descent enters it: the halves become two siblings and the median moves up into the parent, which is therefore never full. The leaf that finally receives the key always has room. Only a root split adds a level, and it deepens every leaf at once.

### Delete: never enter a minimal node

Before descending into a child with only `t - 1` keys, the code fixes it. The three cases:

1. Key in a leaf: remove it.
2. Key in an internal node: if the left child has more than `t - 1` keys, replace the key with its predecessor and delete that below; else if the right child has spare keys, use the successor; else merge both children and the key, and continue inside the merged node.
3. Key not in this node: if the child to enter is minimal, borrow a key through the parent from a sibling with spare keys (left first, then right); otherwise merge with a sibling (the right one, or the left one for the last child).

If the root ends up empty, its only child becomes the new root.

## Step-by-Step Trace

Insert `10, 20, 30, 40, 50, 60` into an empty `t = 2` tree, then delete `10`.

| Step | Tree after the step | Note |
| ---- | ------------------- | ---- |
| insert 10, 20, 30 | `[10 20 30]` | root is full |
| insert 40 | `[20]` over `[10]`, `[30 40]` | root split, 20 promoted |
| insert 50 | `[20]` over `[10]`, `[30 40 50]` | |
| insert 60 | `[20 40]` over `[10]`, `[30]`, `[50 60]` | leaf split, 40 promoted |
| delete 10 | `[40]` over `[20 30]`, `[50 60]` | `[10]` is minimal and `[30]` is minimal, so the two leaves merge around 20 and then 10 is removed; the root `[20 40]` drops to `[40]` |

(All steps were produced by running the Python implementation.)

## Complexity

| Operation | Node reads | Comparisons |
| --------- | ---------- | ----------- |
| search | O(log<sub>t</sub> n) | O(t log<sub>t</sub> n) |
| insert | O(log<sub>t</sub> n) | O(t log<sub>t</sub> n) |
| delete | O(log<sub>t</sub> n) | O(t log<sub>t</sub> n) |
| traverse | O(n / t) | O(n) |

The code scans each node linearly, hence the factor `t`. A split or a merge costs O(t) and happens at most once per level. Space is O(n).

## When to Use

- Data on disk or in large blocks, where node reads dominate.
- Ordered in-memory maps with a large `t`, where wide nodes beat pointer chasing.
- Not needed for small in-memory sets: an AVL or red-black tree is simpler, and a hash table is faster when you only need exact lookups.

## B-Tree vs. Alternatives

| Structure | Height | Best when |
| --------- | ------ | --------- |
| B-tree | O(log<sub>t</sub> n) | data lives on disk |
| B+ tree | O(log<sub>t</sub> n) | range scans and database indexes |
| AVL / red-black | O(log<sub>2</sub> n) | in-memory ordered sets |
| Hash table | n/a | exact lookups, no order |

## Common Pitfalls

- Splitting after the insert instead of before the descent; the one-pass algorithm needs a non-full parent.
- Merging a middle child with its left sibling and then descending at the old index. The last child merges left; any other child merges right. (This was a real bug in the Python version: the delete went into the wrong subtree and left the key in place.)
- Forgetting to replace an empty root by its only child.
- Reading `t` as the maximum: it is the minimum degree, a node has at most `2t - 1` keys.
- Duplicates: `insert` stores a second copy; `delete` removes one copy.

## Implementations

| Language | Folder | Main file | Notes |
| -------- | ------ | --------- | ----- |
| Python | `Python/` | `b_tree.py` | `search` returns `(node, index)` or `None`; `delete` returns nothing |
| C++ | `C++/` | `b_tree.cpp` | `search` returns bool, `remove` returns bool, `traverse` and `validate`; owns its nodes, not copyable |
| Go | `Go/` | `main.go` | `Search` bool, `Delete` bool, `Traverse`; package `main` with a small demo |

All three have the same algorithms and are tested against a set or sorted list on thousands of random operations, with a check of fill bounds, key order and leaf depth.

## Practice Problems

- [Search Insert Position (LeetCode 35)](https://leetcode.com/problems/search-insert-position/) (the search inside one node)
- [Distinct Numbers (CSES 1621)](https://cses.fi/problemset/task/1621) (set semantics)
- [My Calendar I (LeetCode 729)](https://leetcode.com/problems/my-calendar-i/) (predecessor and successor)
- [Contains Duplicate III (LeetCode 220)](https://leetcode.com/problems/contains-duplicate-iii/) (insert, delete and successor on a sliding window)
- Add a `range_search(lo, hi)` on top of the tree and compare it with the B+ tree leaf scan in [B+ Tree](../B_Plus_Tree/README.md).
- Make `insert` ignore existing keys (set semantics) and extend the random test to check it.
- Add a `min()` / `max()` and a `predecessor(key)` query using only node descents.
- Replace the linear in-node scan by binary search and measure the comparison count.

## Related

- [B+ Tree](../B_Plus_Tree/README.md)
- [AVL Tree](../AVL_Tree/README.md)
- [Red-Black Tree](../Red_Black_Tree/README.md)
- [Binary Search Tree](../Binary_Search_Tree/README.md)
