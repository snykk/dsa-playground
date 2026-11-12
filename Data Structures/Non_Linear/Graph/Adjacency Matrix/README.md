# Adjacency Matrix

An adjacency matrix stores a graph as a V-by-V table where cell (i, j) says whether an edge from i to j exists. Edge lookup is O(1), space is O(V^2), and listing the neighbors of a vertex costs O(V).

## Intuition

Think of a distance chart in a road atlas: rows and columns are the cities, and each cell answers "is there a direct road from this city to that one?". Looking up one pair is instant, but the chart has a cell for every pair, including the ones with no road.

The invariant: cell `(u, v)` is set exactly when the edge `u -> v` exists. For an undirected graph both `(u, v)` and `(v, u)` are set, so the matrix is symmetric.

## Visual

```text
Graph (undirected, weighted)      Unweighted matrix     Weighted matrix
                                      0 1 2 3              0   1   2   3
    4                              0  0 1 1 0          0   0   4   1  inf
 0 --- 1                           1  1 0 1 0          1   4   0   2  inf
  \   /                            2  1 1 0 1          2   1   2   0   5
 1 \ / 2                           3  0 0 1 0          3  inf inf  5   0
    2 --- 3
        5
```

## Operations

| Operation | What it does | Time |
| --- | --- | --- |
| constructor | allocate the table, every edge absent | O(V^2) |
| `add_edge(u, v, w)` | set cell `(u, v)` (and `(v, u)` when undirected) | O(1) |
| `remove_edge(u, v)` | clear the cell (and its mirror when undirected) | O(1) |
| `has_edge(u, v)` | read one cell | O(1) |
| `get_neighbors(u)` | scan row `u` | O(V) |
| `bfs(s)`, `dfs(s)` | traverse, one row scan per vertex | O(V^2) |

Weighted graphs keep a separate presence table next to the weights, so a weight of 0, a negative weight or a huge weight is still an edge. Absent cells of the weight table hold infinity, and the diagonal holds 0 (distance to itself); neither counts as an edge until `add_edge` is called.

Python also has `get_weight` (None when absent), `get_degree` (for a directed graph: in-degree plus out-degree), `dfs_recursive`, `is_connected` (undirected graphs only) and `get_matrix`. C++ has `get_weight` (returns -1.0 for absent), `try_get_weight`, `bfs` and `dfs`. Go has `AddEdge`, `HasEdge`, `GetNeighbors` and `BFS`. The vertex count is fixed. An out-of-range vertex raises `ValueError` in Python's `add_edge` and is ignored by C++ and Go.

## Step-by-Step Trace

Build the graph above (undirected, unweighted), then run `bfs(0)`:

| Step | What happens |
| --- | --- |
| `add_edge(0, 1)` | cells (0,1) and (1,0) set |
| `add_edge(0, 2)` | cells (0,2) and (2,0) set |
| `add_edge(1, 2)` | cells (1,2) and (2,1) set |
| `add_edge(2, 3)` | cells (2,3) and (3,2) set |
| `bfs(0)`: scan row 0 | neighbors 1, 2 are queued |
| scan row 1 | neighbors 0, 2 are already seen |
| scan row 2 | neighbor 3 is queued |
| scan row 3 | nothing new; result `[0, 1, 2, 3]` |

## Complexity

| Quantity | Cost | Why |
| --- | --- | --- |
| Space | O(V^2) | V rows of V cells, plus a presence table when weighted |
| Add, remove, has edge | O(1) | direct indexing |
| Neighbors, degree | O(V) | a whole row is scanned |
| BFS, DFS | O(V^2) | one row scan per vertex, whatever E is |

## When to Use

- Use it for dense graphs, small graphs, and code that asks "is there an edge between u and v?" in a tight loop. It is also the natural input of Floyd-Warshall.
- Avoid it for large sparse graphs: a million vertices need 10^12 cells.

## Adjacency Matrix vs. Alternatives

| | Adjacency matrix | Adjacency list | Edge list |
| --- | --- | --- | --- |
| Space | O(V^2) | O(V + E) | O(E) |
| Has edge | O(1) | O(deg(u)) | O(E) |
| Neighbors of u | O(V) | O(deg(u)) | O(E) |
| Best for | dense graphs, lookups | sparse graphs, traversal | sorting edges |

## Common Pitfalls

- Using 0 as "no edge" in a weighted graph, which hides zero-weight edges; keep a presence flag.
- Using a sentinel such as `INT_MAX`: an edge with exactly that weight would vanish.
- Setting only one cell of an undirected edge.
- Reading the diagonal as self-loops: 0 there means "distance to itself".
- C++ `get_weight` returns -1.0 for a missing edge, which is also a legal weight; use `try_get_weight`.
- Allocating a matrix for a large sparse graph.

## Implementations

| Language | Folder | Main file | Notes |
| --- | --- | --- | --- |
| Python | [Python](Python) | `adjacency_matrix.py` | full API, presence table, raises on bad vertices |
| C++ | [C++](C++) | `adjacency_matrix.cpp` | `bfs`, `dfs`, `try_get_weight`; ignores bad vertices |
| Go | [Go](Go) | `main.go` | `AddEdge`, `HasEdge`, `GetNeighbors`, `BFS` |

## Practice Problems

- LeetCode 547: Number of Provinces
- LeetCode 997: Find the Town Judge
- LeetCode 1334: Find the City With the Smallest Number of Neighbors at a Threshold Distance
- LeetCode 785: Is Graph Bipartite?
- LeetCode 1615: Maximal Network Rank

## Related

- [Adjacency List](../Adjacency%20List)
- [Edge List](../Edge%20List)
- [Directed and Undirected graphs](../Directed%20%26%20Undirected)
- [Weighted and Unweighted graphs](../Weighted%20%26%20Unweighted)
- [Floyd-Warshall](../../../../Algorithms/Graph_Algorithms/Shortest_Path/Floyd-Warshall_Algorithm)
