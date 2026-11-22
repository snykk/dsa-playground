# Bitmasking

Bitmasking represents a small set as the bits of one integer, so set operations are single instructions and a DP state can index an array. It is the standard tool when there are at most about 20 to 25 items and the answer depends on a subset: enumeration costs 2^n, and bitmask DP for the travelling salesman problem costs O(n^2 2^n).

## Intuition

Number the items 0 to n-1. A set is the integer whose bit `i` is 1 exactly when item `i` is in the set. Then union is `a | b`, intersection `a & b`, difference `a & ~b`, and the size is a popcount. Counting `mask` from 0 to `2^n - 1` visits every subset once.

The invariant for DP over masks: every proper submask is numerically smaller than its mask, so processing masks in increasing order guarantees that all smaller sets are ready.

## Visual

```text
items:   3 2 1 0            mask = 1011  ->  the set {0, 1, 3}
bits:    1 0 1 1

submasks of 1011 (sub = (sub - 1) & mask):
  1011 -> 1010 -> 1001 -> 1000 -> 0011 -> 0010 -> 0001 -> 0000
  (8 = 2^3 submasks; bit 2 is not in the mask, so it never appears)

masks with exactly 2 bits among 4 (Gosper's hack):
  0011 -> 0101 -> 0110 -> 1001 -> 1010 -> 1100
```

## How It Works

Basic operations (all O(1)):

| Operation | Code | Meaning |
|-----------|------|---------|
| test bit i | `(mask >> i) & 1` | is item `i` in the set |
| set bit i | `mask \| (1 << i)` | add item `i` |
| clear bit i | `mask & ~(1 << i)` | remove item `i` |
| toggle bit i | `mask ^ (1 << i)` | flip item `i` |
| lowest set bit | `mask & -mask` | isolate the lowest item |
| drop lowest | `mask & (mask - 1)` | remove the lowest item |
| popcount | `bin(mask).count('1')`, `__builtin_popcount` | size of the set |

Enumeration:

1. **All subsets:** `for mask in 0 .. (1 << n) - 1`.
2. **Submasks of a mask:** `sub = mask; loop { use(sub); if sub == 0 break; sub = (sub - 1) & mask }`. This includes the empty set. Over all masks it costs O(3^n): each item is outside the mask, in the mask only, or in both the mask and the submask.
3. **Masks with exactly k bits (Gosper's hack):** start at `(1 << k) - 1`, then `c = mask & -mask; r = mask + c; mask = (((r ^ mask) >> 2) / c) | r`, while `mask < (1 << n)`. It needs `k >= 1`: for `k = 0` the lowest set bit does not exist, so the code yields only the empty mask.

Bitmask DP for the travelling salesman problem: `dp[mask][last]` is the shortest path that starts at city 0, visits exactly the cities in `mask` and ends at `last`. Start with `dp[1][0] = 0`; for each mask, each `last` in it and each `next` not in it, relax `dp[mask | (1 << next)][next]`. The tour length is the minimum over `last >= 1` of `dp[full][last] + dist[last][0]`.

SOS DP (sum over subsets): for each bit `i`, for each mask containing bit `i`, add `dp[mask ^ (1 << i)]` to `dp[mask]`. The result is the sum of `a[sub]` over all submasks of each mask, in O(n 2^n).

## Step-by-Step Trace

TSP on four cities with distances 0-1: 10, 0-2: 15, 0-3: 20, 1-2: 35, 1-3: 25, 2-3: 30 (values from the Python implementation; bit `i` is city `i`; `-` is unreachable):

| mask | last = 0 | last = 1 | last = 2 | last = 3 |
|------|----------|----------|----------|----------|
| 0001 | 0 | - | - | - |
| 0011 | - | 10 | - | - |
| 0101 | - | - | 15 | - |
| 0111 | - | 50 | 45 | - |
| 1001 | - | - | - | 20 |
| 1011 | - | 45 | - | 35 |
| 1101 | - | - | 50 | 45 |
| 1111 | - | 70 | 65 | 75 |

Closing the tour: 70 + 10 = 80, 65 + 15 = 80, 75 + 20 = 95. The answer is 80.

## Complexity

| Operation | Time | Space |
|-----------|------|-------|
| basic bit operation | O(1) | O(1) |
| enumerate all subsets of n items | O(2^n) | O(1) |
| submasks of one mask with k bits | O(2^k) | O(1) |
| submasks of every mask | O(3^n) | O(1) |
| bitmask DP for TSP | O(n^2 2^n) | O(n 2^n) |
| SOS DP | O(n 2^n) | O(2^n) |

## When to Use

Use it when n is at most about 20 to 25 and the state is "which items are in the set". Do not use it for n of 40 or more (try meet in the middle), or when a polynomial algorithm exists. Memory is the usual limit: 2^25 states of 4 bytes is 128 MB.

## Bitmasking vs. Alternatives

| Approach | Good for | Limit |
|----------|----------|-------|
| bitmask enumeration or DP | subsets of up to about 25 items | 2^n time and memory |
| `set` / boolean array | sets of any size, rare operations | slower, no array index |
| meet in the middle | subset problems with n up to about 40 | 2^(n/2) time and memory |
| `BitSet` of 64-bit words (C++ file) | thousands of items | set operations cost n / 64 |

## Common Pitfalls

1. **`1 << 31` overflow** in C++ `int`: use `1LL << i` or `uint64_t` once bit positions reach 31 (Go's `int` is 64 bits on common platforms).
2. **Shift by the width or more** is undefined in C++.
3. **`sub > 0` in the submask loop** skips the empty set; use the explicit break.
4. **Operator precedence** in C and C++: `mask & bit == 0` means `mask & (bit == 0)`; write `(mask & bit) == 0`.
5. **Wrong loop bound:** all subsets are `0 .. (1 << n) - 1`.
6. **`__builtin_ctz(0)` and `__builtin_clz(0)`** are undefined; the C++ helpers here return 32.
7. **`next_power_of_2` width.** Python and Go are correct for any width; the C++ version is valid up to 2^30.
8. **Signed shifts.** `n >> 31` on negative `int` is implementation-defined before C++20, and `absNoBranch(INT_MIN)` overflows.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `bitmasking.py` | also `log2_floor`, `log2_ceil`, `meet_in_middle_subset_sum`; generators for enumeration |
| C++ | [C++/](C++/) | `bitmasking.cpp` | `trailingZeros`, `leadingZeros`, `sosDp`, `absNoBranch`, `BitSet`; enumeration prints |
| Go | [Go/](Go/) | `main.go` | `EnumerateSubsets` returns a slice; `SOSDP`, `NextPowerOf2` |

The function sets overlap but are not identical; see each language README. TSP returns 0 for zero or one city in all three.

## Practice Problems

- [Subsets (LeetCode 78)](https://leetcode.com/problems/subsets/)
- [Partition to K Equal Sum Subsets (LeetCode 698)](https://leetcode.com/problems/partition-to-k-equal-sum-subsets/)
- [Shortest Path Visiting All Nodes (LeetCode 847)](https://leetcode.com/problems/shortest-path-visiting-all-nodes/)
- [Hamiltonian Flights (CSES 1690)](https://cses.fi/problemset/task/1690)
- [Elevator Rides (CSES 1653)](https://cses.fi/problemset/task/1653)

## Related

- [Bit Manipulation](../../../Problem_Patterns/Bit_Manipulation/README.md)
- [Meet in the Middle](../../../Problem_Patterns/Meet_in_the_Middle/README.md)
- [Bitmask DP](../../../Algorithms/Dynamic_Programming/Advanced_DP/Bitmask_DP/README.md)
- [Precomputation](../Precomputation/README.md)
