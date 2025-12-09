# DP on Graphs (Python)

**DP on Graphs** is a technique for solving optimization problems on graph structures using Dynamic Programming, particularly effective on Directed Acyclic Graphs (DAGs) where topological ordering enables efficient DP.

---

## Overview

Graph DP works best on DAGs because:
- **No cycles**: Ensures optimal substructure
- **Topological order**: Natural processing order
- **Subproblem independence**: Can solve subproblems independently

For general graphs with cycles, DP is more complex and may require additional techniques like memoization with cycle detection.

---

## Algorithm

1. **Topological Sort**: Order nodes (for DAGs)
2. **DP State**: Store results for each node
3. **Process in order**: Solve nodes in topological order
4. **Combine**: Merge results from predecessors

---

## Complexity Analysis

| Problem Type | Time | Space | Notes |
|--------------|------|-------|-------|
| **DAG Longest Path** | O(V + E) | O(V) | V = vertices, E = edges |
| **DAG Shortest Path** | O(V + E) | O(V) | Similar to longest path |
| **General Graph** | Varies | Varies | May require memoization |

---

## Implementation Details

### Functions

1. **`dag_longest_path(graph, start)`**
   - Longest path in DAG using DP
   - Uses DFS with memoization
   - Returns length of longest path from start
   - Time: O(V + E), Space: O(V)

---

## Usage

```python
from graph_dp import dag_longest_path, dag_shortest_path

# DAG represented as adjacency list
#    0
#   / \
#  1   2
#   \ /
#    3
graph = {
    0: [1, 2],
    1: [3],
    2: [3],
    3: []
}

# Find longest path from node 0
longest = dag_longest_path(graph, 0)
print(longest)  # Output: 2 (path: 0 -> 1 -> 3 or 0 -> 2 -> 3)

# Weighted DAG example
#    0
#   / \
#  1   2
#   \ /
#    3
weighted_graph = {
    0: [(1, 5), (2, 3)],
    1: [(3, 2)],
    2: [(3, 4)],
    3: []
}
# Longest weighted path: 0 -> 2 -> 3 = 3 + 4 = 7

# Shortest path (if needed)
shortest = dag_shortest_path(graph, 0)
print(shortest)  # Output: 2 (same as longest for unweighted)
```

---

## Common Problem Types

### 1. Longest Path in DAG
- Find longest path from source
- Can use DP with topological sort
- O(V + E) time complexity

### 2. Shortest Path with Constraints
- Shortest path with additional constraints
- State includes constraint information

### 3. Graph Coloring DP
- Color graph with constraints
- State tracks color assignments

### 4. Path Counting
- Count paths with properties
- DP tracks path information

### 5. Weighted Path Problems
- Maximize/minimize path weight
- With various constraints

---

## Key Concepts

### Topological Ordering

For DAGs, process nodes in topological order:
1. All predecessors processed before current node
2. Ensures optimal substructure
3. Natural DP order

### State Design

Common state dimensions:
- **Node**: Current node in graph
- **Visited**: Which nodes visited (bitmask for small graphs)
- **Constraints**: Problem-specific constraints

---

## Important Notes

1. **DAG Requirement**: Works best on DAGs (no cycles)
2. **Topological Sort**: Essential for efficient DP on DAGs
3. **Cycle Handling**: General graphs require cycle detection
4. **State Explosion**: Be careful with state space size

---

## Advantages

1. ✅ **Efficient on DAGs**: O(V + E) for many problems
2. ✅ **Optimal**: Guarantees optimal solution
3. ✅ **Flexible**: Can handle various constraints

---

## Disadvantages

1. ❌ **DAG Limitation**: Best for DAGs, complex for general graphs
2. ❌ **State Space**: Can explode with constraints
3. ❌ **Implementation**: More complex than tree DP

---

## When to Use

- ✅ DAG problems (longest/shortest path)
- ✅ Problems with optimal substructure on graphs
- ✅ When topological order exists
- ❌ General graphs with cycles (use other techniques)
- ❌ When BFS/DFS is sufficient

---

## Testing

Run the test suite:

```bash
python graph_dp_test.py
```

---

## Comparison: DAG DP vs General Graph DP

| Aspect | DAG DP | General Graph DP |
|--------|--------|------------------|
| **Cycles** | No cycles | May have cycles |
| **Ordering** | Topological sort | No natural order |
| **Complexity** | O(V + E) | Varies, often exponential |
| **State Design** | Simpler | More complex |
| **Memoization** | Optional | Usually required |

---

## Applications

1. **Project Scheduling**: Critical path method (CPM)
2. **Dependency Resolution**: Resolve dependencies optimally
3. **Longest Path**: Find longest path in DAG
4. **Task Ordering**: Order tasks with dependencies

---

## Related Algorithms

- **Topological Sort**: Prerequisite for DAG DP
- **Tree DP**: Simpler case (tree is a DAG)
- **Graph Algorithms**: BFS, DFS, Dijkstra's
- **Bellman-Ford**: Can find longest path in DAG

---

## References

- "Introduction to Algorithms" by CLRS (Chapter 24)
- Competitive Programming resources
- Graph DP tutorials
- LeetCode problems on DAG DP

---

_Last Updated: December 2025_

