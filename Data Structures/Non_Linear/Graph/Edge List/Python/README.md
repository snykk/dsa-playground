# Edge List - Python

This folder contains a Python implementation of **Edge List** graph representation.

An **Edge List** is a simple way to represent a graph by storing all edges in a list. Each edge is represented as a tuple containing the source vertex, destination vertex, and optionally a weight.

---

## Concept

- **Simple List**: All edges stored in a single list
- **Unweighted**: Tuples are `(from_vertex, to_vertex)`
- **Weighted**: Tuples are `(from_vertex, to_vertex, weight)`
- **Space Efficient**: O(E) space - only stores edges
- **Easy to Understand**: Straightforward representation

---

## Operations

| Operation | Description | Time Complexity |
| --------- | ----------- | --------------- |
| `add_edge(from, to, weight)` | Add an edge to the graph | O(1) |
| `remove_edge(from, to)` | Remove an edge | O(E) |
| `has_edge(from, to)` | Check if edge exists | O(E) |
| `get_weight(from, to)` | Get edge weight | O(E) |
| `get_neighbors(vertex)` | Get all neighbors of a vertex | O(E) |
| `get_edge_count()` | Get number of edges | O(1) |
| `bfs(start)` | Breadth-First Search traversal | O(V + E) |
| `dfs(start)` | Depth-First Search traversal | O(V + E) |
| `to_adjacency_list()` | Convert to adjacency list | O(E) |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| Add Edge | O(1) | O(1) |
| Remove Edge | O(E) | O(1) |
| Check Edge | O(E) | O(1) |
| Get Neighbors | O(E) | O(V) |
| Get All Edges | O(1) | O(E) |
| BFS/DFS | O(V + E) | O(V) |
| Space | O(E) | O(E) |

---

## Usage

```python
from edge_list import EdgeList

# Unweighted undirected graph
graph = EdgeList(directed=False, weighted=False)
graph.add_edge(1, 2)
graph.add_edge(2, 3)

print(graph.has_edge(1, 2))  # True
print(graph.get_edge_count())  # 2

# Weighted directed graph
weighted = EdgeList(directed=True, weighted=True)
weighted.add_edge(1, 2, weight=5.0)
weighted.add_edge(2, 3, weight=3.0)

print(weighted.get_weight(1, 2))  # 5.0
print(weighted.get_edges())  # [(1, 2, 5.0), (2, 3, 3.0)]
```

---

## Example: Unweighted Undirected Graph

```python
graph = EdgeList(directed=False, weighted=False)

# Add edges
graph.add_edge(0, 1)
graph.add_edge(1, 2)
graph.add_edge(2, 3)

# Edge List representation:
# [(0, 1), (1, 0), (1, 2), (2, 1), (2, 3), (3, 2)]
# Note: For undirected, edges appear twice

print(graph.get_edge_count())  # 3 (unique edges)
print(graph.get_edges())  # All edges
```

---

## Running Tests

```bash
# Run tests
python edge_list_test.py
```

---

## When to Use

✅ **Use Edge List when:**
- Graph is **sparse** (few edges)
- Need to **iterate all edges** frequently
- **Simple operations** are sufficient
- **Memory is limited**
- Working with **edge-based algorithms** (Kruskal's MST)

❌ **Don't use when:**
- Need **fast edge lookups**
- Need **frequent neighbor queries**
- Graph is **dense** (many edges)

---

## Notes

- For undirected graphs, edges appear twice in the list
- `get_edge_count()` returns unique edge count (divides by 2 for undirected)
- Can convert to adjacency list using `to_adjacency_list()`
- Simple but slower for most operations compared to adjacency list

