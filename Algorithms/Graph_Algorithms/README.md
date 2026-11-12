# Graph Algorithms

A comprehensive collection of **Graph Algorithms** implementations, including traversal, shortest path, and minimum spanning tree algorithms.

---

## Overview

This folder contains implementations of fundamental graph algorithms in Python, C++, and Go. Each algorithm includes:
- Complete implementation
- Comprehensive test suites
- Detailed documentation
- Complexity analysis

---

## Categories

### 🔹 Traversal Algorithms

- **[BFS (Breadth-First Search)](./Traversal/BFS/)**
  - Level-order traversal
  - Shortest path in unweighted graphs
  - Time: O(V + E), Space: O(V)

- **[DFS (Depth-First Search)](./Traversal/DFS/)**
  - Depth-first traversal
  - Path finding, cycle detection
  - Time: O(V + E), Space: O(V)

---

### 🔹 Shortest Path Algorithms

- **[Dijkstra's Algorithm](Shortest_Path/Dijkstras_Algorithm/)**
  - Single-source shortest path
  - Non-negative edge weights
  - Time: O((V + E) log V), Space: O(V)

- **[Bellman-Ford Algorithm](Shortest_Path/Bellman_Ford_Algorithm/)**
  - Single-source shortest path
  - Works with negative weights
  - Detects negative cycles
  - Time: O(V * E), Space: O(V)

- **[Floyd-Warshall Algorithm](Shortest_Path/Floyd_Warshall_Algorithm/)**
  - All pairs shortest paths
  - Works with negative weights
  - Time: O(V³), Space: O(V²)

- **[A* Search Algorithm](./Shortest_Path/A_Star_Search_Algorithm/)**
  - Informed search with heuristics
  - Optimal pathfinding
  - Time: O(b^d), Space: O(b^d)

---

### 🔹 Minimum Spanning Tree Algorithms

- **[Kruskal's Algorithm](Minimum_Spanning_Tree/Kruskals_Algorithm/)**
  - Edge-based approach
  - Best for sparse graphs
  - Time: O(E log E), Space: O(V)
  - _See full implementation: [Greedy Algorithms](Minimum_Spanning_Tree/)_

- **[Prim's Algorithm](Minimum_Spanning_Tree/Prims_Algorithm/)**
  - Vertex-based approach
  - Best for dense graphs
  - Time: O((V + E) log V), Space: O(V)
  - _See full implementation: [Greedy Algorithms](Minimum_Spanning_Tree/)_

---

### 🔹 Advanced Graph Algorithms

- **[Topological Sort](./Advanced_Graph/Topological_Sort/)**
  - Linear ordering of vertices in DAG
  - Task scheduling, dependency resolution
  - Time: O(V + E), Space: O(V)

- **[Strongly Connected Components](./Advanced_Graph/Strongly_Connected_Components/)**
  - **[Kosaraju's Algorithm](Advanced_Graph/Strongly_Connected_Components/Kosarajus_Algorithm/)**
    - Two DFS passes
    - Intuitive approach
    - Time: O(V + E), Space: O(V)
  - **[Tarjan's Algorithm](Advanced_Graph/Strongly_Connected_Components/Tarjans_Algorithm/)**
    - Single DFS pass
    - More efficient
    - Time: O(V + E), Space: O(V)

- **[Union-Find / DSU](Advanced_Graph/Union_Find_DSU/)**
  - Disjoint set operations
  - Cycle detection, MST
  - Time: O(α(n)) per operation, Space: O(n)

- **[Network Flow](./Advanced_Graph/Network_Flow/)**
  - **[Ford-Fulkerson](Advanced_Graph/Network_Flow/Ford_Fulkerson/)**
    - DFS-based maximum flow
    - Time: O(E × max_flow), Space: O(V + E)
  - **[Edmonds-Karp](Advanced_Graph/Network_Flow/Edmonds_Karp/)**
    - BFS-based maximum flow
    - Polynomial time: O(V × E²), Space: O(V + E)

---

## Algorithm Comparison

### Shortest Path Algorithms

| Algorithm | Time Complexity | Works with Negative Weights | All Pairs | Best For |
|-----------|----------------|----------------------------|-----------|----------|
| **BFS** | O(V + E) | N/A (unweighted) | No | Unweighted graphs |
| **Dijkstra's** | O((V + E) log V) | No | No | Non-negative weights |
| **Bellman-Ford** | O(V * E) | Yes | No | Negative weights |
| **Floyd-Warshall** | O(V³) | Yes (no cycles) | Yes | All pairs |
| **A*** | O(b^d) | Depends | No | Pathfinding with heuristics |

### Minimum Spanning Tree Algorithms

| Algorithm | Time Complexity | Best For | Data Structure |
|-----------|----------------|----------|----------------|
| **Kruskal's** | O(E log E) | Sparse graphs | Union-Find |
| **Prim's** | O((V + E) log V) | Dense graphs | Priority Queue |

---

## Complexity Summary

| Category | Algorithms | Time Complexity Range |
|----------|-----------|----------------------|
| **Traversal** | BFS, DFS | O(V + E) |
| **Shortest Path** | Dijkstra's, Bellman-Ford, Floyd-Warshall, A* | O(V + E) to O(V³) |
| **MST** | Kruskal's, Prim's | O(E log E) to O((V + E) log V) |

---

## When to Use Which Algorithm

### For Shortest Path:
- **Unweighted graph**: Use **BFS**
- **Non-negative weights, single-source**: Use **Dijkstra's**
- **Negative weights, single-source**: Use **Bellman-Ford**
- **All pairs shortest paths**: Use **Floyd-Warshall**
- **Pathfinding with heuristics**: Use **A***

### For Minimum Spanning Tree:
- **Sparse graph**: Use **Kruskal's**
- **Dense graph**: Use **Prim's**

---

## Implementation Details

All implementations follow consistent patterns:
- **Python**: Type hints, comprehensive docstrings
- **C++**: C++17 standard, template support
- **Go**: Generic types, comprehensive tests

Each algorithm includes:
- ✅ Complete implementation
- ✅ Test suite
- ✅ README documentation
- ✅ Complexity analysis
- ✅ Usage examples

---

## Related Topics

- **Data Structures**: [Graph Data Structures](../../Data_Structures/Non_Linear/Graph/)
- **Greedy Algorithms**: [Greedy Algorithms](../Greedy/)
- **Dynamic Programming**: [DP on Graphs](../Dynamic_Programming/Advanced_DP/DP_on_Graphs/)

---

## References

- "Introduction to Algorithms" by CLRS
- "Algorithm Design Manual" by Steven Skiena
- "Artificial Intelligence: A Modern Approach" by Russell & Norvig

---

_Last Updated: December 2025_


