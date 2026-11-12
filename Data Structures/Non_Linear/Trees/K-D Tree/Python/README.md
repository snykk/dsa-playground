# K-D Tree -- Python Implementation

A k-dimensional binary search tree with build, insert, nearest-neighbour and range queries, for any dimensionality. See the [topic README](../README.md) for the idea and a trace.

## Files

| File | Contents |
| ---- | -------- |
| `kd_tree.py` | `KDTree` (and the private `_Node` dataclass) plus a small demo under `__main__` |
| `kd_tree_test.py` | tests for 2D and 3D nearest and range queries against brute force, dimension errors, and a 5000-node chain |

## API

| Call | Result |
| ---- | ------ |
| `KDTree(points=None)` | balanced build from a list of equal-length tuples; `ValueError` on mixed sizes |
| `dimensionality` | the number k (0 for an empty tree) |
| `insert(point)` | adds a point as a leaf; no rebalancing; `ValueError` on a wrong size |
| `nearest(query)` | the closest stored point, or `None` on an empty tree; `ValueError` on a wrong size |
| `range_search(lower, upper)` | list of points inside the box, in pre-order; `ValueError` on wrong-sized bounds |

## Python-Specific Notes

- Points are tuples of numbers, so they are immutable and hashable.
- The build sorts the points at every level (`pts.sort`), which is O(n log^2 n) overall, not O(n log n).
- `nearest` and `range_search` use an explicit stack instead of recursion, so a chain built by thousands of sorted inserts does not raise `RecursionError`. (The recursive build is only as deep as a balanced tree.)
- Squared distances are compared everywhere, so there is no `sqrt` in the hot loop.
- `insert` does not rebalance: for streaming data, rebuild periodically.

## How to Run

```bash
cd "Data Structures/Non_Linear/Trees/K-D Tree/Python"
python3 -m unittest kd_tree_test
python3 kd_tree.py    # demo
```

## Key Takeaways

- The far-side test `diff * diff < best` is the whole pruning rule.
- Build from the full list for balance; sorted inserts make a chain.
- Compare squared distances.
