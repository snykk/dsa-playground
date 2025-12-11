# Minimum Spanning Tree

**Minimum Spanning Tree (MST)** is a subset of edges that connects all vertices in a graph with minimum total weight.

---

## Overview

A Minimum Spanning Tree of a connected, undirected graph is a tree that:
- Connects all vertices
- Has minimum total edge weight
- Contains V-1 edges (where V is number of vertices)
- Has no cycles

---

## Algorithms

### Kruskal's Algorithm
- **Approach**: Add edges in increasing order of weight
- **Data Structure**: Union-Find for cycle detection
- **Time Complexity**: O(E log E) or O(E log V)
- **Best For**: Sparse graphs

### Prim's Algorithm
- **Approach**: Grow tree from starting vertex
- **Data Structure**: Priority queue
- **Time Complexity**: O((V + E) log V)
- **Best For**: Dense graphs

---

## Complexity Comparison

| Algorithm | Time Complexity | Space Complexity | Best For |
|-----------|----------------|------------------|----------|
| **Kruskal's** | O(E log E) | O(V) | Sparse graphs |
| **Prim's** | O((V + E) log V) | O(V) | Dense graphs |

---

## Implementation

Complete implementations are available in:
- **[Kruskal's Algorithm](./Kruskal's_Algorithm/)** - Links to [Greedy implementations](../../Greedy/Minimum%20Spanning%20Tree/Kruskal's%20Algorithm/)
- **[Prim's Algorithm](./Prim's_Algorithm/)** - Links to [Greedy implementations](../../Greedy/Minimum%20Spanning%20Tree/Prim's%20Algorithm/)

Both implementations include:
- Python, C++, and Go versions
- Comprehensive test suites
- Detailed documentation

---

## Key Characteristics

- ✅ **Optimal**: Both algorithms guarantee minimum spanning tree
- ✅ **Efficient**: Polynomial time complexity
- ✅ **Greedy**: Both use greedy approach
- ✅ **Versatile**: Works for any connected undirected graph

---

## When to Use

- ✅ Network design problems
- ✅ Cluster analysis
- ✅ Image segmentation
- ✅ Circuit design
- ✅ Finding minimum cost connections

---

## Related Algorithms

- **Shortest Path**: Dijkstra's, Bellman-Ford
- **Graph Traversal**: BFS, DFS
- **Union-Find**: Essential for Kruskal's

---

## Applications

1. **Network Design**: Design networks with minimum cost
2. **Cluster Analysis**: Find clusters in data
3. **Image Segmentation**: Segment images into regions
4. **Circuit Design**: Design circuits with minimum wire
5. **Approximation Algorithms**: Used in approximation algorithms

---

_Last Updated: December 2025_


