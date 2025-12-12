# Tarjan's Algorithm

**Tarjan's Algorithm** finds all strongly connected components (SCCs) in a directed graph using a single DFS pass. It's more efficient than Kosaraju's in terms of number of passes.

---

## Overview

Tarjan's algorithm uses DFS with low-link values to identify strongly connected components in a single pass. It maintains a stack of vertices in the current DFS path and identifies SCC roots when low-link equals discovery time.

---

## Algorithm

1. **DFS with tracking**: Perform DFS, maintaining indices, low-link, and stack
2. **Update low-link**: Track earliest reachable vertex in same SCC
3. **Identify SCC root**: When low-link equals discovery time, found SCC root
4. **Pop stack**: All vertices popped until root form one SCC

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

- ✅ **Single pass**: Only one DFS pass needed
- ✅ **No graph reversal**: Doesn't need to reverse graph
- ✅ **Efficient**: O(V + E) time complexity
- ✅ **Low-link concept**: Uses low-link values for identification

---

## Applications

1. **Compiler Design**: Finding loops and dependencies
2. **Social Networks**: Finding communities
3. **Web Analysis**: Finding related web pages
4. **Network Analysis**: Finding critical edges and vertices
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

## Comparison: Tarjan vs Kosaraju

| Aspect | Tarjan's | Kosaraju's |
|--------|----------|------------|
| **Passes** | 1 DFS pass | 2 DFS passes |
| **Graph Reversal** | Not required | Required |
| **Complexity** | O(V + E) | O(V + E) |
| **Intuition** | More complex | More intuitive |

---

## Related Algorithms

- **Kosaraju's Algorithm**: Alternative SCC algorithm (two passes)
- **DFS**: Core traversal algorithm
- **Low-link values**: Key concept for SCC identification

---

_Last Updated: December 2025_

