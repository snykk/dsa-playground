# Adjacency Matrix

An **Adjacency Matrix** is a 2D array representation of a graph where `matrix[i][j]` represents an edge from vertex `i` to vertex `j`.

---

## Overview

### Structure
- **2D Array**: `V × V` matrix where V is the number of vertices
- **Unweighted**: Values are `0` (no edge) or `1` (edge exists)
- **Weighted**: Values are edge weights or `∞` (infinity) if no edge
- **Diagonal**: Usually `0` (no self-loops) or edge weight if self-loop exists

### Characteristics
- **Space Complexity**: O(V²) - always uses V² space
- **Edge Lookup**: O(1) - constant time
- **Add/Remove Edge**: O(1) - constant time
- **Get Neighbors**: O(V) - must scan entire row

---

## Visual Example

### Unweighted Undirected Graph
```
Vertices: 0, 1, 2, 3

    0 --- 1
    |     |
    3 --- 2
```

**Adjacency Matrix**:
```
    0  1  2  3
0 [ 0  1  0  1 ]
1 [ 1  0  1  0 ]
2 [ 0  1  0  1 ]
3 [ 1  0  1  0 ]
```

### Weighted Directed Graph
```
        5
    0 ----> 1
    |       |
  3 |       | 2
    v       v
    3 ----> 2
        4
```

**Adjacency Matrix**:
```
    0    1    2    3
0 [ 0    5   ∞   3  ]
1 [ ∞    0   2   ∞  ]
2 [ ∞   ∞    0   ∞  ]
3 [ ∞   ∞    4   0  ]
```

---

## Implementation Details

### Matrix Initialization
- **Unweighted**: Initialize all to `0`
- **Weighted**: Initialize all to `∞` (infinity), diagonal to `0`

### Edge Operations
- **Add Edge**: `matrix[i][j] = weight` (or `1` for unweighted)
- **Remove Edge**: `matrix[i][j] = 0` (or `∞` for weighted)
- **Check Edge**: Check if `matrix[i][j] != 0` (or `!= ∞`)

### Undirected Graphs
- For undirected graphs, set both `matrix[i][j]` and `matrix[j][i]`
- Matrix is symmetric for undirected graphs

---

## Complexity Analysis

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

## Usage Examples

### Python
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
```

### C++
```cpp
AdjacencyMatrix graph(5, false, false);
graph.add_edge(0, 1);
graph.add_edge(1, 2);

bool has_edge = graph.has_edge(0, 1);  // true
vector<int> neighbors = graph.get_neighbors(1);
```

### Go
```go
graph := NewAdjacencyMatrix(5, false, false)
graph.AddEdge(0, 1, 1.0)
graph.AddEdge(1, 2, 1.0)

hasEdge := graph.HasEdge(0, 1)  // true
neighbors := graph.GetNeighbors(1)
```

---

## Advantages

✅ **Fast Edge Lookup**: O(1) to check if edge exists  
✅ **Simple Implementation**: Easy to understand and implement  
✅ **Good for Dense Graphs**: Efficient when E ≈ V²  
✅ **Matrix Operations**: Can use matrix multiplication for path finding  
✅ **Easy to Visualize**: Matrix representation is intuitive  

---

## Disadvantages

❌ **Space Inefficient**: O(V²) space even for sparse graphs  
❌ **Slow Neighbor Queries**: O(V) to get all neighbors  
❌ **Fixed Size**: Must know number of vertices beforehand  
❌ **Wasteful for Sparse Graphs**: Most entries are 0 or ∞  

---

## When to Use

### Use Adjacency Matrix when:
- Graph is **dense** (many edges, E ≈ V²)
- Need **fast edge lookups** (O(1))
- **Fixed number of vertices** known in advance
- Need to perform **matrix operations**
- **Small graphs** where space is not a concern

### Don't use Adjacency Matrix when:
- Graph is **sparse** (few edges, E << V²)
- **Memory is limited**
- Number of vertices is **very large**
- Need **frequent neighbor queries**

---

## Applications

- **Floyd-Warshall Algorithm**: All-pairs shortest paths
- **Transitive Closure**: Finding reachability
- **Graph Isomorphism**: Comparing graph structures
- **Network Analysis**: Small to medium networks
- **Game Development**: Small game maps/grids
- **Social Networks**: Small networks with many connections

---

## Comparison with Other Representations

| Feature | Adjacency Matrix | Adjacency List | Edge List |
| ------- | ---------------- | -------------- | --------- |
| Space | O(V²) | O(V + E) | O(E) |
| Edge Lookup | O(1) | O(V) | O(E) |
| Get Neighbors | O(V) | O(1) | O(E) |
| Add Edge | O(1) | O(1) | O(1) |
| Remove Edge | O(1) | O(V) | O(E) |
| Best For | Dense graphs | Sparse graphs | Edge iteration |

---

## Related Data Structures

- **Adjacency List**: Better for sparse graphs
- **Edge List**: Simpler but slower lookups
- **Directed/Undirected Graph**: Graph direction
- **Weighted Graph**: Graph with weights

