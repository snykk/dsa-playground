# Strongly Connected Components

A strongly connected component is a maximal group of vertices in a directed graph that can all reach each other. Kosaraju and Tarjan both find every component in O(V + E) time with DFS. Kosaraju uses two passes and the reversed graph, Tarjan one pass and a stack.

## Topics

Read them in this order.

| # | Topic | What it adds | Level |
|---|-------|--------------|-------|
| 1 | [Kosaraju's Algorithm](Kosarajus_Algorithm/) | Two DFS passes. Finish order on the graph, then flood the reversed graph in reverse finish order. Easy to prove and to follow. | Advanced |
| 2 | [Tarjan's SCC Algorithm](Tarjans_Algorithm/) | One DFS with discovery times, low-links and a stack. A vertex whose low-link equals its discovery time roots a component. | Advanced |

Both return the same sets of vertices. Every vertex belongs to exactly one component, and shrinking each component to one vertex gives a DAG, the condensation.

## How They Compare

| Property | Kosaraju | Tarjan |
|----------|----------|--------|
| DFS passes | 2 | 1 |
| Needs the reversed graph | yes | no |
| Core idea | the vertex that finishes last in pass 1 lies in a source component | a vertex with low-link equal to its discovery time is a component root |
| Output order | source component first (topological order) | sink component first (reverse topological order) |
| Time | O(V + E) | O(V + E) |
| Extra space | O(V + E), the transposed graph | O(V), indices, low-links and a stack |
| Python version | iterative DFS | iterative DFS |

On the graph with edges `0->1`, `1->2`, `1->3`, `2->0`, `3->4`, `4->5`, `5->3`, Kosaraju returns `[0, 2, 1]` then `[3, 5, 4]`, and Tarjan returns `[5, 4, 3]` then `[2, 1, 0]`. The sets are the same; the order of the components and of the vertices inside them differs.

## Choosing One

| Situation | Use | Why |
|-----------|-----|-----|
| Learning, or you want a result that is easy to explain | Kosaraju | two plain DFS passes and a clear correctness argument |
| Memory is tight, or the graph cannot be reversed cheaply | Tarjan | one pass, and no second copy of the graph |
| You will feed the components into 2-SAT | Tarjan | its output order gives the assignment directly |
| You need the components in topological order | Kosaraju | it already lists the source component first |
| Only a yes or no on whether the graph is one component | either | both provide an `is_strongly_connected` helper in Python |

## Common Pitfalls

- On an undirected graph every connected component is strongly connected, so a plain traversal does the job.
- Kosaraju and Tarjan return opposite orders of components. Code that relies on one breaks when you swap in the other.
- A recursive DFS overflows the call stack on a long cycle. The Python versions here use an explicit stack.
- Kosaraju's second pass must run on the transposed graph, in reverse finish order.
- In Tarjan, an edge to a finished vertex in another component must not update the low-link.

## Related

- [Depth-First Search (DFS)](../../Traversal/DFS/): read first.
- [2-SAT](../2_SAT/): the main application. A formula is unsatisfiable exactly when a variable shares a component with its negation.
- [Topological Sort](../Topological_Sort/): orders the condensation DAG.
- [Bridges and Articulation Points](../Tarjan_Bridges_Articulation/): the same discovery-time and low-link idea on undirected graphs.
