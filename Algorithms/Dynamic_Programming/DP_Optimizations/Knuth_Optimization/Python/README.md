# Knuth Optimization -- Python Implementation

Knuth's optimization of the interval DP `dp[i][j] = min over k of dp[i][k] + dp[k+1][j] + C(i, j)`: each cell tries only the splits between `split[i][j-1]` and `split[i+1][j]`, O(n^2) instead of O(n^3). Applied to Interval DP's pile merging (with the merges read back) and to the optimal binary search tree. For the idea, the trace and the complexity, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `knuth_optimization.py` | `split_dp`, `merge_piles`, `merge_piles_plan`, `optimal_bst` and a demo |
| `knuth_optimization_test.py` | 36 unit tests: the worked example and every candidate it tries, the tables against an independent plain DP (1500 seeded rows) and brute force, the window and the monotone split table, both conditions on the two costs, a cost that breaks them, the merges replayed and their tie rule, the optimal binary search tree against two brute forces, edge cases, exact large values, and the exact number of splits tried |

## API

| Function | Returns | Time | Space |
|----------|---------|------|-------|
| `split_dp(n, cost, knuth=True)` | `dp[0][n-1]` for `dp[i][j] = min over i <= k < j of dp[i][k] + dp[k+1][j] + cost(i, j)` over `n` points; with `knuth=False` every `k` is tried | O(n^2), or O(n^3) without the window | O(n^2) |
| `merge_piles(piles)` | the minimum total cost of merging neighbouring piles into one; a merge costs the size of the pile it makes | O(n^2) | O(n^2) |
| `merge_piles_plan(piles)` | `(cost, merges)`: each merge `(i, k, j)` joins piles `i..k` with piles `k+1..j`, in post-order, the smallest `k` on ties; the same list as Interval DP's `merge_piles_plan` | O(n^2) | O(n^2) |
| `optimal_bst(freq)` | the least `sum(freq[t] * depth(t))` over the binary search trees on keys `0..n-1`, the root at depth 1 | O(n^2) | O(n^2) |

All four raise `ValueError` for a value below 0: a pile, a frequency, a cost returned by `cost`, or `n`. No piles and one pile cost 0 (`(0, [])` for the plan), and no keys cost 0. `split_dp` with `knuth=True` is only right when `cost` satisfies the quadrangle inequality and is monotone on intervals; it does not check.

```python
import math
from knuth_optimization import merge_piles, merge_piles_plan, optimal_bst, split_dp

print(merge_piles([3, 2, 4, 1]))       # 20
print(merge_piles_plan([3, 2, 4, 1]))  # (20, [(0, 0, 1), (2, 2, 3), (0, 1, 3)])
print(optimal_bst([34, 8, 50]))        # 142

prefix = [0, 1, 2, 4, 5, 11]           # piles 1, 1, 2, 1, 6
root = lambda i, j: math.isqrt(prefix[j + 1] - prefix[i])
print(split_dp(5, root), split_dp(5, root, knuth=False))  # 8 7: this cost breaks the condition
```

## Python-Specific Notes

- **Helpers at module level.** `_window` gives the splits a cell tries, `_try_split` tries one of them, and `_fill` fills the tables for any cost (with or without the window). The tests replace `_try_split` to record every candidate and count them, and the site's fixture generator records them the same way. `_fill_merge` and `_fill_bst` return the tables (`dp`, `split`), so the tests compare them cell by cell with an independent plain DP.
- **The same tables as Interval DP.** `split` is `-1` on the diagonal and below it, as in Interval DP; the window of a range of two is `k = i` alone, so the diagonal is never read.
- **Infinity as the start value.** A cell starts at `float("inf")` when its turn comes and holds an integer after its first candidate; the finished table holds integers only.
- **No overflow.** Python's integers are unbounded: merging piles of 2^62 and 2^62 returns 2^63, where C++ and Go report an overflow.
- **A cost of your own.** `split_dp` calls `cost(i, j)` once for each range of two points or more, `n(n - 1) / 2` calls, by increasing length; give it an O(1) cost (prefix sums, for example) to keep the whole DP O(n^2).

## How to Run

```bash
cd "Algorithms/Dynamic_Programming/DP_Optimizations/Knuth_Optimization/Python"
python3 -m unittest knuth_optimization_test
python3 knuth_optimization.py   # demo: the worked example, a tree and a cost that breaks the condition
```

## Key Takeaways

1. Each cell tries `split[i][j-1]` to `split[i+1][j]`; along a diagonal those windows telescope to O(n).
2. The window holds the smallest best `k`, so the strict `<` gives the plain DP's table and merges.
3. Check the quadrangle inequality before trusting the window: with a cost that breaks it the answer is silently too large.
