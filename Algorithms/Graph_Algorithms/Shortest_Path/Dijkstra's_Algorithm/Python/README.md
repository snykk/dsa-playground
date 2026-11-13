# Dijkstra's Algorithm -- Python Implementation

Dijkstra's algorithm over an adjacency list `Dict[int, List[Tuple[int, int]]]` of `(neighbor, weight)` pairs, using `heapq`.

## Files

| File | Contents |
|------|----------|
| `dijkstra.py` | `dijkstra`, `dijkstra_with_path`, `dijkstra_all_pairs` |
| `dijkstra_test.py` | 14 unit tests (`unittest`) |

## API

| Function | Returns |
|----------|---------|
| `dijkstra(graph, start)` | `{vertex: distance}`; unreachable vertices are `float('inf')` |
| `dijkstra_with_path(graph, start, target)` | `(distance, path)`, or `None` if unreachable; `(0, [start])` when `start == target` |
| `dijkstra_all_pairs(graph)` | nested dict: `all_distances[source][target]` |

All use non-negative weights. `dijkstra` and `dijkstra_with_path` run in O((V + E) log V); `dijkstra_all_pairs` in O(V * (V + E) log V) time and O(V^2) space.

```python
from dijkstra import dijkstra, dijkstra_with_path

graph = {0: [(1, 4), (2, 2)], 1: [(3, 10)], 2: [(1, 5), (3, 11)], 3: []}
print(dijkstra(graph, 0))                # {0: 0, 1: 4, 2: 2, 3: 13}
print(dijkstra_with_path(graph, 0, 3))   # (13, [0, 2, 3])
```

## Python-Specific Notes

- Vertices are collected from the dict keys and from the neighbor lists, so a vertex that only appears as a neighbor works.
- `dijkstra({}, 1)` returns `{1: 0}`; the C++ and Go versions return an empty map for an empty graph.
- A settled vertex is skipped when it is popped again (a stale entry); there is no decrease-key.
- Negative weights are not detected: the result is silently wrong.

## How to Run

```bash
cd "Algorithms/Graph_Algorithms/Shortest_Path/Dijkstra's_Algorithm/Python"
python3 -m unittest dijkstra_test
```

## Key Takeaways

- Non-negative weights are a precondition, not something the code checks.
- Lazy deletion replaces decrease-key.
- Use `dijkstra_with_path` to stop early at one target.
