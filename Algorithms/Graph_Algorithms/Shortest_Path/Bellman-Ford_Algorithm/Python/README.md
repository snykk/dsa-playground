# Bellman-Ford Algorithm -- Python Implementation

Bellman-Ford on an edge list of `(u, v, weight)` tuples, with vertices numbered 0 to `num_vertices - 1`.

## Files

| File | Contents |
|------|----------|
| `bellman_ford.py` | `bellman_ford` and `bellman_ford_with_path` |
| `bellman_ford_test.py` | 12 unit tests (`unittest`) |

## API

| Function | Returns |
|----------|---------|
| `bellman_ford(edges, num_vertices, start)` | `{vertex: distance}` with `float('inf')` for unreachable vertices, or `None` if a negative cycle is reachable from `start` |
| `bellman_ford_with_path(edges, num_vertices, start, target)` | `(distance, path)`, or `None` if `target` is unreachable or a negative cycle exists |

Both run in O(V * E) time and O(V) space.

```python
from bellman_ford import bellman_ford, bellman_ford_with_path

edges = [(3, 4, 1), (2, 3, 3), (1, 2, -2), (0, 2, 4), (0, 1, 5)]
print(bellman_ford(edges, 5, 0))                  # {0: 0, 1: 5, 2: 3, 3: 6, 4: 7}
print(bellman_ford_with_path(edges, 5, 0, 4))     # (7, [0, 1, 2, 3, 4])
print(bellman_ford(edges + [(4, 1, -3)], 5, 0))   # None (negative cycle)
```

## Python-Specific Notes

- Distances use `float('inf')`, so edges whose tail is unreached are skipped instead of overflowing.
- Endpoints are not validated: an endpoint outside the range raises `KeyError` when the edge is used.
- With `num_vertices` equal to 0 the result is `{start: 0}`, unlike C++ and Go, which return an empty map.
- `bellman_ford_with_path` cannot tell "unreachable" from "negative cycle": both are `None`.
- There is no early exit; all V - 1 rounds run.

## How to Run

```bash
cd Algorithms/Graph_Algorithms/Shortest_Path/Bellman-Ford_Algorithm/Python
python3 -m unittest bellman_ford_test
```

## Key Takeaways

- Negative weights are the reason to use Bellman-Ford; use arrows, never undirected negative edges.
- `None` means a reachable negative cycle.
- Cost is O(V * E) however the edges are ordered.
