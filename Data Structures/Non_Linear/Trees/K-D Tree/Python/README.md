# K-D Tree — Python Implementation

k-dimensional binary search tree supporting build, insert, nearest-neighbor, and range queries. Arbitrary dimensionality via tuple-typed points.

For the conceptual overview, visuals, and comparison with Ball Tree / HNSW / R-Tree, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `kd_tree.py` | `KDTree` class: `insert`, `nearest`, `range_search`, build-from-points |
| `kd_tree_test.py` | 15 tests covering 2D/3D nearest-neighbor, range queries, and adversarial cases |

---

## Python-Specific Notes

- **`Tuple[float, ...]`** for points: immutable, hashable, usable as dict keys. Python tuple iteration is efficient enough for the per-node distance computation.
- **Sort + median pivot** during build: O(n log n) total via `pts.sort(key=...)` at every level. For very large n, replace with Quickselect for O(n) per level → O(n log n) total with better constants.
- **Recursive NN search**: the early-termination pruning `diff * diff < best[1]` is the speed trick. Comparing squared distances avoids `sqrt` in the hot loop.
- **`dataclass` for `_Node`**: cleaner than a plain class; `__slots__` not used here for readability but worth adding for 100K+ node trees.
- **Insert doesn't rebalance**: documented behavior. Callers with streaming inserts should rebuild periodically or use a different structure (Ball Tree).

---

## How to Run

```bash
python3 -m unittest kd_tree_test.py
```

---

## Key Takeaways for Learners

1. **Compare squared distances, not distances.** The inequality `|a-b| < r` holds iff `(a-b)² < r²` for non-negative r. Skipping the square root saves ~5× in the inner loop.
2. **The "prune far subtree" step is the entire algorithm.** Without it, NN search is O(n). With it, O(log n) expected. Trace through a small example to see _which_ half gets pruned.
3. **Build order matters for balance.** Building from points via median-at-each-level gives a balanced tree; inserting one-by-one in arbitrary order gives an unbalanced tree. For static point sets, always build from the full list.
