# Union-Find Applications Pattern

A **Union-Find** (also known as Disjoint Set Union or DSU) is a data structure that efficiently manages a collection of disjoint sets. It supports two main operations: finding which set an element belongs to, and merging two sets together.

---

## Overview

Union-Find is fundamental for problems involving:
- Connectivity in graphs
- Cycle detection
- Component counting
- Dynamic connectivity
- Network problems

The data structure uses two optimizations:
1. **Path Compression**: Flattens the tree during find operations
2. **Union by Rank**: Always attaches smaller tree to larger tree root

These optimizations make operations nearly constant time: O(α(n)) where α is the inverse Ackermann function, which grows extremely slowly.

---

## Key Characteristics

1. **Efficient Operations**: O(α(n)) per operation (amortized)
2. **Path Compression**: Flattens tree structure for faster future finds
3. **Union by Rank**: Keeps trees balanced
4. **Dynamic**: Supports dynamic set operations

---

## Operations

| Operation | Description | Time Complexity |
|-----------|-------------|----------------|
| `find(x)` | Find root of element x | O(α(n)) |
| `union(x, y)` | Merge sets containing x and y | O(α(n)) |
| `connected(x, y)` | Check if x and y are in same set | O(α(n)) |
| `detect_cycle(edges, n)` | Detect cycle in undirected graph | O(E × α(n)) |
| `count_components(edges, n)` | Count connected components | O(E × α(n)) |

Where α(n) is the inverse Ackermann function (effectively constant).

---

## Implementation Approaches

### 1. Basic Union-Find
- **Pros**: Simple implementation
- **Cons**: No optimizations, slower
- **Use Case**: Learning purposes

### 2. Path Compression Only
- **Pros**: Faster finds
- **Cons**: Trees may become unbalanced
- **Use Case**: When finds are more frequent

### 3. Union by Rank Only
- **Pros**: Balanced trees
- **Cons**: No path compression benefit
- **Use Case**: When unions are more frequent

### 4. Both Optimizations (Recommended)
- **Pros**: Optimal performance, nearly constant time
- **Cons**: Slightly more complex
- **Use Case**: Production code, competitive programming

---

## Applications

1. **Cycle Detection**: Detect cycles in undirected graphs
2. **Connected Components**: Count or find connected components
3. **Kruskal's Algorithm**: Minimum spanning tree construction
4. **Network Connectivity**: Check if nodes are connected
5. **Dynamic Connectivity**: Handle dynamic graph operations
6. **Image Processing**: Connected component labeling

---

## Example Use Cases

### Basic Union-Find
```python
uf = UnionFind(5)
uf.union(0, 1)
uf.union(2, 3)
print(uf.connected(0, 1))  # True
print(uf.connected(0, 2))  # False
```

### Cycle Detection
```python
edges = [(0, 1), (1, 2), (2, 0)]
has_cycle = detect_cycle(edges, 3)  # Returns True
```

### Component Counting
```python
edges = [(0, 1), (2, 3), (4, 5)]
components = count_components(edges, 6)  # Returns 3
```

---

## Implementations

This folder contains implementations in three languages:

- **Python** (`Python/`) - List-based implementation
- **C++** (`C++/`) - Vector-based implementation
- **Go** (`Go/`) - Slice-based implementation

Each implementation includes:
- Complete source code
- Comprehensive test suite
- Detailed README with usage examples

---

## Complexity Summary

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| **Construction** | O(n) | O(n) |
| **Find** | O(α(n)) | O(1) |
| **Union** | O(α(n)) | O(1) |
| **Connected** | O(α(n)) | O(1) |
| **Cycle Detection** | O(E × α(n)) | O(n) |
| **Component Count** | O(E × α(n)) | O(n) |

Where α(n) is inverse Ackermann function (effectively constant for practical n).

---

## When to Use

- **Connectivity Problems**: Check if nodes are connected
- **Cycle Detection**: Detect cycles in undirected graphs
- **Component Counting**: Count connected components
- **Dynamic Graphs**: Handle dynamic connectivity
- **MST Algorithms**: Kruskal's algorithm for MST

---

## Related Patterns

- **Graph Traversal**: DFS/BFS for connectivity
- **Minimum Spanning Tree**: Kruskal's algorithm uses Union-Find
- **Connected Components**: Alternative to DFS for component finding

---

## Further Reading

- "Introduction to Algorithms" by CLRS
- "Algorithm Design Manual" by Steven Skiena
- "Competitive Programming" by Halim & Halim
- LeetCode problems: Number of Islands, Redundant Connection

---

**Note**: Union-Find with path compression and union by rank provides near-constant time operations. Always use both optimizations for optimal performance in competitive programming and production code.

---

_Last Updated: December 2025_
