# Climbing Stairs

Count the distinct ways to climb `n` stairs when each move is 1 or 2 steps. The last move was a 1-step or a 2-step, so `ways(n) = ways(n-1) + ways(n-2)`: the Fibonacci recurrence, with `ways(n) = F(n + 1)`. It takes O(n) time, and O(1) space with two variables.

## Intuition

To stand on stair `n` you came from stair `n-1` (a 1-step) or from stair `n-2` (a 2-step). Those two groups of climbs are disjoint and together cover every climb, so you add their counts. Order matters: 1+2 and 2+1 are different ways.

The base case is `ways(0) = 1`: there is one way to stand on the ground, which is to make no move. It is what makes `ways(2) = ways(1) + ways(0) = 2` come out right (1+1 and 2).

## Visual

The ways to climb 4 stairs with steps 1 and 2:

```text
1 + 1 + 1 + 1
1 + 1 + 2
1 + 2 + 1
2 + 1 + 1
2 + 2
```

The `ways` array for `n = 6`:

```text
stair   0  1  2  3  4  5   6
ways    1  1  2  3  5  8  13
```

Each entry is the sum of the two before it.

## How It Works

1. `ways(0) = 1`, `ways(1) = 1`, `ways(2) = 2`.
2. For `i = 3..n`: `ways(i) = ways(i-1) + ways(i-2)`.
3. Return `ways(n)`.

With arbitrary allowed steps (Python `climbing_stairs_variable_steps(n, steps)`): `dp[0] = 1`, and `dp[i]` is the sum of `dp[i - s]` over every allowed step `s <= i`. The outer loop runs over stairs, so the count is of ordered sequences.

A negative `n` is an error in every language, and `ways(0)` is 1.

## Step-by-Step Trace

`n = 5`, steps 1 and 2, with the two-variable loop:

| i | prev2 | prev1 | current |
|---|-------|-------|---------|
| start | 1 (ways 1) | 2 (ways 2) | |
| 3 | 1 | 2 | 3 |
| 4 | 2 | 3 | 5 |
| 5 | 3 | 5 | 8 |

`ways(5) = 8`. With steps 1, 2 and 3, `ways(0..6)` is 1, 1, 2, 4, 7, 13, 24, so `climbing_stairs_variable_steps(5, [1, 2, 3])` is 13.

## Complexity

| Approach | Time | Space | Why |
|----------|------|-------|-----|
| Naive recursion | O(2^n) | O(n) | recomputes subproblems |
| Memoization | O(n) | O(n) | each `ways(i)` once |
| Tabulation | O(n) | O(n) | one table |
| Two variables (steps 1, 2) | O(n) | O(1) | only the last two values matter |
| Table with `k` step sizes | O(n * k) | O(n) | `k` terms per stair |

The result grows like Fibonacci numbers, so 64-bit integers are exact only up to `ways(91)`; `ways(92) = F(93)` overflows.

## When to Use

Use it for:
- counting paths to a position with a fixed set of moves;
- warming up on DP: it is the simplest state, recurrence and base case;
- any recurrence of the form "sum of earlier terms".

For the minimum cost to reach the top use a `min` recurrence instead; for combinations (order ignored) put the steps in the outer loop.

## Climbing Stairs vs. Alternatives

| Problem | Question | Recurrence |
|---------|----------|------------|
| Climbing Stairs | how many ways to reach `n` | `ways(i) = sum of ways(i - s)` |
| Fibonacci | the value of `F(n)` | `F(i) = F(i-1) + F(i-2)` |
| Coin Change (ways) | how many coin combinations | same table, coins outer |
| Min Cost Climbing Stairs | cheapest way to the top | `min` instead of a sum |

## Common Pitfalls

1. Wrong base case: `ways(0)` is 1; with 0 the recurrence gives `ways(2) = 1`.
2. Off-by-one against Fibonacci: `ways(n) = F(n + 1)`.
3. Overflow: exact in C++ and Go only up to `n = 91`. Python is unbounded.
4. Loop order: stairs outside counts sequences, steps outside counts combinations.
5. Steps of 0 or less are not meaningful and are not checked: a 0 step can inflate the count, and a negative step raises `IndexError`.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `climbing_stairs.py` | naive, memoization, tabulation, optimized, variable steps |
| C++ | [C++/](C++/) | `climbing_stairs.cpp` | `climbingStairs` (steps 1 and 2 only), `long long` |
| Go | [Go/](Go/) | `main.go` | `ClimbingStairs` (steps 1 and 2 only), `int64` |

## Practice Problems

- [LeetCode 70. Climbing Stairs](https://leetcode.com/problems/climbing-stairs/) - the classic
- [LeetCode 746. Min Cost Climbing Stairs](https://leetcode.com/problems/min-cost-climbing-stairs/) - a minimum instead of a count
- [LeetCode 198. House Robber](https://leetcode.com/problems/house-robber/) - the same two-variable pattern
- [LeetCode 509. Fibonacci Number](https://leetcode.com/problems/fibonacci-number/) - the same sequence
- [LeetCode 1137. N-th Tribonacci Number](https://leetcode.com/problems/n-th-tribonacci-number/) - steps 1, 2 and 3

## Related

- [Fibonacci Numbers](../Fibonacci_Numbers/) - `ways(n) = F(n + 1)`
- [Coin Change](../../Linear_DP/Coin_Change/) - the same table with coin values as steps
- [Maximum Subarray (Kadane's Algorithm)](../../Linear_DP/Maximum_Subarray_Kadanes_Algorithm/) - another one-dimensional DP
- [Dynamic Programming overview](../../README.md)
