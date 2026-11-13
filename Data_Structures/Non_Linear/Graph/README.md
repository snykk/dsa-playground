# Graphs

A graph is stored in one of three ways, an adjacency list, an adjacency matrix or an edge list, and the choice sets memory and the cost of every query. Directed and weighted are properties of the edges, and they work the same way in all three.

## Topics

Read them in this order.

| # | Topic | What it adds | Level |
|---|-------|--------------|-------|
| 1 | [Adjacency List](Adjacency_List/) | A list of neighbors per vertex. O(V + E) space, and the default way to hold a sparse graph. | Beginner |
| 2 | [Adjacency Matrix](Adjacency_Matrix/) | A V-by-V table. O(1) edge lookup, paid for with O(V^2) space and an O(V) row scan for neighbors. | Beginner |
| 3 | [Edge List](Edge_List/) | A flat list of edges. The smallest form and the natural input for Kruskal, but every query scans O(E). | Beginner |
| 4 | [Directed and Undirected Graphs](Directed_and_Undirected/) | What an edge direction changes for reachability, degree and connectivity, and how an undirected edge is stored. | Beginner |
| 5 | [Weighted and Unweighted Graphs](Weighted_and_Unweighted/) | Numbers on edges, and why they decide whether BFS, Dijkstra or Bellman-Ford finds the shortest path. | Beginner |

The last two topics are not layouts. They describe the edges, and in this repository both sit on top of an adjacency list. An undirected edge is stored once per direction in all three layouts; the edge list counts it once in `get_edge_count()`.

## How They Compare

`V` is the number of vertices and `E` the number of edges.

| Operation | Adjacency list | Adjacency matrix | Edge list |
|-----------|----------------|------------------|-----------|
| space | O(V + E) | O(V^2) | O(E) |
| has edge (u, v) | O(deg(u)) | O(1) | O(E) |
| neighbors of u | O(deg(u)) | O(V) | O(E) |
| add edge, as coded here | O(deg(u) + deg(v)) | O(1) | O(E) |
| remove edge | O(deg(u) + deg(v)) | O(1) | O(E) |
| BFS or DFS | O(V + E) | O(V^2) | O(V*E) |
| iterate all edges | O(V + E) | O(V^2) | O(E) |

Adding an edge to a list or an edge list is not an O(1) append here: both first replace an existing edge between the same pair, so a repeated call updates the weight instead of creating a parallel edge. The edge list's BFS is O(V*E) because each visited vertex scans the whole list; convert it to an adjacency list first to get O(V + E).

## Choosing One

| Situation | Use | Why |
|-----------|-----|-----|
| A sparse graph and a traversal such as BFS, DFS or Dijkstra | Adjacency List | memory grows with the edges, and neighbors cost only their own degree |
| A dense graph, or many edge-existence queries | Adjacency Matrix | O(1) lookup, and the table is mostly filled anyway |
| An algorithm that sorts or scans every edge once | Edge List | Kruskal and Bellman-Ford want exactly the flat list |
| All-pairs shortest paths on a small graph | Adjacency Matrix | Floyd-Warshall updates the V-by-V table in place |
| One-way relationships such as dependencies | a directed graph | u to v says nothing about v to u |
| Costs, distances or times on the edges | a weighted graph | then BFS is the wrong tool, since it minimizes edges, not cost |

## Common Pitfalls

- A matrix always takes O(V^2) memory, even with no edges, so it is a poor fit for a large sparse graph.
- Running BFS or DFS directly on an edge list is O(V*E), because each vertex scans the whole list.
- `add_edge` scans for an existing edge first, so building a large graph edge by edge is slower than it looks.
- Removing one direction of an undirected edge leaves the other entry, and `has_edge` still answers true.
- `is_connected` is defined for undirected graphs only and raises an error on a directed one.
- BFS finds the path with the fewest edges, not the cheapest one on weighted edges.

## Related

- [Big O Notation](../../../Complexity_Analysis/Time_Complexity/Big_O_Notation/): read first.
- [Graph Algorithms](../../../Algorithms/Graph_Algorithms/): what runs on top of these layouts.
- [BFS](../../../Algorithms/Graph_Algorithms/Traversal/BFS/): level-by-level traversal; O(V + E) on an adjacency list.
- [DFS](../../../Algorithms/Graph_Algorithms/Traversal/DFS/): depth-first traversal on the same layouts.
- [Dijkstra's Algorithm](../../../Algorithms/Graph_Algorithms/Shortest_Path/Dijkstras_Algorithm/): shortest paths on weighted graphs.
- [Kruskal's Algorithm](../../../Algorithms/Graph_Algorithms/Minimum_Spanning_Tree/Kruskals_Algorithm/): sorts an edge list by weight.
