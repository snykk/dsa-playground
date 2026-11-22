# Segment Tree

A segment tree stores the sum of every power-of-two-aligned block of an array in a complete binary tree, so any range sum is assembled from O(log n) precomputed blocks. This repository implements the compact bottom-up layout: range sum, point assignment, O(log n) each.

## Intuition

Imagine the array as the leaves of a perfect binary tree. Every inner node holds the sum of the leaves below it, so the root is the total and a node one level above the leaves is the sum of two neighbours. A range `[l, r]` is a union of a few of these blocks, at most two per level, because only the two ends of the range can force a block to be split.

The array is padded with zeros to a power of two (`size`) so the tree is perfect; 0 is the identity of addition, so padding changes no sums. The tree is stored in one array of length `2 * size`: root at index 1, children of `i` at `2i` and `2i + 1`, leaves at `size + i`.

## Visual

For `[1, 3, 5, 7, 9, 11]` (size 8; array positions in brackets):

```text
                    [1] 36
              /                \
        [2] 16                [3] 20
        /      \              /      \
    [4] 4    [5] 12      [6] 20    [7] 0
    /   \     /   \      /   \     /   \
 [8]1 [9]3 [10]5 [11]7 [12]9 [13]11 [14]0 [15]0
```

## Operations

| Operation | What it does | Time |
| --------- | ------------ | ---- |
| `SegmentTree(arr)` | copy into the leaves, fill parents from `size - 1` down to 1 | O(n) |
| `update(i, value)` | assign `value` to element `i`, recompute its ancestors | O(log n) |
| `query(l, r)` | sum of elements `l..r`, inclusive | O(log n) |
| `get(i)` | read element `i` | O(1) |

Indices are 0-based. An index outside `0..n-1`, or `l > r`, is an error: `IndexError` in Python, `std::out_of_range` in C++, a panic in Go. The code is sum-only (no min or max) and has no range update; see [Segment Tree (Lazy Propagation)](../Segment_Tree_Lazy_Propagation/README.md).

### Query

Set `l += size`, `r += size`. While `l <= r`: if `l` is odd, add `tree[l]` and do `l += 1`; if `r` is even, add `tree[r]` and do `r -= 1`; then `l //= 2`, `r //= 2`.

### Update

Set `tree[size + i] = value`, then for each ancestor `i = (size + i) / 2, ..., 1`, set `tree[i] = tree[2i] + tree[2i + 1]`.

## Step-by-Step Trace

`query(1, 4)` on `[1, 3, 5, 7, 9, 11]` (size 8). The answer is 3 + 5 + 7 + 9 = 24.

| Level | l | r | Action | Sum |
| ----- | - | - | ------ | --- |
| leaves | 9 | 12 | l odd: add `tree[9]` = 3, l = 10; r even: add `tree[12]` = 9, r = 11 | 12 |
| halve | 5 | 5 | l odd: add `tree[5]` = 12, l = 6; r odd: nothing | 24 |
| halve | 3 | 2 | l > r: stop | 24 |

`update(2, 10)`: leaf 10 becomes 10; node 5 = 10 + 7 = 17; node 2 = 4 + 17 = 21; node 1 = 21 + 20 = 41 (the old total 36 plus 5).

## Complexity

| Operation | Time | Why |
| --------- | ---- | --- |
| build | O(n) | each of the `size - 1` internal nodes is computed once |
| update | O(log n) | one node per level on the leaf-to-root path |
| query | O(log n) | at most two nodes per level, one per boundary |
| space | O(n) | `2 * size` cells, always under `4n` |

## When to Use

- Range sums with point updates, when you may later need another associative operation (min, max, gcd) or range updates.
- Not when the array never changes (prefix sums or a sparse table are faster), and not when only sums with updates are needed and memory matters (a [Fenwick Tree](../Fenwick_Tree/README.md) is smaller and shorter).

## Segment Tree vs. Alternatives

| Structure | Update | Range query | Notes |
| --------- | ------ | ----------- | ----- |
| Segment tree | O(log n) | O(log n) | any associative operation |
| Fenwick tree | O(log n) | O(log n) | needs an invertible operation |
| Sparse table | static | O(1) for min and max | no updates |
| Prefix sums | O(n) | O(1) | static data |

## Common Pitfalls

- Negative indices: in Python they would read internal nodes, so the code raises `IndexError`.
- `update` assigns; it does not add a delta.
- Using `size` instead of `n` as the upper bound: padded leaves are not valid indices.
- Sizing a recursive tree `2n`: it needs about `4n`; the padded layout here uses `2 * size`.
- `int` overflow in C++: the sums are `long long`. Python integers do not overflow and Go uses 64-bit `int`.

## Implementations

| Language | Folder | Main file | Notes |
| -------- | ------ | --------- | ----- |
| Python | `Python/` | `segment_tree.py` | `IndexError` on bad indices |
| C++ | `C++/` | `segment_tree.cpp` | `long long` sums, `std::out_of_range`, accepts `const vector<int>&` |
| Go | `Go/` | `main.go` | `int` sums, panics on bad indices |

## Practice Problems

- [Range Sum Query - Mutable (LeetCode 307)](https://leetcode.com/problems/range-sum-query-mutable/)
- [Dynamic Range Sum Queries (CSES 1648)](https://cses.fi/problemset/task/1648)
- [Dynamic Range Minimum Queries (CSES 1649)](https://cses.fi/problemset/task/1649) (change the combine to min)
- [Xenia and Bit Operations (Codeforces 339D)](https://codeforces.com/problemset/problem/339/D)
- [Hotel Queries (CSES 1143)](https://cses.fi/problemset/task/1143) (descend to the first large enough leaf)

## Related

- [Segment Tree (Lazy Propagation)](../Segment_Tree_Lazy_Propagation/README.md)
- [Fenwick Tree](../Fenwick_Tree/README.md)
- [Sparse Table](../Sparse_Table/README.md)
