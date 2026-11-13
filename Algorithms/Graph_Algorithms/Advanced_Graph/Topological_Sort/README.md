# Topological Sort

A topological sort lists the vertices of a directed acyclic graph (DAG) so that for every edge `u -> v`, `u` comes before `v`. It exists exactly when the graph has no directed cycle, and both algorithms here (Kahn's and the DFS version) run in **O(V + E)**.

## Intuition

Think of tasks with prerequisites. A task with no unmet prerequisite can be done now; finishing it may free other tasks. Repeating this places everything, unless some tasks wait on each other in a loop, which is a cycle.

The DFS view: when a DFS finishes a vertex `u`, every vertex reachable from `u` has already finished (unless an edge closes a cycle). So the reverse of the finish order puts `u` before everything it points to.

## Visual

```text
        +--> 1 --+
   0 ---+        +--> 3 --> 4        edges: 0->1 0->2 1->3 2->3 3->4 5->4
        +--> 2 --+            ^
                              |
                         5 ---+

  in-degrees:  0:0  1:1  2:1  3:2  4:2  5:0
  Kahn order:  0 5 1 2 3 4        (one of 10 valid orders)
```

## How It Works

Kahn's algorithm (BFS style):

1. Compute the in-degree of every vertex, including vertices that appear only as neighbours.
2. Queue every vertex with in-degree 0.
3. Pop a vertex, append it to the order, and decrease the in-degree of each neighbour; queue neighbours that reach 0.
4. If fewer vertices were output than exist, the rest sit on or behind a cycle.

DFS version:

1. Run a DFS; append each vertex to a list when it finishes.
2. A neighbour that is on the current DFS path is a back edge, which means a cycle.
3. Reverse the list.

## Step-by-Step Trace

Kahn on `{0:[1,2], 1:[3], 2:[3], 3:[4], 5:[4]}`. Vertex 4 only appears as a neighbour.

| Step | Take | In-degrees reduced | Queue after | Order so far |
|------|------|--------------------|-------------|--------------|
| 1 | 0 | 1: 1 to 0, 2: 1 to 0 | 5, 1, 2 | 0 |
| 2 | 5 | 4: 2 to 1 | 1, 2 | 0, 5 |
| 3 | 1 | 3: 2 to 1 | 2 | 0, 5, 1 |
| 4 | 2 | 3: 1 to 0 | 3 | 0, 5, 1, 2 |
| 5 | 3 | 4: 1 to 0 | 4 | 0, 5, 1, 2, 3 |
| 6 | 4 | - | (empty) | 0, 5, 1, 2, 3, 4 |

`topological_sort_kahn` returns `[0, 5, 1, 2, 3, 4]` and `topological_sort_dfs` returns `[5, 0, 2, 1, 3, 4]`; both are valid. For `{1:[2,4], 2:[3]}` there are exactly three orders: `[1, 2, 3, 4]`, `[1, 2, 4, 3]` and `[1, 4, 2, 3]`.

## Complexity

| Algorithm | Time | Space |
|-----------|------|-------|
| Kahn | O(V + E) | O(V) |
| DFS finish order | O(V + E) | O(V) |
| All orders (Python, backtracking) | O(V! * E) | O(V) |
| Longest path in a DAG (Python) | O(V + E) | O(V) |

Each vertex is queued or finished once and each edge is looked at once. The order is unique exactly when the queue holds one vertex at every step of Kahn (consecutive vertices are linked by edges).

## When to Use

Use it when:

- tasks, courses, packages or build steps have prerequisites;
- you want DP on a DAG (longest or shortest path, counting paths) in one pass;
- you need to know whether a directed graph has a cycle.

Do not use it when:

- the graph has cycles you must keep: contract them first with SCC algorithms;
- the graph is undirected: ordering has no meaning there.

## Kahn vs. DFS

| | Kahn | DFS finish order |
|---|---|---|
| Builds the order | front to back | back to front, then reversed |
| Cycle detection | fewer vertices output than exist | back edge to the current path |
| Fits | "what can run now", layers | when a DFS is already running |
| Deep graphs | no recursion | needs an explicit stack (the Python version has one) |

## Common Pitfalls

1. **Counting only keys.** A vertex that appears only as a neighbour needs an in-degree and a place in the order; comparing with the number of keys makes a DAG look cyclic.
2. **Empty result in C++ and Go.** An empty list means an empty graph or a cycle. Use `isDAG` / `IsDAG`.
3. **Reversing the DFS finish order.** Without the reversal the list is a reverse topological order.
4. **Assuming a unique answer.** Check that every edge points forward instead of comparing with one list.
5. **Self-loops** are cycles: the in-degree can never reach 0.
6. **Longest path without a source.** `longest_path_dag(graph, weights)` starts a path at every vertex with no incoming edge; pass `source` to measure from one vertex only (unreachable vertices get `-inf`).

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `topological_sort.py` | Kahn, iterative DFS, all orders, `is_dag`, `longest_path_dag`; `None` on a cycle |
| C++ | [C++/](C++/) | `topological_sort.cpp` | Kahn and `isDAG`; empty vector on a cycle |
| Go | [Go/](Go/) | `main.go` | Kahn and `IsDAG`; empty slice on a cycle |

## Practice Problems

- [LeetCode 207. Course Schedule](https://leetcode.com/problems/course-schedule/): is there a cycle?
- [LeetCode 210. Course Schedule II](https://leetcode.com/problems/course-schedule-ii/): output an order.
- [LeetCode 269. Alien Dictionary](https://leetcode.com/problems/alien-dictionary/): build the graph from sorted words.
- [CSES 1679. Course Schedule](https://cses.fi/problemset/task/1679): output an order or report a cycle.
- [CSES 1681. Game Routes](https://cses.fi/problemset/task/1681): count paths in a DAG.

## Related

- [DFS](../../Traversal/DFS/README.md): the traversal behind the finish-order version
- [BFS](../../Traversal/BFS/README.md): the queue pattern behind Kahn
- [Strongly Connected Components](../Strongly_Connected_Components/README.md): contract cycles to get a DAG
- [2-SAT](../2-SAT/README.md): orders implication-graph components
