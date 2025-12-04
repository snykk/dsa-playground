# Directed & Undirected Graph - Python

This folder contains a Python implementation of **Graph** that supports both directed and undirected graphs.

A **Graph** is a collection of vertices (nodes) connected by edges. Graphs can be classified based on the direction of their edges.

---

## Concept

- **Directed Graph**: Edges have direction (A → B)
- **Undirected Graph**: Edges are bidirectional (A ↔ B)
- **Adjacency List**: Uses dictionary of lists for storage
- **Dynamic**: Can add vertices dynamically

---

## Operations

| Operation | Description | Time Complexity |
| --------- | ----------- | --------------- |
| `add_vertex(vertex)` | Add a vertex to the graph | O(1) |
| `add_edge(from, to)` | Add an edge between vertices | O(1) |
| `remove_edge(from, to)` | Remove an edge | O(V) |
| `has_edge(from, to)` | Check if edge exists | O(V) |
| `get_neighbors(vertex)` | Get all neighbors of a vertex | O(1) |
| `get_edges()` | Get all edges in the graph | O(E) |
| `get_degree(vertex)` | Get degree of a vertex | O(V) |
| `bfs(start)` | Breadth-First Search traversal | O(V + E) |
| `dfs(start)` | Depth-First Search traversal | O(V + E) |
| `is_connected()` | Check if graph is connected | O(V + E) |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| Add Vertex | O(1) | O(1) |
| Add Edge | O(1) | O(1) |
| Remove Edge | O(V) | O(1) |
| Check Edge | O(V) | O(1) |
| Get Neighbors | O(1) | O(degree) |
| BFS/DFS | O(V + E) | O(V) |
| Check Connected | O(V + E) | O(V) |

---

## Usage

```python
from graph import Graph

# Undirected graph
undirected = Graph(directed=False)
undirected.add_edge(1, 2)
undirected.add_edge(2, 3)
undirected.add_edge(1, 4)

print(undirected.bfs(1))  # [1, 2, 4, 3]
print(undirected.has_edge(1, 2))  # True
print(undirected.has_edge(2, 1))  # True (bidirectional)

# Directed graph
directed = Graph(directed=True)
directed.add_edge(1, 2)
directed.add_edge(2, 3)

print(directed.has_edge(1, 2))  # True
print(directed.has_edge(2, 1))  # False (not bidirectional)
```

---

## Example: Undirected Graph

```python
graph = Graph(directed=False)

# Add edges
graph.add_edge(0, 1)
graph.add_edge(1, 2)
graph.add_edge(2, 3)
graph.add_edge(3, 0)

# Adjacency List representation:
# 0: [1, 3]
# 1: [0, 2]
# 2: [1, 3]
# 3: [0, 2]

# Traverse
bfs_result = graph.bfs(0)  # [0, 1, 3, 2]
dfs_result = graph.dfs(0)  # [0, 1, 2, 3]

# Check connectivity
print(graph.is_connected())  # True
```

---

## Running Tests

```bash
# Run tests
python graph_test.py
```

---

## Notes

- Uses dictionary (`dict`) for adjacency list storage
- For undirected graphs, edges are stored in both directions
- Supports dynamic vertex addition
- BFS/DFS have optimal O(V + E) complexity
- `is_connected()` only works for undirected graphs

