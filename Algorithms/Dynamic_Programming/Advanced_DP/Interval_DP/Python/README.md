# Interval DP -- Python Implementation

Three interval DPs filled by increasing length: merging piles at the minimum cost (with the merges read back, and a top-down form), bursting balloons for the most coins, and cutting a string into palindromes. For the idea, the trace and the complexity, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `interval_dp.py` | `merge_piles`, `merge_piles_plan`, `merge_piles_memo`, `burst_balloons`, `min_palindrome_cuts` and a demo |
| `interval_dp_test.py` | 32 unit tests: the worked example and every candidate it tries, the three problems against brute force (every merge order, burst order and set of cuts, on 400, 300 and 500 seeded inputs), the merges replayed and their tie rule checked against brute force, the top-down form, the order of the fill, edge cases, exact large values, and the exact number of candidates |

## API

| Function | Returns | Time | Space |
|----------|---------|------|-------|
| `merge_piles(piles)` | the minimum total cost of merging neighbouring piles into one; a merge costs the size of the pile it makes | O(n^3) | O(n^2) |
| `merge_piles_plan(piles)` | `(cost, merges)`: each merge `(i, k, j)` joins piles `i..k` with piles `k+1..j`, in post-order, the smallest `k` on ties | O(n^3) | O(n^2) |
| `merge_piles_memo(piles)` | the same cost, computed top-down with a memo | O(n^3) | O(n^2) |
| `burst_balloons(nums)` | the most coins from bursting every balloon | O(n^3) | O(n^2) |
| `min_palindrome_cuts(s)` | the fewest cuts that split `s` into palindromes | O(n^3) | O(n^2) |

`merge_piles`, `merge_piles_plan`, `merge_piles_memo` and `burst_balloons` raise `ValueError` for a value below 0. No piles costs 0 (`(0, [])` for the plan), one pile costs 0, no balloons earn 0 and the empty string needs 0 cuts.

```python
from interval_dp import merge_piles, merge_piles_plan, merge_piles_memo, burst_balloons, min_palindrome_cuts

print(merge_piles([3, 2, 4, 1]))       # 20
print(merge_piles_plan([3, 2, 4, 1]))  # (20, [(0, 0, 1), (2, 2, 3), (0, 1, 3)])
print(merge_piles_memo([3, 2, 4, 1]))  # 20
print(burst_balloons([3, 1, 5, 8]))    # 167
print(min_palindrome_cuts("aab"))      # 1
```

## Python-Specific Notes

- **Helpers at module level.** `_try_split`, `_try_last` and `_try_cut` each try one candidate for one cell. The tests replace them to record every candidate and count them, and the site's fixture generator records the pile-merging candidates the same way. `_fill_merge` and `_fill_merge_memo` return the tables (`dp`, `split`, prefix sums), so the tests can compare the two forms cell by cell.
- **Infinity as the start value.** A cell of `merge_piles` starts at `float("inf")` when its turn comes and holds an integer after its first candidate; the finished table holds integers only.
- **Recursion.** `merge_piles_memo` recurses `n` calls deep, so past Python's default limit of 1000 frames it raises `RecursionError` (the tests check this), before doing much work. The loops of `merge_piles` have no such limit; at that size the cubic time is the real limit anyway.
- **No overflow.** Python's integers are unbounded: merging piles of 2^62 and 2^62 returns 2^63, where C++ and Go report an overflow.
- **Strings.** `min_palindrome_cuts` compares items with `==`, so a `str` is compared by code point (and a `bytes` object by byte, as C++ and Go do).

## How to Run

```bash
cd "Algorithms/Dynamic_Programming/Advanced_DP/Interval_DP/Python"
python3 -m unittest interval_dp_test
python3 interval_dp.py   # demo: the worked example and one call of each problem
```

## Key Takeaways

1. Fill by length: every cell reads only shorter ranges, which are then final.
2. A strict `<` with `k` going up keeps the smallest tied split, so the merges read back are fixed.
3. When the first choice makes the two sides interact, choose the last one instead (burst balloons).
