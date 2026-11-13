# Graph Traversal Problems

Graph traversal visits every vertex and edge of a graph once, using a queue (BFS), a stack (DFS) or an in-degree counter (Kahn's algorithm). It answers reachability, fewest-steps, connected-region and dependency-order questions in O(V + E).

## Intuition

Keep a frontier of nodes to visit and a visited set. Repeatedly take a node from the frontier and add its unvisited neighbours. A queue explores in rings of equal distance (BFS); a stack goes as deep as possible first (DFS). A grid is a graph too: each cell's neighbours are the adjacent cells.

Invariant for BFS: nodes leave the queue in non-decreasing distance order, so the first time a node is reached it is by a shortest path.

Signals: "fewest moves" with equal costs (BFS), "count the regions / islands" (flood fill), "valid order of tasks with prerequisites" (topological sort).

## Visual

```text
graph: 0-1, 0-2, 1-3, 2-3, 3-4        BFS from 0

        1                    layer 0:  0
      /   \                  layer 1:  1  2
    0       3 --- 4          layer 2:  3
      \   /                  layer 3:  4
        2

queue:  [0] -> [1,2] -> [2,3] -> [3] -> [4]     dist(4) = 3
```

## How It Works

1. Build the graph (adjacency list) or treat grid cells as nodes.
2. Put the start in the frontier and mark it visited.
3. Take a node out, handle it, and add every unvisited neighbour (marking it visited when it is added).
4. Stop at the target or when the frontier is empty.

Kahn's topological sort instead starts from all nodes with in-degree 0, removes one at a time and lowers the in-degree of its successors; nodes reaching 0 join the queue. If fewer than n nodes come out, the graph has a cycle.

Flood fill (`num_islands`) starts a DFS at every unvisited `'1'` and turns everything connected to it into `'0'`; each start is one island.

## Step-by-Step Trace

`bfs_shortest_path(graph, 0, 4)` on the graph above:

| Step | Pop | Push | Queue after |
|------|-----|------|-------------|
| 1 | (0, d0) | (1, d1), (2, d1) | 1, 2 |
| 2 | (1, d1) | (3, d2) | 2, 3 |
| 3 | (2, d1) | nothing: 3 is already visited | 3 |
| 4 | (3, d2) | (4, d3) | 4 |
| 5 | (4, d3) | target reached, return 3 | |

Topological sort of `1->0, 2->0, 3->1, 3->2`: in-degrees are `0:2, 1:1, 2:1, 3:0`. Output `[3, 1, 2, 0]`.

## Complexity

| Algorithm | Time | Space |
|-----------|------|-------|
| BFS / DFS | O(V + E) | O(V) |
| Flood fill on R by C grid | O(R * C) | O(R * C) stack or recursion |
| Kahn topological sort | O(V + E) | O(V + E) |

Each vertex is queued once and each adjacency list is read once.

## When to Use

Use BFS for fewest steps in an unweighted graph, flood fill for regions, Kahn for orderings and cycle checks. Do not use BFS when edges have different weights (use Dijkstra).

## Graph Traversal vs. Alternatives

| Need | Tool | Why |
|------|------|-----|
| Fewest edges | BFS | layers equal distances |
| Cheapest weighted path | Dijkstra | BFS ignores weights |
| Dynamic connectivity | Union-Find | no traversal per query |
| Dependency order | Kahn or DFS finishing order | linear time, detects cycles |

## Common Pitfalls

- Marking visited when popping, not when pushing, in BFS: nodes get queued many times.
- Requiring the target to be a key of the adjacency dict; sink nodes of a directed graph have no entry (fixed here).
- Recursive DFS on a long path or big grid exceeds Python's recursion limit. The Python code uses explicit stacks; the C++ flood fill still recurses.
- `num_islands` overwrites the grid with `'0'` in all languages; pass a copy.
- A topological sort shorter than n means a cycle; the functions return an empty list.
- C++ `topologicalSort` does not check that edge endpoints are below `n`.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python/](Python/) | `graph_traversal.py` | BFS, iterative DFS, flood fill, Kahn |
| C++ | [C++/](C++/) | `graph_traversal.cpp` | `GraphTraversal` static methods; BFS, flood fill, Kahn (no DFS function) |
| Go | [Go/](Go/) | `main.go` | `BFSShortestPath`, `NumIslands`, `TopologicalSort` (no DFS function) |

## Practice Problems

- LeetCode 200, Number of Islands
- LeetCode 733, Flood Fill
- LeetCode 994, Rotting Oranges
- LeetCode 127, Word Ladder
- LeetCode 207, Course Schedule
- LeetCode 210, Course Schedule II

## Related

- [BFS](../../Algorithms/Graph_Algorithms/Traversal/BFS/)
- [DFS](../../Algorithms/Graph_Algorithms/Traversal/DFS/)
- [Topological Sort](../../Algorithms/Graph_Algorithms/Advanced_Graph/Topological_Sort/)
- [Union-Find Applications](../Union_Find_Applications/)
