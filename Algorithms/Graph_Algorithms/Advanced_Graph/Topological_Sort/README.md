# Topological Sort

**Topological Sort** is a linear ordering of vertices in a directed acyclic graph (DAG) such that for every directed edge (u, v), vertex u comes before v in the ordering.

---

## Overview

Topological sort is used to find a valid ordering of tasks with dependencies. It only works on Directed Acyclic Graphs (DAGs) - graphs with no cycles. If a cycle exists, topological sort is impossible.

---

## Algorithms

### 1. Kahn's Algorithm (BFS-based)
- **Time Complexity**: O(V + E)
- **Space Complexity**: O(V)
- **Approach**: Use in-degrees and queue
- **Best For**: Most practical cases

### 2. DFS-based Algorithm
- **Time Complexity**: O(V + E)
- **Space Complexity**: O(V)
- **Approach**: DFS with recursion stack
- **Best For**: Memory-efficient implementations

---

## Key Characteristics

- ✅ **DAG only**: Works only on Directed Acyclic Graphs
- ✅ **Cycle detection**: Can detect cycles
- ✅ **Multiple orderings**: May have multiple valid orderings
- ✅ **Efficient**: O(V + E) time complexity

---

## Applications

1. **Task Scheduling**: Order tasks with dependencies
2. **Course Prerequisites**: Determine course order
3. **Build Systems**: Resolve build dependencies
4. **Package Managers**: Resolve package dependencies
5. **Event Ordering**: Order events in distributed systems

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

- **DFS**: Used in DFS-based topological sort
- **BFS**: Used in Kahn's algorithm
- **Cycle Detection**: Topological sort detects cycles
- **Longest Path**: Can use topological sort for DAG longest path

---

_Last Updated: December 2025_

