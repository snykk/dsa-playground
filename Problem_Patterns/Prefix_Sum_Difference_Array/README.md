# Prefix Sum and Difference Array

A prefix sum array answers "sum of a[l..r]" in O(1) after an O(n) pass. Its inverse, the difference array, applies "add v to a[l..r]" in O(1) and rebuilds the result in one O(n) pass. They remove the inner loop from range queries and from batches of range updates.

## Intuition

The running total up to index i, `prefix[i]`, contains everything before i. The sum of any range is therefore the total up to its end minus the total before its start: the shared part cancels.

A difference array records where values change. Adding v to a range means "+v starts here" at l and "+v stops here" at r + 1. A running sum over those marks recovers the final array, because additions commute: apply them in any order, read once.

Signals: many static range-sum queries; many "add to a range" updates followed by one read; overlapping intervals or bookings on a timeline; "number of subarrays with sum k".

## Visual

```text
arr     =  3   1   4   1   5
prefix  = 0   3   4   8   9  14            prefix[i + 1] = prefix[i] + arr[i]

query(1, 3) = prefix[4] - prefix[1] = 9 - 3 = 6      (1 + 4 + 1)

difference array, size 5 (6 cells), updates (0..2, +5) and (1..3, +3):

index   0   1   2   3   4   5
diff    5   3   0  -5  -3   0
sweep   5   8   8   3   0           running sum = final array
```

## How It Works

Prefix sums:

1. `prefix[0] = 0`, then `prefix[i + 1] = prefix[i] + a[i]`.
2. `query(l, r) = prefix[r + 1] - prefix[l]` (inclusive bounds).

Difference array:

1. Allocate `size + 1` cells of zero.
2. `update(l, r, v)`: `diff[l] += v` and, if `r + 1 < len(diff)`, `diff[r + 1] -= v`.
3. `get_array()`: running sum of `diff[0..size-1]`.

`range_updates(arr, updates)` in Python adds the original array back after the sweep.

## Step-by-Step Trace

Updates `(0, 2, +5)` then `(1, 3, +3)` on five zeros:

| Step | diff (6 cells) |
|------|----------------|
| start | 0, 0, 0, 0, 0, 0 |
| add 5 to [0, 2] | 5, 0, 0, -5, 0, 0 |
| add 3 to [1, 3] | 5, 3, 0, -5, -3, 0 |
| running sum | 5, 8, 8, 3, 0 |

## Complexity

| Operation | Time | Space |
|-----------|------|-------|
| Build prefix sums | O(n) | O(n) |
| Range sum query | O(1) | O(1) |
| Range update | O(1) | O(1) |
| Materialize after updates | O(n) | O(n) |

For q operations: O(n + q) instead of O(n * q).

## When to Use

Use prefix sums for many queries on an array that does not change, and a difference array when you apply many range updates and read the result once. Do not use them when updates and queries alternate (use a Fenwick tree or a segment tree), or for non-invertible operations such as range minimum.

## Prefix Sum vs. Alternatives

| Approach | Update | Query | Best for |
|----------|--------|-------|----------|
| Prefix sum | O(n) rebuild | O(1) | static arrays |
| Difference array | O(1) | O(n) to read all | batch updates, one read |
| Fenwick tree | O(log n) | O(log n) | interleaved point updates and prefix queries |
| Segment tree | O(log n) | O(log n) | interleaved range updates and queries (lazy) |
| Plain loop | O(1) point | O(n) | very few queries |

## Common Pitfalls

- `prefix[r + 1] - prefix[l]`, not `prefix[r] - prefix[l]`, when the array has a leading zero.
- A difference array needs `size + 1` cells because `r + 1` can equal `size`.
- Updating then querying without rebuilding: the prefix array is stale after a change.
- Overflow: sums of many large values need 64-bit integers; the C++ and Go code use `int`.
- No index validation anywhere: out-of-range indices raise in Python, are undefined in C++ and panic in Go (a negative Python index wraps silently).
- `range_sum_queries` and `range_updates` exist only in Python; C++ and Go have just the two classes.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `prefix_sum.py` | two classes plus `range_sum_queries` and `range_updates` helpers |
| C++ | [C++/](C++/) | `prefix_sum.cpp` | `PrefixSum` and `DifferenceArray`, `int` sums |
| Go | [Go/](Go/) | `main.go` | `PrefixSum` and `DifferenceArray`, `int` sums |

## Practice Problems

- [LeetCode 303. Range Sum Query - Immutable](https://leetcode.com/problems/range-sum-query-immutable/)
- [LeetCode 560. Subarray Sum Equals K](https://leetcode.com/problems/subarray-sum-equals-k/)
- [LeetCode 238. Product of Array Except Self](https://leetcode.com/problems/product-of-array-except-self/)
- [LeetCode 1109. Corporate Flight Bookings](https://leetcode.com/problems/corporate-flight-bookings/)
- [LeetCode 1094. Car Pooling](https://leetcode.com/problems/car-pooling/)

## Related

- [Precomputation](../../Utilities/Optimization_Techniques/Precomputation/) (2D prefix sums)
- [Fenwick Tree](../../Data_Structures/Non_Linear/Trees/Fenwick_Tree/)
- [Segment Tree](../../Data_Structures/Non_Linear/Trees/Segment_Tree/)
- [Sliding Window](../Sliding_Window/)
