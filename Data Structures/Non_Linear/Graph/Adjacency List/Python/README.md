# Adjacency List - Python

This folder contains a Python implementation of **Adjacency List** graph representation.

An **Adjacency List** is a collection of lists where each list represents the neighbors of a vertex. This is the most common and efficient representation for graphs.

---

## Concept

- **Dictionary of Lists**: Each vertex has a list of its neighbors
- **Unweighted**: List contains vertex IDs
- **Weighted**: List contains `(neighbor, weight)` tuples
- **Dynamic**: Can add vertices dynamically
- **Space Efficient**: O(V + E) - only stores existing edges

---

## Operations

| Operation | Description | Time Complexity |
| --------- | ----------- | --------------- |
| `add_vertex(vertex)` | Add a vertex to the graph | O(1) |
| `add_edge(from, to, weight)` | Add an edge between vertices | O(1) |
| `remove_edge(from, to)` | Remove an edge | O(V) |
| `has_edge(from, to)` | Check if edge exists | O(V) |
| `get_weight(from, to)` | Get edge weight | O(V) |
| `get_neighbors(vertex)` | Get all neighbors of a vertex | O(1) |
| `get_neighbors_with_weights(vertex)` | Get neighbors with weights | O(1) |
| `get_degree(vertex)` | Get degree of a vertex | O(V) |
| `bfs(start)` | Breadth-First Search traversal | O(V + E) |
| `dfs(start)` | Depth-First Search traversal | O(V + E) |
| `is_connected()` | Check if graph is connected | O(V + E) |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| Initialize | O(V) | O(V) |
| Add Edge | O(1) | O(1) |
| Remove Edge | O(V) | O(1) |
| Check Edge | O(V) | O(1) |
| Get Neighbors | O(1) | O(degree) |
| BFS/DFS | O(V + E) | O(V) |
| Space | O(V + E) | O(V + E) |

---

## Usage

```python
from adjacency_list import AdjacencyList

# Unweighted undirected graph
graph = AdjacencyList(directed=False, weighted=False)
graph.add_edge(1, 2)
graph.add_edge(2, 3)

print(graph.has_edge(1, 2))  # True
print(graph.get_neighbors(2))  # [1, 3]

# Weighted directed graph
weighted = AdjacencyList(directed=True, weighted=True)
weighted.add_edge(1, 2, weight=5.0)
weighted.add_edge(2, 3, weight=3.0)

print(weighted.get_weight(1, 2))  # 5.0
print(weighted.get_neighbors_with_weights(2))  # [(3, 3.0)]
```

---

## Example: Unweighted Undirected Graph

```python
graph = AdjacencyList(directed=False, weighted=False)

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

## Example: Weighted Directed Graph

```python
weighted = AdjacencyList(directed=True, weighted=True)

# Add weighted edges
weighted.add_edge(0, 1, weight=5.0)
weighted.add_edge(1, 2, weight=3.0)
weighted.add_edge(0, 3, weight=2.0)

# Adjacency List representation:
# 0: [(1, 5.0), (3, 2.0)]
# 1: [(2, 3.0)]
# 2: []
# 3: []

# Get neighbors with weights
neighbors = weighted.get_neighbors_with_weights(0)
# [(1, 5.0), (3, 2.0)]
```

---

## Running Tests

```bash
# Run tests
python adjacency_list_test.py
```

---

## When to Use

✅ **Use Adjacency List when:**
- Graph is **sparse** (few edges, E << V²)
- Need **frequent neighbor queries**
- **Memory is limited**
- **Dynamic graph** (adding/removing vertices)
- Most **real-world graphs**

❌ **Don't use when:**
- Graph is **very dense** (E ≈ V²)
- Need **very fast edge lookups**

---

## Notes

- Uses dictionary (`dict`) for adjacency list storage
- Supports dynamic vertex addition
- For weighted graphs, stores tuples `(neighbor, weight)`
- For unweighted graphs, stores vertex IDs directly
- BFS/DFS have optimal O(V + E) complexity

