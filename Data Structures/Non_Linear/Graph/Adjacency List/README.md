# Adjacency List

An **Adjacency List** is a collection of lists where each list represents the neighbors of a vertex. This is the most common and efficient representation for graphs.

---

## Overview

### Structure
- **Array/Dictionary of Lists**: Each vertex has a list of its neighbors
- **Unweighted**: List contains vertex IDs
- **Weighted**: List contains `(neighbor, weight)` tuples
- **Dynamic**: Can add vertices dynamically

### Characteristics
- **Space Complexity**: O(V + E) - only stores existing edges
- **Edge Lookup**: O(V) - must search the list
- **Add Edge**: O(1) - append to list
- **Get Neighbors**: O(1) to get list, O(degree) to iterate

---

## Visual Example

### Unweighted Undirected Graph
```
Vertices: 0, 1, 2, 3

    0 --- 1
    |     |
    3 --- 2
```

**Adjacency List**:
```
0: [1, 3]
1: [0, 2]
2: [1, 3]
3: [0, 2]
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

**Adjacency List**:
```
0: [(1, 5), (3, 3)]
1: [(2, 2)]
2: []
3: [(2, 4)]
```

---

## Implementation Details

### Data Structure
```python
# Unweighted
adjacency_list = {
    0: [1, 3],
    1: [0, 2],
    2: [1, 3],
    3: [0, 2]
}

# Weighted
adjacency_list = {
    0: [(1, 5.0), (3, 3.0)],
    1: [(2, 2.0)],
    2: [],
    3: [(2, 4.0)]
}
```

### Edge Operations
- **Add Edge**: Append to list (O(1))
- **Remove Edge**: Search and remove (O(V))
- **Check Edge**: Linear search (O(V))
- **Get Neighbors**: Return list (O(1))

---

## Complexity Analysis

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

## Usage Examples

### Python
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

### C++
```cpp
AdjacencyList graph(false, false);
graph.add_edge(1, 2);
graph.add_edge(2, 3);

bool has_edge = graph.has_edge(1, 2);  // true
vector<int> neighbors = graph.get_neighbors(2);
```

### Go
```go
graph := NewAdjacencyList(false, true)
graph.AddEdge(1, 2, 5.0)
graph.AddEdge(2, 3, 3.0)

hasEdge := graph.HasEdge(1, 2)  // true
neighbors := graph.GetNeighbors(2)
```

---

## Advantages

✅ **Space Efficient**: O(V + E) space, only stores existing edges  
✅ **Fast Neighbor Queries**: O(1) to get neighbor list  
✅ **Good for Sparse Graphs**: Efficient when E << V²  
✅ **Dynamic**: Can add vertices dynamically  
✅ **Memory Efficient**: No wasted space  
✅ **Standard Representation**: Most common in practice  

---

## Disadvantages

❌ **Slow Edge Lookup**: O(V) to check if edge exists  
❌ **Slower for Dense Graphs**: Adjacency matrix may be better  
❌ **Cache Performance**: Less cache-friendly than matrix  

---

## When to Use

### Use Adjacency List when:
- Graph is **sparse** (few edges, E << V²)
- Need **frequent neighbor queries**
- **Memory is limited**
- **Dynamic graph** (adding/removing vertices)
- Most **real-world graphs** (social networks, web graphs)

### Don't use Adjacency List when:
- Graph is **very dense** (E ≈ V²)
- Need **very fast edge lookups**
- Performing **matrix operations**

---

## Applications

- **BFS/DFS**: Standard graph traversal
- **Dijkstra's Algorithm**: Shortest path finding
- **Social Networks**: Friend connections
- **Web Crawling**: Page links
- **Dependency Resolution**: Package dependencies
- **Network Routing**: Internet routing
- **Most Graph Algorithms**: Default choice

---

## Comparison with Other Representations

| Feature | Adjacency List | Adjacency Matrix | Edge List |
| ------- | -------------- | ---------------- | --------- |
| Space | O(V + E) | O(V²) | O(E) |
| Edge Lookup | O(V) | O(1) | O(E) |
| Get Neighbors | O(1) | O(V) | O(E) |
| Add Edge | O(1) | O(1) | O(1) |
| Remove Edge | O(V) | O(1) | O(E) |
| Best For | Sparse graphs | Dense graphs | Edge iteration |

---

## Optimization Tips

1. **Use Hash Set for Neighbors**: Faster edge lookup (O(1) average)
2. **Pre-allocate Lists**: If you know approximate degree
3. **Use Arrays for Fixed Vertices**: Better cache performance
4. **Sort Neighbors**: For deterministic traversal
5. **Use Separate Lists for In/Out**: For directed graphs

---

## Related Data Structures

- **Adjacency Matrix**: Better for dense graphs
- **Edge List**: Simpler but slower
- **Directed/Undirected Graph**: Graph direction
- **Weighted Graph**: Graph with weights

