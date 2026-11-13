# 0/1 Knapsack -- Python Implementation

Two bottom-up solutions to the 0/1 knapsack: a full 2D table and a one-row version.

## Files

| File | Contents |
|------|----------|
| `knapsack_01.py` | `knapsack_01` and `knapsack_01_optimized` |
| `knapsack_01_test.py` | `unittest` cases |

## API

| Function | Description | Time | Space |
|----------|-------------|------|-------|
| `knapsack_01(weights, values, capacity)` | 2D table `dp[i][w]`; returns the best value | O(n * W) | O(n * W) |
| `knapsack_01_optimized(weights, values, capacity)` | one array, `w` swept from `capacity` down to `weights[i]`; returns the best value | O(n * W) | O(W) |

Both return an `int` (the best value) and never the chosen items. They do not validate their input: `weights` and `values` must have the same length and `capacity` must be non-negative (a negative capacity raises `IndexError`).

```python
from knapsack_01 import knapsack_01, knapsack_01_optimized

print(knapsack_01([1, 3, 4, 5], [1, 4, 5, 7], 7))            # 9
print(knapsack_01_optimized([1, 3, 4, 5], [1, 4, 5, 7], 7))  # 9
```

## Python-Specific Notes

- Python integers do not overflow, so large values are safe.
- The 2D table is built with a list comprehension (`[[0] * (capacity + 1) for _ in range(n + 1)]`) so that rows are not aliased.
- The 1D version must sweep right to left (`range(capacity, weights[i] - 1, -1)`); a forward sweep would reuse items.
- Items of weight 0 are handled: they are taken whenever they add value.

## How to Run

From this folder:

```bash
python3 -m unittest knapsack_01_test
```

## Key Takeaways

- `dp[i][w]` reads only row `i-1`, which is what enforces "each item at most once".
- The 1D version saves memory but gives up item recovery, and its loop direction is the whole trick.
- The running time depends on the capacity value, not its size: it is pseudo-polynomial.
