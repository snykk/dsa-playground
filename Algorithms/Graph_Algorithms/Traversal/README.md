# Graph Traversal Algorithms

Traversal visits every vertex reachable from a start vertex in O(V + E) time. BFS and DFS differ in one choice, which discovered vertex to expand next, and that choice gives BFS shortest hop counts and gives DFS the entry and exit order behind cycles and topological sort.

## Topics

Read them in this order.

| # | Topic | What it adds | Level |
|---|-------|--------------|-------|
| 1 | [Breadth-First Search (BFS)](BFS/) | Expand the oldest discovered vertex. Visits in rings of equal hop distance, so it gives fewest-edge paths in unweighted graphs. | Beginner |
| 2 | [Depth-First Search (DFS)](DFS/) | Expand the newest discovered vertex. Goes deep, then backtracks; the finish order powers cycles, topological sort and components. | Beginner |

Both keep a visited set and a collection of discovered but unexpanded vertices. Both cost O(V + E) on an adjacency list and O(V^2) on an adjacency matrix. Neither looks at edge weights.

## How They Compare

| Property | BFS | DFS |
|----------|-----|-----|
| Collection of discovered vertices | queue (FIFO) | stack or recursion (LIFO) |
| Visit order | by distance from the start, in rings | down one branch, then back up |
| Fewest-edge path in an unweighted graph | yes | no |
| Detects a cycle | possible, but not its natural use | yes, from the entry and exit state |
| Gives a topological order | with in-degrees (Kahn) | yes, from the finish order |
| Time | O(V + E) | O(V + E) |
| Extra space | O(V) | O(V) to O(V + E) |
| Needs recursion | no | optional |

DFS needs O(V) with real recursion and up to O(E) for the stack of its marking-on-pop version.

## Choosing One

| Situation | Use | Why |
|-----------|-----|-----|
| Fewest edges between two vertices | BFS | the first time it reaches a vertex is along a shortest path |
| Every vertex within k steps | BFS | the rings are the distances |
| Detect a cycle, or order tasks by dependency | DFS | entry and exit times show back edges and give a topological order |
| Connected components | either | one search per unvisited vertex; both cost O(V + E) in total |
| Cheapest path with weights | neither | use [Dijkstra](../Shortest_Path/Dijkstras_Algorithm/), which is BFS with a priority queue |
| Strongly connected components, bridges | DFS | Kosaraju, Tarjan and the bridge algorithm are all built on DFS |

## Common Pitfalls

- Mark a vertex as visited when you enqueue it in BFS, not when you dequeue it, or the same vertex enters the queue many times.
- DFS finds a path, not the shortest one.
- A search covers one component. For a disconnected graph, start a new search from each unvisited vertex.
- Recursive DFS can overflow the call stack on a deep graph, such as a path of a hundred thousand vertices. Use an explicit stack.
- Neither one is a weighted shortest-path algorithm.

## Related

- [Graphs](../../../Data_Structures/Non_Linear/Graph/): read first.
- [Queue](../../../Data_Structures/Linear/Queue/): read first, for BFS.
- [Stack Data Structure](../../../Data_Structures/Linear/Stack/): read first, for iterative DFS.
- [Shortest Path Algorithms](../Shortest_Path/): what to use once edges have weights.
- [Topological Sort](../Advanced_Graph/Topological_Sort/): built on the DFS finish order or on BFS with in-degrees.
- [Strongly Connected Components](../Advanced_Graph/Strongly_Connected_Components/): built on DFS.
- [Graph Traversal Problems](../../../Problem_Patterns/Graph_Traversal_Problems/): practice problems for both searches.
