# Unbounded Knapsack -- Python Implementation

The one-row table going up (each item reusable) and going down (each item once), the multiset of items read back from it, the 2D table, and the two ways of counting. For the idea, the trace and the complexity, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `unbounded_knapsack.py` | `unbounded_knapsack`, `unbounded_knapsack_items`, `unbounded_knapsack_table`, `zero_one_knapsack`, `count_combinations`, `count_permutations` and a demo |
| `unbounded_knapsack_test.py` | 37 unit tests: the worked example and every update it makes, both loop directions against brute force (600 random inputs each), the multiset and its tie rule (800 random inputs, the rule checked against the table on 400), the table row by row, edge cases, bad input, exact large values, the counts against brute force (500 inputs), and the number of updates |

## API

| Function | Returns | Time | Space |
|----------|---------|------|-------|
| `unbounded_knapsack(weights, values, capacity)` | the best total value within `capacity`, each item usable any number of times | O(n * W) | O(W) |
| `unbounded_knapsack_items(weights, values, capacity)` | `(value, counts)`: the best value and `counts[i]` copies of item `i` that reach it | O(n * W) | O(W) |
| `unbounded_knapsack_table(weights, values, capacity)` | the `(n + 1) x (W + 1)` table: row `i` uses the first `i` items | O(n * W) | O(n * W) |
| `zero_one_knapsack(weights, values, capacity)` | the same loop with `w` going down: each item at most once | O(n * W) | O(W) |
| `count_combinations(weights, target)` | the number of multisets of items whose weights add up to `target` | O(n * target) | O(target) |
| `count_permutations(weights, target)` | the number of sequences of items whose weights add up to `target` | O(n * target) | O(target) |

All of them raise `ValueError` for a weight below 1, and the knapsack functions also for a negative capacity or lists of different lengths, the counts for a negative target. A capacity of 0, an empty list of items and items heavier than the capacity are fine: the answer is 0, `[0] * n` copies, and a target of 0 has one way.

```python
from unbounded_knapsack import (unbounded_knapsack, unbounded_knapsack_items, zero_one_knapsack,
                                count_combinations, count_permutations)

weights, values = [1, 3, 4, 5], [1, 4, 5, 7]
print(unbounded_knapsack(weights, values, 10))        # 14
print(unbounded_knapsack_items(weights, values, 10))  # (14, [0, 0, 0, 2])
print(zero_one_knapsack(weights, values, 10))         # 13
print(count_combinations([1, 2, 5], 5))               # 4
print(count_permutations([1, 2, 5], 5))               # 9
```

## Python-Specific Notes

- **Helpers at module level.** `_relax` does one `dp[w] = max(dp[w], dp[w - weight] + value)` and `_fill_row` runs the loops in either direction. The tests replace `_relax` to record every update and count them, and the site's fixture generator records the updates the same way.
- **The direction is a `range`.** `range(weight, capacity + 1)` goes up and `range(capacity, weight - 1, -1)` goes down; for an item heavier than the capacity both are empty.
- **No overflow.** Python's integers are unbounded, so a value or a count above 2^63 - 1 comes back exact, where C++ and Go report an overflow.
- **Input types are not checked.** Weights and the capacity must be integers (a float weight makes `range` raise `TypeError`); values may be any integers, and those of 0 or less are never taken.

## How to Run

```bash
cd "Algorithms/Dynamic_Programming/Linear_DP/Unbounded_Knapsack/Python"
python3 -m unittest unbounded_knapsack_test
python3 unbounded_knapsack.py   # demo: the worked example and the two counts
```

## Key Takeaways

1. `w` going up lets `dp[w - weight]` already contain the item: that is the reuse.
2. `choice[w]` changes only on a strict gain, so the multiset read back from it is fixed by the order of the items.
3. Items outside the loop count combinations; totals outside count permutations.
