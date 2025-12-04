# Adjacency Matrix - Python

This folder contains a Python implementation of **Adjacency Matrix** graph representation.

An **Adjacency Matrix** is a 2D array representation of a graph where `matrix[i][j]` represents an edge from vertex `i` to vertex `j`.

---

## Concept

- **2D Array**: `V × V` matrix where V is the number of vertices
- **Unweighted**: Values are `0` (no edge) or `1` (edge exists)
- **Weighted**: Values are edge weights or `∞` (infinity) if no edge
- **Fast Lookups**: O(1) to check if edge exists
- **Space**: O(V²) - always uses V² space

---

## Operations

| Operation | Description | Time Complexity |
| --------- | ----------- | --------------- |
| `add_edge(from, to, weight)` | Add an edge between vertices | O(1) |
| `remove_edge(from, to)` | Remove an edge | O(1) |
| `has_edge(from, to)` | Check if edge exists | O(1) |
| `get_weight(from, to)` | Get edge weight | O(1) |
| `get_neighbors(vertex)` | Get all neighbors of a vertex | O(V) |
| `get_degree(vertex)` | Get degree of a vertex | O(V) |
| `bfs(start)` | Breadth-First Search traversal | O(V²) |
| `dfs(start)` | Depth-First Search traversal | O(V²) |
| `is_connected()` | Check if graph is connected | O(V²) |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| Initialize | O(V²) | O(V²) |
| Add Edge | O(1) | O(1) |
| Remove Edge | O(1) | O(1) |
| Check Edge | O(1) | O(1) |
| Get Neighbors | O(V) | O(V) |
| BFS/DFS | O(V²) | O(V) |
| Space | O(V²) | O(V²) |

---

## Usage

```python
from adjacency_matrix import AdjacencyMatrix

# Unweighted undirected graph
graph = AdjacencyMatrix(5, directed=False, weighted=False)
graph.add_edge(0, 1)
graph.add_edge(1, 2)

print(graph.has_edge(0, 1))  # True
print(graph.get_neighbors(1))  # [0, 2]

# Weighted directed graph
weighted = AdjacencyMatrix(5, directed=True, weighted=True)
weighted.add_edge(0, 1, weight=5.0)
weighted.add_edge(1, 2, weight=3.0)

print(weighted.get_weight(0, 1))  # 5.0
print(weighted.bfs(0))  # [0, 1, 2]
```

---

## Example: Unweighted Undirected Graph

```python
graph = AdjacencyMatrix(4, directed=False, weighted=False)

# Add edges
graph.add_edge(0, 1)
graph.add_edge(1, 2)
graph.add_edge(2, 3)
graph.add_edge(3, 0)

# Matrix representation:
#     0  1  2  3
#  0 [0  1  0  1]
#  1 [1  0  1  0]
#  2 [0  1  0  1]
#  3 [1  0  1  0]

# Traverse
bfs_result = graph.bfs(0)  # [0, 1, 3, 2]
dfs_result = graph.dfs(0)  # [0, 1, 2, 3]

# Check connectivity
print(graph.is_connected())  # True
```

---

## Example: Weighted Directed Graph

```python
weighted = AdjacencyMatrix(4, directed=True, weighted=True)

# Add weighted edges
weighted.add_edge(0, 1, weight=5.0)
weighted.add_edge(1, 2, weight=3.0)
weighted.add_edge(0, 3, weight=2.0)

# Get weight
print(weighted.get_weight(0, 1))  # 5.0
print(weighted.get_weight(1, 0))  # inf (no reverse edge)

# Get neighbors
print(weighted.get_neighbors(0))  # [1, 3]
```

---

## Running Tests

```bash
# Run tests
python adjacency_matrix_test.py
```

---

## When to Use

✅ **Use Adjacency Matrix when:**
- Graph is **dense** (many edges, E ≈ V²)
- Need **fast edge lookups** (O(1))
- **Fixed number of vertices** known in advance
- **Small to medium graphs** where space is not a concern

❌ **Don't use when:**
- Graph is **sparse** (few edges, E << V²)
- **Memory is limited**
- Number of vertices is **very large**

---

## Notes

- Matrix is initialized with `float('inf')` for weighted graphs (no edge)
- Diagonal is set to `0` (no self-loops by default)
- For undirected graphs, matrix is symmetric
- Vertices are 0-indexed
- BFS/DFS have O(V²) complexity due to neighbor lookup

