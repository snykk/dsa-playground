# Prim's Algorithm (Graph Algorithms)

**Prim's Algorithm** finds Minimum Spanning Tree (MST) by growing the tree from a starting vertex, always adding the minimum weight edge connecting the tree to a new vertex.

---

## Overview

Prim's algorithm is a greedy algorithm that finds the minimum spanning tree of a connected, undirected graph. It works by:
1. Start with any vertex
2. Maintain a set of vertices in MST
3. At each step, add minimum weight edge connecting MST to new vertex
4. Repeat until all vertices are in MST

**Key Insight**: Always add the minimum weight edge connecting the current MST to a new vertex.

---

## Implementation

The complete implementation is available at:
**[Algorithms/Greedy/Minimum Spanning Tree/Prim's Algorithm](../../Greedy/Minimum%20Spanning%20Tree/Prim's%20Algorithm/)**

The implementation includes:
- Python, C++, and Go versions
- Priority queue for efficient edge selection
- Comprehensive test suites
- Detailed documentation

---

## Complexity Analysis

| Complexity | Time | Space |
|------------|------|-------|
| **Binary Heap** | O((V + E) log V) | O(V) |
| **Fibonacci Heap** | O(E + V log V) | O(V) |

**Note**: 
- V = number of vertices
- E = number of edges
- Binary heap implementation shown

---

## Key Characteristics

- ✅ **Efficient**: O((V + E) log V) with binary heap
- ✅ **Dense graphs**: Works well for dense graphs
- ✅ **Greedy**: Classic example of greedy algorithm
- ✅ **Optimal**: Guarantees minimum spanning tree
- ❌ **Requires starting vertex**: Needs a starting vertex
- ❌ **Adjacency structure**: Works best with adjacency list/matrix

---

## When to Use

- ✅ Dense graphs (many edges)
- ✅ When adjacency list/matrix is natural
- ✅ When starting vertex is known
- ❌ Sparse graphs (Kruskal's may be better)
- ❌ When edge list representation is natural

---

## Related Algorithms

- **Kruskal's Algorithm**: Alternative MST algorithm
- **Dijkstra's**: Similar structure but for shortest paths
- **Borůvka's Algorithm**: Another MST algorithm

---

## Applications

1. **Network Design**: Design networks with minimum cost
2. **Cluster Analysis**: Find clusters in data
3. **Image Segmentation**: Segment images into regions
4. **Circuit Design**: Design circuits with minimum wire

---

_See full implementation: [Algorithms/Greedy/Minimum Spanning Tree/Prim's Algorithm](../../Greedy/Minimum%20Spanning%20Tree/Prim's%20Algorithm/)_

---

_Last Updated: December 2025_


