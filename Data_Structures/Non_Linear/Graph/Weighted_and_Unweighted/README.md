# Weighted & Unweighted Graphs

A weighted graph attaches a number to every edge (distance, cost, time); an unweighted graph treats every edge as equal. This folder implements one adjacency-list `WeightedGraph` for both: an edge added without a weight gets weight 1.0. The weights decide which shortest-path algorithm applies.

## Intuition

On a road map, "fewest turns" and "fewest kilometres" are different questions. An unweighted graph answers the first (path length is the number of edges), a weighted graph answers the second (path length is the sum of the weights), and the best route for one need not be the best route for the other.

The invariant: `(v, w)` is in `u`'s list exactly when the edge `u -> v` of weight `w` exists, with at most one edge per ordered pair. Re-adding an edge replaces its weight.

## Visual

```text
Weighted undirected graph            Adjacency list

       4                             0: (1, 4) (2, 1) (3, 10)
   0 ----- 1                         1: (0, 4) (2, 2)
   | \     |                         2: (0, 1) (1, 2) (3, 5)
 10|  \1   |2                        3: (2, 5) (0, 10)
   |   \   |
   3 ----- 2
       5
```

## Operations

| Operation | What it does | Time |
| --- | --- | --- |
| `add_edge(u, v, w=1.0)` | replace any existing `u -> v` edge, append `(v, w)` (and the mirror when undirected) | O(deg(u) + deg(v)) |
| `remove_edge(u, v)` | remove the edge (and its mirror when undirected) | O(deg(u) + deg(v)) |
| `has_edge(u, v)` | scan `u`'s list | O(deg(u)) |
| `get_weight(u, v)` | the weight; None (Python) or -1.0 (C++, Go) when absent | O(deg(u)) |
| `get_neighbors(u)` | neighbor ids | O(deg(u)) |
| `get_neighbors_with_weights(u)` | a copy of the pairs (Python) | O(deg(u)) |
| `get_total_weight()` | sum of weights, each undirected edge once | O(V + E) |
| `bfs(s)` | breadth-first order, ignoring weights | O(V + E) |

Python also has `get_edges`, `get_vertices`, `dfs`, `dfs_recursive` and `is_connected` (undirected only). C++ and Go have the operations above plus `bfs`.

Zero and negative weights are stored as given. Negative weights are legal to store, but they break Dijkstra; a negative cycle makes shortest paths undefined.

## Step-by-Step Trace

Edges `0-1 (4), 0-2 (1), 1-2 (2), 2-3 (5), 0-3 (10)`. `get_total_weight()` is 4 + 1 + 2 + 5 + 10 = 22, and `bfs(0)` returns `[0, 1, 2, 3]`. BFS counts hops; Dijkstra (run on this graph) sums weights:

| Target | Fewest edges | Cost | Cheapest path | Cost |
| --- | --- | --- | --- | --- |
| 1 | 0 - 1 | 4 | 0 - 2 - 1 | 3 |
| 2 | 0 - 2 | 1 | 0 - 2 | 1 |
| 3 | 0 - 3 | 10 | 0 - 2 - 3 | 6 |

Calling `add_edge(0, 3, 1)` afterwards replaces the weight-10 edge, so the total drops to 13.

## Complexity

| Quantity | Cost | Why |
| --- | --- | --- |
| Space | O(V + E) | one pair per edge end |
| Add, remove edge | O(deg) | a list is scanned and rebuilt |
| Get weight | O(deg(u)) | scan one list |
| Total weight | O(V + E) | every entry is visited once |
| BFS, DFS | O(V + E) | weights are ignored |

## When to Use

- Weighted: edge costs matter (routing, networks, planning, minimum spanning trees).
- Unweighted: only connectivity or hop count matters (social graphs, mazes); BFS is enough.
- Pick the shortest-path algorithm from the weights: BFS for none, Dijkstra for non-negative, Bellman-Ford for negative, Floyd-Warshall for all pairs.

## Weighted vs. Unweighted

| | Unweighted | Weighted |
| --- | --- | --- |
| Edge carries | nothing | a number |
| Path length | number of edges | sum of weights |
| Shortest path | BFS | Dijkstra or Bellman-Ford |
| Storage | neighbor ids | `(neighbor, weight)` pairs |

## Common Pitfalls

- Running BFS on a weighted graph and calling the result the shortest path.
- Running Dijkstra with negative weights.
- Treating weight 0 as "no edge": here a weight-0 edge exists; use `has_edge`.
- C++ and Go `get_weight` return -1.0 for an absent edge, which can also be a real weight.
- Comparing floating-point sums with `==`.
- Summing every list entry to get the total of an undirected graph: that counts each edge twice.

## Implementations

| Language | Folder | Main file | Notes |
| --- | --- | --- | --- |
| Python | [Python](Python) | `weighted_graph.py` | full API; `add_edge` weight defaults to 1.0 |
| C++ | [C++](C++) | `weighted_graph.cpp` | `get_weight` returns -1.0 when absent; BFS only |
| Go | [Go](Go) | `main.go` | `AddEdge` needs the weight; BFS only |

## Practice Problems

- LeetCode 743: Network Delay Time
- LeetCode 787: Cheapest Flights Within K Stops
- LeetCode 1514: Path with Maximum Probability
- LeetCode 1631: Path With Minimum Effort
- LeetCode 1584: Min Cost to Connect All Points

## Related

- [Adjacency List](../Adjacency_List)
- [Edge List](../Edge_List)
- [Directed and Undirected graphs](../Directed_and_Undirected)
- [Dijkstra's Algorithm](../../../../Algorithms/Graph_Algorithms/Shortest_Path/Dijkstras_Algorithm)
- [Bellman-Ford](../../../../Algorithms/Graph_Algorithms/Shortest_Path/Bellman_Ford_Algorithm)
- [BFS](../../../../Algorithms/Graph_Algorithms/Traversal/BFS)
