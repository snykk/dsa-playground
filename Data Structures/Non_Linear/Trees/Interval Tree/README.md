# Interval Tree

An interval tree stores closed intervals `[low, high]` in a binary search tree ordered by `low`, and keeps in every node the largest `high` of its subtree. That `max` lets an overlap query skip subtrees that cannot match. In this repository the tree is not self-balancing: insert and delete cost O(h), where h is the height.

## Intuition

To find the stored intervals that overlap a query `q`, a plain BST on `low` is not enough: an interval far to the left can still reach `q`. Storing `max` (the largest `high` below a node) fixes that. If `left.max < q.low`, nothing in the left subtree reaches `q` and the whole subtree is skipped. On the right side, every interval has `low >= node.low`, so if `node.low > q.high` nothing there can start early enough.

Two closed intervals overlap exactly when `a.high >= b.low` and `b.high >= a.low`; touching endpoints count.

## Visual

Intervals inserted in this order: `[15,20]`, `[10,30]`, `[17,19]`, `[5,20]`, `[12,15]`, `[30,40]`:

```text
               [15,20] max=40
              /               \
      [10,30] max=30        [17,19] max=40
      /           \                  \
 [5,20] max=20  [12,15] max=15      [30,40] max=40
```

Query `[22,26]` visits every node except `[5,20]` (its `max` 20 is below 22) and matches only `[10,30]`.

## Operations

| Operation | What it does | Time |
| --------- | ------------ | ---- |
| `insert(interval)` | walk down by `low` (equal lows go right), raising `max` on the path | O(h) |
| `search_overlapping(q)` | all intervals overlapping `q` | about O(h + k), O(n) worst case |
| `search_containing_point(x)` | overlap query with `[x, x]` | same |
| `search_contained_in(q)` | intervals lying fully inside `q` | same |
| `delete(interval)` | remove one equal interval, recompute `max` on the way back up | O(h) |
| `inorder_traversal()`, `size()` | all intervals sorted by `low`; count | O(n) |

### Overlap query rules

1. If the node's interval overlaps `q`, report it.
2. Visit the left subtree only if `left.max >= q.low`.
3. Visit the right subtree only if `node.low <= q.high`.

### Delete

Find the node by `low` (equal lows are on the right, so keep going right until `high` matches too). A node with at most one child is replaced by that child; with two children it takes the in-order successor's interval (smallest in the right subtree). Recompute `max` on every node along the way back up.

## Step-by-Step Trace

Query `[14,16]` on the tree above:

| Step | Node | Overlaps? | Next |
| ---- | ---- | --------- | ---- |
| 1 | `[15,20]` | yes (15 <= 16 and 20 >= 14) | left.max 30 >= 14: go left; node.low 15 <= 16: go right later |
| 2 | `[10,30]` | yes | left.max 20 >= 14: go left; 10 <= 16: go right |
| 3 | `[5,20]` | yes | leaf |
| 4 | `[12,15]` | yes | leaf |
| 5 | `[17,19]` | no (17 > 16) | no left child; right child skipped because 17 > 16 |

Result, in visit order: `[15,20]`, `[10,30]`, `[5,20]`, `[12,15]`. (All traces come from running the Python implementation.)

## Complexity

| Operation | Time | Why |
| --------- | ---- | --- |
| insert, delete | O(h) | one root-to-leaf path (plus one path to the successor on delete) |
| overlap query | O(h + k) typical, O(n) worst | the prune rules are sufficient, not exact: a subtree with a large `max` may be entered and hold no match |
| space | O(n) | one node per interval |

The height h is about log n for random input and up to n for input sorted by `low`, where the tree becomes a chain. The code is recursive, so a very deep tree also risks a stack overflow (Python raises `RecursionError` near its default limit of 1000).

## When to Use

- A dynamic set of intervals with overlap, point or containment queries.
- Not for static data (sort and sweep, or a segment tree, is simpler), and not when you need worst-case guarantees unless you build the same augmentation on a balanced tree.

## Interval Tree vs. Alternatives

| Approach | Insert | Overlap query | Notes |
| -------- | ------ | ------------- | ----- |
| Augmented BST (this code) | O(h) | about O(h + k) | dynamic, unbalanced |
| Sorted list | O(n) | O(n) | simplest |
| Segment tree | static | O(log n + k) | fixed coordinate range |
| Sort and sweep | offline | O(n log n) total | all intervals known upfront |

## Common Pitfalls

- Not updating `max` after an insert or delete: stale values hide matches.
- Pruning left with `node.low` instead of `left.max >= q.low`.
- Mixing closed and half-open intervals: this code is closed, so `[1,5]` and `[5,9]` overlap.
- Assuming balance: sorted input creates a chain.
- Reversed intervals: Python raises `ValueError`; C++ and Go swap the bounds silently.

## Implementations

| Language | Folder | Main file | Notes |
| -------- | ------ | --------- | ----- |
| Python | `Python/` | `interval_tree.py` | accepts `Interval` objects or `(low, high)` tuples |
| C++ | `C++/` | `interval_tree.cpp` | `remove`, `searchContainedIn`, `inorderTraversal`, `size`, `validateMax`; frees nodes, not copyable |
| Go | `Go/` | `main.go` | `Delete`, `SearchContainedIn`, `InorderTraversal`, `Size`; small demo `main` |

## Practice Problems

- [LeetCode 729: My Calendar I](https://leetcode.com/problems/my-calendar-i/)
- [LeetCode 731: My Calendar II](https://leetcode.com/problems/my-calendar-ii/)
- [LeetCode 56: Merge Intervals](https://leetcode.com/problems/merge-intervals/)
- [LeetCode 57: Insert Interval](https://leetcode.com/problems/insert-interval/)
- [LeetCode 253: Meeting Rooms II](https://leetcode.com/problems/meeting-rooms-ii/)

## Related

- [Segment Tree](../Segment%20Tree/README.md)
- [AVL Tree](../AVL%20Tree/README.md)
- [Binary Search Tree](../Binary%20Search%20Tree/README.md)
