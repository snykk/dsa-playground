# Union-Find / Disjoint Set Union (DSU)

**Union-Find (Disjoint Set Union - DSU)** is a data structure that efficiently tracks disjoint sets and supports union and find operations. It's used in many graph algorithms like Kruskal's MST, cycle detection, and connected components.

---

## Overview

Union-Find maintains a collection of disjoint sets and supports:
- **Find**: Determine which set an element belongs to
- **Union**: Merge two sets into one
- **Connected**: Check if two elements are in the same set

**Key Optimizations**:
- **Path Compression**: Flattens tree during find operation
- **Union by Rank**: Always attaches smaller tree to larger tree

---

## Algorithm

### Find Operation (with Path Compression)

1. If `parent[x] != x`, recursively find root
2. Set `parent[x] = root` (path compression)
3. Return root

### Union Operation (with Union by Rank)

1. Find roots of both elements
2. If roots are same, return false (already connected)
3. Attach smaller rank tree to larger rank tree
4. If ranks equal, increment rank of new root
5. Decrement set count

---

## Complexity Analysis

| Operation | Time | Space |
|-----------|------|-------|
| **Find** | O(α(n)) amortized | O(1) |
| **Union** | O(α(n)) amortized | O(1) |
| **Connected** | O(α(n)) amortized | O(1) |
| **Initialization** | O(n) | O(n) |

Where:
- n = number of elements
- α(n) = inverse Ackermann function (practically constant, < 5 for n < 2^65536)

**Note**: With path compression and union by rank, operations are nearly constant time.

---

## Key Characteristics

- ✅ **Efficient**: Nearly constant time operations
- ✅ **Simple**: Easy to understand and implement
- ✅ **Versatile**: Used in many graph algorithms
- ✅ **Optimized**: Path compression and union by rank

---

## Applications

1. **Kruskal's MST**: Essential for MST algorithm
2. **Cycle Detection**: Detect cycles in undirected graphs
3. **Connected Components**: Find all connected components
4. **Network Connectivity**: Check if nodes are connected
5. **Image Segmentation**: Group pixels into regions
6. **Social Networks**: Find friend groups

---

## Implementations

Each algorithm is implemented in three languages:
- **Python** (`Python/`)
- **C++** (`C++/`)
- **Go** (`Go/`)

All implementations include:
- Complete source code
- Comprehensive test suites
- Detailed README documentation
- Usage examples

---

## Related Algorithms

- **Kruskal's Algorithm**: Uses Union-Find for MST
- **DFS/BFS**: Alternative for connected components
- **Path Compression**: Optimization technique
- **Union by Rank**: Optimization technique

---

_Last Updated: December 2025_

