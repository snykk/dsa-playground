# DP on Trees (C++)

C++ scaffold for Dynamic Programming on Trees, a technique that computes optimal values by propagating DP states from leaves to root (or root to leaves) in a tree structure. The full implementation is in the Python directory.

## Files

| File | Description |
|------|-------------|
| `tree_dp.cpp` | Placeholder structure (see Python for full implementation) |
| `tree_dp_test.cpp` | Basic structure test |

## How to Run

```bash
g++ -std=c++17 -DTESTING -o test tree_dp_test.cpp
./test
```

## Key Concepts

| Concept | Description | Typical Complexity |
|---------|-------------|-------------------|
| Maximum Independent Set | Select nodes with maximum sum such that no two adjacent nodes are chosen | O(n) |
| Maximum Path Sum | Find the path through the tree with the largest total value | O(n) |
| State: `(include, exclude)` | For each node, track the optimal value when the node is included vs. excluded | -- |

## Complexity

| Aspect | Complexity |
|--------|-----------|
| Time | O(n) where n = number of nodes |
| Space | O(n) for recursion stack and DP values |

## Notes

- Tree DP uses post-order DFS: process all children before the current node.
- Each node typically stores two states (include/exclude) to handle adjacency constraints.
- The Python implementation contains complete solvers for Maximum Independent Set and Maximum Path Sum.
- See `../Python/tree_dp.py` for the full working implementation.

---

_Last Updated: April 2026_
