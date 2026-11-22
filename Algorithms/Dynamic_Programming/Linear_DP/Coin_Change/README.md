# Coin Change

Given coin values and a target amount, find the fewest coins that sum to it (or count the ways to make it). A one-dimensional table over the amounts `0..amount` solves it in O(n * amount) time and O(amount) space, and works for any coin set, where "largest coin first" does not.

## Intuition

To pay `a` with the fewest coins, look at the last coin `c` you hand over: the rest is an optimal payment of `a - c`. Try every coin and keep the best. So `dp[a]` is one more than the smallest `dp[a - c]` over all coins `c <= a`, with `dp[0] = 0` and unreachable amounts at infinity.

Greedy picks the largest coin first and can be wrong: with coins `{1, 3, 4}` and amount 6 it pays 4 + 1 + 1 (three coins) while 3 + 3 needs two.

## Visual

Coins `{1, 2, 5}`, amount 11. The row is `dp[a]`; the answer is the last entry.

```text
a      0  1  2  3  4  5  6  7  8  9  10  11
dp[a]  0  1  1  2  2  1  2  2  3  3   2   3
```

Walking back from 11: coin 5 (to 6), coin 5 (to 1), coin 1 (to 0). The coins are 5, 5, 1.

## How It Works

1. `dp[0] = 0` and every other entry is infinity. A negative amount raises an error; amount 0 returns 0.
2. For each coin `c` and each `a` from `c` to `amount`: `dp[a] = min(dp[a], dp[a - c] + 1)`. The upward sweep lets a coin be reused.
3. Return `dp[amount]`, or `-1` if it is still infinity.

Variants in the Python file:
- `coin_change_ways`: `dp[0] = 1` and `dp[a] += dp[a - c]`, with coins in the outer loop, which counts combinations (order ignored).
- `coin_change_01`: each coin at most once, so the amount sweep runs downward (from `amount` to `c`).

## Step-by-Step Trace

`dp[11]` for coins `{1, 2, 5}`, in the order the coin-outer loop updates it. When coin 1 is processed, `dp[10]` is still 10 (1-coins only); when coin 2 is processed, `dp[9]` is 5:

| Coin | Candidate | Value |
|------|-----------|-------|
| 1 | `dp[10] + 1` | 11 |
| 2 | `dp[9] + 1` | 6 |
| 5 | `dp[6] + 1` | 3 |

The minimum is 3. For the counting version with amount 5, the table after each coin is `1,0,0,0,0,0` then `1,1,1,1,1,1` (coin 1), `1,1,2,2,3,3` (coin 2) and `1,1,2,2,3,4` (coin 5): there are 4 ways (5; 2+2+1; 2+1+1+1; 1+1+1+1+1).

## Complexity

| Aspect | Cost | Why |
|--------|------|-----|
| Time | O(n * amount) | one pass over the amounts per coin |
| Space | O(amount) | a single array |
| Plain recursion | exponential | repeated subproblems |

It is pseudo-polynomial: the time depends on the value of `amount`.

## When to Use

Use it for:
- fewest coins (or items) that reach an exact total;
- counting combinations or sequences that reach a total;
- coin sets that are not known to be canonical.

Do not use it when:
- the amount is huge (10^9 or more);
- the coin system is canonical and speed matters (greedy is enough).

## Coin Change vs. Alternatives

| Method | Time | Optimal | Note |
|--------|------|---------|------|
| DP over amounts | O(n * amount) | Yes | any coin set |
| Greedy, largest coin first | O(n log n) | No | only for canonical systems |
| Plain recursion | exponential | Yes | recomputes subproblems |
| 0/1 Knapsack | O(n * W) | Yes | each item once; related sweep direction |

## Common Pitfalls

1. Using greedy: `{1, 3, 4}`, amount 6 gives 3 coins instead of 2.
2. Loop order when counting: coins outside counts combinations (4 for amount 5 above), amounts outside counts ordered sequences (9).
3. Sweep direction: upward reuses coins, downward uses each once. `coin_change_01([1, 2, 5], 11)` is `-1`, because all three coins together make only 8.
4. Adding 1 to the infinity sentinel in C++ or Go: check that `dp[a - c]` is reachable first, as the code does.
5. Forgetting that amount 0 needs 0 coins and has 1 way.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `coin_change.py` | `coin_change_min_coins`, `coin_change_ways`, `coin_change_01` |
| C++ | [C++/](C++/) | `coin_change.cpp` | `coinChangeMinCoins` only |
| Go | [Go/](Go/) | `main.go` | `CoinChangeMinCoins` only |

All three raise an error for a negative amount and return `-1` when the amount cannot be made.

## Practice Problems

- [Coin Change (LeetCode 322)](https://leetcode.com/problems/coin-change/)
- [Coin Change II (LeetCode 518)](https://leetcode.com/problems/coin-change-ii/)
- [Combination Sum IV (LeetCode 377)](https://leetcode.com/problems/combination-sum-iv/)
- [Perfect Squares (LeetCode 279)](https://leetcode.com/problems/perfect-squares/)

## Related

- [0/1 Knapsack](../../2D_DP/0_1_Knapsack/) - the same idea with each item used once
- [Climbing Stairs](../../Basic_DP/Climbing_Stairs/) - counting with steps as coins
- [Fibonacci Numbers](../../Basic_DP/Fibonacci_Numbers/) - the first one-dimensional DP
- [Dynamic Programming overview](../../README.md)
