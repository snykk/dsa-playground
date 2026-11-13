# Square Root Decomposition

Square root decomposition splits an array into blocks of about sqrt(N) elements and keeps one precomputed sum per block. A range-sum query scans two partial blocks and adds whole-block sums, so it costs O(sqrt N); a point update is O(1). Build is O(N).

## Intuition

A query range is made of a partial block on the left, some complete blocks, and a partial block on the right. Complete blocks are answered from stored sums. Only the partial blocks are scanned, and each has fewer than one block's worth of elements.

Invariant: `blocks[b]` always equals the sum of the elements of block `b`. A point update changes one element, so it adjusts exactly one block sum, by `new - old`.

## Visual

```text
arr     = [ 1  2  3  4 | 5  6  7  8 | 9 10 ]      block size 4 (ceil(sqrt(10)))
blocks  = [    10      |     26      |  19  ]

query(1, 9):   l=1                          r=9
               [ . 2  3  4 ] [ 5 6 7 8 ] [ 9 10 ]
                  scan         stored 26     scan
               (2+3+4) = 9  +    26     +  (9+10) = 19   ->  54
```

## How It Works

1. Block size `B = max(1, ceil(sqrt(N)))`; there are `ceil(N / B)` blocks.
2. Build: `blocks[i // B] += arr[i]` for every `i`.
3. `query(l, r)` (inclusive): if `l // B == r // B`, add `arr[l..r]`. Otherwise add the left partial block, the stored sums of the blocks strictly between, and the right partial block.
4. `update(i, v)`: `blocks[i // B] += v - arr[i]`, then `arr[i] = v`.

Only point updates and range-sum queries exist; there are no range updates and no min/max.

## Step-by-Step Trace

`arr = [1..10]`, `B = 4`, block sums `[10, 26, 19]`.

| Operation | Work | Result |
|-----------|------|--------|
| `query(2, 7)` | left partial indices 2-3 (3 + 4), right partial indices 4-7 (5 + 6 + 7 + 8), no middle blocks | 33 |
| `update(5, 20)` | block 1 sum changes by 14, block sums become `[10, 40, 19]` | `arr[5] = 20` |
| `query(2, 7)` | same cells, new value at index 5 | 47 |
| `query(1, 9)` | 9 (left) + 26 (middle block 1) + 19 (right) | 54 |

## Complexity

| Operation | Time | Space |
|-----------|------|-------|
| Build | O(N) | O(sqrt N) for the block sums, plus a copy of the array |
| `query` | O(sqrt N) | O(1) |
| `update` | O(1) | O(1) |

Why: a query handles at most `B - 1` elements on each side and at most `N / B` block sums, so the cost is about `2B + N / B`, which is smallest for `B` near sqrt N.

## When to Use

Use it for range queries with point updates when you want simple code, or when the block summary is easy to keep but hard to merge in a tree. Do not use it when queries are many and updates rare (prefix sums are O(1)), or when O(log N) queries matter (segment tree or Fenwick tree).

## Square Root Decomposition vs. Alternatives

| Structure | Build | Query | Point update |
|-----------|-------|-------|--------------|
| Square root decomposition | O(N) | O(sqrt N) | O(1) |
| Segment tree | O(N) | O(log N) | O(log N) |
| Fenwick tree | O(N) | O(log N) | O(log N) |
| Prefix sums | O(N) | O(1) | O(N) |

## Common Pitfalls

- Block size 0 on an empty array; the code clamps it to 1.
- Overwriting `arr[i]` before computing `value - arr[i]` for the block sum.
- Assuming the last block is full; it may be partial.
- Off-by-one at block borders (left partial ends at `(left_block + 1) * B - 1`, right starts at `right_block * B`).
- Forgetting the same-block case.
- Integer overflow of the sums in C++ and Go.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `square_root_decomposition.py` | copies the input list |
| C++ | [C++/](C++/) | `square_root_decomposition.cpp` | copies the input vector; `int` sums |
| Go | [Go/](Go/) | `main.go` | copies the input slice; `int` sums |

## Practice Problems

- [LeetCode 307 - Range Sum Query - Mutable](https://leetcode.com/problems/range-sum-query-mutable/)
- [CSES - Dynamic Range Sum Queries](https://cses.fi/problemset/task/1648)

## Related

- [Mo's Algorithm](../Mos_Algorithm/)
- [Heavy-Light Decomposition](../Heavy_Light_Decomposition/)
- [Specialized Techniques overview](../)
