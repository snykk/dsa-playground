# Union-Find (Disjoint Set Union) for Graphs

Union-Find keeps a forest of parent pointers so that "are these two vertices connected?" and "merge their groups" both take almost constant time: **O(alpha(n)) amortized** with path compression and union by rank. In graph algorithms it counts connected components, finds the edge that closes a cycle and powers Kruskal's minimum spanning tree.

This is the graph-algorithm view. The data structure itself is explained in [Data_Structures/Advanced_Structures/Disjoint_Set_Union](../../../../Data_Structures/Advanced_Structures/Disjoint_Set_Union/README.md), and typical problems are collected in [Problem_Patterns/Union_Find_Applications](../../../../Problem_Patterns/Union_Find_Applications/README.md).

## Intuition

Each group of connected vertices is a tree. `parent[x]` points towards the root, and the root (which points to itself) names the group. Two vertices are connected exactly when they have the same root.

Two tricks keep the trees flat:

- **Path compression:** after `find(x)`, every vertex on the path points directly at the root.
- **Union by rank:** when merging, the root of lower rank goes under the other. Rank is an upper bound on the tree height (not the size), and it grows only when two equal ranks meet. A tree of rank `r` has at least `2^r` vertices, so no tree is higher than `log2(n)`.

## Visual

Eight vertices after `union(0,1) (2,3) (0,2) (4,5) (6,7) (4,6) (0,4)`:

```text
                0  (rank 3)
           /    |      \
          1     2       4  (rank 2)
                |      / \
                3     5   6  (rank 1)
                          |
                          7

  index    0  1  2  3  4  5  6  7
  parent   0  0  0  2  0  4  4  6
  rank     3  0  1  0  2  0  1  0
```

`find(7)` walks 7, 6, 4, 0 and then points 7 and 6 at 0 (4 already points there): `parent` becomes `[0, 0, 0, 2, 0, 4, 0, 0]`.

## How It Works

1. **Start.** `parent[i] = i`, `rank[i] = 0`, `count = n`.
2. **`find(x)`:** if `parent[x] != x`, set `parent[x] = find(parent[x])`; return `parent[x]`.
3. **`union(x, y)`:** find both roots. If equal, return false (already connected). Otherwise attach the lower-rank root to the other; on a tie make one the parent and raise its rank. Decrease `count` and return true.
4. **`connected(x, y)`:** `find(x) == find(y)`.
5. **Graph use:** process the edges in order. A union that returns false is an edge inside an existing component, which closes a cycle.

## Step-by-Step Trace

`UnionFind(8)` and the seven unions above (Python, `parent` / `rank` / `count` after each):

| Operation | parent | rank | count |
|-----------|--------|------|-------|
| start | 0 1 2 3 4 5 6 7 | 0 0 0 0 0 0 0 0 | 8 |
| union(0,1) | 0 0 2 3 4 5 6 7 | 1 0 0 0 0 0 0 0 | 7 |
| union(2,3) | 0 0 2 2 4 5 6 7 | 1 0 1 0 0 0 0 0 | 6 |
| union(0,2) | 0 0 0 2 4 5 6 7 | 2 0 1 0 0 0 0 0 | 5 |
| union(4,5) | 0 0 0 2 4 4 6 7 | 2 0 1 0 1 0 0 0 | 4 |
| union(6,7) | 0 0 0 2 4 4 6 6 | 2 0 1 0 1 0 1 0 | 3 |
| union(4,6) | 0 0 0 2 4 4 4 6 | 2 0 1 0 2 0 1 0 | 2 |
| union(0,4) | 0 0 0 2 0 4 4 6 | 3 0 1 0 2 0 1 0 | 1 |
| find(7) | 0 0 0 2 0 4 0 0 | 3 0 1 0 2 0 1 0 | 1 |

## Complexity

| Variant | Time per operation | Space |
|---------|--------------------|-------|
| Naive (no tricks) | O(n) | O(n) |
| Union by rank only | O(log n) | O(n) |
| Path compression only | O(log n) amortized | O(n) |
| Both | O(alpha(n)) amortized | O(n) |

`alpha` is the inverse Ackermann function, below 5 for any practical `n`. Initialisation is O(n). Processing `E` edges costs O(E alpha(n)); Kruskal adds an O(E log E) sort.

## When to Use

Use it when:

- edges arrive one at a time and you need connectivity after each (online);
- you need components, their sizes or their count, or an early cycle check;
- you build a minimum spanning tree with Kruskal.

Do not use it when:

- you need paths, distances or the tree shape: use BFS or DFS;
- edges are removed: union-find cannot split a set (a rollback variant without compression exists but is not implemented here).

## Union-Find vs. DFS / BFS

| | Union-Find | DFS / BFS |
|---|---|---|
| Components of a fixed graph | O(E alpha(n)) | O(V + E) |
| Edges added online | handled | rerun |
| Cycle in an undirected graph | a union that returns false | a visited non-parent neighbour |
| Paths and distances | no | yes |
| Memory | two arrays | adjacency list and visited |

## Common Pitfalls

1. **Linking non-roots.** Always `find` both vertices first; setting `parent[x] = y` directly detaches subtrees.
2. **Comparing `parent` values** instead of `find` results: the parent can be stale until the next find.
3. **Calling union by rank a size rule.** Rank bounds height; attaching by size is a different scheme.
4. **Unchecked ids.** Nothing validates `0 <= x < n`: a negative id wraps silently in Python (`UnionFind(3).union(-1, 0)` merges the last element and returns True), an id `>= n` raises `IndexError`, C++ has undefined behaviour and Go panics.
5. **Different method names.** The union method is `union` (Python), `unite` (C++) and `Union` (Go).
6. **Parallel edges and self-loops** make the cycle check return true.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `union_find.py` | `UnionFind` plus components, cycle detection, largest component and Kruskal helpers |
| C++ | [C++/](C++/) | `union_find.cpp` | `UnionFind` (`unite`) plus `unionFindCycleDetection` |
| Go | [Go/](Go/) | `main.go` | `UnionFind` (`Union`) plus `UnionFindCycleDetection` |

## Practice Problems

- [LeetCode 547. Number of Provinces](https://leetcode.com/problems/number-of-provinces/): count components.
- [LeetCode 684. Redundant Connection](https://leetcode.com/problems/redundant-connection/): the edge that closes a cycle.
- [LeetCode 721. Accounts Merge](https://leetcode.com/problems/accounts-merge/): union accounts that share an email.
- [LeetCode 1584. Min Cost to Connect All Points](https://leetcode.com/problems/min-cost-to-connect-all-points/): Kruskal.
- [CSES 1676. Road Construction](https://cses.fi/problemset/task/1676): components and largest size after each edge.

## Related

- [Disjoint Set Union (data structure)](../../../../Data_Structures/Advanced_Structures/Disjoint_Set_Union/README.md): the structure in depth
- [Union-Find Applications](../../../../Problem_Patterns/Union_Find_Applications/README.md): problem patterns
- [Kruskal's Algorithm](../../Minimum_Spanning_Tree/Kruskals_Algorithm/): the main client
- [Tarjan Bridges and Articulation Points](../Tarjan_Bridges_Articulation/README.md): another way to study connectivity
- [DFS](../../Traversal/DFS/README.md): components without union-find
