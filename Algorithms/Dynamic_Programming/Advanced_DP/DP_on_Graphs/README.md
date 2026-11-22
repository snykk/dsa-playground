# DP on Graphs

DP on graphs solves path problems on a directed acyclic graph (DAG) by computing, for each node, the best answer over its successors. The repository's `dag_longest_path` returns the longest path from a start node in O(V + E) time with a memoized DFS, and raises an error if a cycle is reachable.

## Intuition

In a DAG, following edges can never return to a node. A path starting at `v` is one edge to a successor `w` followed by a path starting at `w`, so the best path from `v` depends only on the best paths from its successors. Each node is solved once and reused by every parent; that sharing is the whole saving over trying all paths.

With a cycle this breaks: the best path from `v` would depend on itself, and a longest path is undefined. The code marks nodes that are in progress, and meeting one again means a cycle.

## Visual

```text
Successors:  0: 1 2 3    1: 2 4    2: 4 5    3: 5    4: 6    5: 6    6: -

dp[v] = edges on the longest path starting at v, filled sinks first:

   6:0 -> 4:1, 5:1 -> 2:2, 3:2 -> 1:3 -> 0:4

longest path from 0:  0 -> 1 -> 2 -> 4 -> 6   (4 edges)
```

## How It Works

1. `dp[v]` = number of nodes on the longest path that starts at `v` (the function returns `dp[start] - 1`, the number of edges).
2. If `v` is already finished, return its memo value.
3. If `v` is in progress, raise `ValueError`: the graph has a cycle.
4. Mark `v` in progress. For each successor `w` (none if `v` is not a key of the dictionary) take `max(dp[w])`.
5. Unmark `v`, store `dp[v] = best + 1` and return it.

## Step-by-Step Trace

Graph above, `dag_longest_path(graph, 0)`. Values complete in this order:

| Node | Successors | Computation | Value (edges) |
|------|------------|-------------|---------------|
| 6 | none | base case | 0 |
| 4 | 6 | 1 + 0 | 1 |
| 5 | 6 | 1 + 0 | 1 |
| 2 | 4, 5 | 1 + max(1, 1) | 2 |
| 1 | 2, 4 | 1 + max(2, 1) | 3 |
| 3 | 5 | 1 + 1 | 2 |
| 0 | 1, 2, 3 | 1 + max(3, 2, 2) | 4 |

The result is 4. For `{0: [1], 1: [2], 2: [0]}` the chain 0, 1, 2 meets 0 again while it is in progress and `ValueError` is raised.

## Complexity

| | Time | Space |
|---|------|-------|
| `dag_longest_path` | O(V + E) | O(V) |

Each reachable node is expanded once and each of its edges is read once. The memo, the in-progress set and the recursion stack hold at most one entry per reachable node. The recursion depth is at most the number of nodes on the longest path (exactly that on a chain), so a chain of more than about 1,000 nodes reaches Python's default recursion limit. Without the memo, the time is proportional to the number of paths, which can be exponential.

## When to Use

- Longest path, path counting or maximum-weight path on a DAG, and dependency problems such as the critical path of a project.
- Do not use it on graphs with cycles (longest path is NP-hard there), and do not use it for shortest paths with arbitrary cycles (use Dijkstra or Bellman-Ford).

## DAG DP vs. Alternatives

| Approach | Time | Notes |
|----------|------|-------|
| DAG DP | O(V + E) | needs no cycles |
| Dijkstra | O((V + E) log V) | shortest paths, non-negative weights |
| Bellman-Ford | O(V * E) | shortest paths, negative weights allowed |
| General longest path | NP-hard | no known polynomial algorithm |

## Common Pitfalls

- Tracking only a visited set: a back edge then looks like a finished node and the answer is silently wrong.
- Mixing up nodes and edges: `dp` counts nodes and the function subtracts 1.
- Assuming every node is a key: a missing key is treated as a node with no successors.
- Cycles that are not reachable from `start` are not reported.
- Edge weights are not supported: neighbours must be bare node ids.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python](Python/) | `graph_dp.py` | Complete `dag_longest_path` with cycle detection; 7 tests |
| C++ | [C++](C++/) | `graph_dp.cpp` | `dagLongestPath` on an `unordered_map<int, vector<int>>`; throws `std::invalid_argument` on a cycle; 9 tests |
| Go | [Go](Go/) | `main.go` | `DAGLongestPath` on a `map[int][]int`; returns `ErrCycle` on a cycle; 3 tests |

## Practice Problems

- [Longest Path (AtCoder DP G)](https://atcoder.jp/contests/dp/tasks/dp_g)
- [Game Routes (CSES 1681)](https://cses.fi/problemset/task/1681)
- [Longest Flight Route (CSES 1680)](https://cses.fi/problemset/task/1680)
- [Longest Increasing Path in a Matrix (LeetCode 329)](https://leetcode.com/problems/longest-increasing-path-in-a-matrix/)
- [Largest Color Value in a Directed Graph (LeetCode 1857)](https://leetcode.com/problems/largest-color-value-in-a-directed-graph/)

## Related

- [DP on Trees](../DP_on_Trees/)
- [Bitmask DP](../Bitmask_DP/)
- [Graph Traversal Problems](../../../../Problem_Patterns/Graph_Traversal_Problems/)
- [Shortest Path algorithms](../../../Graph_Algorithms/Shortest_Path/)
