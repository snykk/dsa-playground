# Directed & Undirected Graph

A **Graph** is a collection of vertices (nodes) connected by edges. Graphs can be classified based on the direction of their edges.

---

## Overview

### Directed Graph
- Edges have **direction** (A → B)
- Edge from A to B does not imply edge from B to A
- Example: Web links, dependencies, one-way streets

### Undirected Graph
- Edges are **bidirectional** (A ↔ B)
- Edge between A and B works both ways
- Example: Social networks, road networks (two-way), friendships

---

## Key Concepts

### Graph Properties
- **Vertices (Nodes)**: The fundamental units of a graph
- **Edges**: Connections between vertices
- **Degree**: Number of edges connected to a vertex
  - In directed graphs: in-degree + out-degree
  - In undirected graphs: just degree

### Graph Operations
- **Add Vertex**: O(1)
- **Add Edge**: O(1)
- **Remove Edge**: O(V)
- **Check Edge**: O(V)
- **Get Neighbors**: O(V)
- **BFS/DFS Traversal**: O(V + E)

---

## Visual Example

### Undirected Graph
```
    1 --- 2
    |     |
    4 --- 3
```

**Edges**: (1,2), (1,4), (2,3), (3,4), (2,1), (4,1), (3,2), (4,3)

### Directed Graph
```
    1 --> 2
    |     |
    v     v
    4 --> 3
```

**Edges**: (1,2), (1,4), (2,3), (4,3)

---

## Implementation Details

### Data Structure
- **Adjacency List**: `{vertex: [neighbors]}`
- Efficient for sparse graphs
- Space: O(V + E)

### Traversal Algorithms

#### BFS (Breadth-First Search)
- Uses queue
- Explores level by level
- Finds shortest path (unweighted graphs)

#### DFS (Depth-First Search)
- Uses stack (iterative) or recursion
- Explores as deep as possible
- Useful for cycle detection, topological sort

---

## Complexity Analysis

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| Add Vertex | O(1) | O(1) |
| Add Edge | O(1) | O(1) |
| Remove Edge | O(V) | O(1) |
| Check Edge | O(V) | O(1) |
| Get Neighbors | O(V) | O(V) |
| BFS | O(V + E) | O(V) |
| DFS | O(V + E) | O(V) |
| Check Connected | O(V + E) | O(V) |

---

## Usage Examples

### Python
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

### C++
```cpp
Graph undirected(false);
undirected.add_edge(1, 2);
undirected.add_edge(2, 3);

vector<int> bfs_result = undirected.bfs(1);
```

### Go
```go
undirectedGraph := NewGraph(false)
undirectedGraph.AddEdge(1, 2)
undirectedGraph.AddEdge(2, 3)

bfsResult := undirectedGraph.BFS(1)
```

---

## Applications

- **Social Networks**: Friend connections (undirected)
- **Web Crawling**: Page links (directed)
- **Dependency Resolution**: Package dependencies (directed)
- **Network Routing**: Internet routing (both)
- **Recommendation Systems**: User-item relationships
- **Compiler Design**: Control flow graphs

---

## When to Use

### Use Directed Graph when:
- Relationships are one-way (A follows B, but B may not follow A)
- Dependencies matter (A depends on B)
- Causality is important

### Use Undirected Graph when:
- Relationships are mutual (A is friends with B)
- Connections are symmetric
- Path direction doesn't matter

---

## Related Data Structures

- **Weighted Graph**: Graph with edge weights
- **Adjacency Matrix**: Alternative representation
- **Edge List**: Simple edge storage

