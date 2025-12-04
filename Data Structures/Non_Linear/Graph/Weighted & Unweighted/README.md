# Weighted & Unweighted Graph

A **Weighted Graph** is a graph where edges have associated weights (costs, distances, or values). An **Unweighted Graph** treats all edges as having equal weight (typically 1).

---

## Overview

### Weighted Graph
- Edges have **weights** (e.g., distance, cost, time)
- Useful for finding shortest paths, minimum spanning trees
- Example: Road networks with distances, network latency

### Unweighted Graph
- All edges have **equal weight** (default: 1)
- Simpler representation
- Example: Social networks, organizational charts

---

## Key Concepts

### Weight Properties
- **Edge Weight**: Value associated with an edge
- **Path Weight**: Sum of weights along a path
- **Shortest Path**: Path with minimum total weight

### Graph Operations
- **Add Edge with Weight**: O(1)
- **Get Edge Weight**: O(V)
- **Update Edge Weight**: O(V)
- **Total Graph Weight**: O(E)

---

## Visual Example

### Weighted Undirected Graph
```
        5
    1 ----- 2
    |       |
  3 |       | 2
    |       |
    4 ----- 3
        4
```

**Edges with weights**:
- (1, 2, 5)
- (1, 4, 3)
- (2, 3, 2)
- (3, 4, 4)

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

**Edges with weights**:
- (1, 2, 5)
- (1, 4, 3)
- (2, 3, 2)
- (4, 3, 4)

---

## Implementation Details

### Data Structure
- **Adjacency List**: `{vertex: [(neighbor, weight), ...]}`
- Stores both neighbor and weight together
- Space: O(V + E)

### Weight Handling
- **Default Weight**: 1.0 for unweighted edges
- **Weight Types**: Integer or floating-point
- **Negative Weights**: Supported (affects algorithm choice)

---

## Complexity Analysis

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| Add Edge | O(1) | O(1) |
| Get Weight | O(V) | O(1) |
| Update Weight | O(V) | O(1) |
| Get Neighbors | O(V) | O(V) |
| BFS/DFS | O(V + E) | O(V) |
| Total Weight | O(E) | O(1) |

---

## Usage Examples

### Python
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

### C++
```cpp
WeightedGraph graph(false);
graph.add_edge(1, 2, 5.0);
graph.add_edge(2, 3, 3.0);

double weight = graph.get_weight(1, 2);  // 5.0
```

### Go
```go
graph := NewWeightedGraph(false)
graph.AddEdge(1, 2, 5.0)
graph.AddEdge(2, 3, 3.0)

weight := graph.GetWeight(1, 2)  // 5.0
```

---

## Applications

- **Shortest Path**: Dijkstra's, Bellman-Ford algorithms
- **Minimum Spanning Tree**: Kruskal's, Prim's algorithms
- **Network Routing**: Finding optimal paths
- **Resource Allocation**: Cost optimization
- **Game Development**: Pathfinding with terrain costs
- **Transportation**: Route planning with distances/times

---

## When to Use

### Use Weighted Graph when:
- Edge costs matter (distance, time, money)
- Need to find optimal paths
- Comparing different routes
- Real-world applications with costs

### Use Unweighted Graph when:
- Only connectivity matters
- All connections are equal
- Simpler problem requirements
- Social network analysis (friendship strength not considered)

---

## Algorithm Considerations

### Weighted Graphs
- **Dijkstra's Algorithm**: Shortest path (non-negative weights)
- **Bellman-Ford**: Shortest path (allows negative weights)
- **Floyd-Warshall**: All-pairs shortest paths
- **Prim's/Kruskal's**: Minimum spanning tree

### Unweighted Graphs
- **BFS**: Shortest path (fewest edges)
- **DFS**: Cycle detection, connectivity
- **Union-Find**: Connected components

---

## Related Data Structures

- **Directed/Undirected Graph**: Graph direction
- **Edge List**: Alternative representation
- **Adjacency Matrix**: Dense graph representation

