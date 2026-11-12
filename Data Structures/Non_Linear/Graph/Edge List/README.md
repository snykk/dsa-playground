# Edge List

An edge list stores a graph as a flat list of edges and nothing else. It is the smallest representation, O(E) space, and the natural input for algorithms that sort or scan all edges (Kruskal, Bellman-Ford). Edge and neighbor lookups cost O(E).

## Intuition

Think of a list of flights: "A to B, 4 hours". There is no map and no per-city list, so asking "which flights leave A?" means reading every line, but sorting the flights by duration is trivial.

The invariant: the edge `u -> v` exists exactly when an entry for `(u, v)` is in the list, and there is at most one entry per ordered pair. An undirected edge is stored as two entries, one per direction; a self-loop is stored once.

## Visual

```text
Graph (undirected, weighted)      Stored list (both directions)

    4                              (0, 1, 4)  (1, 0, 4)
 0 --- 1                           (0, 2, 1)  (2, 0, 1)
  \   /                            (1, 2, 2)  (2, 1, 2)
 1 \ / 2                           (2, 3, 5)  (3, 2, 5)
    2 --- 3
        5                          get_edge_count() = 4
```

## Operations

| Operation | What it does | Time |
| --- | --- | --- |
| `add_edge(u, v, w)` | record the vertices, remove an existing `u -> v` entry, append the new one (and the reverse when undirected) | O(E) |
| `remove_edge(u, v)` | filter the entry out (and the reverse when undirected) | O(E) |
| `has_edge(u, v)` | scan for the entry | O(E) |
| `get_weight(u, v)` | scan for the entry | O(E) |
| `get_neighbors(u)` | scan for entries starting at `u`, no duplicates | O(E) |
| `get_edge_count()` | edges, with an undirected edge counted once | O(E) |
| `bfs(s)` | breadth-first order, one list scan per vertex | O(V E) |

Python also has `get_edges` (both directions for an undirected graph), `get_vertices`, `dfs`, `dfs_recursive`, `is_connected` (undirected only; raises `ValueError` otherwise) and `to_adjacency_list`. C++ and Go have the operations above plus `bfs`.

`add_edge` replaces an existing edge before appending, so it is a full scan rather than the O(1) append you might expect; many inserts are therefore quadratic.

## Step-by-Step Trace

Build the graph above, then remove `1-2`:

| Step | Entries stored | `get_edge_count()` |
| --- | --- | --- |
| `add_edge(0, 1, 4)` | (0,1,4) (1,0,4) | 1 |
| `add_edge(0, 2, 1)` | + (0,2,1) (2,0,1) | 2 |
| `add_edge(1, 2, 2)` | + (1,2,2) (2,1,2) | 3 |
| `add_edge(2, 3, 5)` | + (2,3,5) (3,2,5) | 4 |
| `remove_edge(1, 2)` | (1,2,2) and (2,1,2) removed | 3 |

A self-loop is stored once, so with edge `1-2` and loop `3-3` the list has 3 entries and the count is `(3 - 1) / 2 + 1 = 2`.

For Kruskal, sort one entry per edge by weight: 0-2 (1), 1-2 (2), 0-1 (4), 2-3 (5).

## Complexity

| Quantity | Cost | Why |
| --- | --- | --- |
| Space | O(E) | one entry per edge, two per undirected edge |
| Add, remove, has edge | O(E) | no index, the list is scanned |
| Neighbors of u | O(E) | every entry is checked |
| BFS with this class | O(V E) | one scan per vertex; convert to an adjacency list for O(V + E) |
| Sort by weight | O(E log E) | comparison sort |

## When to Use

- Use it when the algorithm iterates over all edges: Kruskal's minimum spanning tree, Bellman-Ford, graph input and output, conversion to another representation.
- Avoid it for traversal or frequent edge lookups; use an adjacency list or matrix.

## Edge List vs. Alternatives

| | Edge list | Adjacency list | Adjacency matrix |
| --- | --- | --- | --- |
| Space | O(E) | O(V + E) | O(V^2) |
| Has edge | O(E) | O(deg(u)) | O(1) |
| Neighbors of u | O(E) | O(deg(u)) | O(V) |
| Best for | sorting and scanning edges | traversal | dense graphs |

## Common Pitfalls

- Treating `add_edge` as O(1) when it replaces duplicates first.
- Halving the list to count undirected edges without handling self-loops.
- Removing only one direction of an undirected edge.
- Running BFS or DFS directly on a big edge list instead of converting it.
- Python's `get_edges` returns both directions of an undirected edge; filter on `u < v` for one per edge.
- C++ and Go `get_weight` return -1.0 for an absent edge, which can also be a real weight.

## Implementations

| Language | Folder | Main file | Notes |
| --- | --- | --- | --- |
| Python | [Python](Python) | `edge_list.py` | tuples, full API including `to_adjacency_list` |
| C++ | [C++](C++) | `edge_list.cpp` | separate vectors for weighted and unweighted edges |
| Go | [Go](Go) | `main.go` | `Edge{From, To, Weight}` slice |

## Practice Problems

- LeetCode 1584: Min Cost to Connect All Points (Kruskal on an edge list)
- LeetCode 1135: Connecting Cities With Minimum Cost
- LeetCode 743: Network Delay Time (Bellman-Ford over edges)
- LeetCode 787: Cheapest Flights Within K Stops
- LeetCode 1971: Find if Path Exists in Graph

## Related

- [Adjacency List](../Adjacency%20List)
- [Adjacency Matrix](../Adjacency%20Matrix)
- [Weighted and Unweighted graphs](../Weighted%20%26%20Unweighted)
- [Kruskal's Algorithm](../../../../Algorithms/Graph_Algorithms/Minimum_Spanning_Tree/Kruskal's_Algorithm)
- [Bellman-Ford](../../../../Algorithms/Graph_Algorithms/Shortest_Path/Bellman-Ford_Algorithm)
