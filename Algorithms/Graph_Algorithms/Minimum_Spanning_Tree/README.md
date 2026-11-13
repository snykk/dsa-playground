# Minimum Spanning Tree

A minimum spanning tree joins every vertex of a weighted undirected graph with V - 1 edges of the smallest possible total weight. Kruskal and Prim both build one greedily and reach the same total weight; they differ in whether they grow a forest of fragments or a single tree.

## Topics

Read them in this order.

| # | Topic | What it adds | Level |
|---|-------|--------------|-------|
| 1 | [Kruskal's Algorithm](Kruskals_Algorithm/) | Sort the edges, then keep each one that joins two different fragments. Union-find answers that in almost constant time. | Intermediate |
| 2 | [Prim's Algorithm](Prims_Algorithm/) | Grow one tree from a start vertex, always adding the cheapest edge that leaves it. A heap picks the edge. | Intermediate |

Both rely on the cut property: for any split of the vertices into two groups, the lightest edge between the groups can be part of some minimum spanning tree. Both are implemented in Python, C++ and Go.

## How They Compare

| Property | Kruskal | Prim |
|----------|---------|------|
| Grows | a forest of fragments that merge | one tree |
| Picks | the globally lightest edge that is safe | the lightest edge that leaves the tree |
| Needs | sorted edges and union-find | a priority queue, or an array for the matrix version |
| Natural input | edge list | adjacency list or adjacency matrix |
| Time | O(E log E) | O(E log V) with a heap, O(V^2) with a matrix |
| Extra space | O(V) | O(V + E) with a heap, O(V) with a matrix |
| Disconnected graph | spanning forest, fewer than V - 1 edges | only the start vertex component |
| Negative weights | allowed | allowed |

Since E is at most V^2, log E is at most 2 log V, so O(E log E) and O(E log V) are the same class.

## Choosing One

| Situation | Use | Why |
|-----------|-----|-----|
| Edges arrive as a list, or the graph is sparse | Kruskal | sort once and merge fragments |
| The graph is dense or stored as a matrix | Prim with the matrix | O(V^2) beats O(E log V) when E is close to V^2 |
| You need a forest for a disconnected graph | Kruskal | it returns one tree per component without any extra work |
| You want a tree grown from a given vertex | Prim | it starts at the vertex you name |
| You want shortest paths from a vertex | [Dijkstra](../Shortest_Path/Dijkstras_Algorithm/) | an MST does not minimise distances from any single vertex |

## Common Pitfalls

- An MST minimises total weight. The path between two vertices inside it can be longer than their shortest path in the graph.
- Kruskal without the union-find cycle check does not return a tree.
- A disconnected graph has no spanning tree. Kruskal returns fewer than V - 1 edges without an error, and Prim silently leaves out the vertices it cannot reach.
- These algorithms are for undirected graphs. A directed graph needs a minimum spanning arborescence, which is a different algorithm.
- Equal edge weights allow several minimum spanning trees, so the two algorithms can return different trees of the same total.

## Related

- [Graphs](../../../Data_Structures/Non_Linear/Graph/): read first.
- [Greedy Algorithms](../../Greedy/): read first.
- [Disjoint Set Union](../../../Data_Structures/Advanced_Structures/Disjoint_Set_Union/): read first, the union-find behind Kruskal.
- [Heaps](../../../Data_Structures/Non_Linear/Heaps/): read first, the priority queue behind Prim.
- [Dijkstra's Algorithm](../Shortest_Path/Dijkstras_Algorithm/): the same priority-queue shape, ranked by total distance.
- [Graph Traversal Algorithms](../Traversal/): the searches that spanning trees build on.
