# Maximum Subarray (Kadane's Algorithm)

The maximum subarray problem asks for the contiguous block of an array with the largest sum. Kadane's algorithm solves it in one pass, O(n) time and O(1) space, by tracking the best sum of a block that ends at the current element.

## Intuition

Every subarray ends somewhere. Let `cur[i]` be the best sum of a subarray ending at index `i`. That block either extends the best block ending at `i-1`, or starts fresh at `i`, so `cur[i] = max(arr[i], cur[i-1] + arr[i])`. The answer is the largest `cur[i]`.

Extending helps exactly when `cur[i-1]` is positive. A negative running sum can only hurt any block that continues it, so it is dropped. The algorithm starts from `arr[0]`, not from 0, so an all-negative array correctly returns its largest element (the subarray must be non-empty).

## Visual

`arr = [-2, 1, -3, 4, -1, 2, 1, -5, 4]`. The best block is `[4, -1, 2, 1]`.

```text
index   0   1   2   3   4   5   6   7   8
arr    -2   1  -3   4  -1   2   1  -5   4
cur    -2   1  -2   4   3   5   6   1   5
best   -2   1   1   4   4   5   6   6   6
                    [-------------]          <- window 3..6, sum 6
```

## How It Works

1. If the array is empty, return 0 (a convention; see the pitfalls).
2. `cur = best = arr[0]`.
3. For `i = 1..n-1`: `cur = max(arr[i], cur + arr[i])`, then `best = max(best, cur)`.
4. Return `best`.

To get the window (`kadane_with_indices` in Python): when `cur < 0`, restart with `cur = arr[i]` and remember `temp_start = i`; otherwise add `arr[i]`. When `cur` strictly exceeds `best`, set `best = cur`, `start = temp_start`, `end = i`. On ties the earliest window is kept. `kadane_dp` is the same recurrence with an explicit O(n) array.

## Step-by-Step Trace

| i | arr[i] | cur | best | window start |
|---|--------|-----|------|--------------|
| 0 | -2 | -2 | -2 | 0 |
| 1 | 1 | 1 | 1 | 1 |
| 2 | -3 | -2 | 1 | 1 |
| 3 | 4 | 4 | 4 | 3 |
| 4 | -1 | 3 | 4 | 3 |
| 5 | 2 | 5 | 5 | 3 |
| 6 | 1 | 6 | 6 | 3 |
| 7 | -5 | 1 | 6 | 3 |
| 8 | 4 | 5 | 6 | 3 |

Result: sum 6, from index 3 to 6.

## Complexity

| Aspect | Cost | Why |
|--------|------|-----|
| Time | O(n) | one pass, constant work per element, for every input |
| Space | O(1) | two numbers (and three indices for the window); `kadane_dp` uses O(n) |
| Brute force | O(n^2) | try every start and end with running sums |
| Divide and conquer | O(n log n) | `T(n) = 2 T(n/2) + O(n)` |

## When to Use

Use it for:
- the largest-sum contiguous block of numbers, including streams (one pass);
- as a building block: maximum-sum rectangle, circular arrays, maximum product with small changes.

Do not use it when:
- you need all ties or the `k` best blocks;
- the block must have a fixed length (use a sliding window).

## Kadane vs. Alternatives

| Method | Time | Space | Note |
|--------|------|-------|------|
| Kadane | O(n) | O(1) | one pass |
| Prefix sums | O(n) | O(1) | best `P[j]` minus the smallest earlier `P[i]`; the same idea |
| Divide and conquer | O(n log n) | O(log n) | left, right and crossing answers |
| Brute force | O(n^2) | O(1) | simplest |

## Common Pitfalls

1. Starting `best` at 0: wrong for all-negative arrays, where the answer is the largest element. `[-3, -1, -2]` gives `-1`.
2. Resetting `cur` to 0 instead of `arr[i]`: this silently allows an empty subarray.
3. Empty input: all three implementations return 0 by convention (Python's `kadane_with_indices` returns `(0, -1, -1)`), although for non-empty input the subarray is never empty.
4. Overflow: the C++ version sums in `int`. Python is unbounded and Go's `int` is 64-bit.
5. Window indices: copy the start when `best` improves, not when `cur` restarts.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `kadane.py` | `kadane_algorithm`, `kadane_with_indices`, `kadane_dp` |
| C++ | [C++/](C++/) | `kadane.cpp` | `kadaneAlgorithm` (sum only, `int`) |
| Go | [Go/](Go/) | `main.go` | `KadaneAlgorithm` (sum only) |

## Practice Problems

- [LeetCode 53. Maximum Subarray](https://leetcode.com/problems/maximum-subarray/) - the classic
- [LeetCode 152. Maximum Product Subarray](https://leetcode.com/problems/maximum-product-subarray/) - track the minimum too
- [LeetCode 918. Maximum Sum Circular Subarray](https://leetcode.com/problems/maximum-sum-circular-subarray/) - total sum minus the minimum block
- [LeetCode 121. Best Time to Buy and Sell Stock](https://leetcode.com/problems/best-time-to-buy-and-sell-stock/) - Kadane on the daily differences

## Related

- [Longest Increasing Subsequence](../Longest_Increasing_Subsequence/) - another linear DP
- [Coin Change](../Coin_Change/) - a one-dimensional DP over amounts
- [Climbing Stairs](../../Basic_DP/Climbing_Stairs/) - a recurrence that needs only the previous value
- [Dynamic Programming overview](../../README.md)
