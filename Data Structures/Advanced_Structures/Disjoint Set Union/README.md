# Disjoint Set Union (DSU)

The **Disjoint Set Union** (also called Union-Find) is a data structure that maintains a partition of elements into non-overlapping (disjoint) sets. It supports two primary operations -- **find** (determine which set an element belongs to) and **union** (merge two sets) -- both in nearly constant amortized time.

> **Note**: For graph-algorithm applications of Union-Find (cycle detection, Kruskal's MST, connected components), see [`Algorithms/Graph_Algorithms/Advanced_Graph/Union-Find_DSU/`](../../../Algorithms/Graph_Algorithms/Advanced_Graph/Union-Find_DSU/). This module focuses on the data structure itself: its internal representation, optimization techniques, and theoretical analysis.

---

## Core Operations

| Operation | Description | Time (amortized) | Space |
|-----------|-------------|-------------------|-------|
| `DSU(n)` | Initialize n singleton sets {0}, {1}, ..., {n-1} | O(n) | O(n) |
| `find(x)` | Return the representative (root) of the set containing x | O(alpha(n)) | O(1) |
| `union(x, y)` | Merge the sets containing x and y; return whether a merge occurred | O(alpha(n)) | O(1) |
| `connected(x, y)` | Check whether x and y belong to the same set | O(alpha(n)) | O(1) |
| `get_component_count()` | Return the current number of disjoint sets | O(1) | O(1) |
| `get_components()` | Return a mapping from each root to its members | O(n) | O(n) |
| `get_size(x)` | Return the size of the set containing x | O(alpha(n)) | O(1) |

Here alpha(n) is the **inverse Ackermann function**, which grows so slowly that it is at most 4 for any n up to 2^{65536} -- effectively constant.

---

## Visual Example

```
Initial state (5 elements):       After union(0,1) and union(2,3):
  {0} {1} {2} {3} {4}               {0,1} {2,3} {4}

  0   1   2   3   4                  0     2     4
                                     |     |
                                     1     3

After union(1,3):                  
  {0,1,2,3} {4}                    

      0
     / \
    1   2
        |
        3
```

---

## Path Compression

Without optimization, `find` may traverse a long chain. **Path compression** flattens the tree during `find` by pointing every visited node directly to the root.

```
Before find(3):          After find(3):
      0                       0
      |                     / | \
      1                    1  2  3
      |
      2
      |
      3
```

---

## Union by Rank

**Union by rank** keeps trees shallow by always attaching the shorter tree under the root of the taller tree. Rank is an upper bound on tree height.

```
rank 0: {4}     rank 1: {0,1}      Union by rank attaches
                     0              the smaller-rank tree
                     |              under the larger-rank root.
                     1
```

When both trees have the same rank, one becomes the child of the other and the new root's rank increases by one.

---

## Use Cases (Data Structure Perspective)

- **Equivalence classes**: Maintaining dynamic equivalence relations.
- **Percolation**: Tracking connected regions in grid simulations.
- **Image processing**: Labeling connected components in binary images.
- **Compiler optimization**: Determining variable aliasing.
- **Dynamic connectivity**: Answering "are these two items in the same group?" queries online.

---

## Implementations

| Language | Source | Tests |
|----------|--------|-------|
| Python | [`Python/dsu.py`](Python/dsu.py) | [`Python/dsu_test.py`](Python/dsu_test.py) |
| C++ | [`C++/dsu.cpp`](C++/dsu.cpp) | [`C++/dsu_test.cpp`](C++/dsu_test.cpp) |
| Go | [`Go/main.go`](Go/main.go) | [`Go/main_test.go`](Go/main_test.go) |

---

_Last Updated: April 2026_
