# Network Flow

Network flow asks how much can be sent from a source to a sink through edges with capacities. Ford-Fulkerson and Edmonds-Karp both push flow along augmenting paths in a residual graph and stop at the same maximum. The only difference is how the path is chosen, any path or the shortest, and it decides the running time.

## Topics

Read them in this order.

| # | Topic | What it adds | Level |
|---|-------|--------------|-------|
| 1 | [Ford-Fulkerson Method](Ford_Fulkerson/) | The method. Find any path with spare capacity, push flow along it, repeat. Backward edges let it undo earlier choices. | Advanced |
| 2 | [Edmonds-Karp Algorithm](Edmonds_Karp/) | The same method with BFS, so each path is a shortest one. That one change gives a polynomial bound. | Advanced |

Each round finds a path with spare capacity in the residual graph, pushes the bottleneck along it, and stops when no path remains. The max-flow min-cut theorem says the result equals the capacity of a minimum cut.

## How They Compare

| Property | Ford-Fulkerson | Edmonds-Karp |
|----------|----------------|--------------|
| Augmenting path | any path, found by DFS here | a shortest path by edge count, found by BFS |
| Time | O(E f) | O(V E^2) |
| Depends on capacity values | yes | no |
| Terminates on irrational capacities | not guaranteed | yes |
| Extra space | O(V + E) | O(V + E) |
| Extra in Python | `min_cut` and the list of augmenting paths | the flow value only |

Here f is the maximum flow. On the network with source 0, sink 5 and edges `0->1 16`, `0->2 13`, `1->2 10`, `1->3 12`, `2->1 4`, `2->4 14`, `3->2 9`, `3->5 20`, `4->3 7`, `4->5 4`, both return 23. Edmonds-Karp needs 3 rounds and Ford-Fulkerson 6.

## Choosing One

| Situation | Use | Why |
|-----------|-----|-----|
| Learning how the residual graph works | Ford-Fulkerson | the method is the simplest form of the idea |
| Any real use, or capacities that may be large | Edmonds-Karp | the bound does not depend on the capacities |
| You need the minimum cut as well | Ford-Fulkerson in this repository | its Python code has `min_cut` and returns the augmenting paths |
| Small integer capacities and a small maximum flow | either | both finish in few rounds |

Faster algorithms such as Dinic's exist. They are not in this repository.

## Common Pitfalls

- Without the backward edges the algorithm can get stuck below the maximum, because it cannot undo a bad early choice.
- Ford-Fulkerson's running time depends on the flow value, so huge capacities can make it very slow.
- With irrational capacities, a careless path choice in Ford-Fulkerson may never terminate.
- Edmonds-Karp here returns only the total flow value, not the flow on each edge.
- Model an undirected edge as two directed edges, each with the capacity.

## Related

- [Depth-First Search (DFS)](../../Traversal/DFS/): read first, it finds the paths in Ford-Fulkerson.
- [Breadth-First Search (BFS)](../../Traversal/BFS/): read first, it finds the paths in Edmonds-Karp.
- [Advanced Graph Algorithms](../): the other structure-finding topics.
- [Shortest Path Algorithms](../../Shortest_Path/): Edmonds-Karp picks shortest paths by edge count, as BFS does.
