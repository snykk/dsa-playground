# BFS (Breadth-First Search)

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

## Key Characteristics

- ✅ **Shortest path**: Finds shortest path in unweighted graphs
- ✅ **Level order**: Natural level-by-level traversal
- ✅ **Simple**: Easy to understand and implement
- ✅ **Complete**: Visits all reachable vertices
- ❌ **Memory**: Requires O(V) space for queue
- ❌ **Unweighted only**: Doesn't work for weighted shortest path

---

## When to Use

- ✅ Finding shortest path in unweighted graphs
- ✅ Level-order traversal
- ✅ Finding connected components
- ✅ Finding minimum steps in grid problems
- ❌ Weighted graphs (use Dijkstra's instead)

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

_Last Updated: December 2025_

