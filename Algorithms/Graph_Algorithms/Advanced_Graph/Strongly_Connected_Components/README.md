# Strongly Connected Components

**Strongly Connected Components (SCCs)** are maximal sets of vertices in a directed graph where every vertex is reachable from every other vertex in the component.

---

## Overview

A strongly connected component is a maximal set of vertices in a directed graph such that for every pair of vertices u and v in the component, there is a path from u to v and from v to u.

**Key Insight**: In a strongly connected component, every vertex can reach every other vertex.

---

## Algorithms

### 1. Kosaraju's Algorithm
- **Time Complexity**: O(V + E)
- **Space Complexity**: O(V)
- **Approach**: Two DFS passes (original graph, then reversed graph)
- **Best For**: Intuitive understanding

### 2. Tarjan's Algorithm
- **Time Complexity**: O(V + E)
- **Space Complexity**: O(V)
- **Approach**: Single DFS pass with low-link values
- **Best For**: Efficiency (single pass)

---

## Comparison

| Aspect | Kosaraju's | Tarjan's |
|--------|------------|----------|
| **Passes** | 2 DFS passes | 1 DFS pass |
| **Graph Reversal** | Required | Not required |
| **Complexity** | O(V + E) | O(V + E) |
| **Intuition** | More intuitive | More complex |
| **Memory** | O(V) | O(V) |

---

## Key Characteristics

- ✅ **Directed graphs**: Only works on directed graphs
- ✅ **Cycle detection**: Can detect cycles
- ✅ **Condensation graph**: Can build DAG of SCCs
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

- **[Kosaraju's Algorithm](Kosarajus_Algorithm/)** - Two-pass algorithm
- **[Tarjan's Algorithm](Tarjans_Algorithm/)** - Single-pass algorithm

Each implementation includes:
- Python, C++, and Go versions
- Comprehensive test suites
- Detailed documentation

---

## Related Algorithms

- **Topological Sort**: Works on DAG (condensation graph of SCCs)
- **DFS**: Core traversal algorithm
- **Graph Reversal**: Used in Kosaraju's algorithm
- **[2-SAT Solver](../2_SAT/README.md)**: The flagship application of SCC — each 2-SAT clause becomes two implications, and satisfiability reduces to "does any variable share an SCC with its negation?" Linear-time SAT decision procedure built directly on top of this module.
- **[Tarjan's Bridges & Articulation Points](../Tarjan_Bridges_Articulation/README.md)**: The _undirected_-graph cousin — same `disc[]` / `low[]` timestamp machinery, different edge rules. Both descend from Tarjan's original DFS framework.

---

_Last Updated: December 2025_

