# Graph Traversal Problems -- Python Implementation

BFS, DFS, flood fill and Kahn's topological sort. See the [topic README](../README.md) for the ideas.

## Files

| File | Contents |
|------|----------|
| `graph_traversal.py` | The four algorithms and a demo `main` |
| `graph_traversal_test.py` | Unit tests, including sink nodes and deep inputs |

## API

- `bfs_shortest_path(graph, start, target)`: edges on a shortest path, 0 if equal, -1 if `start` is missing or the target is unreachable. The target need not be a key of `graph`.
- `get_dfs_traversal(graph, start)`: preorder list using an explicit stack; neighbours in list order. Empty list if `start` is missing.
- `dfs_recursive(graph, node, visited, result)`: the recursive helper; limited by Python's recursion depth.
- `num_islands(grid)`: connected `'1'` regions (4-neighbour); modifies `grid`.
- `topological_sort(n, edges)`: Kahn's order for nodes `0..n-1` and edges `[u, v]`; empty list on a cycle or `n <= 0`.

## Python-Specific Notes

- The graph is a `dict` from node to neighbour list.
- DFS and flood fill avoid recursion, so 1,500-node paths and 60 by 60 grids work.
- `num_islands` writes `'0'` into the grid; call it on a copy such as `[row[:] for row in grid]`.

## How to Run

```bash
python3 -m unittest graph_traversal_test
python3 graph_traversal.py
```

## Key Takeaways

- Use a deque for BFS and a list as a stack for DFS.
- Mark nodes visited when they enter the frontier.
- An empty topological order means a cycle.
