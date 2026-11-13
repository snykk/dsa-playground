# BFS -- Python Implementation

Breadth-First Search over an adjacency list (`Dict[int, List[int]]`) with `collections.deque` as the queue.

## Files

| File | Contents |
|------|----------|
| `bfs.py` | the five BFS functions |
| `bfs_test.py` | 22 unit tests (`unittest`) |

## API

| Function | Returns |
|----------|---------|
| `bfs_adjacency_list(graph, start)` | vertices in BFS order; `[]` if `start` is not a key |
| `bfs_with_path(graph, start, target)` | a shortest path as a list, or `None`; `[start]` when `start == target` |
| `bfs_level_order(graph, start)` | a list of levels, each a list of vertices |
| `bfs_connected_components(graph)` | components of an undirected (symmetric) graph, each in BFS order |
| `bfs_shortest_distance(graph, start)` | `{vertex: hops}` for every reachable vertex |

All run in O(V + E) time and O(V) space. Example on `{1: [2, 4], 2: [3], 3: [], 4: []}`:

```python
from bfs import bfs_adjacency_list, bfs_with_path, bfs_level_order, bfs_shortest_distance

graph = {1: [2, 4], 2: [3], 3: [], 4: []}
print(bfs_adjacency_list(graph, 1))     # [1, 2, 4, 3]
print(bfs_with_path(graph, 1, 3))       # [1, 2, 3]
print(bfs_level_order(graph, 1))        # [[1], [2, 4], [3]]
print(bfs_shortest_distance(graph, 1))  # {1: 0, 2: 1, 4: 1, 3: 2}
```

## Python-Specific Notes

- `deque.popleft()` is O(1); `list.pop(0)` would be O(V).
- A vertex that appears only in neighbor lists is handled (`graph.get(v, [])`), so `bfs_with_path({0: [1]}, 0, 1)` returns `[0, 1]`.
- `bfs_with_path` keeps a `parent` dict and rebuilds the path once, so it stays O(V + E) on long paths.
- `bfs_connected_components` shares one visited set. It is meant for symmetric adjacency lists; on a directed graph it returns the vertices first reached from each unvisited key.

## How to Run

```bash
cd Algorithms/Graph_Algorithms/Traversal/BFS/Python
python3 -m unittest bfs_test
```

## Key Takeaways

- Mark a vertex visited when you enqueue it, not when you dequeue it.
- Use `deque` for the queue and a parent map for paths.
- BFS gives fewest edges, not least weight.
