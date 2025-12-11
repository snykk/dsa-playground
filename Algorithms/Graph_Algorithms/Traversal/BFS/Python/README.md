# BFS (Breadth-First Search) - Python

**BFS (Breadth-First Search)** is a graph traversal algorithm that explores all vertices at the current depth level before moving to vertices at the next depth level.

---

## Overview

BFS is a fundamental graph traversal algorithm that:
- Explores level by level (breadth-first)
- Uses a queue data structure
- Finds shortest path in unweighted graphs
- Can detect cycles and connected components

**Key Insight**: Visit all neighbors before moving to next level.

---

## Algorithm

1. **Start**: Add starting vertex to queue and mark as visited
2. **Process**: While queue is not empty:
   - Dequeue a vertex
   - Visit all unvisited neighbors
   - Add neighbors to queue and mark as visited
3. **Repeat**: Continue until queue is empty

---

## Complexity Analysis

| Complexity | Time | Space |
|------------|------|-------|
| **All Cases** | O(V + E) | O(V) |

**Note**: 
- V = number of vertices
- E = number of edges
- O(V) space for queue and visited set

---

## Implementation Details

### Functions

1. **`bfs_adjacency_list(graph, start)`**
   - Basic BFS traversal
   - Returns list of vertices in BFS order
   - Time: O(V + E), Space: O(V)

2. **`bfs_with_path(graph, start, target)`**
   - Finds shortest path from start to target
   - Returns path as list of vertices
   - Time: O(V + E), Space: O(V)

3. **`bfs_level_order(graph, start)`**
   - Returns vertices grouped by level
   - Useful for level-order problems
   - Time: O(V + E), Space: O(V)

4. **`bfs_connected_components(graph)`**
   - Finds all connected components
   - Returns list of components
   - Time: O(V + E), Space: O(V)

5. **`bfs_shortest_distance(graph, start)`**
   - Finds shortest distance to all vertices
   - Returns dictionary of distances
   - Time: O(V + E), Space: O(V)

---

## Usage

```python
from bfs import (
    bfs_adjacency_list,
    bfs_with_path,
    bfs_level_order,
    bfs_connected_components,
    bfs_shortest_distance
)

# Basic BFS
graph = {
    1: [2, 4],
    2: [3],
    3: [],
    4: []
}
result = bfs_adjacency_list(graph, 1)
print(result)  # [1, 2, 4, 3]

# Find shortest path
path = bfs_with_path(graph, 1, 3)
print(path)  # [1, 2, 3]

# Level order
levels = bfs_level_order(graph, 1)
print(levels)  # [[1], [2, 4], [3]]

# Connected components
components = bfs_connected_components(graph)
print(components)  # [[1, 2, 3, 4]]

# Shortest distances
distances = bfs_shortest_distance(graph, 1)
print(distances)  # {1: 0, 2: 1, 4: 1, 3: 2}
```

---

## Important Notes

1. **Queue-based**: Uses deque for efficient queue operations
2. **Visited tracking**: Must track visited vertices to avoid cycles
3. **Unweighted graphs**: BFS finds shortest path only in unweighted graphs
4. **Level-by-level**: Processes all vertices at same level before next level

---

## Advantages

1. ✅ **Shortest path**: Finds shortest path in unweighted graphs
2. ✅ **Level order**: Natural level-by-level traversal
3. ✅ **Simple**: Easy to understand and implement
4. ✅ **Complete**: Visits all reachable vertices

---

## Disadvantages

1. ❌ **Memory**: Requires O(V) space for queue
2. ❌ **Not optimal for deep graphs**: May explore many vertices
3. ❌ **Unweighted only**: Doesn't work for weighted shortest path

---

## When to Use

- ✅ Finding shortest path in unweighted graphs
- ✅ Level-order traversal
- ✅ Finding connected components
- ✅ Finding minimum steps in grid problems
- ❌ Weighted graphs (use Dijkstra's instead)
- ❌ When depth-first is more natural

---

## Testing

```bash
python bfs_test.py
```

---

## Related Algorithms

- **DFS**: Depth-First Search for different traversal order
- **Dijkstra's**: Shortest path in weighted graphs
- **A\***: Informed search with heuristics

---

## Applications

1. **Shortest Path**: Find shortest path in unweighted graphs
2. **Social Networks**: Find degrees of separation
3. **Puzzle Solving**: Find minimum moves to solve puzzle
4. **Web Crawling**: Crawl web pages level by level
5. **Network Broadcasting**: Broadcast messages in network

---

## References

- "Introduction to Algorithms" by CLRS (Chapter 22)
- "Algorithm Design Manual" by Steven Skiena

---

_Last Updated: December 2025_

