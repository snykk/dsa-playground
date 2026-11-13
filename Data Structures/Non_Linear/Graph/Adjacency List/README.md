# Adjacency List

An adjacency list stores one list of neighbors per vertex. It uses O(V + E) space, lists the neighbors of a vertex in O(deg) time, and is the default representation for sparse graphs.

## Intuition

Think of a phone contact list: each person has a short list of the people they know, not a row for every person in the world. Only real connections take space, so the structure grows with the number of edges, not with V squared.

The invariant: `v` is in `u`'s list exactly when the edge `u -> v` exists. An undirected edge is stored in both lists, and every operation must keep the two copies in sync.

## Visual

```text
Undirected weighted graph        Adjacency list

    4                            0: (1, 4) (2, 1)
 0 --- 1                         1: (0, 4) (2, 2)
  \   /                          2: (0, 1) (1, 2) (3, 5)
 1 \ / 2                         3: (2, 5)
    2 --- 3
        5
```

## Operations

| Operation | What it does | Time |
| --- | --- | --- |
| `add_vertex(v)` | create an empty list for `v` if it is new | O(1) |
| `add_edge(u, v, w)` | create missing vertices, replace an existing `u -> v` edge, append the new one (and the reverse when undirected) | O(deg(u) + deg(v)) |
| `remove_edge(u, v)` | filter `v` out of `u`'s list (and `u` out of `v`'s when undirected) | O(deg(u) + deg(v)) |
| `has_edge(u, v)` | scan `u`'s list | O(deg(u)) |
| `get_neighbors(u)` | return the neighbors (a copy in Python) | O(deg(u)) |
| `bfs(s)` | breadth-first order from `s` | O(V + E) |

Python adds `dfs`, `dfs_recursive`, `get_weight`, `get_neighbors_with_weights`, `get_degree`, `get_vertices`, `get_edges` and `is_connected` (undirected graphs only; it raises `ValueError` on a directed graph). C++ and Go implement the six operations above.

`add_edge` removes an existing edge between the same vertices first, so adding it twice updates the weight instead of creating a parallel edge. That is why it is O(deg), not O(1).

## Step-by-Step Trace

Build the graph above (undirected, weighted), then remove `1-2`:

| Step | Lists |
| --- | --- |
| `add_edge(0, 1, 4)` | 0: (1, 4) / 1: (0, 4) |
| `add_edge(0, 2, 1)` | 0: (1, 4) (2, 1) / 2: (0, 1) |
| `add_edge(1, 2, 2)` | 1: (0, 4) (2, 2) / 2: (0, 1) (1, 2) |
| `add_edge(2, 3, 5)` | 2: (0, 1) (1, 2) (3, 5) / 3: (2, 5) |
| `remove_edge(1, 2)` | 1: (0, 4) / 2: (0, 1) (3, 5) |

`bfs(0)` on the graph before the removal returns `[0, 1, 2, 3]`.

## Complexity

| Quantity | Cost | Why |
| --- | --- | --- |
| Space | O(V + E) | one list per vertex, one entry per edge end (2E entries when undirected) |
| Add or remove edge | O(deg(u) + deg(v)) | the lists are scanned |
| Has edge | O(deg(u)) | linear scan of one list |
| Neighbors of u | O(deg(u)) | proportional to the output |
| BFS / DFS | O(V + E) | every list is read once |

The degree is at most V - 1, so the worst case for the per-edge operations is O(V).

## When to Use

- Use it for sparse graphs (E much smaller than V squared) and whenever you mostly iterate over neighbors: BFS, DFS, Dijkstra, Prim.
- Avoid it when you need constant-time edge lookups on a dense graph; use a matrix or a hash set per vertex.

## Adjacency List vs. Alternatives

| | Adjacency list | Adjacency matrix | Edge list |
| --- | --- | --- | --- |
| Space | O(V + E) | O(V^2) | O(E) |
| Has edge | O(deg(u)) | O(1) | O(E) |
| Neighbors of u | O(deg(u)) | O(V) | O(E) |
| Best for | sparse graphs, traversal | dense graphs | sorting edges |

## Common Pitfalls

- Removing only one direction of an undirected edge.
- Treating `add_edge` as O(1); it scans for an existing edge.
- Undirected self-loops are stored once, so counting list entries gives degree 1 where the usual convention gives 2.
- Forgetting a visited set in BFS or DFS on a graph with cycles.
- Editing the list returned by `get_neighbors`; in Python it is a copy and the graph does not change.

## Implementations

| Language | Folder | Main file | Notes |
| --- | --- | --- | --- |
| Python | [Python](Python) | `adjacency_list.py` | full API, dict of lists, weights as tuples |
| C++ | [C++](C++) | `adjacency_list.cpp` | two maps (unweighted and weighted), BFS only |
| Go | [Go](Go) | `main.go` | `Edge{To, Weight}` slices, BFS only |

## Practice Problems

- LeetCode 133: Clone Graph
- LeetCode 207: Course Schedule
- LeetCode 997: Find the Town Judge
- LeetCode 797: All Paths From Source to Target
- LeetCode 1971: Find if Path Exists in Graph

## Related

- [Adjacency Matrix](../Adjacency%20Matrix)
- [Edge List](../Edge%20List)
- [Directed and Undirected graphs](../Directed%20%26%20Undirected)
- [Weighted and Unweighted graphs](../Weighted%20%26%20Unweighted)
- [BFS](../../../../Algorithms/Graph_Algorithms/Traversal/BFS)
- [DFS](../../../../Algorithms/Graph_Algorithms/Traversal/DFS)
