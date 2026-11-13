# Prim's Algorithm (C++)

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

1. **`primMST(graph, start)`**
   - Uses adjacency list representation
   - Implements with binary heap (priority queue)
   - Returns vector of tuples (from, to, weight) representing MST edges
   - Time: O(E log V), Space: O(V)
   - Best for sparse graphs

### Data Structures

- **`std::priority_queue`**: Min-heap for edge selection
- **`std::vector<std::vector<std::pair<int, int>>>`**: Adjacency list representation

---

## Usage

```cpp
#include <vector>
#include <queue>
#include <tuple>
#include "prim.cpp"

int main() {
    // Adjacency list: graph[vertex] = [(neighbor, weight), ...]
    std::vector<std::vector<std::pair<int, int>>> graph = {
        {{1, 10}, {2, 6}, {3, 5}},  // vertex 0
        {{0, 10}, {3, 15}},          // vertex 1
        {{0, 6}, {3, 4}},            // vertex 2
        {{0, 5}, {1, 15}, {2, 4}}    // vertex 3
    };
    
    auto mst = primMST(graph, 0);
    
    // Print MST edges
    for (const auto& edge : mst) {
        std::cout << "Edge: (" << std::get<0>(edge) << ", " 
                  << std::get<1>(edge) << ", " 
                  << std::get<2>(edge) << ")\n";
    }
    // Output:
    // Edge: (0, 3, 5)
    // Edge: (3, 2, 4)
    // Edge: (0, 1, 10)
    
    return 0;
}
```

---

## Important Notes

1. **Starting vertex**: Can start from any vertex (MST is same)
2. **Priority queue**: Essential for O(E log V) complexity
3. **Visited tracking**: Must track which vertices are in MST
4. **Edge representation**: (from, to, weight) in MST result
5. **Heap implementation**: Uses std::priority_queue with custom comparator

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

## Compilation

```bash
g++ -std=c++17 prim_test.cpp -o prim_test
./prim_test
```

---

## Testing

Run the test suite:

```bash
g++ -std=c++17 prim_test.cpp -o test && ./test
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
