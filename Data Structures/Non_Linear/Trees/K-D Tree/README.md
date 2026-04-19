# K-D Tree (k-Dimensional Binary Search Tree)

> A **K-D Tree** is a binary search tree generalized to **k dimensions**: at each level, points are split by one coordinate axis (cycling through x, y, z, ...). Supports nearest-neighbor search and range queries in O(log n) expected time on balanced trees.

---

## 🎯 Intuition

A regular BST splits the number line: everything left of the root is smaller, everything right is larger. A K-D Tree does the same thing for **points in space**: at depth 0, split by x-coordinate. At depth 1, split by y. At depth 2, split by x again (or z, for 3D). And so on, cycling through dimensions.

Why? Because "find the nearest neighbor to a query point" is asked all the time:
- Autocomplete by distance ("what's the closest word to my typo?")
- Databases: "find stores within 5 km of this location"
- Machine learning: k-NN classification
- Graphics & physics: collision detection, ray tracing
- Robotics: motion planning

Brute force is O(n) per query. K-D Tree is O(log n) _expected_ on balanced data.

---

## 📊 Visual (2D)

```
Points: (7,2), (5,4), (9,6), (2,3), (4,7), (8,1)
Tree (cycling x, y, x, y, ...):

                  (7, 2)          ← depth 0, split by x
                 /      \
             (5, 4)      (9, 6)   ← depth 1, split by y
             /    \        /
        (2, 3)  (4, 7)  (8, 1)    ← depth 2, split by x again
```

At each level, the split axis is `depth % k`:
- **Depth 0 (split x):** left subtree has x < 7, right subtree has x ≥ 7.
- **Depth 1 (split y):** within the left subtree, left child has y < 4, right child has y ≥ 4.
- **Depth 2 (split x again):** and so on.

```
Spatially:
    10│        (4,7)             (9,6)
      │    (5,4) |                │
     5│──────────┼────────────────┤       ← x=7 vertical split (root)
      │ (2,3)    │          (8,1) │
      │          │                │
      0└─────────┴────────────────┘
                 7                10
```

---

## 🧮 Core Operations

### Build O(n log n)
Recursive construction: find the median along the current axis (use Quickselect for O(n) expected per level), place it as the root, recursively build left and right subtrees with the axis cycled.

### Insert O(log n) expected
Walk down from root, comparing at each level by the appropriate axis. Insert where you find a null child. Does **not** rebalance — repeated inserts on ordered data produce a degenerate tree.

### Nearest Neighbor O(log n) expected
Recursively search the subtree on the "query's side" of the split. Then check: could a point on the _other_ side be closer than the best we've found? If the perpendicular distance from the query to the splitting plane is less than the current best distance, yes — recurse into the other subtree too. Otherwise, prune.

### Range Search (rectangular region) O(√n + k)
Recurse into subtrees whose bounding boxes overlap the query rectangle. Report every stored point inside.

---

## ⏱️ Complexity

| Operation | Best / Average | Worst |
|-----------|----------------|-------|
| Build (balanced) | O(n log n) | O(n log n) |
| Insert | O(log n) | O(n) — unbalanced |
| Nearest Neighbor | O(log n) | O(n) — adversarial queries / high dimension |
| Range Search | O(√n + k) 2D / O(n^{1-1/k} + k) general | O(n + k) |

Note the **curse of dimensionality**: K-D Tree degrades fast as `k` grows. Past ~20 dimensions, performance is close to linear scan. For high-dim nearest-neighbor, use Ball Trees, Approximate NN (ANN / HNSW), or LSH instead.

---

## 🎯 When to Use

✅ **Use K-D Trees when:**
- Low-to-moderate dimensional points (k ≤ 10)
- Nearest-neighbor or range queries dominate
- Data is reasonably balanced (or you rebuild periodically)
- You need exact answers (not approximate)

❌ **Avoid when:**
- **High dimensional** (k ≥ 20) — use ANN-based structures (FAISS, HNSW)
- Data is very dynamic — K-D Trees don't rebalance on insert
- You only need nearest neighbor approximately — LSH is much faster at scale
- Range queries are always rectangular on axis-aligned grids — a grid-based index may be simpler

---

## ⚔️ K-D Tree vs. Alternatives

| Structure | Dim | NN Query | Good for |
|-----------|-----|----------|----------|
| **K-D Tree** | Low (≤ 10) | O(log n) expected | 2D/3D spatial search |
| **Ball Tree** | Medium (≤ 100) | O(log n) expected | Higher-dim, non-Euclidean metrics |
| **R-Tree** | Low | O(log n) | Range queries on rectangular objects (GIS) |
| **Octree / Quadtree** | Fixed 2D/3D | O(log n) | Grid-aligned subdivision, game engines |
| **HNSW / FAISS** | Any | Approximate, O(log n) | Web-scale embeddings (millions of points, k=768) |
| **Grid / Hash** | Any | O(1) per cell | Uniform point distribution, fixed-size queries |

---

## ⚠️ Common Pitfalls

1. **Insert-only trees become unbalanced.** If you insert random points, expected depth is O(log n). If you insert in sorted order by first axis, you get a left-spine degenerate tree. Rebuild periodically.
2. **Forgetting to check the other subtree in NN search.** The algorithm's correctness depends on "could a closer point exist on the other side of the split?" Drop that check and you get incorrect results.
3. **Axis cycling off-by-one.** At depth 0 you split by dim 0; at depth 1 by dim 1; at depth `d` by `d % k`. Swapping or shifting one index silently breaks search pruning.
4. **Distance function mismatch.** Usually Euclidean, but the split comparison must also be consistent with the metric. For Manhattan distance (L1), splits should still be axis-aligned but distance pruning uses |x - x'| rather than (x - x')².
5. **Curse of dimensionality sneaks up.** A tree that works beautifully in 3D may be no better than linear scan in 20D. Benchmark on realistic data.

---

## 🔧 Implementations

| Language | Folder | Notes |
|----------|--------|-------|
| Python | [Python/](Python/) | Supports arbitrary k via `Tuple[float, ...]`; includes nearest-neighbor and range-rect search |
| C++ | [C++/](C++/) | Template `<int K>` for compile-time dimensionality |
| Go | [Go/](Go/) | Runtime-variable dimensionality via `[]float64` |

---

## 📝 Practice Problems

- [LeetCode 973. K Closest Points to Origin](https://leetcode.com/problems/k-closest-points-to-origin/) — doable with K-D Tree
- [Codeforces 119D. String Transformation 2](https://codeforces.com/problemset/problem/119/D)
- [Kaggle KNN notebooks](https://www.kaggle.com/code/prashant111/k-nearest-neighbors-knn-classifier) — K-D Tree is what scikit-learn uses under the hood for `KNeighborsClassifier(algorithm='kd_tree')`
- [Range search / nearest-neighbor tutorials on CP-Algorithms](https://cp-algorithms.com/geometry/kd-trees.html)

---

## 🔗 Related

- [Binary Search Tree](../Binary%20Search%20Tree/README.md) — 1D ancestor
- [Segment Tree](../Segment%20Tree/README.md) — range queries on a single axis
- [Computational Geometry — Closest Pair](../../../../Algorithms/Computational_Geometry/Advanced_Geometry/Closest_Pair_of_Points/README.md) — alternative approach for the pair-closest-pair problem

---

_Part of [Non-Linear Data Structures — Trees](../README.md)._
