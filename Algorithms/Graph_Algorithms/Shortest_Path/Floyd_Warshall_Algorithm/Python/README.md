# Floyd-Warshall Algorithm -- Python Implementation

All-pairs shortest paths over an adjacency list `Dict[int, List[Tuple[int, int]]]`, with vertices numbered 0 to `num_vertices - 1`.

## Files

| File | Contents |
|------|----------|
| `floyd_warshall.py` | `floyd_warshall`, `floyd_warshall_path`, `reconstruct_path` |
| `floyd_warshall_test.py` | 16 unit tests (`unittest`) |

## API

| Function | Returns |
|----------|---------|
| `floyd_warshall(graph, num_vertices)` | matrix `dist[i][j]`, with `sys.maxsize` where j is unreachable from i, or `None` on a negative cycle |
| `floyd_warshall_path(graph, num_vertices)` | `(dist, next_vertex)` matrices, or `None` on a negative cycle |
| `reconstruct_path(next_vertex, start, end)` | the path as a list, or `None` if there is none |

Time O(V^3), space O(V^2).

```python
from floyd_warshall import floyd_warshall, floyd_warshall_path, reconstruct_path

g = {0: [(1, 3), (3, 7)], 1: [(0, 8), (2, -2)], 2: [(0, 5), (3, 1)], 3: [(0, 2)]}
print(floyd_warshall(g, 4)[1])          # [1, 0, -2, -1]
dist, nxt = floyd_warshall_path(g, 4)
print(reconstruct_path(nxt, 1, 3))      # [1, 2, 3]
```

## Python-Specific Notes

- "No path" is `sys.maxsize`, while Dijkstra and Bellman-Ford in this repository use `float('inf')`.
- Edge initialization uses `min`, so parallel edges keep the cheapest and a positive self-loop does not change the diagonal.
- The negative-cycle check runs once at the end. Python integers cannot overflow, so values that shrink during the rounds are harmless.
- `reconstruct_path` stops after V vertices instead of looping on corrupt next pointers.

## How to Run

```bash
cd Algorithms/Graph_Algorithms/Shortest_Path/Floyd_Warshall_Algorithm/Python
python3 -m unittest floyd_warshall_test
```

## Key Takeaways

- `k` is the outermost loop.
- Check the diagonal for negative cycles before using the matrix.
- Use `floyd_warshall_path` when you need the path itself.
