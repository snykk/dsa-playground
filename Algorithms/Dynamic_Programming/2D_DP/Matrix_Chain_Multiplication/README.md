# Matrix Chain Multiplication

Matrix multiplication is associative, so every parenthesization of a chain of matrices gives the same product, but the number of scalar multiplications differs a lot. This problem finds the cheapest order with an interval DP in O(n^3) time and O(n^2) space. It never multiplies any matrices: only the dimensions matter.

## Intuition

Multiplying a `p x q` matrix by a `q x r` matrix costs `p * q * r` scalar multiplications. With `A` 10x100, `B` 100x5 and `C` 5x50, `(A B) C` costs 5000 + 2500 = 7500, while `A (B C)` costs 25000 + 50000 = 75000.

The input is `dims = [p0, p1, ..., pn]`: matrix `Ai` is `dims[i-1] x dims[i]`, so `n + 1` numbers describe `n` matrices. In the best order of `Ai..Aj`, the last multiplication joins `Ai..Ak` with `A(k+1)..Aj` for some `k`. The two halves are independent, so each must itself be optimal.

## Visual

`dims = [40, 20, 30, 10, 30]`: `A1` 40x20, `A2` 20x30, `A3` 30x10, `A4` 10x30. Each cell is the cost, with the best split `k` in brackets.

```text
         j=1      j=2          j=3          j=4
  i=1     0     24000 [1]    14000 [1]    26000 [3]   <- answer
  i=2             0           6000 [2]    12000 [3]
  i=3                            0         9000 [3]
  i=4                                         0
```

The order that gives 26000 is `((A1 (A2 A3)) A4)`.

## How It Works

1. `dp[i][i] = 0`: one matrix needs no multiplication.
2. For chain length `len = 2..n`, for each `i`, with `j = i + len - 1`:
   `dp[i][j] = min over k in [i, j-1] of dp[i][k] + dp[k+1][j] + dims[i-1] * dims[k] * dims[j]`.
3. The answer is `dp[1][n]`.

Filling by chain length guarantees that both sub-chains are already computed. With fewer than two matrices (`len(dims) < 3`) all three implementations return 0. They return only the cost; to recover the order, store the best `k` of each cell in a second table and print recursively.

## Step-by-Step Trace

The cell `dp[1][4]` of the example:

| Split k | Left + right + join | Total |
|---------|---------------------|-------|
| 1 | `dp[1][1] + dp[2][4] + 40*20*30` = 0 + 12000 + 24000 | 36000 |
| 2 | `dp[1][2] + dp[3][4] + 40*30*30` = 24000 + 9000 + 36000 | 69000 |
| 3 | `dp[1][3] + dp[4][4] + 40*10*30` = 14000 + 0 + 12000 | 26000 |

The minimum is 26000 at `k = 3`. Unrolling: `dp[1][3]` used `k = 1`, so the order is `((A1 (A2 A3)) A4)`: 6000 for `A2 A3`, 8000 for `A1` times it, 12000 for the last product. Multiplying left to right costs 48000.

## Complexity

| Aspect | Cost | Why |
|--------|------|-----|
| Time | O(n^3) | about `n^2 / 2` intervals, up to `n - 1` splits each |
| Space | O(n^2) | the table (half of it unused) |
| Brute force | Catalan(n-1) orders | 4,862 for 10 matrices, 1,767,263,190 for 20 |

Faster algorithms exist (Hu and Shing, O(n log n)), but they are much more complex and are not in this repository.

## When to Use

Use it when:
- you must choose the order of a product of several matrices (or tensors);
- a problem splits a range at one point and combines two independent halves (interval DP).

Do not use it when:
- the chain has thousands of matrices and cubic time is too slow;
- real running time depends on more than the scalar-multiplication count (sparsity, cache, parallelism).

## Matrix Chain Multiplication vs. Alternatives

| Approach | Time | Result |
|----------|------|--------|
| Interval DP (this code) | O(n^3) | exact minimum cost |
| Try every parenthesization | Catalan(n-1) orders | exact, only for tiny `n` |
| Always left to right | O(n) | valid but can be far from optimal (48000 vs 26000 above) |
| Hu-Shing | O(n log n) | exact, complex |

## Common Pitfalls

1. Confusing the dimension list with the matrix list: `n` matrices need `n + 1` numbers.
2. 32-bit overflow: costs grow like the product of three dimensions, so `[2000, 2000, 2000]` (8 * 10^9) needs 64-bit costs. C++ uses `long long`, Go's `int` is 64-bit on 64-bit platforms, Python is unbounded.
3. Looping over `i` first instead of chain length, which reads cells that are not computed yet.
4. Wrong join cost: it is `dims[i-1] * dims[k] * dims[j]`.
5. Reading the answer from the wrong cell: it is `dp[1][n]`.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `matrix_chain.py` | `matrix_chain_multiplication(dims)` |
| C++ | [C++/](C++/) | `matrix_chain.cpp` | `matrixChainMultiplication(dims)`, `long long` cost |
| Go | [Go/](Go/) | `main.go` | `MatrixChainMultiplication(dims)`, `math.MaxInt` start value |

All three implement the same bottom-up function and return only the minimum cost.

## Practice Problems

- [Slimes (AtCoder DP N)](https://atcoder.jp/contests/dp/tasks/dp_n)
- [Minimum Score Triangulation of Polygon (LeetCode 1039)](https://leetcode.com/problems/minimum-score-triangulation-of-polygon/)
- [Minimum Cost to Cut a Stick (LeetCode 1547)](https://leetcode.com/problems/minimum-cost-to-cut-a-stick/)
- [Burst Balloons (LeetCode 312)](https://leetcode.com/problems/burst-balloons/)
- [Minimum Cost to Merge Stones (LeetCode 1000)](https://leetcode.com/problems/minimum-cost-to-merge-stones/)

## Related

- [Longest Common Subsequence](../Longest_Common_Subsequence/) - another 2D table over prefixes
- [Edit Distance](../Edit_Distance/) - a 2D DP with three transitions
- [0/1 Knapsack](../0_1_Knapsack/) - a 2D DP over items and capacity
- [Interval DP](../../Advanced_DP/Interval_DP/) - the general pattern this table follows, with more problems
- [Dynamic Programming overview](../../README.md)
