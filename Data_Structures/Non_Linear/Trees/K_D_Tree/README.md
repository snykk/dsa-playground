# K-D Tree (k-Dimensional Binary Search Tree)

A K-D tree is a binary search tree for points in k dimensions: each level splits the space by one coordinate, cycling through the axes. It answers nearest-neighbour and rectangular range queries by skipping regions that cannot contain an answer: O(log n) average for nearest neighbour on a balanced tree in low dimensions, about O(sqrt n + k) for a 2D range query.

## Intuition

A BST splits the number line: smaller keys left, larger keys right. A K-D tree does the same for points in space. Depth 0 splits on x, depth 1 on y, depth 2 on x again (or on z in 3D), so the split axis at depth `d` is `d mod k`. Each node stores one point and owns a rectangular region of space that its point cuts in two.

For nearest-neighbour search the payoff is the pruning rule: after searching the query's own side of a split, the other side only matters if the splitting line is closer to the query than the best point found so far. Otherwise the whole subtree is skipped.

Typical uses are spatial lookups ("nearest store"), k-NN on low-dimensional data, and geometry problems on point sets. Brute force is O(n) per query.

## Visual

Points `(7,2) (5,4) (9,6) (2,3) (4,7) (8,1)` built with the median builder:

```text
                (7,2)            depth 0, split on x
               /     \
          (5,4)       (9,6)      depth 1, split on y
          /    \       /
     (2,3)  (4,7)  (8,1)         depth 2, split on x again
```

```text
 y
 7 |            E
 6 |                          C
 5 |
 4 |         B
 3 |    D
 2 |                    A       <- root splits on x = 7
 1 |                       F
 0 +--0--1--2--3--4--5--6--7--8--9-- x
```

A = (7,2), B = (5,4), C = (9,6), D = (2,3), E = (4,7), F = (8,1). The left subtree (x < 7) is split by y = 4, the right subtree (x > 7) by y = 6.

## Operations

| Operation | What it does | Time |
| --------- | ------------ | ---- |
| build from points | sort by the current axis, take the median as the node, recurse | O(n log n) in C++, O(n log^2 n) in Python and Go |
| `insert(p)` | walk down by each level's axis, attach a leaf; no rebalancing | O(h) |
| `nearest(q)` | closest stored point (Euclidean) | O(log n) average, O(n) worst |
| `range_search(lo, hi)` | all points with `lo[i] <= p[i] <= hi[i]` on every axis | about O(sqrt n + k) in 2D |

### Nearest neighbour

1. Compute the distance (squared) from `q` to the node's point; keep the best so far.
2. Let `diff = q[axis] - node.point[axis]`. The near side is left if `diff < 0`, else right. Search it first.
3. Search the far side only if `diff^2 < best_squared_distance`.

### Range search

Report the node's point if it is inside the box. Go left if `lo[axis] <= point[axis]`, right if `hi[axis] >= point[axis]`.

## Step-by-Step Trace

Nearest to `(1, 3)` on the tree above (produced by running the Python implementation):

| Step | Node | Distance squared | Decision |
| ---- | ---- | ---------------- | -------- |
| 1 | `(7,2)` | 37 | best; 1 < 7, go left |
| 2 | `(5,4)` | 17 | best; y 3 < 4, go left |
| 3 | `(2,3)` | 1 | new best; leaf |
| 4 | back at `(5,4)` | plane distance squared 1 | 1 is not less than 1: skip `(4,7)` |
| 5 | back at `(7,2)` | plane distance squared 36 | skip the whole right subtree `(9,6)`, `(8,1)` |

Answer: `(2,3)`, with three of the six nodes visited.

Range search box `(3,3)` to `(8,7)`: the root `(7,2)` is outside (y = 2) but both sides are searched; `(5,4)` and `(4,7)` are inside. Result: `(5,4)`, `(4,7)`.

## Complexity

| Operation | Average | Worst |
| --------- | ------- | ----- |
| build | O(n log n) (C++), O(n log^2 n) (Python, Go) | same |
| insert | O(log n) | O(n), a chain after sorted inserts |
| nearest | O(log n) | O(n), adversarial queries or high dimension |
| range search | O(sqrt n + k) in 2D, O(n^(1-1/d) + k) in d dimensions | O(n) |

Python and Go sort at every level (O(n log n) each), giving O(n log^2 n); C++ uses `std::nth_element`, linear per level on average. Space is O(n).

The curse of dimensionality: with many dimensions the plane test prunes little and queries approach a linear scan. K-D trees suit roughly 2 to 10 dimensions.

## When to Use

- Static or mostly static point sets in low dimensions, with many nearest-neighbour or box queries.
- Not for very high dimensions (use approximate indexes), not for heavy streaming inserts (no rebalancing, no delete here), and not for tiny n (brute force is simpler).

## K-D Tree vs. Alternatives

| Structure | Dimensions | Good for |
| --------- | ---------- | -------- |
| K-D tree | low (about 2 to 10) | exact nearest and box queries |
| Quadtree / octree | fixed 2D / 3D | regular subdivision |
| R-tree | low | boxes and shapes, disk-friendly |
| Grid / hash | any, uniform data | O(1) cell lookup |
| HNSW, LSH | high | approximate nearest neighbours |
| Brute force | any | simplest, fine for small n |

## Common Pitfalls

- Skipping the far-side test: the search then returns a good point, not the nearest one.
- Mixing squared and plain distances in the plane test.
- Off-by-one in the axis (`depth mod k`).
- Inserting sorted points: the tree becomes a chain; build from the full list instead.
- Mixed dimensionality: Python raises `ValueError`, Go panics, C++ rejects it at compile time.
- Python's queries are iterative, but C++ and Go recurse; a chain of very many nodes can overflow the C++ stack.

## Implementations

| Language | Folder | Main file | Notes |
| -------- | ------ | --------- | ----- |
| Python | `Python/` | `kd_tree.py` | any k via tuples; iterative queries |
| C++ | `C++/` | `kd_tree.h` | template `size_t K`; `std::optional` result; `nth_element` build |
| Go | `Go/` | `main.go` | any k via `[]float64`; panics on wrong-sized queries |

## Practice Problems

- [K Closest Points to Origin (LeetCode 973)](https://leetcode.com/problems/k-closest-points-to-origin/) (usually a heap or quickselect; a K-D tree also works)
- [Queries on Number of Points Inside a Circle (LeetCode 1828)](https://leetcode.com/problems/queries-on-number-of-points-inside-a-circle/) (range search, then a distance check)
- [Minimum Euclidean Distance (CSES 2194)](https://cses.fi/problemset/task/2194) (nearest neighbour per point; a sweep line is the safe solution)
- Extend `nearest` to return the k nearest points with a bounded max-heap.
- Add delete (replace by the minimum along the node's axis from a subtree).
- Build with the widest-spread axis instead of cycling and compare query counts.

## Related

- [Binary Search Tree](../Binary_Search_Tree/README.md)
- [Segment Tree](../Segment_Tree/README.md)
- [Closest Pair of Points](../../../../Algorithms/Computational_Geometry/Advanced_Geometry/Closest_Pair_of_Points)
