# Fenwick Tree -- Python Implementation

A Fenwick tree (binary indexed tree) over a list of numbers. See the [topic README](../README.md) for the idea.

## Files

| File | Contents |
| ---- | -------- |
| `fenwick_tree.py` | `FenwickTree` |
| `fenwick_tree_test.py` | unit tests, index-error tests, negative values and a randomized test against brute force |

## API

| Call | Result |
| ---- | ------ |
| `FenwickTree(arr)` | builds from a list with `n` updates, O(n log n) |
| `update(index, delta)` | adds `delta` (negative allowed) to element `index` |
| `prefix_sum(index)` | sum of elements `0..index` |
| `query(left, right)` | sum of elements `left..right`, inclusive |
| `get(index)` | one element |

Indices outside `0..n-1`, and `left > right`, raise `IndexError`.

## Python-Specific Notes

- Python integers do not overflow, and any numeric type that supports `+=` works (floats accumulate rounding error).
- Negative indices are rejected instead of wrapping around as in a list; `update(-1, x)` used to loop forever.
- Internal cells live in `self.tree`, 1-based with cell 0 unused.

## How to Run

```bash
cd "Data_Structures/Non_Linear/Trees/Fenwick_Tree/Python"
python3 -m unittest fenwick_tree_test
```

## Key Takeaways

- `i & -i` isolates the lowest set bit; adding it climbs, subtracting it descends.
- `update` adds a delta; it does not assign.
- Validate indices before converting to 1-based.
