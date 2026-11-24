# 0-1 BFS -- Python Implementation

Single-source shortest paths with weights 0 and 1, using `collections.deque`, plus the grid example of breaking walls. For the idea, the trace and the complexity, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `zero_one_bfs.py` | `zero_one_bfs`, `path_to`, `zero_one_bfs_with_path`, `grid_edges`, `min_wall_breaks` and a demo |
| `zero_one_bfs_test.py` | 35 unit tests: the worked example and its full deque trace, edge cases (one vertex, no edges, unreachable vertices, self-loops, a zero-weight cycle, parallel edges, ties), invalid input, 2140 random graphs against a Dijkstra reference, the invariant and the push and pop counts, and the grid, with 300 random grids against Dijkstra |

## API

- `zero_one_bfs(edges, num_vertices, start) -> (dist, parent)`: `edges` is any iterable of `(u, v, w)` with `0 <= u, v < num_vertices` and `w` equal to 0 or 1. `dist[v]` is the shortest distance from `start`, or -1 when `v` is unreachable; `parent[v]` is the vertex before `v` on that path, or -1 for `start` and unreachable vertices.
- `path_to(parent, start, target) -> list`: the path from `start` to `target` read back along `parent`; `[start]` when they are equal, `[]` when `target` is unreachable.
- `zero_one_bfs_with_path(edges, num_vertices, start, target) -> (distance, path)`: both at once, `(-1, [])` when there is no path.
- `grid_edges(grid) -> list`: the edges of a grid of `.` (road) and `#` (wall) strings; entering a wall costs 1, a road 0.
- `min_wall_breaks(grid, start, goal) -> int`: the fewest walls to break from `start` to `goal`, both `(row, col)`.

All of them raise `ValueError` on bad input: a negative vertex count, an endpoint out of range, a weight other than the integers 0 and 1, a start or target that is not a vertex, or a grid that is empty, ragged or has another character.

```python
from zero_one_bfs import zero_one_bfs, zero_one_bfs_with_path, min_wall_breaks

edges = [(0, 1, 1), (0, 2, 0), (2, 1, 0), (1, 3, 1), (2, 4, 1), (4, 3, 0), (4, 5, 1), (3, 5, 1), (6, 0, 1)]
print(zero_one_bfs(edges, 7, 0))               # ([0, 0, 0, 1, 1, 2, -1], [-1, 2, 0, 1, 2, 4, -1])
print(zero_one_bfs_with_path(edges, 7, 0, 5))  # (2, [0, 2, 4, 5])
print(min_wall_breaks(["...#.#.", "##.#.#.", "...#.#.", ".###.#.", ".....#."], (0, 0), (4, 6)))  # 1
```

## Python-Specific Notes

- **Entries are `(distance, vertex)` tuples.** `deque.appendleft` and `deque.append` push to the two ends and `popleft` takes the front, each in O(1). The distance in the entry is what the stale check `d > dist[u]` compares.
- **-1, not infinity.** Unreachable vertices get -1, as in C++ and Go, so all three return the same lists. The relaxation tests `dist[v] == -1` first.
- **Weights are checked strictly.** Only integers equal to 0 or 1 pass; `1.0`, `'1'` and `None` raise `ValueError`. `True` and `False` are integers in Python, so they pass and count as 1 and 0.
- **Helpers at module level.** `_adjacency` and `_search` are plain module functions, and `_search` looks `deque` up in the module when it runs. So the tests replace `_adjacency` to count reads of `adj` and the module's `deque` to record every push and pop, and the site's fixture generator records the deque the same way.

## How to Run

```bash
cd "Algorithms/Graph_Algorithms/Shortest_Path/0_1_BFS/Python"
python3 -m unittest zero_one_bfs_test
python3 zero_one_bfs.py   # demo: the worked example, two paths and the grid
```

## Key Takeaways

1. A deque with two kinds of push replaces the heap when every weight is 0 or 1.
2. A vertex can be pushed twice; the stale check keeps it from being processed twice.
3. `parent` holds a shortest-path tree; `path_to` reads one path out of it.
