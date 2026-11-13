# Directed & Undirected Graphs

In a directed graph every edge has a direction, so u to v says nothing about v to u. In an undirected graph an edge works both ways. This folder implements one `Graph` class (adjacency list) for both kinds, with O(V + E) space and O(V + E) traversal.

## Intuition

An undirected edge is a handshake: if I know you, you know me. A directed edge is a hyperlink or a follow: I can point at you without you pointing back. The direction decides what "reachable", "degree" and "connected" mean.

The invariant: `v` is in `u`'s list when the edge `u -> v` exists. For an undirected graph the code keeps the mirror entry too, so `v` in `u`'s list if and only if `u` in `v`'s list. An undirected graph is just a directed graph with both arrows.

## Visual

```text
Undirected: 1-2, 1-4, 2-3, 4-3, 3-5      Directed: 1->2, 1->4, 2->3, 4->3, 3->5

      2                                        +--> 2 --+
     / \                                      /          v
    1   3 --- 5                              1            3 --> 5
     \ /                                      \          ^
      4                                        +--> 4 --+

Lists (undirected)         Lists (directed)
1: [2, 4]                  1: [2, 4]
2: [1, 3]                  2: [3]
3: [2, 4, 5]               3: [5]
4: [1, 3]                  4: [3]
5: [3]                     5: []
```

## Operations

| Operation | What it does | Time |
| --- | --- | --- |
| `add_vertex(v)` | create an empty neighbor list | O(1) |
| `add_edge(u, v)` | create missing vertices, append unless present (and the mirror when undirected) | O(deg(u) + deg(v)) |
| `remove_edge(u, v)` | remove `v` from `u`'s list (and `u` from `v`'s when undirected) | O(deg(u) + deg(v)) |
| `has_edge(u, v)` | scan `u`'s list | O(deg(u)) |
| `get_neighbors(u)` | a copy of the out-neighbors | O(deg(u)) |
| `get_vertices()`, `get_edges()` | all vertices; all edges (an undirected edge once) | O(V + E) |
| `bfs(s)`, `dfs(s)` | traversal from `s` | O(V + E) |
| `is_connected()` | undirected only: does BFS reach every vertex? | O(V + E) |
| `get_degree(u)` | undirected: neighbors of `u`; directed: in-degree plus out-degree | O(1) undirected, O(V + E) directed |

Duplicate edges are ignored, so there are no parallel edges. `is_connected()` on a directed graph raises `ValueError` (Python), throws `std::invalid_argument` (C++) or panics (Go). Python and Go have a recursive DFS (`dfs_recursive`, `DFSRecursive`); C++ does not.

## Step-by-Step Trace

Edges `1-2, 1-4, 2-3, 4-3, 3-5`, breadth-first from 1:

| Mode | Result | Why |
| --- | --- | --- |
| undirected `bfs(1)` | `[1, 2, 4, 3, 5]` | every vertex is reachable and `is_connected()` is True |
| directed `bfs(1)` | `[1, 2, 4, 3, 5]` | arrows 1->2, 1->4, 2->3, 3->5 reach everything |
| directed `bfs(3)` | `[3, 5]` | only 3 -> 5 leaves vertex 3 |
| directed `bfs(5)` | `[5]` | vertex 5 has no outgoing edge |

Directed `get_degree` (in plus out): vertex 1 gives 2, vertex 2 gives 2, vertex 3 gives 3, vertex 4 gives 2, vertex 5 gives 1.

## Complexity

| Quantity | Cost | Why |
| --- | --- | --- |
| Space | O(V + E) | up to 2E entries when undirected |
| Add, remove edge | O(deg) | duplicate check or removal scans lists |
| Has edge | O(deg(u)) | linear scan |
| BFS, DFS, `is_connected` | O(V + E) | each vertex and list entry once |

In an undirected graph the degrees sum to 2E (handshake lemma). In a digraph the in-degrees sum to E and so do the out-degrees.

## When to Use

- Undirected: symmetric relations such as friendships, two-way roads, connected components.
- Directed: asymmetric relations such as links, dependencies, flows, and anything that needs a topological order.
- For weights see Weighted & Unweighted; for dense graphs or O(1) lookup see Adjacency Matrix.

## Directed vs. Undirected

| | Undirected | Directed |
| --- | --- | --- |
| Edge | unordered pair | ordered pair |
| Entries stored | 2 per edge | 1 per edge |
| Degree | one number | in-degree and out-degree |
| Connectivity | connected components | weak and strong components |
| Cycle detection | visited neighbor that is not the parent | visited neighbor on the current DFS path |

## Common Pitfalls

- Mirroring a directed edge, or forgetting to mirror an undirected one: traversals then miss vertices.
- Calling `is_connected()` on a directed graph.
- Reading `get_degree` on a digraph as the number of neighbors: it is in plus out.
- Using the undirected cycle rule on a digraph.
- Assuming BFS from any vertex reaches everything in a directed graph.
- An undirected self-loop is stored once, so counting list entries gives degree 1 instead of the conventional 2.

## Implementations

| Language | Folder | Main file | Notes |
| --- | --- | --- | --- |
| Python | [Python](Python) | `graph.py` | dict of lists; `get_neighbors` returns a copy |
| C++ | [C++](C++) | `graph.cpp` | no recursive DFS; throws on directed `is_connected` |
| Go | [Go](Go) | `main.go` | panics on directed `IsConnected`; `GetNeighbors` returns a copy |

## Practice Problems

- LeetCode 997: Find the Town Judge (in-degree and out-degree)
- LeetCode 207: Course Schedule (directed cycle detection)
- LeetCode 323: Number of Connected Components in an Undirected Graph
- LeetCode 785: Is Graph Bipartite?
- LeetCode 1971: Find if Path Exists in Graph

## Related

- [Adjacency List](../Adjacency%20List)
- [Adjacency Matrix](../Adjacency%20Matrix)
- [Edge List](../Edge%20List)
- [Weighted and Unweighted graphs](../Weighted%20%26%20Unweighted)
- [BFS](../../../../Algorithms/Graph_Algorithms/Traversal/BFS)
- [Topological Sort](../../../../Algorithms/Graph_Algorithms/Advanced_Graph/Topological_Sort)
