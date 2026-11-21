# Fenwick Tree (Binary Indexed Tree)

A Fenwick tree keeps prefix sums of an array in one array of the same size, using the lowest set bit of an index to pick the cells to read or write. Point updates and prefix or range sums cost O(log n), with about ten lines of code and n + 1 cells of memory.

## Intuition

A plain array has O(1) updates and O(n) sums; a prefix-sum array has the opposite. A Fenwick tree splits the difference. Cell `i` (1-based) stores the sum of the `lowbit(i)` elements that end at `i`, where `lowbit(i) = i & -i` is the lowest set bit of `i`. A prefix sum is then a handful of whole blocks, and an update touches only the blocks that contain the changed element.

Both walks follow the bits of the index:

- Query: `i -= lowbit(i)` clears the lowest set bit, jumping to the block just before the current one.
- Update: `i += lowbit(i)` moves to the next cell whose block contains the current block.

Each walk takes at most one step per bit of `i`, so O(log n).

## Visual

For the array `[1, 3, 5, 7, 9, 11]` (1-based cells, cell 0 unused):

```text
i        1    2    3    4    5    6
binary  001  010  011  100  101  110
lowbit   1    2    1    4    1    2
tree[i]  1    4    5   16    9   20
covers  [1] [1-2] [3] [1-4] [5] [5-6]
```

## Operations

| Operation | What it does | Time |
| --------- | ------------ | ---- |
| `update(i, delta)` | add `delta` to element `i` (climb with `i += lowbit(i)`) | O(log n) |
| `prefix_sum(i)` | sum of elements `0..i` (descend with `i -= lowbit(i)`) | O(log n) |
| `query(l, r)` | `prefix_sum(r) - prefix_sum(l - 1)` | O(log n) |
| `get(i)` | one element, as `query(i, i)` | O(log n) |

Public indices are 0-based; the code adds 1 internally. An index outside `0..n-1`, or `l > r`, is an error: `IndexError` in Python, `std::out_of_range` in C++, a panic in Go. `update` adds a delta; to assign, add `new - get(i)`.

## Step-by-Step Trace

Array `[1, 3, 5, 7, 9, 11]`, so `tree = [_, 1, 4, 5, 16, 9, 20]`.

Prefix sum of 0-based index 4 (1-based 5):

| Step | i (binary) | Add | Running sum | Next i |
| ---- | ---------- | --- | ----------- | ------ |
| 1 | 5 (101) | tree[5] = 9 | 9 | 5 - 1 = 4 |
| 2 | 4 (100) | tree[4] = 16 | 25 | 4 - 4 = 0, stop |

The result 25 = 1 + 3 + 5 + 7 + 9.

`update(2, +5)` (1-based 3):

| Step | i (binary) | Cell | Next i |
| ---- | ---------- | ---- | ------ |
| 1 | 3 (011) | tree[3] 5 to 10 | 3 + 1 = 4 |
| 2 | 4 (100) | tree[4] 16 to 21 | 4 + 4 = 8 > n, stop |

The new tree is `[_, 1, 4, 10, 21, 9, 20]`, and the prefix sum of 1-based 5 is now 9 + 21 = 30.

## Complexity

| Operation | Time | Why |
| --------- | ---- | --- |
| update | O(log n) | at most log<sub>2</sub>(n) + 1 climbs |
| prefix_sum, query | O(log n) | at most one step per set bit |
| build (as implemented) | O(n log n) | n updates |
| build (alternative) | O(n) | push each `tree[i]` into `tree[i + lowbit(i)]` once |
| space | O(n) | n + 1 numbers |

## When to Use

- Dynamic prefix or range sums, counts, XOR.
- Counting inversions and frequency tables over a bounded range.
- Not for min, max or gcd: the query subtracts two prefixes, so the operation must be invertible. Use a [Segment Tree](../Segment_Tree/README.md) or a [Sparse Table](../Sparse_Table/README.md) instead.
- Not when the array never changes: a prefix-sum array answers in O(1).

## Fenwick Tree vs. Alternatives

| Structure | Update | Range sum | Space | Notes |
| --------- | ------ | --------- | ----- | ----- |
| Fenwick tree | O(log n) | O(log n) | n | shortest code, needs an invertible operation |
| Segment Tree | O(log n) | O(log n) | 2n to 4n | min, max, gcd too |
| Prefix-sum array | O(n) | O(1) | n | static data |
| Plain array | O(1) | O(n) | n | rare queries |

Range update with point query works by storing the difference array in a Fenwick tree; range update with range query needs two trees. Neither is in this folder.

## Common Pitfalls

- Using index 0 internally: `lowbit(0) = 0`, so `i += lowbit(i)` never advances and the loop never ends. `update(-1, x)` became exactly this; it is now rejected.
- Treating `update` as assignment; it adds a delta.
- `int` overflow in C++: sums are `long long` here. Python integers do not overflow and Go uses 64-bit `int`.
- Calling `prefix_sum(l - 1)` with `l = 0`.
- Expecting range min or max.

## Implementations

| Language | Folder | Main file | Notes |
| -------- | ------ | --------- | ----- |
| Python | `Python/` | `fenwick_tree.py` | `IndexError` on bad indices |
| C++ | `C++/` | `fenwick_tree.cpp` | `long long` sums, `std::out_of_range`, constructor takes a `const vector<int>&` |
| Go | `Go/` | `main.go` | `int` sums, panics on bad indices |

## Practice Problems

- [LeetCode 307: Range Sum Query - Mutable](https://leetcode.com/problems/range-sum-query-mutable/)
- [LeetCode 315: Count of Smaller Numbers After Self](https://leetcode.com/problems/count-of-smaller-numbers-after-self/)
- [LeetCode 493: Reverse Pairs](https://leetcode.com/problems/reverse-pairs/)
- [CSES: Dynamic Range Sum Queries](https://cses.fi/problemset/task/1648)

## Related

- [Segment Tree](../Segment_Tree/README.md)
- [Segment Tree (Lazy Propagation)](../Segment_Tree_Lazy_Propagation/README.md)
- [Sparse Table](../Sparse_Table/README.md)
