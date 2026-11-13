# Shortest Path Algorithms

Shortest-path algorithms find the cheapest route through a weighted graph. The four here differ in what they assume and what they return, which is non-negative weights and one source for Dijkstra, negative weights for Bellman-Ford, every pair for Floyd-Warshall, and one goal with a hint for A*.

## Topics

Read them in this order.

| # | Topic | What it adds | Level |
|---|-------|--------------|-------|
| 1 | [Dijkstra's Algorithm](Dijkstras_Algorithm/) | The baseline. Settle the closest unsettled vertex with a priority queue. Fast, but wrong if any edge is negative. | Intermediate |
| 2 | [Bellman-Ford Algorithm](Bellman_Ford_Algorithm/) | Relax every edge V - 1 times. Slower, but it handles negative edges and detects a reachable negative cycle. | Intermediate |
| 3 | [Floyd-Warshall Algorithm](Floyd_Warshall_Algorithm/) | Fill a V by V table, allowing one more intermediate vertex per round. Distances between every pair at once. | Intermediate |
| 4 | [A* Search](A_Star_Search_Algorithm/) | Dijkstra guided by a heuristic. It expands the vertex with the smallest g + h, so it can skip parts of the graph. | Intermediate |

Each one keeps a distance estimate per vertex and lowers it by relaxing an edge: if `dist[u] + w < dist[v]`, then `dist[v]` becomes `dist[u] + w`. They differ in which edges they relax and in what order.

## How They Compare

| Algorithm | Answers | Idea | Negative edges | Time | Extra space |
|-----------|---------|------|----------------|------|-------------|
| Dijkstra | one source to all | settle the closest unsettled vertex, then relax its edges | no | O((V + E) log V) | O(V + E) |
| Bellman-Ford | one source to all | relax every edge, V - 1 rounds, then one check round | yes, and detects negative cycles | O(V * E) | O(V) |
| Floyd-Warshall | all pairs | allow vertex k as an intermediate, for k from 0 to V - 1 | yes, and detects negative cycles | O(V^3) | O(V^2) |
| A* | one source to one goal | Dijkstra ordered by g + h, with h an estimate of the cost left | no | O(b^d) worst case | depends on the open set |

A negative cycle, one whose weights sum below zero, makes the cheapest path undefined, because every lap makes it cheaper. Bellman-Ford and Floyd-Warshall report it; in Python both return `None`. Dijkstra from every vertex also gives all pairs, at V times the single-source time, which beats O(V^3) on a sparse graph with non-negative weights.

## Choosing One

| Situation | Use | Why |
|-----------|-----|-----|
| One source, non-negative weights | Dijkstra | the fastest of the general methods here |
| Negative edges, or you must detect a negative cycle | Bellman-Ford | it does not assume that settled vertices are final |
| Distances between all pairs on a small graph | Floyd-Warshall | three short loops, handles negative edges, one table |
| One goal and a good distance estimate, such as a map or a grid | A* | the heuristic prunes vertices that point away from the goal |
| Every edge costs the same | [BFS](../Traversal/BFS/) | no priority queue needed, and it runs in O(V + E) |

## Common Pitfalls

- Dijkstra with a negative edge gives no error, only a wrong answer.
- BFS on weighted edges minimises the number of edges, not the cost.
- If a negative cycle is reachable, no shortest path exists. Only Bellman-Ford and Floyd-Warshall check for it.
- An unreachable distance (`inf`) plus a weight must stay unreachable. Check for it before relaxing.
- An A* heuristic that overestimates the remaining cost can return a path that is not the cheapest.

## Related

- [Breadth-First Search (BFS)](../Traversal/BFS/): read first.
- [Heaps](../../../Data_Structures/Non_Linear/Heaps/): read first, for the priority queue.
- [Minimum Spanning Tree](../Minimum_Spanning_Tree/): Prim's algorithm has the same shape as Dijkstra, with a different key.
- [Topological Sort](../Advanced_Graph/Topological_Sort/): the other graph topic that orders vertices by their edges.
- [Greedy Algorithms](../../Greedy/): Dijkstra is greedy.
