# Prim's Algorithm (Go)

**Prim's Algorithm** finds Minimum Spanning Tree (MST) by growing the tree from a starting vertex, always adding the minimum weight edge that connects the current MST to a new vertex.

---

## Overview

Prim's algorithm is a greedy algorithm that finds MST by:
1. Starting with any vertex
2. Maintaining a set of vertices already in MST
3. At each step, adding the minimum weight edge connecting MST to a vertex outside MST
4. Repeating until all vertices are included

**Key Insight**: Always add the minimum weight edge connecting current MST to a new vertex.

---

## Algorithm

1. **Initialize**: Start with any vertex, add to MST
2. **Maintain priority queue**: Store edges from MST vertices to outside vertices
3. **Greedy selection**:
   - Extract minimum weight edge from queue
   - If edge connects to new vertex:
     - Add edge and vertex to MST
     - Add all edges from new vertex to queue
4. **Repeat**: Until all vertices in MST (V-1 edges added)

---

## Complexity Analysis

| Representation | Time | Space |
|----------------|------|-------|
| **Adjacency List + Heap** | O(E log V) | O(V) |
| **Adjacency Matrix + Array** | O(V²) | O(V) |

**Note**: 
- Binary heap gives O(E log V) - better for sparse graphs
- Array gives O(V²) - better for dense graphs

---

## Implementation Details

### Functions

1. **`PrimMST(graph, start)`**
   - Uses adjacency list representation
   - Implements with binary heap (priority queue)
   - Returns (mst_edges, total_weight)
   - Time: O(E log V), Space: O(V)
   - Best for sparse graphs

2. **`PrimMSTAdjacencyList(graph, start)`**
   - Alias for PrimMST
   - Convenient interface

### Data Structures

- **`Edge`**: Represents an edge with `To` and `Weight`
- **`PriorityQueue`**: Implements heap.Interface for min-heap

---

## Usage

```go
package main

import "fmt"

func main() {
    // Adjacency list representation
    graph := map[int][]Edge{
        0: {{1, 10}, {2, 6}, {3, 5}},
        1: {{0, 10}, {3, 15}},
        2: {{0, 6}, {3, 4}},
        3: {{0, 5}, {1, 15}, {2, 4}},
    }
    
    mst, weight := PrimMST(graph, 0)
    fmt.Printf("MST edges: %v\n", mst)  // [[0 3 5] [3 2 4] [0 1 10]]
    fmt.Printf("Total weight: %d\n", weight)  // 19
}
```

---

## Important Notes

1. **Starting vertex**: Can start from any vertex (MST is same)
2. **Priority queue**: Essential for O(E log V) complexity
3. **Visited tracking**: Must track which vertices are in MST
4. **Edge representation**: (from, to, weight) in MST result
5. **Heap implementation**: Uses container/heap package

---

## Advantages

1. ✅ **Optimal**: Guarantees minimum spanning tree
2. ✅ **Efficient**: O(E log V) with heap for sparse graphs
3. ✅ **Dense graphs**: O(V²) with array is good for dense graphs
4. ✅ **Flexible**: Works with different graph representations

---

## Disadvantages

1. ❌ **Starting vertex**: Requires choosing starting vertex
2. ❌ **Heap overhead**: Binary heap has constant factor overhead
3. ❌ **Dense graphs**: O(V²) may be slower than Kruskal's for very dense graphs

---

## When to Use

- ✅ Dense graphs (E ≈ V²)
- ✅ When adjacency list is natural representation
- ✅ When starting from specific vertex makes sense
- ❌ Very sparse graphs (Kruskal's may be simpler)
- ❌ When edge list is only representation

---

## Comparison with Kruskal's

| Aspect | Prim's | Kruskal's |
|--------|--------|-----------|
| **Graph Type** | Adjacency list/matrix | Edge list |
| **Best For** | Dense graphs | Sparse graphs |
| **Start** | Requires starting vertex | No starting vertex |
| **Data Structure** | Priority Queue | Union-Find + Sorting |

---

## Testing

Run the test suite:

```bash
go test -v
```

---

## Related Algorithms

- **Kruskal's Algorithm**: Alternative MST algorithm
- **Dijkstra's Algorithm**: Similar structure, different objective
- **Borůvka's Algorithm**: Another MST algorithm

---

## Applications

1. **Network Design**: Design networks with minimum cost
2. **Cluster Analysis**: Find clusters in data
3. **Approximation Algorithms**: Used as subroutine in other algorithms
4. **Image Processing**: Image segmentation

---

## References

- Prim, R. C. (1957). "Shortest connection networks and some generalizations"
- "Introduction to Algorithms" by CLRS (Chapter 23)
- "Algorithm Design Manual" by Steven Skiena

---

_Last Updated: December 2025_
