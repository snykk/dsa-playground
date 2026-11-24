# Network Flow

Network flow asks how much can be sent from a source to a sink through edges with capacities. Ford-Fulkerson, Edmonds-Karp and Dinic all push flow along augmenting paths in a residual graph and stop at the same maximum. They differ in how they choose the paths, any path, one shortest path per BFS, or shortest paths until none of that length is left per BFS, and that decides the running time.

## Topics

Read them in this order.

| # | Topic | What it adds | Level |
|---|-------|--------------|-------|
| 1 | [Ford-Fulkerson Method](Ford_Fulkerson/) | The method. Find any path with spare capacity, push flow along it, repeat. Backward edges let it undo earlier choices. | Advanced |
| 2 | [Edmonds-Karp Algorithm](Edmonds_Karp/) | The same method with BFS, so each path is a shortest one. That one change gives a polynomial bound. | Advanced |
| 3 | [Dinic's Algorithm](Dinic/) | One BFS sorts the vertices into levels, then depth-first searches push flow along shortest paths until none is left before the next BFS, with a current-arc pointer per vertex. Returns the flow on every edge and a minimum cut. | Advanced |

Each round finds a path with spare capacity in the residual graph, pushes the bottleneck along it, and stops when no path remains; Dinic groups its rounds into phases that share one BFS. The max-flow min-cut theorem says the result equals the capacity of a minimum cut.

## How They Compare

| Property | Ford-Fulkerson | Edmonds-Karp | Dinic |
|----------|----------------|--------------|-------|
| Augmenting path | any path, found by DFS here | a shortest path by edge count, found by BFS | shortest paths of the BFS level graph, found by DFS until each has a full edge |
| Time | O(E f) | O(V E^2) | O(V^2 E); O(E sqrt(V)) on unit networks |
| Depends on capacity values | yes | no | no |
| Terminates on irrational capacities | not guaranteed | yes | yes |
| Extra space | O(V + E) | O(V + E) | O(V + E) |
| Extra in Python | `min_cut` and the list of augmenting paths | the flow value only | `dinic_flow`: the flow on every edge, a minimum cut, the phases and the entries looked at |

Here f is the maximum flow. On the network with source 0, sink 5 and edges `0->1 16`, `0->2 13`, `1->2 10`, `1->3 12`, `2->1 4`, `2->4 14`, `3->2 9`, `3->5 20`, `4->3 7`, `4->5 4`, all three return 23. Edmonds-Karp needs 3 rounds and Ford-Fulkerson 6; Dinic takes the same 3 paths as Edmonds-Karp in 2 phases, so it runs 3 BFS where Edmonds-Karp runs 4.

## Choosing One

| Situation | Use | Why |
|-----------|-----|-----|
| Learning how the residual graph works | Ford-Fulkerson | the method is the simplest form of the idea |
| A small network, or capacities that may be large | Edmonds-Karp | the bound does not depend on the capacities, and the code is short |
| A large network, or a unit network such as bipartite matching | Dinic | one BFS per phase instead of one per path, and O(E sqrt(V)) on unit networks |
| You need the flow on each edge or the minimum cut | Dinic in this repository | `dinic_flow` returns both; Ford-Fulkerson's `min_cut` returns the cut too |
| Small integer capacities and a small maximum flow | any of them | all finish in few rounds |

Push-relabel algorithms, which move flow vertex by vertex instead of along paths, are not in this repository.

## Common Pitfalls

- Without the backward edges the algorithm can get stuck below the maximum, because it cannot undo a bad early choice.
- Ford-Fulkerson's running time depends on the flow value, so huge capacities can make it very slow.
- With irrational capacities, a careless path choice in Ford-Fulkerson may never terminate.
- Edmonds-Karp here returns only the total flow value, not the flow on each edge; Dinic's `dinic_flow` returns the flows too.
- Dinic without its current-arc pointer still returns the right value, but its searches walk past the same entries again and again.
- Model an undirected edge as two directed edges, each with the capacity.

## Related

- [Depth-First Search (DFS)](../../Traversal/DFS/): read first, it finds the paths in Ford-Fulkerson and Dinic.
- [Breadth-First Search (BFS)](../../Traversal/BFS/): read first, it finds the paths in Edmonds-Karp and the levels in Dinic.
- [Advanced Graph Algorithms](../): the other structure-finding topics.
- [Bipartite Matching](../Bipartite_Matching/): the unit-capacity case; Hopcroft-Karp is Dinic's idea on its flow network.
- [Shortest Path Algorithms](../../Shortest_Path/): Edmonds-Karp picks shortest paths by edge count, as BFS does.
