# DP on Graphs -- Python Implementation

Longest path in a directed acyclic graph using a memoized DFS, with cycle detection.

## Files

| File | Description |
|------|-------------|
| `graph_dp.py` | `dag_longest_path` |
| `graph_dp_test.py` | `unittest` tests (7) |

## API

- `dag_longest_path(graph, start)`: `graph` maps a node to a list of successor nodes. Returns the number of edges on the longest path starting at `start`. A node without an entry in `graph` has no successors. Raises `ValueError` if a cycle (including a self-loop) is reachable from `start`. Time O(V + E), space O(V).

```python
from graph_dp import dag_longest_path

graph = {0: [1, 2], 1: [3], 2: [3], 3: []}
print(dag_longest_path(graph, 0))   # 2  (0 -> 1 -> 3 or 0 -> 2 -> 3)
```

## Python-Specific Notes

- The recursion depth is at most the number of nodes on the longest path (exactly that on a chain), so a chain of more than about 1,000 nodes needs `sys.setrecursionlimit` or an iterative rewrite.
- Nodes may be any hashable value, not only integers.
- Edge weights are not supported: successors must be plain node ids.
- Only the part of the graph reachable from `start` is examined.

## How to Run

From this folder:

```bash
python3 -m unittest graph_dp_test
```

## Key Takeaways

- Memoization makes each node and edge cost O(1) work overall.
- An in-progress set distinguishes a cycle from a harmless shared descendant.
- The result counts edges: `dp` counts nodes and the function subtracts 1.
