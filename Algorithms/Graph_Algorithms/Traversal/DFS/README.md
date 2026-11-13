# DFS (Depth-First Search)

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

## Key Characteristics

- ✅ **Memory efficient**: O(V) space (better than BFS for deep graphs)
- ✅ **Path finding**: Natural for finding paths
- ✅ **Cycle detection**: Easy to detect cycles
- ✅ **Topological sort**: Natural for topological sorting
- ❌ **Not shortest path**: Doesn't guarantee shortest path
- ❌ **Deep recursion**: Recursive version may hit stack limit

---

## When to Use

- ✅ Finding paths (not necessarily shortest)
- ✅ Cycle detection
- ✅ Topological sorting
- ✅ Connected components
- ✅ Maze solving
- ❌ Finding shortest path (use BFS for unweighted)

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

_Last Updated: December 2025_

