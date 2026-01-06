# Graph Traversal Algorithms

Fundamental algorithms for exploring graphs.

## Topics

| Algorithm | Description |
|-----------|-------------|
| [BFS](BFS/) | Breadth-First Search - level-order traversal |
| [DFS](DFS/) | Depth-First Search - recursive exploration |

## Overview

### Breadth-First Search (BFS)
- Explores neighbors before going deeper
- Uses a queue data structure
- Finds shortest path in unweighted graphs
- Time: O(V + E), Space: O(V)

### Depth-First Search (DFS)
- Explores as deep as possible before backtracking
- Uses stack (or recursion)
- Useful for cycle detection, topological sort
- Time: O(V + E), Space: O(V)

## Applications

- **Shortest path** (unweighted): BFS
- **Cycle detection**: DFS
- **Topological sorting**: DFS
- **Connected components**: BFS or DFS
- **Bipartite check**: BFS or DFS

