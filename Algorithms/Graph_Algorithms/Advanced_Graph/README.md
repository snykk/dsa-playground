# Advanced Graph Algorithms

These algorithms look for structure inside a graph instead of paths through it. A valid task order, groups of mutually reachable vertices, single points of failure, a yes-or-no answer to a logic formula, the most flow a network can carry, and the most pairs a bipartite graph can match. Most of them are one DFS or BFS with extra bookkeeping.

## Topics

Read them in this order.

| # | Topic | What it adds | Level |
|---|-------|--------------|-------|
| 1 | [Topological Sort](Topological_Sort/) | Order a DAG so every edge points forward, with Kahn's algorithm or DFS. The simplest topic here, and it detects cycles. | Intermediate |
| 2 | [Strongly Connected Components](Strongly_Connected_Components/) | Split a directed graph into maximal groups of mutually reachable vertices. Kosaraju uses two DFS passes, Tarjan one. | 2 topics |
| 3 | [Bridges and Articulation Points](Tarjan_Bridges_Articulation/) | Find the edges and vertices whose removal disconnects an undirected graph, with discovery times and low-links in one DFS. | Advanced |
| 4 | [2-SAT](2_SAT/) | Decide a formula of two-literal clauses by building an implication graph and running an SCC algorithm on it. | Advanced |
| 5 | [Network Flow](Network_Flow/) | Maximum flow from a source to a sink with augmenting paths. Ford-Fulkerson finds any path, Edmonds-Karp the shortest. | 2 topics |
| 6 | [Bipartite Matching](Bipartite_Matching/) | The most pairs between two sides, along augmenting paths: Kuhn's DFS per vertex, or Hopcroft-Karp's shortest paths in phases. Konig's theorem gives a minimum vertex cover. | Advanced |

Topological sort, strongly connected components and bridges are built on DFS, and 2-SAT is a thin layer over an SCC algorithm. Network flow stands apart: it changes a residual graph again and again instead of walking the graph once. Bipartite matching is its unit-capacity case, with faster algorithms of its own.

## How They Compare

| Topic | Input | Output | Built on | Time | Level |
|-------|-------|--------|----------|------|-------|
| Topological sort | directed acyclic graph | an order of the vertices, or a cycle report | in-degrees and a queue, or DFS | O(V + E) | Intermediate |
| Strongly connected components | directed graph | the components, in a topological order of the condensation or its reverse | DFS, twice or once | O(V + E) | Advanced |
| Bridges and articulation points | undirected multigraph | the bridges and the cut vertices | one DFS with disc and low values | O(V + E) | Advanced |
| 2-SAT | clauses with two literals each | satisfiable or not, plus an assignment | implication graph and Tarjan | O(n + m) | Advanced |
| Network flow | directed graph with capacities | the maximum flow value | augmenting paths in a residual graph | O(E f) or O(V E^2) | Advanced |
| Bipartite matching | bipartite graph, no weights | a maximum matching, and a minimum vertex cover | augmenting paths, by DFS or by BFS layers and DFS | O(V E) or O(E sqrt(V)) | Advanced |

For 2-SAT, n is the number of variables and m the number of clauses. For Ford-Fulkerson, f is the maximum flow and the capacities must be integers.

## Choosing One

| Situation | Use | Why |
|-----------|-----|-----|
| Order tasks by their dependencies | [Topological Sort](Topological_Sort/) | every task comes after everything it depends on |
| Check whether a dependency graph has a cycle | [Topological Sort](Topological_Sort/) | Kahn leaves vertices unplaced when a cycle exists |
| Group a directed graph into mutually reachable parts | [Strongly Connected Components](Strongly_Connected_Components/) | the components form a DAG you can then order |
| Find the weak links of a network | [Bridges and Articulation Points](Tarjan_Bridges_Articulation/) | one DFS lists every bridge and articulation point |
| Decide pairwise either-or constraints | [2-SAT](2_SAT/) | a conflict is exactly a variable in the same SCC as its negation |
| Carry as much as possible from a source to a sink | [Network Flow](Network_Flow/) | augmenting paths reach the maximum, and a minimum cut proves it |
| Pair items of two kinds, each pair allowed or not | [Bipartite Matching](Bipartite_Matching/) | Hopcroft-Karp has a better bound than Ford-Fulkerson or Edmonds-Karp on the flow reduction, and a minimum vertex cover proves the answer |

## Common Pitfalls

- Topological sort on a graph with a cycle has no valid order. Check the result for a cycle report.
- Kosaraju lists the source component first and Tarjan the sink component first, so the two orders are reverse of each other.
- The bridge algorithm is for undirected graphs only, and its vertices must be numbered from 0 to n - 1.
- With three literals per clause the problem is NP-complete and the 2-SAT method no longer works.
- Ford-Fulkerson's running time depends on the flow value, and with irrational capacities it may never stop. Use Edmonds-Karp.
- Bipartite matching and Konig's theorem need a bipartite graph; with weights on the edges the task is an assignment problem instead.

## Related

- [Graph Traversal Algorithms](../Traversal/): read first.
- [Shortest Path Algorithms](../Shortest_Path/): the other area that asks about cost along paths.
- [Minimum Spanning Tree](../Minimum_Spanning_Tree/): the other area that asks about cost over the whole graph.
- [Disjoint Set Union](../../../Data_Structures/Advanced_Structures/Disjoint_Set_Union/): the union-find structure used by Kruskal's algorithm.
- [Graph Traversal Problems](../../../Problem_Patterns/Graph_Traversal_Problems/): practice problems built on BFS and DFS.
