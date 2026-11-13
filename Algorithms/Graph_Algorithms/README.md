# Graph Algorithms

Graph algorithms answer questions about vertices and edges, such as what is reachable, what is cheapest, what connects everything for the least cost, and what structure hides in the graph. The four areas here build on each other, from plain traversal up to components, orders and flows.

## Topics

Read them in this order.

| # | Section | What it adds | Level |
|---|---------|--------------|-------|
| 1 | [Graph Traversal Algorithms](Traversal/) | Visit every reachable vertex. BFS goes ring by ring, DFS goes deep first; almost everything else is built on one of them. | 2 topics |
| 2 | [Shortest Path Algorithms](Shortest_Path/) | Cheapest routes in weighted graphs. Dijkstra, Bellman-Ford for negative edges, Floyd-Warshall for all pairs, A* for one goal. | 4 topics |
| 3 | [Minimum Spanning Tree](Minimum_Spanning_Tree/) | Connect all vertices with the least total weight. Kruskal sorts edges, Prim grows one tree. | 2 topics |
| 4 | [Advanced Graph Algorithms](Advanced_Graph/) | Structure inside a graph. Topological order, strongly connected components, bridges, 2-SAT and maximum flow. | 7 topics |

All four areas are implemented in Python, C++ and Go.

## How They Compare

| Area | Question | Main tools | Typical time | Weights |
|------|----------|------------|--------------|---------|
| Traversal | what is reachable, and in what order | BFS with a queue, DFS with a stack or recursion | O(V + E) | ignored |
| Shortest path | cheapest route from a source, or between all pairs | Dijkstra, Bellman-Ford, Floyd-Warshall, A* | O((V + E) log V) to O(V^3) | the point of the area |
| Minimum spanning tree | cheapest set of edges that connects everything | Kruskal with union-find, Prim with a heap | O(E log E) or O(E log V) | the point of the area |
| Advanced graph | order, components, bridges, satisfiability, flow | Kahn, Kosaraju, Tarjan, 2-SAT, Ford-Fulkerson, Edmonds-Karp | O(V + E) to O(V E^2) | only for flow capacities |

| Area | Algorithm | Time | Extra space |
|------|-----------|------|-------------|
| Traversal | BFS, DFS | O(V + E) | O(V) |
| Shortest path | Dijkstra | O((V + E) log V) | O(V + E) |
| Shortest path | Bellman-Ford | O(V * E) | O(V) |
| Shortest path | Floyd-Warshall | O(V^3) | O(V^2) |
| Minimum spanning tree | Kruskal | O(E log E) | O(V) |
| Minimum spanning tree | Prim with a heap | O(E log V) | O(V + E) |
| Advanced graph | Topological sort, SCC, bridges | O(V + E) | O(V) to O(V + E) |
| Advanced graph | Edmonds-Karp | O(V E^2) | O(V + E) |

DFS needs O(V) with real recursion and up to O(E) for the stack of its marking-on-pop version.

## Where to Start

1. Read the Graphs data structures first: adjacency list, adjacency matrix and edge list. Every algorithm here takes one of them as input.
2. Traversal: BFS and DFS. They are short, and the rest of the section reuses both.
3. Shortest Path: start with Dijkstra's algorithm. Bellman-Ford, Floyd-Warshall and A* each change one of its assumptions: negative edges, all pairs, a single goal with a hint.
4. Minimum Spanning Tree: Kruskal and Prim solve the same problem from two directions. Kruskal also needs the union-find structure.
5. Advanced Graph: take topological sort first, then strongly connected components, bridges and 2-SAT, which reuse DFS. Network flow is the most self-contained part and can be read last.

## Choosing an Area

| Situation | Go to | Why |
|-----------|-------|-----|
| Is B reachable from A, or how many components are there | [Traversal](Traversal/) | one BFS or DFS answers it in O(V + E) |
| Fewest hops in an unweighted graph | [Traversal](Traversal/) (BFS) | the first visit to a vertex is along a shortest path |
| Cheapest route with positive costs | [Shortest Path](Shortest_Path/) (Dijkstra) | it settles the closest vertex first |
| Cheapest route with negative edges, or a negative cycle check | [Shortest Path](Shortest_Path/) (Bellman-Ford) | it relaxes every edge V - 1 times and then checks once more |
| Connect all sites with the least cable | [Minimum Spanning Tree](Minimum_Spanning_Tree/) | every vertex is joined and no cycle is paid for |
| Order tasks that depend on each other | [Advanced Graph](Advanced_Graph/) (Topological Sort) | every edge points forward in the result |
| Find mutually reachable groups, or single points of failure | [Advanced Graph](Advanced_Graph/) | strongly connected components and bridges, each in one DFS |
| Largest amount that can pass from a source to a sink | [Advanced Graph](Advanced_Graph/) (Network Flow) | augmenting paths in a residual graph reach the maximum |

## Common Pitfalls

- BFS counts edges, not cost: on a weighted graph it returns the fewest-hop path, which can cost far more than the cheapest one.
- Dijkstra does not fail on a negative edge. It silently returns wrong distances; use Bellman-Ford.
- A minimum spanning tree minimises total weight, not the distance from any one vertex.
- One traversal from one start covers one component. On a disconnected graph, Kruskal returns a forest.
- Topological sort needs a DAG, SCC algorithms need directed edges, and bridges are defined for undirected graphs.

## Related

- [Graphs](../../Data_Structures/Non_Linear/Graph/): read first.
- [Disjoint Set Union](../../Data_Structures/Advanced_Structures/Disjoint_Set_Union/): the union-find structure behind Kruskal's algorithm.
- [Heaps](../../Data_Structures/Non_Linear/Heaps/): the priority queue behind Dijkstra and Prim.
- [Greedy Algorithms](../Greedy/): Kruskal and Prim are greedy.
- [Graph Traversal Problems](../../Problem_Patterns/Graph_Traversal_Problems/): practice problems for BFS and DFS.
