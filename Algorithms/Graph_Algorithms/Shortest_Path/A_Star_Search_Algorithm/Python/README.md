# A* Search Algorithm -- Python Implementation

A* over an adjacency list `Dict[int, List[Tuple[int, int]]]` of `(neighbor, weight)` pairs, using `heapq`.

## Files

| File | Contents |
|------|----------|
| `astar.py` | `astar`, `manhattan_distance`, `euclidean_distance` |
| `astar_test.py` | 15 unit tests (`unittest`) |

## API

| Function | Returns |
|----------|---------|
| `astar(graph, start, goal, heuristic)` | `(cost, path)` or `None` if the goal is unreachable; `(0, [start])` when `start == goal` |
| `manhattan_distance(pos1, pos2)` | `int`, for grid coordinates |
| `euclidean_distance(pos1, pos2)` | `float`, for coordinates |

`heuristic` is a function of one vertex. The distance helpers take two coordinate pairs, so wrap them:

```python
from astar import astar, manhattan_distance

pos = {0: (0, 0), 1: (1, 0), 2: (0, 1), 3: (1, 1)}
graph = {0: [(1, 1), (2, 1)], 1: [(3, 1)], 2: [(3, 1)], 3: []}
goal = 3
cost, path = astar(graph, 0, goal, lambda v: manhattan_distance(pos[v], pos[goal]))
print(cost, path)  # 2 [0, 1, 3]
```

## Python-Specific Notes

- The heap holds tuples `(f, g, vertex, path)`, so ties in f are broken by smaller g, then by vertex.
- No closed set: a vertex is re-pushed whenever a cheaper g is found, and stale entries are skipped with `g_score > g_scores[current]`. The result is optimal for any admissible heuristic on non-negative weights.
- Every heap entry holds a copy of its path (O(path length) per push). A `came_from` map would avoid that.
- Time is O(b^d) in general and O((V + E) log V) for a consistent heuristic.

## How to Run

```bash
cd Algorithms/Graph_Algorithms/Shortest_Path/A_Star_Search_Algorithm/Python
python3 -m unittest astar_test
```

## Key Takeaways

- Admissible means never overestimating; that is what guarantees the optimum.
- The code re-opens vertices, so an inconsistent but admissible heuristic is still optimal.
- With `lambda v: 0` the function is Dijkstra's algorithm.
