# DFS (Depth-First Search) - Python

**DFS (Depth-First Search)** is a graph traversal algorithm that explores as far as possible along each branch before backtracking.

---

## Overview

DFS is a fundamental graph traversal algorithm that:
- Explores depth-first (goes deep before going wide)
- Uses a stack data structure (or recursion)
- Useful for path finding, cycle detection, topological sort
- Can be implemented iteratively or recursively

**Key Insight**: Explore as deep as possible before backtracking.

---

## Algorithm

1. **Start**: Push the starting vertex onto the stack
2. **Process**: While stack is not empty:
   - Pop a vertex; skip it if it is already visited
   - Otherwise mark it visited (a vertex is marked when popped, not when pushed)
   - Push its unvisited neighbors (in reverse, so the first neighbor is popped first)
3. **Repeat**: Continue until stack is empty

---

## Complexity Analysis

| Complexity | Time | Space |
|------------|------|-------|
| **All Cases** | O(V + E) | O(V) |

**Note**: 
- V = number of vertices
- E = number of edges
- O(V) space for stack/recursion and visited set

---

## Implementation Details

### Functions

1. **`dfs_adjacency_list(graph, start)`**
   - Iterative DFS traversal
   - Returns list of vertices in DFS order
   - Time: O(V + E), Space: O(V)

2. **`dfs_recursive(graph, start)`**
   - DFS in recursive order
   - Simulates the recursion with an explicit stack, so deep graphs do not hit Python's recursion limit
   - Time: O(V + E), Space: O(V)

3. **`dfs_with_path(graph, start, target)`**
   - Finds path from start to target
   - Returns path as list of vertices
   - Time: O(V + E), Space: O(V)

4. **`dfs_connected_components(graph)`**
   - Finds all connected components
   - Returns list of components
   - Time: O(V + E), Space: O(V)

5. **`dfs_detect_cycle(graph, directed)`**
   - Detects cycle in graph
   - Works for both directed and undirected graphs
   - Time: O(V + E), Space: O(V)

6. **`dfs_topological_sort(graph)`**
   - Topological sort for DAG
   - Returns None if cycle exists
   - Time: O(V + E), Space: O(V)

---

## Usage

```python
from dfs import (
    dfs_adjacency_list,
    dfs_recursive,
    dfs_with_path,
    dfs_connected_components,
    dfs_detect_cycle,
    dfs_topological_sort
)

# Basic DFS
graph = {
    1: [2, 4],
    2: [3],
    3: [],
    4: []
}
result = dfs_adjacency_list(graph, 1)
print(result)  # [1, 2, 3, 4]

# Recursive DFS
result = dfs_recursive(graph, 1)
print(result)  # [1, 2, 3, 4]

# Find path
path = dfs_with_path(graph, 1, 3)
print(path)  # [1, 2, 3]

# Connected components
components = dfs_connected_components(graph)
print(components)  # [[1, 2, 3, 4]]

# Detect cycle
has_cycle = dfs_detect_cycle(graph, directed=False)
print(has_cycle)  # False

# Topological sort
dag = {
    1: [2, 3],
    2: [4],
    3: [4],
    4: []
}
topo_order = dfs_topological_sort(dag)
print(topo_order)  # [1, 3, 2, 4] (one possible order)
```

---

## Important Notes

1. **Stack-based**: Uses list as stack for iterative version
2. **Visited tracking**: Must track visited vertices to avoid cycles
3. **Order may vary**: DFS order depends on neighbor order
4. **No recursion limit**: The recursive-order functions simulate recursion with an explicit stack, so deep graphs do not raise `RecursionError`

---

## Advantages

1. ✅ **Memory efficient**: O(V) space (better than BFS for deep graphs)
2. ✅ **Path finding**: Natural for finding paths
3. ✅ **Cycle detection**: Easy to detect cycles
4. ✅ **Topological sort**: Natural for topological sorting

---

## Disadvantages

1. ❌ **Not shortest path**: Doesn't guarantee shortest path
2. ❌ **Deep recursion**: Recursive version may hit stack limit
3. ❌ **Order dependent**: Order depends on neighbor order

---

## When to Use

- ✅ Finding paths (not necessarily shortest)
- ✅ Cycle detection
- ✅ Topological sorting
- ✅ Connected components
- ✅ Maze solving
- ❌ Finding shortest path (use BFS for unweighted)

---

## Testing

```bash
python dfs_test.py
```

---

## Related Algorithms

- **BFS**: Breadth-First Search for level-order traversal
- **Dijkstra's**: Shortest path in weighted graphs
- **Topological Sort**: DFS-based topological sorting

---

## Applications

1. **Path Finding**: Find any path between vertices
2. **Cycle Detection**: Detect cycles in graphs
3. **Topological Sort**: Order vertices in DAG
4. **Maze Solving**: Solve mazes using DFS
5. **Connected Components**: Find all connected components

---

## References

- "Introduction to Algorithms" by CLRS (Chapter 22)
- "Algorithm Design Manual" by Steven Skiena

---

_Last Updated: December 2025_

