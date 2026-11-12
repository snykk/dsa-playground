# DP Problem Patterns

Dynamic programming (DP) solves a problem by combining answers to smaller versions of itself and computing each distinct subproblem once. This folder implements three classic families, the 0/1 knapsack (O(N * W)), the longest common subsequence (O(N * M)) and the longest increasing subsequence (O(N log N)), and gives the recipe for recognizing and writing a DP.

## Intuition

DP applies when a problem has **optimal substructure** (the best answer is built from the best answers to smaller problems) and **overlapping subproblems** (the same smaller problems recur). A brute force explores exponentially many choice sequences, but the number of distinct situations is polynomial, so remembering them collapses the search.

Recipe:

1. State: say in one sentence what `dp[...]` means.
2. Transition: express a state through smaller states.
3. Order and base case: fill states so dependencies come first; start from the smallest known state.
4. Answer and space: read the right cell; keep only the rows the transition reads.

## Visual

0/1 knapsack, weights `[1, 3, 4, 5]`, values `[1, 4, 5, 7]`, capacity 7 (one array, capacity 0..7, items processed in order, capacities from high to low):

```text
capacity        0  1  2  3  4  5  6  7
start           0  0  0  0  0  0  0  0
item (1, 1)     0  1  1  1  1  1  1  1
item (3, 4)     0  1  1  4  5  5  5  5
item (4, 5)     0  1  1  4  5  6  6  9
item (5, 7)     0  1  1  4  5  7  8  9     answer dp[7] = 9
```

## How It Works

- **0/1 knapsack:** `dp[w] = max(dp[w], dp[w - weight] + value)` for each item, with `w` going from `capacity` down to `weight`. Going down uses each item at most once.
- **LCS:** `dp[i][j]` is the LCS of the first `i` and `j` characters. Equal characters give `1 + dp[i-1][j-1]`, otherwise `max(dp[i-1][j], dp[i][j-1])`. The code keeps two rows and swaps the strings so the shorter one sets the row length.
- **LIS:** `tails[k]` is the smallest last element of an increasing subsequence of length `k + 1`. Each number replaces the first tail `>=` it (binary search) or is appended. The length of `tails` is the answer, and the subsequence is strictly increasing.

Other families and their states: linear `dp[i]`, interval `dp[l][r]`, subset `dp[mask]`, digit `dp[pos][tight][state]`, tree `dp[node]` and graph `dp[v]`; see the folders under `Algorithms/Dynamic_Programming`.

## Step-by-Step Trace

LCS of `"abcde"` and `"ace"` (rows `-abcde`, columns `-ace`):

| | - | a | c | e |
|---|---|---|---|---|
| **-** | 0 | 0 | 0 | 0 |
| **a** | 0 | 1 | 1 | 1 |
| **b** | 0 | 1 | 1 | 1 |
| **c** | 0 | 1 | 2 | 2 |
| **d** | 0 | 1 | 2 | 2 |
| **e** | 0 | 1 | 2 | 3 |

The answer is 3 (`ace`). LIS `tails` for `[10, 9, 2, 5, 3, 7, 101, 18]`: `[10]`, `[9]`, `[2]`, `[2,5]`, `[2,3]`, `[2,3,7]`, `[2,3,7,101]`, `[2,3,7,18]`, so the length is 4.

## Complexity

| Pattern | Time | Space | Reason |
|---------|------|-------|--------|
| `knapsack_01` | O(N * W) | O(W) | N items times W + 1 capacities |
| `lcs` | O(N * M) | O(min(N, M)) | every cell once, two rows |
| `lis` | O(N log N) | O(N) | one binary search per element |

Knapsack is pseudo-polynomial: W is a value, not the input length.

## When to Use

- "Minimum, maximum or number of ways" over a sequence, two strings, a budget or a grid, where choices are made one position at a time and sub-results repeat.
- Not when a greedy choice is provably safe (it is simpler and faster), or when the state space is not polynomial.

## DP vs. Alternatives

| Approach | Time | Use when |
|----------|------|----------|
| DP | polynomial in the number of states | optimal substructure and overlapping subproblems |
| Greedy | usually O(n log n) | a locally best choice is provably safe |
| Brute force | exponential | tiny inputs, or to check a DP |
| Memoized recursion | reachable states only | natural recursion with few reachable states |

## Common Pitfalls

- Loop direction in 1D knapsack: downwards for 0/1, upwards for unbounded.
- A vague state definition.
- Treating `tails` as the subsequence itself: it gives only the length.
- Strict versus non-strict LIS: `bisect_left` (strict) versus `bisect_right`.
- Zero-weight items and capacity 0: an item of weight 0 fits in capacity 0.
- Missing base cases (empty strings, zero capacity).

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python](Python/) | `dp_patterns.py` | `knapsack_01`, `lcs`, `lis`; 5 tests |
| C++ | [C++](C++/) | `dp_patterns.cpp` | static methods of `DPPatterns`; 3 tests |
| Go | [Go](Go/) | `main.go` | `Knapsack01`, `LCS`, `LIS`; 4 tests |

The three languages implement the same three functions. There is no Fibonacci or coin-change code in this folder; see the Basic DP and Linear DP topics.

## Practice Problems

- [0/1 Knapsack (AtCoder Educational DP Contest, problem D)](https://atcoder.jp/contests/dp/tasks/dp_d)
- [Longest Common Subsequence (LeetCode 1143)](https://leetcode.com/problems/longest-common-subsequence/)
- [Longest Increasing Subsequence (LeetCode 300)](https://leetcode.com/problems/longest-increasing-subsequence/)
- [Partition Equal Subset Sum (LeetCode 416)](https://leetcode.com/problems/partition-equal-subset-sum/)
- [Coin Change (LeetCode 322)](https://leetcode.com/problems/coin-change/)

## Related

- [0-1 Knapsack](../../Algorithms/Dynamic_Programming/2D%20DP/0-1%20Knapsack/)
- [Longest Common Subsequence](../../Algorithms/Dynamic_Programming/2D%20DP/Longest%20Common%20Subsequence/)
- [Longest Increasing Subsequence](../../Algorithms/Dynamic_Programming/Linear%20DP/Longest%20Increasing%20Subsequence/)
- [Bitmask DP](../../Algorithms/Dynamic_Programming/Advanced%20DP/Bitmask%20DP/)
