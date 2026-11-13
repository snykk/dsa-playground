# Interval Tree -- Python Implementation

An augmented binary search tree of closed intervals. See the [topic README](../README.md) for the algorithms.

## Files

| File | Contents |
| ---- | -------- |
| `interval_tree.py` | `Interval`, `IntervalNode`, `IntervalTree` |
| `interval_tree_test.py` | unit tests, exact-result checks, a scaling regression test and a randomized test against brute force with a `max` checker |

## API

| Call | Result |
| ---- | ------ |
| `Interval(low, high, data=None)` | closed interval; raises `ValueError` if `low > high` |
| `Interval.overlaps(other)`, `contains_point(x)` | predicates |
| `IntervalTree()` | empty tree |
| `insert(interval)` | adds an interval (an `Interval` or a `(low, high)` tuple) |
| `search_overlapping(q)` | list of intervals overlapping `q` |
| `search_containing_point(x)` | intervals containing `x` |
| `search_contained_in(q)` | intervals fully inside `q` |
| `delete(interval)` | removes one equal interval; no-op if absent |
| `inorder_traversal()`, `size()`, `is_empty()` | sorted list, count, emptiness |

## Python-Specific Notes

- Results are lists of the stored `Interval` objects, in tree order, not sorted by anything in particular.
- The tree is not balanced and the code is recursive: sorted input of more than about a thousand intervals hits the default recursion limit.
- `Interval.data` carries an optional payload; it is ignored by every query.

## How to Run

```bash
cd "Data Structures/Non_Linear/Trees/Interval Tree/Python"
python3 -m unittest interval_tree_test
```

## Key Takeaways

- `max` is repaired only along the path of an insert or delete.
- Equal `low` values go to the right.
- Overlap queries are pruned, but not guaranteed O(log n + k).
