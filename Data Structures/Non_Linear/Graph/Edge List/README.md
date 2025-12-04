# Edge List

An **Edge List** is a simple way to represent a graph by storing all edges in a list. Each edge is represented as a tuple containing the source vertex, destination vertex, and optionally a weight.

---

## Overview

### Edge List Representation
- **Simple Structure**: Just a list of edges
- **Space Efficient**: O(E) space
- **Easy to Understand**: Straightforward representation
- **Flexible**: Supports directed/undirected, weighted/unweighted

### Edge Format
- **Unweighted**: `(from_vertex, to_vertex)`
- **Weighted**: `(from_vertex, to_vertex, weight)`

---

## Key Concepts

### Edge Storage
- All edges stored in a single list
- For undirected graphs, edges may appear twice (bidirectional)
- Easy to iterate through all edges

### Operations
- **Add Edge**: O(1) - append to list
- **Remove Edge**: O(E) - search and remove
- **Check Edge**: O(E) - linear search
- **Get Neighbors**: O(E) - filter edges

---

## Visual Example

### Unweighted Undirected Graph
```
    1 --- 2
    |     |
    4 --- 3
```

**Edge List**:
```
[(1, 2), (2, 1), (1, 4), (4, 1), (2, 3), (3, 2), (3, 4), (4, 3)]
```

### Weighted Directed Graph
```
        5
    1 ----> 2
    |       |
  3 |       | 2
    v       v
    4 ----> 3
        4
```

**Edge List**:
```
[(1, 2, 5), (1, 4, 3), (2, 3, 2), (4, 3, 4)]
```

---

## Implementation Details

### Data Structure
```python
edges = [
    (1, 2, 5.0),    # weighted
    (2, 3, 3.0),    # weighted
    (1, 4)          # unweighted (default weight = 1.0)
]
```

### Edge Count
- **Directed**: Number of edges = list length
- **Undirected**: Number of unique edges = list length / 2

---

## Complexity Analysis

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| Add Edge | O(1) | O(1) |
| Remove Edge | O(E) | O(1) |
| Check Edge | O(E) | O(1) |
| Get Neighbors | O(E) | O(V) |
| Get All Edges | O(1) | O(E) |
| BFS/DFS | O(V + E) | O(V) |
| Convert to Adjacency List | O(E) | O(V + E) |

---

## Usage Examples

### Python
```python
from edge_list import EdgeList

# Unweighted undirected graph
graph = EdgeList(directed=False, weighted=False)
graph.add_edge(1, 2)
graph.add_edge(2, 3)

print(graph.get_edges())  # [(1, 2), (2, 1), (2, 3), (3, 2)]
print(graph.has_edge(1, 2))  # True

# Weighted directed graph
weighted = EdgeList(directed=True, weighted=True)
weighted.add_edge(1, 2, weight=5.0)
weighted.add_edge(2, 3, weight=3.0)

print(weighted.get_weight(1, 2))  # 5.0
print(weighted.get_edge_count())  # 2
```

### C++
```cpp
EdgeList graph(false, true);  // undirected, weighted
graph.add_edge(1, 2, 5.0);
graph.add_edge(2, 3, 3.0);

vector<tuple<int, int, double>> edges = graph.get_edges();
```

### Go
```go
graph := NewEdgeList(false, true)  // undirected, weighted
graph.AddEdge(1, 2, 5.0)
graph.AddEdge(2, 3, 3.0)

edges := graph.GetEdges()
```

---

## Advantages

✅ **Simple**: Easy to understand and implement  
✅ **Space Efficient**: Only stores edges (O(E))  
✅ **Easy Iteration**: Natural iteration over all edges  
✅ **Flexible**: Supports all graph types  
✅ **Good for Sparse Graphs**: Efficient when E << V²  

---

## Disadvantages

❌ **Slow Lookups**: O(E) to check if edge exists  
❌ **Inefficient Neighbors**: O(E) to get neighbors  
❌ **Not Good for Dense Graphs**: Better to use adjacency matrix  

---

## When to Use

### Use Edge List when:
- Graph is **sparse** (few edges)
- Need to **iterate all edges** frequently
- **Simple operations** are sufficient
- **Memory is limited**
- Working with **edge-based algorithms** (Kruskal's MST)

### Don't use Edge List when:
- Need **fast edge lookups**
- Need **frequent neighbor queries**
- Graph is **dense** (many edges)
- Need **efficient traversal**

---

## Conversion to Other Representations

### To Adjacency List
```python
adj_list = {}
for edge in edges:
    from_v, to_v = edge[0], edge[1]
    if from_v not in adj_list:
        adj_list[from_v] = []
    adj_list[from_v].append(to_v)
```

### To Adjacency Matrix
```python
matrix = [[0] * V for _ in range(V)]
for edge in edges:
    from_v, to_v = edge[0], edge[1]
    matrix[from_v][to_v] = 1  # or weight
```

---

## Applications

- **Kruskal's Algorithm**: MST construction (needs sorted edges)
- **Graph Input/Output**: Easy to read/write
- **Graph Algorithms**: That iterate over all edges
- **Sparse Graphs**: Social networks, web graphs
- **Graph Serialization**: Storing graphs in files

---

## Related Data Structures

- **Adjacency List**: Better for neighbor queries
- **Adjacency Matrix**: Better for dense graphs
- **Directed/Undirected Graph**: Graph direction
- **Weighted Graph**: Graph with weights

