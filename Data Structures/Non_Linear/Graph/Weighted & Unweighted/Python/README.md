# Weighted & Unweighted Graph - Python

This folder contains a Python implementation of **Weighted Graph** that supports both weighted and unweighted edges.

A **Weighted Graph** is a graph where edges have associated weights (costs, distances, or values). An **Unweighted Graph** treats all edges as having equal weight (typically 1).

---

## Concept

- **Edge Weights**: Each edge can have a weight value
- **Unweighted Default**: Default weight is 1.0 for unweighted edges
- **Flexible**: Can mix weighted and unweighted operations
- **Adjacency List**: Uses adjacency list representation with weights

---

## Operations

| Operation | Description | Time Complexity |
| --------- | ----------- | --------------- |
| `add_vertex(vertex)` | Add a vertex to the graph | O(1) |
| `add_edge(from, to, weight)` | Add a weighted edge | O(1) |
| `remove_edge(from, to)` | Remove an edge | O(V) |
| `has_edge(from, to)` | Check if edge exists | O(V) |
| `get_weight(from, to)` | Get edge weight | O(V) |
| `get_neighbors(vertex)` | Get all neighbors | O(1) |
| `get_neighbors_with_weights(vertex)` | Get neighbors with weights | O(1) |
| `get_total_weight()` | Get sum of all edge weights | O(E) |
| `bfs(start)` | Breadth-First Search | O(V + E) |
| `dfs(start)` | Depth-First Search | O(V + E) |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| Add Edge | O(1) | O(1) |
| Get Weight | O(V) | O(1) |
| Update Weight | O(V) | O(1) |
| Get Neighbors | O(1) | O(degree) |
| BFS/DFS | O(V + E) | O(V) |
| Total Weight | O(E) | O(1) |

---

## Usage

```python
from weighted_graph import WeightedGraph

# Weighted undirected graph
graph = WeightedGraph(directed=False)
graph.add_edge(1, 2, weight=5.0)
graph.add_edge(2, 3, weight=3.0)
graph.add_edge(1, 4, weight=2.0)

print(graph.get_weight(1, 2))  # 5.0
print(graph.get_total_weight())  # 10.0

# Unweighted (default weight = 1.0)
graph.add_edge(4, 5)  # weight = 1.0
```

---

## Example: Weighted Graph

```python
graph = WeightedGraph(directed=False)

# Add weighted edges
graph.add_edge(0, 1, weight=5.0)
graph.add_edge(1, 2, weight=3.0)
graph.add_edge(0, 3, weight=2.0)

# Get neighbors with weights
neighbors = graph.get_neighbors_with_weights(0)
# [(1, 5.0), (3, 2.0)]

# Calculate total weight
total = graph.get_total_weight()  # 10.0
```

---

## Running Tests

```bash
# Run tests
python weighted_graph_test.py
```

---

## Notes

- Default weight is 1.0 for unweighted edges
- Supports both integer and floating-point weights
- Can update edge weight by re-adding edge with new weight
- For undirected graphs, both directions have same weight
- `get_total_weight()` counts each unique edge once

