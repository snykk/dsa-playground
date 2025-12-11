# Kruskal's Algorithm (Graph Algorithms)

**Kruskal's Algorithm** finds Minimum Spanning Tree (MST) by adding edges in increasing order of weight, using Union-Find to detect cycles.

---

## Overview

Kruskal's algorithm is a greedy algorithm that finds the minimum spanning tree of a connected, undirected graph. It works by:
1. Sorting all edges by weight
2. Adding edges in order (lightest first)
3. Skipping edges that would create cycles
4. Stopping when V-1 edges are added (MST complete)

**Key Insight**: Always add the minimum weight edge that doesn't create a cycle.

---

## Implementation

The complete implementation is available at:
**[Algorithms/Greedy/Minimum Spanning Tree/Kruskal's Algorithm](../../Greedy/Minimum%20Spanning%20Tree/Kruskal's%20Algorithm/)**

The implementation includes:
- Python, C++, and Go versions
- Union-Find data structure for cycle detection
- Comprehensive test suites
- Detailed documentation

---

## Complexity Analysis

| Complexity | Time | Space |
|------------|------|-------|
| **All Cases** | O(E log E) or O(E log V) | O(V) |

**Note**: 
- O(E log E) for sorting edges
- O(E log V) with path compression and union by rank
- O(V) for Union-Find structure

---

## Key Characteristics

- ✅ **Efficient**: O(E log E) time complexity
- ✅ **Simple**: Easy to understand and implement
- ✅ **Greedy**: Classic example of greedy algorithm
- ✅ **Optimal**: Guarantees minimum spanning tree
- ❌ **Requires sorting**: Must sort all edges first
- ❌ **Sparse graphs**: Works well for sparse graphs (E ≈ V)

---

## When to Use

- ✅ Sparse graphs (few edges)
- ✅ When all edges are known upfront
- ✅ When edge list representation is natural
- ❌ Dense graphs (Prim's may be better)
- ❌ When graph changes dynamically

---

## Related Algorithms

- **Prim's Algorithm**: Alternative MST algorithm
- **Union-Find**: Essential data structure for Kruskal's
- **Borůvka's Algorithm**: Another MST algorithm

---

## Applications

1. **Network Design**: Design networks with minimum cost
2. **Cluster Analysis**: Find clusters in data
3. **Image Segmentation**: Segment images into regions
4. **Circuit Design**: Design circuits with minimum wire

---

_See full implementation: [Algorithms/Greedy/Minimum Spanning Tree/Kruskal's Algorithm](../../Greedy/Minimum%20Spanning%20Tree/Kruskal's%20Algorithm/)_

---

_Last Updated: December 2025_


