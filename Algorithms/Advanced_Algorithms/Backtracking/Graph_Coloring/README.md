# Graph Coloring

Graph coloring assigns one of m colors to every vertex so that no edge joins two vertices of the same color. The backtracking solver in this folder colors vertices in index order, undoes a choice when a later vertex runs out of colors, and finds the chromatic number by trying m = 1, 2, 3, ...

## Intuition

Think of exam scheduling. Each exam is a vertex, and two exams are joined by an edge if some student takes both. Colors are time slots. A proper coloring is a timetable without clashes, and the chromatic number is the smallest number of slots you need.

Invariant: when the solver works on vertex `v`, vertices `0..v-1` already form a proper partial coloring. A color is committed only after `is_safe` confirms that no neighbor has it, so a complete assignment is always a proper coloring.

## Visual

```text
graph:  0-1, 0-2, 0-3, 1-2, 2-3          graph_coloring(graph, 3)

      1                                   vertex  color
     / \                                    0       1
    0---2                                   1       2
     \ /                                    2       3
      3                                     3       2   (not adjacent to 1)

m = 2: v0=1, v1=2, v2 has neighbors with colors 1 and 2 -> stuck, backtrack ...
       no 2-coloring exists, so chromatic_number(graph) = 3
```

## How It Works

1. Start at vertex 0 with every color set to 0 (uncolored).
2. For vertex `v`, try colors `1..m`. A color is safe if no neighbor of `v` has it (`is_safe` scans row `v` of the adjacency matrix).
3. On a safe color, set `color[v] = c` and solve vertex `v + 1`. If that succeeds, return success.
4. Otherwise reset `color[v] = 0` (backtrack) and try the next color. If no color works, return failure.
5. When `v == V`, every vertex is colored: success.
6. `chromatic_number` calls `graph_coloring(graph, m)` for `m = 1, 2, ..., V` and returns the first m that succeeds. This is correct because a coloring with m colors is also valid with m + 1 colors.

## Step-by-Step Trace

`graph_coloring(graph, 2)` on the graph above fails after 5 calls of the recursive helper:

| Step | Vertex | Colors tried | Outcome |
|------|--------|--------------|---------|
| 1 | 0 | 1 | safe, `color[0] = 1` |
| 2 | 1 | 1, 2 | 1 clashes with vertex 0, 2 is safe |
| 3 | 2 | 1, 2 | both clash (neighbors 0 and 1), fail |
| 4 | 1 | none left | fail, undo vertex 0 |
| 5 | 0 | 2 | safe, then the same failure repeats with the colors swapped |

With `m = 3` there is no backtracking and the result is `[1, 2, 3, 2]`.

## Complexity

| Operation | Time | Space |
|-----------|------|-------|
| `is_safe` | O(V) | O(1) |
| `graph_coloring(graph, m)` | O(V * m^V) worst case | O(V) |
| `chromatic_number` | O(V * V^V) worst case | O(V) |

The search tree has depth V and branching factor m, so at most about m^V leaves. Every node runs an O(V) safety scan. Space is the color array plus the recursion depth, both O(V), not counting the V x V input matrix. Deciding 3-colorability is NP-complete, so no polynomial bound is expected.

## When to Use

- Small constraint problems where "does m colors suffice?" needs an exact answer.
- Teaching the backtracking template: choose, check, recurse, undo.
- Not for large graphs. Use a greedy or DSatur heuristic when a good, not minimal, coloring is enough.

## Graph Coloring vs. Alternatives

| Approach | Result | Time |
|----------|--------|------|
| Backtracking (this folder) | exact | exponential |
| Greedy coloring (not implemented here) | at most max degree + 1 colors, not minimal | O(V + E) with adjacency lists |
| Bipartite check with BFS or DFS | decides m = 2 | O(V + E) |

## Common Pitfalls

- Forgetting `color[v] = 0` after a failed branch leaves a stale color that blocks later vertices.
- The matrix must be symmetric. A self-loop `graph[v][v] = 1` is not detected, because `color[v]` is still 0 when `v` is checked.
- 0 means "uncolored", so colors start at 1.
- `graph_coloring` returns some coloring with colors in `1..m`; only `chromatic_number` gives the minimum.
- Index order is a weak vertex order. Starting with high-degree vertices prunes much earlier.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python](Python/) | `graph_coloring.py` | returns a list or `None` |
| C++ | [C++](C++/) | `graph_coloring.cpp` | returns `std::optional<std::vector<int>>` |
| Go | [Go](Go/) | `main.go` | returns a slice or `nil` |

All three take an adjacency matrix. Greedy coloring and DSatur are not implemented.

## Practice Problems

- [Is Graph Bipartite? (LeetCode 785)](https://leetcode.com/problems/is-graph-bipartite/)
- [Possible Bipartition (LeetCode 886)](https://leetcode.com/problems/possible-bipartition/)

## Related

- [N-Queens Problem](../N_Queens_Problem/README.md)
- [Sudoku Solver](../Sudoku_Solver/README.md)
- [Rat in a Maze](../Rat_in_a_Maze/README.md)
- [DFS](../../../Graph_Algorithms/Traversal/DFS/README.md)
