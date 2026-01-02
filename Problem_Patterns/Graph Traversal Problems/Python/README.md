# Graph Traversal in Python

Implementation of graph traversal algorithms in Python3.

## Features

1.  **BFS**: Shortest path in unweighted graph.
2.  **DFS**: Recursive traversal.
3.  **Flood Fill**: Number of Islands problem.
4.  **Topological Sort**: Kahn's algorithm for dependency resolution.

## Usage

```python
from graph_traversal import bfs_shortest_path, num_islands

# BFS
graph = {0: [1, 2], 1: [3], 2: [3], 3: []}
dist = bfs_shortest_path(graph, 0, 3) # Output: 2

# Number of Islands
grid = [
    ["1","1","0"],
    ["0","0","1"]
]
count = num_islands(grid) # Output: 2
```

## Testing

Run the written unit tests:

```bash
python graph_traversal_test.py
```
