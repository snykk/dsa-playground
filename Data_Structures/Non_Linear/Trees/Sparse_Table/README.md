# Sparse Table

A sparse table precomputes the minimum (or maximum) of every window whose length is a power of two. A range query is then the combination of two overlapping windows: O(1) per query, O(n log n) time and memory to build, and no updates. It is not a tree; it sits in this folder next to the other range-query structures.

## Intuition

Any length is covered by two windows of the largest power of two that fits inside it, one starting at the left end and one ending at the right end. If the table already stores the answer for every such window, a query is two lookups.

Overlap is harmless for minimum because `min(x, x) = x`. Operations with this property (idempotent: min, max, gcd, bitwise AND and OR) can use a sparse table. A sum cannot: the overlapped elements would be counted twice.

## Visual

`table[i][j]` is the minimum of `a[i .. i + 2^j - 1]`, for `a = [1, 3, 5, 7, 9, 11, 2, 4, 6, 8]` (a dash marks a window that would run off the end):

```text
i      :  0  1  2  3  4  5  6  7  8  9
j=0 (1):  1  3  5  7  9 11  2  4  6  8
j=1 (2):  1  3  5  7  9  2  2  4  6  -
j=2 (4):  1  3  5  2  2  2  2  -  -  -
j=3 (8):  1  2  2  -  -  -  -  -  -  -
```

## Operations

| Operation | What it does | Time |
| --------- | ------------ | ---- |
| `SparseTable(arr, kind)` | build level by level; `kind` is `min` or `max` | O(n log n) |
| `query(l, r)` | min or max of `a[l..r]` (inclusive); swapped bounds are reordered | O(1) |
| `get(i)` | the original element | O(1) |

`kind` must be `"min"` or `"max"`; anything else is an error (`ValueError`, `std::invalid_argument`, or a panic). An empty array builds an empty table, and every query on it fails (`IndexError`, `std::out_of_range`, panic), as does any index outside `0..n-1`.

### Build

`table[i][0] = a[i]`. For `j >= 1` and every `i` with `i + 2^j <= n`: `table[i][j] = min(table[i][j-1], table[i + 2^(j-1)][j-1])`. The number of levels is `floor(log2(n)) + 1`, computed with integers.

### Query

With `len = r - l + 1` and `k = floor(log2(len))`: the answer is `min(table[l][k], table[r - 2^k + 1][k])`.

## Step-by-Step Trace

Minimum of `a[2..8]` on the array above: `len = 7`, `k = 2`.

| Window | Table cell | Elements | Min |
| ------ | ---------- | -------- | --- |
| first | `table[2][2]` | `a[2..5]` = 5, 7, 9, 11 | 5 |
| second | `table[5][2]` | `a[5..8]` = 11, 2, 4, 6 | 2 |

The answer is `min(5, 2) = 2`. Index 5 lies in both windows. For a sum, the same two windows would give 55 instead of 44 because `a[5] = 11` is counted twice. (Values come from running the Python implementation.)

## Complexity

| Operation | Time | Why |
| --------- | ---- | --- |
| build | O(n log n) | n windows per level, about log n levels, O(1) each |
| query | O(1) | one integer log, two table reads |
| space | O(n log n) | one value per start and level |
| update | not supported | one change affects many windows; rebuild |

## When to Use

- Static data with a very large number of range min, max or gcd queries.
- Not when the data changes (use a [Segment Tree](../Segment_Tree/README.md)), not for sums (use prefix sums or a [Fenwick Tree](../Fenwick_Tree/README.md)), and not when n is so large that `n log n` memory is a problem.

## Sparse Table vs. Alternatives

| Structure | Build | Query | Update |
| --------- | ----- | ----- | ------ |
| Sparse table | O(n log n) | O(1) | none |
| Segment tree | O(n) | O(log n) | O(log n) |
| Fenwick tree | O(n log n) as written | O(log n) | O(log n) |
| Prefix sums | O(n) | O(1) | none |

RMQ structures with linear preprocessing and O(1) queries exist, so the sparse table is the simplest fast option, not the asymptotically best one.

## Common Pitfalls

- Using it for sums: overlapped elements are counted twice.
- Computing `k` with floating-point `log2`; use bit length (`bit_length()`, `bits.Len`, an integer loop).
- Filling levels past the end of the array (`i + 2^j` must be `<= n`).
- Using the table after the data changed.
- Passing a `kind` other than `min` or `max`; it used to silently mean max.

## Implementations

| Language | Folder | Main file | Notes |
| -------- | ------ | --------- | ----- |
| Python | `Python/` | `sparse_table.py` | copies the input; `ValueError` and `IndexError` |
| C++ | `C++/` | `sparse_table.cpp` | copies the input; `std::invalid_argument`, `std::out_of_range` |
| Go | `Go/` | `main.go` | copies the input; panics on bad kind or range |

## Practice Problems

- [CSES: Static Range Minimum Queries](https://cses.fi/problemset/task/1647)
- [LeetCode 239: Sliding Window Maximum](https://leetcode.com/problems/sliding-window-maximum/) (a sparse table works, a deque is the usual answer)
- Build an argmin table that returns the position of the minimum.
- Answer range gcd queries with the same structure.

## Related

- [Segment Tree](../Segment_Tree/README.md)
- [Fenwick Tree](../Fenwick_Tree/README.md)
- [Segment Tree (Lazy Propagation)](../Segment_Tree_Lazy_Propagation/README.md)
