# Kosaraju's Algorithm

**Kosaraju's Algorithm** finds all strongly connected components (SCCs) in a directed graph. A strongly connected component is a maximal set of vertices where every vertex is reachable from every other vertex in the component.

---

## Overview

Kosaraju's algorithm is one of the most intuitive algorithms for finding strongly connected components. It uses two DFS passes:
1. First DFS on original graph to determine finish times
2. Second DFS on reversed graph in order of decreasing finish times

---

## Algorithm

1. **First DFS**: Perform DFS on original graph, record finish times
2. **Reverse Graph**: Create transpose of graph (reverse all edges)
3. **Second DFS**: Perform DFS on reversed graph in reverse finish order
4. **Result**: Each DFS tree in second pass is one SCC

---

## Complexity Analysis

| Operation | Time | Space |
|-----------|------|-------|
| **Find All SCCs** | O(V + E) | O(V) |

Where:
- V = number of vertices
- E = number of edges

---

## Key Characteristics

- ✅ **Two DFS passes**: Requires two complete traversals
- ✅ **Graph reversal**: Must reverse graph for second pass
- ✅ **Intuitive**: Easy to understand algorithm
- ✅ **Efficient**: O(V + E) time complexity

---

## Applications

1. **Compiler Design**: Finding loops and dependencies
2. **Social Networks**: Finding communities
3. **Web Analysis**: Finding related web pages
4. **Circuit Design**: Finding feedback loops
5. **Graph Decomposition**: Breaking graph into components

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

- **Tarjan's Algorithm**: Alternative SCC algorithm (single pass)
- **DFS**: Used in both passes
- **Graph Reversal**: Transpose operation
- **Condensation Graph**: DAG of SCCs

---

_Last Updated: December 2025_

