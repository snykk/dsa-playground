# Fractional Knapsack -- Python Implementation

Greedy fractional knapsack: items are `(value, weight)` tuples.

## Files

| File | Contents |
|------|----------|
| `fractional_knapsack.py` | `fractional_knapsack` and `fractional_knapsack_value_only` |
| `fractional_knapsack_test.py` | 9 `unittest` tests (classic case with exact fractions, all items fit, no item fits whole, empty, zero capacity, input untouched, greedy vs 0/1, zero-weight items) |

## API

| Function | Returns |
|----------|---------|
| `fractional_knapsack(items, capacity)` | `(max_value, selected)` where `selected` is a list of `(value, weight, fraction)` in the order taken; `(0, [])` for no items or capacity <= 0 |
| `fractional_knapsack_value_only(items, capacity)` | only the maximum value; 0 for no items or capacity <= 0 |

```python
from fractional_knapsack import fractional_knapsack

fractional_knapsack([(60, 10), (100, 20), (120, 30)], 50)
# (240.0, [(60, 10, 1.0), (100, 20, 1.0), (120, 30, 0.6666666666666666)])
```

## Python-Specific Notes

- Both functions sort a copy, so the caller's list keeps its order.
- A zero-weight item gets the ratio `float('inf')` and is taken whole first (it used to raise `ZeroDivisionError`).
- Totals mix `int` and `float`, so the result can be an `int` or a `float`; compare with `assertAlmostEqual`.
- Only the Python version returns the fractions taken.

## How to Run

```bash
cd "Algorithms/Greedy/Fractional_Knapsack/Python"
python3 -m unittest fractional_knapsack_test
```

## Key Takeaways

- Sort by value / weight, take whole items, cut the last one.
- The value-only function is the lighter choice when the fractions are not needed.
- Use dynamic programming, not this, when items cannot be split.
