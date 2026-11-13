# 0/1 Knapsack

Given `n` items, each with a weight and a value, and a bag of capacity `W`, choose the subset of maximum total value whose weight does not exceed `W`. Each item is taken whole or not at all. A DP table over (items, capacity) solves it in O(n * W) time, which is pseudo-polynomial.

## Intuition

You can carry 10 kg. The laptop weighs 3 kg and is worth 1000, the TV weighs 8 kg and is worth 1200, the watch weighs 1 kg and is worth 500. Laptop + TV is 11 kg and does not fit. Laptop + watch is worth 1500, TV + watch is worth 1700: the best choice.

Instead of trying all 2^n subsets, ask a smaller question: what is the best value using only the first `i` items and a bag of capacity `w`? Call it `dp[i][w]`. Item `i` is either skipped (then the answer is `dp[i-1][w]`) or taken (then you earn its value and have `w - weight` capacity left for the first `i-1` items). Both options read row `i-1`, so an item can never be counted twice.

## Visual

Items as (weight, value): (1,1), (3,4), (4,5), (5,7). Capacity 7.

```text
            w=0  w=1  w=2  w=3  w=4  w=5  w=6  w=7
 i=0 (none)   0    0    0    0    0    0    0    0
 i=1 (1,1)    0    1    1    1    1    1    1    1
 i=2 (3,4)    0    1    1    4    5    5    5    5
 i=3 (4,5)    0    1    1    4    5    6    6    9
 i=4 (5,7)    0    1    1    4    5    7    8    9   <- answer dp[4][7] = 9
```

## How It Works

1. Create a table `dp` with `n + 1` rows and `W + 1` columns, all zeros (row 0 means "no items").
2. For each item `i = 1..n` and each capacity `w = 0..W`:
   - if `weights[i-1] > w`, the item does not fit: `dp[i][w] = dp[i-1][w]`;
   - otherwise `dp[i][w] = max(dp[i-1][w], dp[i-1][w - weights[i-1]] + values[i-1])`.
3. The answer is `dp[n][W]`.

To recover the chosen items, walk back from `dp[n][W]`: if `dp[i][w] != dp[i-1][w]`, item `i` was taken, so record it and subtract its weight from `w`. The code in this repository returns only the value.

Space optimization: row `i` depends only on row `i-1`, so one array is enough if `w` runs from `W` down to the item's weight. Going left to right would reuse the item (the unbounded knapsack). Only the Python implementation has this version.

## Step-by-Step Trace

Same input as the Visual section.

| Cell | Skip | Take | Result |
|------|------|------|--------|
| `dp[2][3]` (item 3 kg, value 4) | `dp[1][3] = 1` | `dp[1][0] + 4 = 4` | 4 |
| `dp[3][7]` (item 4 kg, value 5) | `dp[2][7] = 5` | `dp[2][3] + 5 = 9` | 9 |
| `dp[4][7]` (item 5 kg, value 7) | `dp[3][7] = 9` | `dp[3][2] + 7 = 8` | 9 (skip) |

Traceback: `dp[4][7] == dp[3][7]` so item 4 is skipped; `dp[3][7] != dp[2][7]` so item 3 (4 kg) is taken and `w = 3`; `dp[2][3] != dp[1][3]` so item 2 (3 kg) is taken and `w = 0`. Chosen: items 2 and 3, weight 7, value 9.

## Complexity

| Approach | Time | Space | Why |
|----------|------|-------|-----|
| Recursion, no memo | O(2^n) | O(n) | each item branches into take / skip |
| Top-down with memo | O(n * W) | O(n * W) | each (i, w) is solved once |
| Bottom-up 2D | O(n * W) | O(n * W) | the table; allows traceback |
| Bottom-up 1D | O(n * W) | O(W) | right-to-left sweep, value only |

The time is pseudo-polynomial: `W` is a number whose written length is only log(W) bits. With `W = 10^9` the table is unusable even for 20 items; use meet-in-the-middle (O(2^(n/2))) or branch and bound. The problem is NP-hard.

## When to Use

Use it when:
- items are indivisible and each is used at most once;
- the capacity is moderate (roughly `n * W` up to about 10^7 to 10^8 cells);
- you need the exact optimum.

Do not use it when:
- items can be split (greedy fractional knapsack, O(n log n));
- copies are unlimited (unbounded knapsack, a left-to-right sweep);
- `W` is huge (meet-in-the-middle, branch and bound), or an approximation is enough (an FPTAS).

## 0/1 Knapsack vs. Alternatives

Greedy by value per weight fails here. Items (weight, value): (10,60), (20,100), (30,120), capacity 50. Greedy takes the first two for 160. The optimum skips the first item: 100 + 120 = 220.

| Problem | Items | Method | Time |
|---------|-------|--------|------|
| 0/1 Knapsack | whole, once | DP | O(n * W) |
| Fractional Knapsack | can be split | greedy by value / weight | O(n log n) |
| Unbounded Knapsack | unlimited copies | same DP, forward sweep | O(n * W) |
| Subset Sum | value = weight | boolean DP | O(n * W) |
| Bounded Knapsack | up to k copies | binary splitting into 0/1 items | O(n * W * log k) |

## Common Pitfalls

1. Sweeping `w` left to right in the 1D version: it turns the problem into the unbounded knapsack. With one item (weight 2, value 3) and capacity 4 the wrong sweep returns 6 instead of 3.
2. Off-by-one table size: `n + 1` rows and `W + 1` columns; item `i` is `weights[i-1]`.
3. Using greedy by ratio.
4. Weights and values of different lengths: none of the implementations checks this.
5. A negative capacity: not supported. Python raises `IndexError` and Go panics; the C++ version reads out of bounds or throws. Check it before calling.
6. Huge `W`: compute `n * W` before allocating.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `knapsack_01.py` | 2D table (`knapsack_01`) and one-row version (`knapsack_01_optimized`) |
| C++ | [C++/](C++/) | `knapsack_01.cpp` | 2D table only (`knapsack01`), `int` values |
| Go | [Go/](Go/) | `main.go` | 2D table only (`Knapsack01`) |

All three return the best value, not the chosen items.

## Practice Problems

- [LeetCode 416. Partition Equal Subset Sum](https://leetcode.com/problems/partition-equal-subset-sum/) - subset sum, a 0/1 knapsack with value = weight
- [LeetCode 494. Target Sum](https://leetcode.com/problems/target-sum/) - reduces to subset sum
- [LeetCode 474. Ones and Zeroes](https://leetcode.com/problems/ones-and-zeroes/) - a knapsack with two capacities
- [LeetCode 1049. Last Stone Weight II](https://leetcode.com/problems/last-stone-weight-ii/) - split into two piles with minimal difference

## Related

- [Fractional Knapsack](../../../Greedy/Fractional%20Knapsack/) - the greedy, divisible-items variant
- [Coin Change](../../Linear%20DP/Coin%20Change/) - unbounded knapsack in disguise
- [Longest Common Subsequence](../Longest%20Common%20Subsequence/) - another 2D DP table
- [Dynamic Programming overview](../../README.md)
