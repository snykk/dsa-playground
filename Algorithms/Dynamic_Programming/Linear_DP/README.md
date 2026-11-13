# Linear Dynamic Programming

Linear DP uses a one-dimensional table, indexed by a position in a sequence or by an amount. Coin Change, the Longest Increasing Subsequence and Kadane's algorithm all fill that table left to right, and they differ in what an entry means and how many earlier entries it reads.

## Topics

Read them in this order.

| # | Topic | What it adds | Level |
|---|-------|--------------|-------|
| 1 | [Coin Change](Coin_Change/) | Fewest coins, or number of ways, for an amount. Each entry reads one earlier entry per coin, and greedy can fail. | Intermediate |
| 2 | [Longest Increasing Subsequence](Longest_Increasing_Subsequence/) | `dp[i]` is the longest run ending at `i`. The O(n^2) table has an O(n log n) version that keeps only the smallest tail per length. | Intermediate |
| 3 | [Maximum Subarray (Kadane's Algorithm)](Maximum_Subarray_Kadanes_Algorithm/) | Best sum of a run ending here, so each entry reads only the previous one. That makes it O(n) time and O(1) space. | Intermediate |

Each topic keeps one array and fills it in one direction. The final answer is the last entry (Coin Change) or the best entry (LIS, Kadane).

## How They Compare

| Topic | Entry | Reads | Time | Space |
|-------|-------|-------|------|-------|
| Coin Change | `dp[a]`: fewest coins (or ways) for amount `a` | `dp[a - c]` for every coin `c` | O(n*A) | O(A) |
| LIS, table | `dp[i]`: longest increasing run ending at `i` | `dp[j]` for every `j < i` with `arr[j] < arr[i]` | O(n^2) | O(n) |
| LIS, tails | smallest tail per run length | binary search over the tails | O(n log n) | O(n) |
| Kadane | best sum of a run ending at `i` | the previous entry only | O(n) | O(1) |

Coin Change is pseudo-polynomial: A is a value, not a count of digits. The LIS tails version returns the length only.

## Choosing One

| Situation | Use | Why |
|-----------|-----|-----|
| Make an amount from reusable coins with the fewest coins | Coin Change, min coins | greedy is not safe for every coin set |
| Count the ways to make an amount | Coin Change, ways | the loops sum instead of taking a minimum |
| Each coin can be used once | Coin Change, 0/1 version | loop the amounts downward |
| Longest increasing run, small n or the run itself needed | LIS table | the parent array recovers the subsequence |
| Longest increasing run, large n | LIS with tails | O(n log n) by binary search |
| Best contiguous sum | Kadane | one pass and two numbers |
| Items are limited by a budget | [0/1 Knapsack](../2D_DP/0_1_Knapsack/) | the state needs both the item and the capacity |

## Common Pitfalls

- Trusting greedy for coins: it fails for `1, 3, 4` and amount 6 (4 + 1 + 1 against 3 + 3), and DP is correct for any coin set.
- Using the wrong loop direction: upward over amounts allows reuse, downward allows one use per coin.
- Treating equal values as increasing: the LIS here is strictly increasing, so `7, 7, 7` has length 1.
- Returning the tails array as the LIS: it holds the smallest tail per length and need not be a subsequence of the input.
- Forgetting the all-negative case: Kadane must return the largest element, because the run cannot be empty. Empty input returns 0.

## Related

- [Basic Dynamic Programming](../Basic_DP/): read first.
- [2D Dynamic Programming](../2D_DP/): states with two indices.
- [0/1 Knapsack](../2D_DP/0_1_Knapsack/): items limited by a budget.
- [Longest Common Subsequence](../2D_DP/Longest_Common_Subsequence/): the two-sequence version of LIS.
