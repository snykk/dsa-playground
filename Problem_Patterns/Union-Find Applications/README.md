# Union-Find Applications

Union-Find (disjoint set union) tracks which items belong to the same group while groups merge. Its `union` call reports whether the two items were already connected, which is all that is needed to count components, detect a cycle while adding edges, or build a minimum spanning tree with Kruskal's algorithm. Operations cost O(alpha(n)) amortized.

This topic is about using the structure. The structure itself is described in [Disjoint Set Union](../../Data%20Structures/Advanced_Structures/Disjoint%20Set%20Union/) and [Union-Find DSU](../../Algorithms/Graph_Algorithms/Advanced_Graph/Union-Find_DSU/).

## Intuition

Each group is a tree in a `parent` array whose root represents the group. `find` climbs to the root (and flattens the path); `union` joins two roots, hanging the shorter tree under the taller one (union by rank).

Invariant: two items are connected if and only if `find` gives the same root. Each successful `union` lowers the group count by one, so after all edges `n - (successful unions)` is the number of components.

Signals: "are A and B connected" as connections are added, "does this edge create a cycle", "cheapest network connecting everything", "merge accounts that share an email". It cannot split groups or delete an edge.

## Visual

```text
UnionFind(6), parent array after each step (a root points to itself)

start        [0, 1, 2, 3, 4, 5]   6 groups
union(0, 1)  [0, 0, 2, 3, 4, 5]   5
union(2, 3)  [0, 0, 2, 2, 4, 5]   4
union(0, 2)  [0, 0, 0, 2, 4, 5]   3
union(4, 5)  [0, 0, 0, 2, 4, 4]   2   groups {0,1,2,3} and {4,5}
find(3)      [0, 0, 0, 0, 4, 4]       path compression: 3 now points at 0
```

## How It Works

1. `find(x)`: follow parents to the root and point every node on the path at it.
2. `union(x, y)`: find both roots; if equal, return `False`. Otherwise attach the root of lower rank under the other (on a tie, the second under the first and the rank of the first grows) and decrement the count; return `True`.
3. Applications are loops over `union`:

```text
count_components(n, edges): union every edge, return get_count()
has_cycle(n, edges):        some union returns False  ->  cycle
kruskal(n, edges):          sort by weight, keep an edge when union returns True
```

In this repository the DSU and `count_components` (Python only) are implemented; cycle detection and Kruskal are the loops above written on `union`'s return value.

## Step-by-Step Trace

Cycle detection on the edges `0-1, 1-2, 2-3, 3-1, 3-4`:

| Edge | union result | Meaning |
|------|--------------|---------|
| 0-1 | True | merged |
| 1-2 | True | merged |
| 2-3 | True | merged |
| 3-1 | False | already connected: this edge closes a cycle |
| 3-4 | True | merged |

Kruskal on `0-1 (1), 2-3 (2), 0-2 (3), 1-3 (4), 1-2 (5), 3-4 (7)` (sorted): 0-1, 2-3, 0-2 are accepted, 1-3 and 1-2 are rejected, 3-4 is accepted. Total weight 1 + 2 + 3 + 7 = 13 with 4 edges, and the group count ends at 1.

## Complexity

| Operation | Time | Space |
|-----------|------|-------|
| `find`, `union`, `connected` | O(alpha(n)) amortized | O(n) for the arrays |
| Components or cycle check over E edges | O(n + E alpha(n)) | O(n) |
| Kruskal | O(E log E) for the sort | O(n) |

alpha is the inverse Ackermann function, at most 4 for any n that fits in memory.

## When to Use

Use it when edges arrive over time, when you need the cycle test or Kruskal, or when items must be grouped by a shared property. Do not use it for directed graphs, when edges are deleted (unless processed offline in reverse), or when you need the actual path between two nodes (use BFS or DFS).

## Union-Find vs. Alternatives

| Approach | Best for | Time |
|----------|----------|------|
| Union-Find | incremental connectivity, cycle test, Kruskal | O(alpha(n)) per edge |
| BFS / DFS | static graph, paths, directed cycles | O(V + E) per full run |
| Rebuild components each time | tiny inputs | O(V + E) per query |

## Common Pitfalls

- Comparing `parent[x]` and `parent[y]` instead of `find(x)` and `find(y)`.
- Ignoring the boolean from `union`, which is the cycle signal.
- Using it on directed graphs.
- Elements must be `0..n - 1`; map other ids first.
- `count_components(n, edges)` takes `n` first, and exists only in Python.
- Bad indices: Python raises `ValueError`, C++ throws `std::out_of_range`, Go panics (no bounds check, and a negative size panics in the constructor).

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `union_find.py` | `UnionFind` plus `count_components`; raises `ValueError` |
| C++ | [C++/](C++/) | `union_find.cpp` | `UnionFind` with `unite`; throws on bad input |
| Go | [Go/](Go/) | `main.go` | `UnionFind` with `Union`; no bounds checks |

## Practice Problems

- [LeetCode 547. Number of Provinces](https://leetcode.com/problems/number-of-provinces/)
- [LeetCode 684. Redundant Connection](https://leetcode.com/problems/redundant-connection/)
- [LeetCode 721. Accounts Merge](https://leetcode.com/problems/accounts-merge/)
- [LeetCode 1584. Min Cost to Connect All Points](https://leetcode.com/problems/min-cost-to-connect-all-points/)
- [LeetCode 200. Number of Islands](https://leetcode.com/problems/number-of-islands/)

## Related

- [Disjoint Set Union](../../Data%20Structures/Advanced_Structures/Disjoint%20Set%20Union/)
- [Union-Find DSU](../../Algorithms/Graph_Algorithms/Advanced_Graph/Union-Find_DSU/)
- [Kruskal's Algorithm](../../Algorithms/Greedy/Minimum%20Spanning%20Tree/Kruskal's%20Algorithm/)
- [Graph Traversal Problems](../Graph%20Traversal%20Problems/)
