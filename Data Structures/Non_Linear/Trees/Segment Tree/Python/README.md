# Segment Tree -- Python Implementation

A bottom-up segment tree for range sums and point assignment. See the [topic README](../README.md) for the layout and traces.

## Files

| File | Contents |
| ---- | -------- |
| `segment_tree.py` | `SegmentTree` |
| `segment_tree_test.py` | unit tests, index-error tests, negative values and a randomized test against brute force |

## API

| Call | Result |
| ---- | ------ |
| `SegmentTree(arr)` | builds the tree in O(n) |
| `update(index, value)` | assigns `value` to element `index` |
| `query(left, right)` | sum of elements `left..right`, inclusive |
| `get(index)` | one element |

Indices outside `0..n-1`, and `left > right`, raise `IndexError`.

## Python-Specific Notes

- Python integers do not overflow, so sums match the other languages only while they fit in 64 bits.
- Negative indices are rejected instead of wrapping like list indices; they used to read internal nodes silently.
- The internal list `self.tree` has length `2 * size` with position 0 unused.
- The class is sum-only; there is no range update.

## How to Run

```bash
cd "Data Structures/Non_Linear/Trees/Segment Tree/Python"
python3 -m unittest segment_tree_test
```

## Key Takeaways

- `size` is the next power of two; leaves are at `size + i`.
- A query takes at most two nodes per level.
- `update` assigns a value.
