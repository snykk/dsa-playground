# Fibonacci Numbers

The Fibonacci numbers satisfy `F(0) = 0`, `F(1) = 1` and `F(n) = F(n-1) + F(n-2)`. Computing them by plain recursion takes exponential time because the same values are recomputed again and again, which makes them the standard first example of dynamic programming: memoization or a bottom-up loop gives O(n) time, and matrix powers give O(log n) arithmetic operations.

## Intuition

`F(5)` needs `F(4)` and `F(3)`. `F(4)` also needs `F(3)`, and both need `F(2)`, and so on. A naive recursion repeats those calls, but there are only `n + 1` distinct values. Compute each one once, store it, and reuse it. Each value depends only on the previous two, so even the table can be replaced by two variables.

## Visual

The call tree of the naive recursion for `F(5)` has 15 calls. Starred calls repeat a value that was already computed.

```text
F5
+-- F4
|   +-- F3
|   |   +-- F2
|   |   |   +-- F1
|   |   |   +-- F0
|   |   +-- F1*
|   +-- F2*
|       +-- F1*
|       +-- F0*
+-- F3*
    +-- F2*
    |   +-- F1*
    |   +-- F0*
    +-- F1*
```

Only 6 of the 15 calls are first occurrences. The bottom-up table for `n = 10`:

```text
index   0  1  2  3  4  5  6   7   8   9  10
F(i)    0  1  1  2  3  5  8  13  21  34  55
```

## How It Works

1. Base cases: `F(0) = 0`, `F(1) = 1`.
2. Memoization (top-down): recurse, but store every result in a dictionary and return the stored value on a repeat.
3. Tabulation (bottom-up): fill `dp[2..n]` with `dp[i] = dp[i-1] + dp[i-2]`.
4. Space-optimized: keep only `prev2` and `prev1` and slide them forward.
5. Matrix power (Python only): `[[1,1],[1,0]]^n` has `F(n)` as its top-right entry; exponentiation by squaring needs O(log n) matrix products.

Every function rejects a negative `n` (Python `ValueError`, C++ `std::invalid_argument`, Go panic).

## Step-by-Step Trace

`fibonacci_optimized(6)`:

| i | prev2 | prev1 | current |
|---|-------|-------|---------|
| start | 0 | 1 | |
| 2 | 0 | 1 | 1 |
| 3 | 1 | 1 | 2 |
| 4 | 1 | 2 | 3 |
| 5 | 2 | 3 | 5 |
| 6 | 3 | 5 | 8 |

The answer is the last `current`, 8, which is stored in `prev1`. In the naive version `fibonacci_naive(10)` makes 177 calls and `fibonacci_naive(30)` makes 2,692,537; the memoized version makes 19 calls for `n = 10`.

## Complexity

| Approach | Time | Space | Note |
|----------|------|-------|------|
| Naive recursion | O(2^n) (Theta(1.618^n)) | O(n) | recomputes values |
| Memoization | O(n) | O(n) | recursion depth `n` |
| Tabulation | O(n) | O(n) | no recursion |
| Two variables | O(n) | O(1) | the usual choice |
| Matrix power | O(log n) multiplications | O(log n) stack | the Python `matrix_power` is recursive |

For very large `n` the numbers themselves have about `0.2 * n` digits, so the additions are not constant-time in Python.

## When to Use

Use it:
- to learn memoization versus tabulation;
- to count things that follow the Fibonacci recurrence (climbing stairs with steps 1 and 2, domino tilings of a 2 x n strip);
- the matrix method when `n` is huge, or when you need `F(n)` modulo a number.

Do not use the naive recursion for anything beyond about `n = 35`.

## Fibonacci Numbers vs. Alternatives

| Method | Time | Space | Catch |
|--------|------|-------|-------|
| Naive recursion | O(2^n) | O(n) | exponential |
| Memoization | O(n) | O(n) | recursion limit (Python fails at about n = 1000) |
| Two variables | O(n) | O(1) | none for moderate `n` |
| Matrix power | O(log n) | O(log n) | more code, big integers grow |
| Closed formula (Binet) | O(1) with floats | O(1) | floating-point error for large `n` |

## Common Pitfalls

1. Overflow: `F(92) = 7540113804746346429` is the last value that fits in a signed 64-bit integer. `F(93)` overflows: signed overflow is undefined behaviour in C++, and Go silently wraps. Python has no limit.
2. Recursion depth: `fibonacci_memoization(3000)` raises `RecursionError` in Python.
3. Wrong base cases: starting both `F(0)` and `F(1)` at 1 shifts every index.
4. Negative `n` is an error in these implementations; they do not extend the sequence backwards.
5. Naive recursion looks fine at `n = 30` and is hopeless at `n = 50`.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `fibonacci.py` | naive, memoization, tabulation, optimized, matrix, `fibonacci_sequence` |
| C++ | [C++/](C++/) | `fibonacci.cpp` | tabulation, optimized, memoization; `long long` results |
| Go | [Go/](Go/) | `main.go` | tabulation and optimized; `int64` results |

## Practice Problems

- [LeetCode 509. Fibonacci Number](https://leetcode.com/problems/fibonacci-number/) - the definition itself
- [LeetCode 70. Climbing Stairs](https://leetcode.com/problems/climbing-stairs/) - the same recurrence in disguise
- [LeetCode 1137. N-th Tribonacci Number](https://leetcode.com/problems/n-th-tribonacci-number/) - three previous terms
- [LeetCode 746. Min Cost Climbing Stairs](https://leetcode.com/problems/min-cost-climbing-stairs/) - a minimum instead of a sum
- [LeetCode 198. House Robber](https://leetcode.com/problems/house-robber/) - a two-variable DP

## Related

- [Climbing Stairs](../Climbing_Stairs/) - ways(n) = F(n + 1)
- [Coin Change](../../Linear_DP/Coin_Change/) - a one-dimensional DP over amounts
- [Matrix Exponentiation](../../../Mathematical_Algorithms/Advanced_Math/Matrix_Exponentiation/) - the general tool behind the matrix method
- [Dynamic Programming overview](../../README.md)
