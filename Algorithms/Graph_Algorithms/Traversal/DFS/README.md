# DFS (Depth-First Search)

Depth-First Search follows one branch of a graph as deep as it can go, then backtracks and tries the next one. It runs in O(V + E) time, and the order in which it enters and leaves vertices powers cycle detection, topological sort and connected components.

## Intuition

Walk a maze with a ball of thread: go down a corridor until you hit a dead end or a place you have already been, then retrace your steps to the last junction that still has an unexplored corridor.

The invariant: the vertices that are entered but not yet finished always form one path from the start to the current vertex, which is the recursion stack. A vertex is finished only when everything reachable from it has been visited. So an edge that points back into the current path closes a cycle, and listing vertices by decreasing finish time gives a topological order.

## Visual

```text
Directed graph, start A (discovery/finish times):

   A 1/10 ---> B 2/7 ---> D 3/6 ---> E 4/5
     |           ^         ^           |
     |           |         |           |
     |           +---------|-----------+      E->B  back edge (cycle B-D-E)
     +-------> C 8/9 ------+                  C->D  cross edge
                                              A->B, B->D, D->E, A->C  tree edges
```

## How It Works

Recursive form:

1. Mark the vertex visited (discovery).
2. For each neighbor that is not visited, recurse into it (a tree edge).
3. When no neighbor is left, the vertex is finished: return to the caller.

Iterative form (`dfs_adjacency_list` and the other stack versions):

1. Push the start vertex.
2. Pop a vertex. If it is already visited, skip it. Otherwise mark it visited **now** and report it.
3. Push its unvisited neighbors in reverse order, so the first neighbor is popped first.

Marking a vertex when it is pushed is not DFS: on `0:[1,2], 1:[2,3]` it visits 0, 1, 3, 2 instead of 0, 1, 2, 3.

## Step-by-Step Trace

The graph above numbered A to E = 0 to 4 (`{0:[1,2], 1:[3], 2:[3], 3:[4], 4:[1]}`), iterative form, top of stack on the right:

| Pop | Action | Stack after |
|-----|--------|-------------|
| A | visit A, push C then B | C B |
| B | visit B, push D | C D |
| D | visit D, push E | C E |
| E | visit E; neighbor B is visited | C |
| C | visit C; neighbor D is visited | empty |

- Order: `[0, 1, 3, 4, 2]` (A, B, D, E, C)
- `dfs_detect_cycle(g, True)` is `True`: E->B is a back edge.
- Without E->B, `dfs_topological_sort` returns `[0, 2, 1, 3, 4]`.

## Complexity

| Quantity | Cost | Why |
|----------|------|-----|
| Time | O(V + E) | each vertex is entered once, each adjacency list is scanned once |
| Space, recursion | O(V) | one frame per vertex on the current path |
| Space, mark-on-pop stack | O(V + E) | a vertex can be pushed once per incoming edge (about 19,700 entries on a complete graph with 200 vertices) |

## When to Use

Use DFS for cycle detection, topological sorting, connected components, flood fill, backtracking, and as the base of strongly connected component and bridge algorithms.

Do not use it when you need the fewest edges between two vertices (use BFS) or least-weight paths (use Dijkstra's algorithm).

## DFS vs. Alternatives

| | DFS | BFS |
|--|-----|-----|
| Structure | stack or recursion | queue |
| Time | O(V + E) | O(V + E) |
| Fewest-edge path | No | Yes |
| Cycles, finish order | natural | only cycles and components |
| Memory on wide graphs | small | a whole ring |

## Common Pitfalls

- **Marking on push.** It changes the order. Mark on pop.
- **Deep recursion.** A path of 100,000 vertices overflows the stack in Python and C++. The Python and C++ code here uses an explicit stack; Go grows stacks on demand.
- **Two different cycle rules.** Undirected: a visited neighbor that is not the parent. Directed: a neighbor that is still on the current path (a finished vertex is not a cycle).
- **Sentinel parent.** A parent value such as -1 breaks when -1 is a real vertex; the code keeps a separate "has parent" flag.
- **Expecting shortest paths.** `dfs_with_path` returns the first path in DFS order.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `dfs.py` | six functions: traversal, recursive order, path, components, cycle, topological sort; recursion simulated with explicit stacks |
| C++ | [C++/](C++/) | `dfs.cpp` | three functions: traversal, path, cycle detection |
| Go | [Go/](Go/) | `main.go` | four functions: traversal, recursive traversal, path, cycle detection |

## Practice Problems

- [Number of Islands](https://leetcode.com/problems/number-of-islands/) (LeetCode)
- [Course Schedule](https://leetcode.com/problems/course-schedule/) (LeetCode, directed cycle)
- [Course Schedule II](https://leetcode.com/problems/course-schedule-ii/) (LeetCode, topological order)
- [Clone Graph](https://leetcode.com/problems/clone-graph/) (LeetCode)
- [Building Teams](https://cses.fi/problemset/task/1668) and [Round Trip](https://cses.fi/problemset/task/1669) (CSES)

## Related

- [BFS](../BFS/) - the queue-based counterpart
- [Topological Sort](../../Advanced_Graph/Topological_Sort/)
- [Tarjan's Algorithm](../../Advanced_Graph/Strongly_Connected_Components/Tarjan's_Algorithm/) - strongly connected components built on DFS
- [Stack](../../../../Data%20Structures/Linear/Stack/)
