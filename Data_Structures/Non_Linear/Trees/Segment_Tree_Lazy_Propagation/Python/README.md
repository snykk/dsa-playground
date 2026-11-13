# Segment Tree (Lazy Propagation) -- Python Implementation

A recursive segment tree with lazy tags: range add and range sum. See the [topic README](../README.md) for the idea and a trace.

## Files

| File | Contents |
| ---- | -------- |
| `segment_tree_lazy.py` | `LazySegmentTree` |
| `segment_tree_lazy_test.py` | unit tests, an empty-array test and a randomized test against brute force |

## API

| Call | Result |
| ---- | ------ |
| `LazySegmentTree(arr)` | builds the tree in O(n) |
| `update_range(left, right, val)` | adds `val` to every element of `left..right` (inclusive) |
| `query(left, right)` | sum of elements `left..right` (inclusive) |

There is no index validation: a range partly outside the array is clipped, and a range outside does nothing.

## Python-Specific Notes

- Python integers are unbounded, so `val * length` cannot overflow.
- `tree` and `lazy` are lists of length `4 * n`; the module has no demo block, so running the file prints nothing.
- The recursion depth is about `log2(n)`.

## How to Run

```bash
cd "Data_Structures/Non_Linear/Trees/Segment_Tree_Lazy_Propagation/Python"
python3 -m unittest segment_tree_lazy_test
```

## Key Takeaways

- Tags rest only on fully covered nodes.
- Push down before recursing into a partial node.
- A push scales the tag by each child's own length.
