# Meet in the Middle

Meet in the middle splits a search over 2^n possibilities into two halves of 2^(n/2), enumerates each half separately and combines them with sorting or hashing. It handles subset-style problems with n around 40, where brute force (2^n) is too slow and a DP over large values is impossible. Typical cost: O(2^(n/2) * n).

## Intuition

Every subset of the whole array is exactly one pair: a subset of the left half and a subset of the right half, and its sum is the sum of the two parts. So enumerate the left sums (2^(n/2) values) and the right sums (2^(n/2) values), and for each left sum look up the right sum that completes the goal. You never visit all 2^n pairs; each left sum needs one lookup.

Signals: n between about 30 and 45, large values (so no DP over the sum), and independent take-or-skip choices whose halves interact through one combinable quantity such as a sum.

## Visual

```text
nums   = [ 5  3 | 2  7  10 ]          target = 14
           left     right
left sums  : 0 5 3 8
right sums : 0 2 7 9 10 12 17 19      (sorted)

for each left sum a, best right sum <= 14 - a:
  a=0 -> 12   total 12
  a=5 ->  9   total 14   <- best
  a=3 -> 10   total 13
  a=8 ->  2   total 10
```

## How It Works

1. Split the array in the middle: the left half is `nums[:n // 2]`, the right half the rest.
2. Enumerate every subset sum of each half (the empty subset gives 0).
3. Make one side searchable: sort it (closest sum) or put it in a hash set (exact sum).
4. For each sum `a` of the other side, look up the partner:
   - closest sum (Python): binary search the largest right sum `<= target - a`;
   - exact sum (C++, Go): check whether `target - a` is in the set.
5. Keep the best total.

## Step-by-Step Trace

`closest_subset_sum([5, 3, 2, 7, 10], 14)`:

| Left sum a | Room 14 - a | Best right sum | Total |
|-----------|-------------|----------------|-------|
| 0 | 14 | 12 | 12 |
| 5 | 9 | 9 | 14 |
| 3 | 11 | 10 | 13 |
| 8 | 6 | 2 | 10 |

The answer is 14 (`5 + 2 + 7`). For the exact-sum version on `[1, 2, 3, 4, 5, 6]` with target 10, the left half `[1, 2, 3]` has sums 0..6 and the right half `[4, 5, 6]` has sums `{0, 4, 5, 6, 9, 10, 11, 15}`; the left sum 0 with the right sum 10 reaches the target.

## Complexity

| Version | Time | Space |
|---------|------|-------|
| Closest sum (sort and binary search) | O(2^(n/2) * n) | O(2^(n/2)) |
| Exact sum (hash sets) | O(2^(n/2)) average | O(2^(n/2)) |

Each half has 2^(n/2) sums. Sorting one half costs O(2^(n/2) * n) and each of the 2^(n/2) binary searches costs O(n). For n = 40 that is about 2 million sums per half instead of 10^12 subsets. Memory limits the method to about n = 45.

## When to Use

- A subset-sum-like question with n of 30 to 45 and large values, such as exact sum, largest sum not above a limit, counting subsets, or 4-sum.
- Not when n is at most about 20 (plain enumeration), when the sum is small (a knapsack DP is faster), or when the halves do not interact through one combinable quantity.

## Meet in the Middle vs. Alternatives

| Approach | Time | Use when |
|----------|------|----------|
| Brute force over subsets | O(2^n * n) | n up to about 20 |
| Meet in the middle | O(2^(n/2) * n) | n about 30 to 45, large values |
| DP over the sum (knapsack) | O(n * S) | the sum S is small |
| Bitmask DP | O(2^n * n) | the order or identity of the chosen set matters |

## Common Pitfalls

- An uneven split: one half is then close to 2^n.
- Forgetting the empty subset (sum 0) on either side.
- Negative values with pruning: the closest-sum code skips left sums above the target, valid only for non-negative numbers. `closest_subset_sum` raises `ValueError` for a negative number and for a negative target.
- Overflow: the C++ version uses `int` sums.
- The Python version and the C++ and Go versions solve different problems (closest sum versus exact sum).

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python](Python/) | `meet_in_middle.py` | `closest_subset_sum`: largest sum not above the target; 7 tests |
| C++ | [C++](C++/) | `meet_in_middle.cpp` | `subsetSumMeetInMiddle`: exact sum, hash sets; 2 test functions |
| Go | [Go](Go/) | `main.go` | `subsetSumMeetInMiddle`: exact sum, hash sets; 2 tests |

## Practice Problems

- [Closest Subsequence Sum (LeetCode 1755)](https://leetcode.com/problems/closest-subsequence-sum/)
- [Partition Array Into Two Arrays to Minimize Sum Difference (LeetCode 2035)](https://leetcode.com/problems/partition-array-into-two-arrays-to-minimize-sum-difference/)
- [4Sum II (LeetCode 454)](https://leetcode.com/problems/4sum-ii/)
- [Meet in the Middle (CSES)](https://cses.fi/problemset/task/1628)

## Related

- [Bitmask DP](../../Algorithms/Dynamic_Programming/Advanced%20DP/Bitmask%20DP/)
- [Two Pointers](../Two%20Pointers/)
- [Bit Manipulation](../Bit%20Manipulation/)
- [Coordinate Compression](../Coordinate%20Compression/)
