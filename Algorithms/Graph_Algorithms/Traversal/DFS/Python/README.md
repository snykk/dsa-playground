# DFS -- Python Implementation

Depth-First Search over an adjacency list (`Dict[int, List[int]]`). Everything that is recursive in the textbook is simulated with an explicit stack, so deep graphs do not raise `RecursionError`.

## Files

| File | Contents |
|------|----------|
| `dfs.py` | the six DFS functions |
| `dfs_test.py` | 30 unit tests (`unittest`) |

## API

| Function | Returns |
|----------|---------|
| `dfs_adjacency_list(graph, start)` | vertices in DFS order (stack, marks on pop); `[]` if `start` is not a key |
| `dfs_recursive(graph, start)` | the same order as a textbook recursive DFS |
| `dfs_with_path(graph, start, target)` | the first path found in DFS order, or `None`; `[start]` when `start == target` |
| `dfs_connected_components(graph)` | components, each in DFS order; one visited set is shared |
| `dfs_detect_cycle(graph, directed=False)` | `True` if the graph has a cycle |
| `dfs_topological_sort(graph)` | a topological order, or `None` if there is a cycle |

All run in O(V + E) time. Space is O(V), except `dfs_adjacency_list` and `dfs_with_path`, whose stack can hold one entry per edge (O(V + E)).

```python
from dfs import dfs_adjacency_list, dfs_detect_cycle, dfs_topological_sort

g = {0: [1, 2], 1: [3], 2: [3], 3: [4], 4: [1]}
print(dfs_adjacency_list(g, 0))          # [0, 1, 3, 4, 2]
print(dfs_detect_cycle(g, directed=True))  # True
dag = {0: [1, 2], 1: [3], 2: [3], 3: [4], 4: []}
print(dfs_topological_sort(dag))         # [0, 2, 1, 3, 4]
```

## Python-Specific Notes

- Recursion is replaced by stacks of neighbor iterators, so a 100,000-vertex path works.
- A vertex that appears only in neighbor lists is handled with `graph.get(v, [])`.
- `dfs_with_path` records one parent per vertex and rebuilds the path once, so it is O(V + E).
- `dfs_detect_cycle` uses a parent for undirected graphs and a "current path" set for directed graphs.

## How to Run

```bash
cd Algorithms/Graph_Algorithms/Traversal/DFS/Python
python3 -m unittest dfs_test
```

## Key Takeaways

- Mark on pop for the stack version; push neighbors in reverse for left-to-right order.
- Undirected and directed cycle detection follow different rules.
- Explicit stacks remove the recursion limit.
