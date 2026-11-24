# Lowest Common Ancestor

The lowest common ancestor (LCA) of two nodes u and v in a rooted tree is the deepest node that has both of them in its subtree. Walking up one parent at a time finds it in O(depth), which is O(n) on a long path. This topic builds two tables once and then answers many queries fast: binary lifting (O(n log n) to build, O(log n) per query, plus the k-th ancestor of a node) and an Euler tour with a sparse table (O(n log n) to build, O(1) per query). Both also give the distance between two nodes.

A node counts as its own ancestor, so `lca(u, u) == u`, and `lca(u, v) == u` when u is an ancestor of v.

## Intuition

**Binary lifting.** Climbing d levels one parent at a time is slow, but every d is a sum of powers of two (11 = 8 + 2 + 1). Store, for every node, its ancestors 1, 2, 4, 8, ... levels up, and any climb takes one jump per 1 bit of d. To find the LCA, first lift the deeper node to the depth of the other. If they meet, that node is the answer. Otherwise both are strictly below the LCA, at the same depth. Try the jumps from the largest down and take a jump only when it lands both nodes on *different* ancestors: equal ancestors are common, but maybe not the lowest. The invariant is that u and v stay distinct and strictly below the LCA; after the smallest jump they are two children of it, and the answer is their parent.

**Euler tour.** Walk the tree depth-first and write down a node every time the walk enters it or comes back to it from a child. Between the first time the walk meets u and the first time it meets v, it goes from u to v without leaving the subtree of their LCA, and it passes through the LCA itself. So the LCA is the shallowest node in that stretch of the tour: a range minimum query over the depths, which a [sparse table](../../../../Data_Structures/Non_Linear/Trees/Sparse_Table/) answers with two overlapping windows.

## Visual

The tree of the tests and the demo, rooted at 0:

```text
        0             depth 0
      /   \
     1     2          depth 1
    / \     \
   3   4     5        depth 2
  / \         \
 6   7         8      depth 3
 |
 9                    depth 4
```

Binary lifting table `up[k][v]`, the ancestor 2^k levels above v (the root points to itself):

```text
v         0  1  2  3  4  5  6  7  8  9
depth     0  1  1  2  2  2  3  3  3  4
up[0]     0  0  0  1  1  2  3  3  5  6     1 level up: the parent
up[1]     0  0  0  0  0  0  1  1  2  3     2 levels up
up[2]     0  0  0  0  0  0  0  0  0  0     4 levels up
up[3]     0  0  0  0  0  0  0  0  0  0     8 levels up
```

Euler tour (children in edge order) with the depth of every entry:

```text
i       0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18
euler   0  1  3  6  9  6  3  7  3  1  4  1  0  2  5  8  5  2  0
depth   0  1  2  3  4  3  2  3  2  1  2  1  0  1  2  3  2  1  0

first:  node 0 1  2 3  4  5 6 7  8 9
        at   0 1 13 2 10 14 3 7 15 4
```

## How It Works

### The tree

Both classes take `n`, a list of `n - 1` edges `(u, v)` on the nodes `0..n-1`, and a root (0 by default). `rooted_tree` checks the input, builds `adj` (each node's neighbours in the order the edges are listed) and walks breadth-first from the root for `parent` (-1 for the root) and `depth`. The walk uses a queue, not recursion.

| Input | Python | C++ | Go |
|-------|--------|-----|----|
| `n < 1`, a root or an endpoint outside `0..n-1`, a number of edges other than `n - 1`, or edges that do not reach every node from the root (with `n - 1` edges that means a cycle, a repeated edge or a loop, and the rest is a forest) | `ValueError` | `std::invalid_argument` | the constructor returns an error wrapping `ErrNotATree` |
| a query node outside `0..n-1`, negative ones included | `IndexError` | `std::out_of_range` | panic |
| `kth_ancestor(v, k)` with `k < 0` | `ValueError` | `std::invalid_argument` | panic |
| `kth_ancestor(v, k)` with `k > depth[v]` | -1 | -1 | -1 |

### Binary lifting (`BinaryLiftingLCA`)

1. `levels = n.bit_length()`, which is floor(log2 n) + 1. Jumps of 1, 2, ..., 2^(levels-1) add up to 2^levels - 1, at least `n - 1`, the deepest a node can be.
2. `up[0][v] = parent[v]`, and `up[0][root] = root`: the root is its own parent, so a jump past the root stops at the root and no entry is -1.
3. `up[k][v] = up[k-1][up[k-1][v]]` for k = 1, 2, ...: two jumps of 2^(k-1) make one jump of 2^k.
4. `kth_ancestor(v, k)`: -1 if `k > depth[v]`; otherwise, for each 1 bit of k (lowest first), `v = up[bit][v]`.
5. `lca(u, v)`: make u the deeper node, `u = kth_ancestor(u, depth[u] - depth[v])`, return u if it equals v. Then for k from `levels - 1` down to 0: if `up[k][u] != up[k][v]`, move both. Return `up[0][u]`.

### Euler tour and sparse table (`EulerTourLCA`)

1. A depth-first walk with an explicit stack and a pointer `nxt[u]` to the next neighbour of u to try. Entering a child v sets `first[v] = len(euler)` and appends v; when u has no neighbour left, it is popped and the new top of the stack is appended again. Children are entered in `adj` order. The tour has `2n - 1` entries: every node once when entered, plus one more entry for each of the `n - 1` returns to a parent.
2. `sparse[0]` is the tour. `sparse[k][i] = shallower(sparse[k-1][i], sparse[k-1][i + 2^(k-1)])` for every window `euler[i .. i + 2^k - 1]` that fits, while `2^k <= len(euler)`. `shallower` keeps the left node when the depths are equal. That rule never chooses between two different nodes: two different nodes of the same depth always have a shallower node (their LCA) between them in the tour, so every window has exactly one shallowest node.
3. `lca(u, v)`: `left, right = first[u], first[v]` (swapped if needed), `k = (right - left + 1).bit_length() - 1`, and the answer is the shallower of `sparse[k][left]` and `sparse[k][right - 2^k + 1]`.

### Distance

Both classes have `distance(u, v) = depth[u] + depth[v] - 2 * depth[lca(u, v)]`, the number of edges on the path: up from u to the LCA, then down to v. It does not depend on the root.

## Step-by-Step Trace

`lca(9, 8)` by binary lifting on the tree above (`levels = 4`):

| Step | u | v | What happens |
|------|---|---|--------------|
| 1 | 9 | 8 | depth 4 and 3: u is already the deeper one. Lift u by 1 = 0b1: u = up[0][9] = 6 |
| 2 | 6 | 8 | k = 3: up[3][6] = up[3][8] = 0. Equal, no jump |
| 3 | 6 | 8 | k = 2: up[2][6] = up[2][8] = 0. Equal, no jump |
| 4 | 6 | 8 | k = 1: up[1][6] = 1, up[1][8] = 2. Different: u = 1, v = 2 |
| 5 | 1 | 2 | k = 0: up[0][1] = up[0][2] = 0. Equal, no jump |
| 6 | 1 | 2 | return up[0][1] = 0 |

The query reads 12 table entries. `distance(9, 8)` = 4 + 3 - 2 * 0 = 7. `kth_ancestor(9, 3)`: 3 = 0b11, so 9 jumps to up[0][9] = 6, then to up[1][6] = 1. `kth_ancestor(9, 5)` is -1, because 9 is only 4 levels deep.

`lca(9, 4)` by the Euler tour: `first[9] = 4` and `first[4] = 10`. The stretch `euler[4..10]` is `9 6 3 7 3 1 4` with depths `4 3 2 3 2 1 2`. Its length 7 gives k = 2, so the two windows are `euler[4..7]` (shallowest node `sparse[2][4] = 3`) and `euler[7..10]` (shallowest `sparse[2][7] = 1`). Node 1 has depth 1 and node 3 depth 2, so `lca(9, 4) = 1`. Two table reads.

## Complexity

| Operation | Time | Space |
|-----------|------|-------|
| `rooted_tree` (checks and breadth-first walk) | O(n) | O(n) |
| `BinaryLiftingLCA` build | O(n log n): `n * levels` entries | O(n log n) |
| `kth_ancestor` | O(log n): one read per 1 bit of k | O(1) |
| `lca`, `distance` (lifting) | O(log n): at most `levels` reads to lift, then 2 per level, 2 more per jump and 1 at the end | O(1) |
| `EulerTourLCA` build | O(n log n): a tour of `m = 2n - 1` entries and about `m log2 m` table cells | O(n log n) |
| `lca`, `distance` (Euler tour) | O(1): two table reads | O(1) |

Counted with the Python code on a path, a star and a random tree of n = 10^5 nodes, with 301 queries on each: binary lifting stores 1,700,000 entries (17 levels) and no query read more than 44 of them; the Euler tour has 199,999 entries, the sparse table 3,337,857 cells, and every query read exactly 2. From n = 64 to 10^5 the lifting table stays between 1.02 and 1.17 times n log2 n entries, and the sparse table between 0.87 and 0.95 times m log2 m cells.

## When to Use

- Many LCA, distance or ancestor queries on one tree that does not change: n and the number of queries around 10^5 or more.
- Binary lifting when you also need the k-th ancestor, or want to walk up by a computed amount; it is the shorter code.
- The Euler tour when queries dominate and O(1) each matters.
- Not for one or two queries: walking up the parents costs O(n) with no table. Not when the tree changes shape: both tables must be rebuilt.

## LCA vs. Alternatives

| Method | Build | Query | Extra memory | Also gives |
|--------|-------|-------|--------------|------------|
| Walk up the parents | O(n) for depths | O(depth), O(n) worst | O(n) | nothing more |
| Binary lifting | O(n log n) | O(log n) | O(n log n) | k-th ancestor |
| Euler tour + sparse table | O(n log n) | O(1) | O(n log n) | each subtree is a stretch of the tour |
| [Heavy-light decomposition](../Heavy_Light_Decomposition/) | O(n) | O(log n) | O(n) | the path as O(log n) array ranges |
| Tarjan's offline LCA (union-find; not in this repository) | none | all q queries together, known in advance, in nearly O(n + q) | O(n + q) | nothing more |

[Precomputation](../../../../Utilities/Optimization_Techniques/Precomputation/) shows binary lifting as one precomputed table among many: Python with an iterative DFS, C++ with a recursive one over fixed-size global arrays, nothing in Go, no input checks, and -1 for a missing ancestor. This topic adds the Euler tour, the distance, the k-th ancestor, the checks, loops in every language and a Go version.

## Common Pitfalls

- **Jumping when the ancestors are equal.** An equal ancestor is common, but maybe not the lowest; jump only when they differ, and return the parent at the end.
- **Skipping the lift.** The second phase assumes both nodes are at the same depth.
- **Too few levels.** With `levels` levels the longest climb is 2^levels - 1; it must reach the deepest node. `n.bit_length()` is enough.
- **-1 as an index.** If a missing ancestor is stored as -1, `up[k][-1]` in Python silently reads the last node. Here the root is its own parent instead.
- **Recursion on deep trees.** A path of 10^5 nodes is far past Python's default recursion limit of 1000. A recursive C++ walk needs one stack frame per level: a plain recursive DFS on a path, built with `g++ -O2`, finished 10^5 levels with an 8 MB stack and crashed at 3 x 10^5. Every walk here is a loop; the tests build both classes on a path of 10^5 nodes in all three languages.
- **A tour without the returns.** A pre-order (each node once) is not enough: for `lca(9, 4)` above it holds `9 7 4` between the two nodes, whose shallowest node is 4, not 1. The returns to the parent are what put the LCA in the range.
- **Floating-point log2** for the window size. Use `bit_length()` or an integer loop.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `lowest_common_ancestor.py` | `rooted_tree`, `BinaryLiftingLCA`, `EulerTourLCA`; tables as public attributes |
| C++ | [C++/](C++/) | `lowest_common_ancestor.cpp` | `rootedTree`, `BinaryLiftingLCA`, `EulerTourLCA`; tables through const accessors |
| Go | [Go/](Go/) | `main.go` | `NewRootedTree`, `NewBinaryLifting`, `NewEulerTour` return an error; tables as copies |

All three give the same tables and answers: the tests pin the tables of the tree above, computed by the Python code, and compare both classes with a naive LCA on every labelled tree with up to 6 nodes (every root, every pair) and on random trees.

## Practice Problems

- [Lowest Common Ancestor of a Binary Tree (LeetCode 236)](https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/): one query, the definition itself.
- [Company Queries I (CSES 1687)](https://cses.fi/problemset/task/1687): the boss k levels up, `kth_ancestor`.
- [Company Queries II (CSES 1688)](https://cses.fi/problemset/task/1688): many LCA queries.
- [Distance Queries (CSES 1135)](https://cses.fi/problemset/task/1135): `distance` through the LCA.
- [Minimum Edge Weight Equilibrium Queries in a Tree (LeetCode 2846)](https://leetcode.com/problems/minimum-edge-weight-equilibrium-queries-in-a-tree/): counts per weight on root paths, combined at the LCA.

## Related

- [Sparse Table](../../../../Data_Structures/Non_Linear/Trees/Sparse_Table/): the range minimum structure behind the Euler tour method.
- [Precomputation](../../../../Utilities/Optimization_Techniques/Precomputation/): binary lifting as a precomputed table.
- [Heavy-Light Decomposition](../Heavy_Light_Decomposition/): another LCA in O(log n), with path segments.
- [Centroid Decomposition](../Centroid_Decomposition/): the other tree technique of this category.
- [Cartesian Tree](../../../../Data_Structures/Non_Linear/Trees/Cartesian_Tree/): the reverse reduction, range minimum as an LCA.
- [DFS](../../../Graph_Algorithms/Traversal/DFS/) and [BFS](../../../Graph_Algorithms/Traversal/BFS/): the two walks the classes use.
- [Specialized Techniques overview](../)
