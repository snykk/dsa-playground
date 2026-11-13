# Prefix Sum and Difference Array -- Python Implementation

Prefix sums for range queries and difference arrays for range updates. See the [topic README](../README.md) for the idea.

## Files

| File | Contents |
|------|----------|
| `prefix_sum.py` | `PrefixSum`, `DifferenceArray`, two helpers and a demo `main` |
| `prefix_sum_test.py` | Unit tests for both classes and both helpers |

## API

- `PrefixSum(arr)`: builds the prefix array in O(n). `query(left, right)` returns the inclusive range sum in O(1).
- `DifferenceArray(size)`: `update(left, right, value)` in O(1) and `get_array()` in O(n).
- `range_sum_queries(arr, queries)`: answers a list of `(left, right)` pairs.
- `range_updates(arr, updates)`: applies `(left, right, value)` updates to a copy of `arr` and returns the result.

## Python-Specific Notes

- Integers never overflow.
- Indices are not validated: `right >= len(arr)` raises `IndexError`, and a negative `right` wraps around silently.
- The helpers are Python-only; C++ and Go expose just the two classes.

## How to Run

```bash
python3 -m unittest prefix_sum_test
python3 prefix_sum.py
```

## Key Takeaways

- A leading zero makes every range query `prefix[r + 1] - prefix[l]`.
- The difference array needs one spare cell.
- Updates commute, so batch them and read once.
