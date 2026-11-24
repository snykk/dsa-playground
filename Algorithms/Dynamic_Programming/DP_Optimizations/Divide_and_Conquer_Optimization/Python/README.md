# Divide and Conquer Optimization -- Python Implementation

The layered DP `dp[g][i] = min over j < i of dp[g-1][j] + C(j, i)` with each layer computed by the divide-and-conquer recursion, the plain DP beside it, and the groups read back from the best `j` of every cell. The example cost is the square of a group's sum. For the idea, the trace and the complexity, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `divide_and_conquer_optimization.py` | `min_cost_partition`, `min_cost_partition_plain`, `partition_dp` and a demo |
| `divide_and_conquer_optimization_test.py` | 30 unit tests: the worked example, its recursion call by call and its cost evaluations; the recursion against the plain DP (1500 random inputs) and both against every split (1500 inputs, tie rule included); the groups; the quadrangle inequality and the monotone `opt`; a cost that breaks it (pinned wrong answers, 3000 random inputs); edge cases; the number of cost evaluations on growing `n`, and a recursion that does not narrow failing that bound |

## API

| Function | Returns | Time | Space |
|----------|---------|------|-------|
| `min_cost_partition(values, k)` | `(cost, bounds)`: the least sum of `(group sum)^2` over `k` contiguous non-empty groups, with the recursion | O(k n log n) | O(k n) |
| `min_cost_partition_plain(values, k)` | the same `(cost, bounds)`, from the plain DP | O(k n^2) | O(k n) |
| `partition_dp(n, k, cost, optimized=True)` | `(cost, bounds)` for any `cost(j, i)` of the group `[j, i)`; `optimized=False` is the plain DP | O(k n log n) or O(k n^2) calls of `cost` | O(k n) |

`bounds` has `k + 1` entries, `0 = bounds[0] < ... < bounds[k] = n`, and group `g` is `values[bounds[g]:bounds[g + 1]]`. Of several best splits the functions return the one whose last cut is smallest, then the cut before it, and so on.

`min_cost_partition` and `min_cost_partition_plain` raise `ValueError` for `k < 1`, `k > len(values)` (so for every `k` on an empty list) and a negative value; `partition_dp` raises `ValueError` for `k < 1` or `k > n`. `partition_dp` with `optimized=True` is right only when the smallest best `j` is monotone in `i`; it does not check.

```python
from itertools import accumulate
from divide_and_conquer_optimization import min_cost_partition, min_cost_partition_plain, partition_dp

values = [3, 1, 4, 1, 5, 9, 2, 6]
print(min_cost_partition(values, 3))        # (341, [0, 4, 6, 8]): [3, 1, 4, 1] [5, 9] [2, 6]
print(min_cost_partition_plain(values, 3))  # (341, [0, 4, 6, 8])

p = list(accumulate([1, 2, 4, -5], initial=0))
square = lambda j, i: (p[i] - p[j]) ** 2
print(partition_dp(4, 2, square, optimized=True))   # (10, [0, 2, 4]): wrong, opt is not monotone
print(partition_dp(4, 2, square, optimized=False))  # (2, [0, 1, 4])
```

## Python-Specific Notes

- **Helpers at module level.** `_group_cost` computes one cost, `_best_split` tries a range of `j` for one cell, and `_solve_range` is the recursion of one layer. The tests replace them to record every call and count every cost evaluation, and the site's fixture generator records the recursion the same way. One test replaces `_solve_range` with a version that passes the whole range of `j` to every call: its answers are right, but it makes exactly as many evaluations as the plain DP and fails the bound.
- **No overflow.** Python's integers are unbounded, so `[3037000499, 1]` in two groups returns 9223372030926249002 exactly, where C++ and Go report an overflow.
- **Recursion depth.** The recursion of a layer is about `log2(n)` calls deep, far below Python's default limit of 1000.
- **Prefix sums** come from `itertools.accumulate(values, initial=0)`, and each cost is a lambda over them, so `partition_dp` sees the concrete problem as one more cost function.

## How to Run

```bash
cd "Algorithms/Dynamic_Programming/DP_Optimizations/Divide_and_Conquer_Optimization/Python"
python3 -m unittest divide_and_conquer_optimization_test
python3 divide_and_conquer_optimization.py   # demo: the worked example and the failing cost
```

## Key Takeaways

1. Solve the middle cell first; its best `j` splits the search for both halves.
2. The narrowing is only correct when `opt` is monotone: check the quadrangle inequality, or compare with the plain DP.
3. A strict `<` over `j` going up fixes the groups returned, in every language.
