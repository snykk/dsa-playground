# Dijkstra's Algorithm

**Dijkstra's Algorithm** finds shortest paths from a source vertex to all other vertices in a weighted graph with non-negative edge weights.

---

## Overview

Dijkstra's algorithm is a greedy algorithm that:
- Finds shortest paths in weighted graphs
- Works only with non-negative edge weights
- Uses priority queue (heap) for efficient implementation
- Guarantees optimal solution

**Key Insight**: Always process the vertex with minimum distance first.

---

## Algorithm

1. **Initialize**: Set distance to start = 0, all others = infinity
2. **Priority Queue**: Add (0, start) to priority queue
3. **Process**: While queue is not empty:
   - Extract vertex with minimum distance
   - For each neighbor:
     - Calculate new distance = current distance + edge weight
     - If new distance < current distance, update and add to queue
4. **Repeat**: Until all vertices processed

---

## Complexity Analysis

| Complexity | Time | Space |
|------------|------|-------|
| **Binary Heap** | O((V + E) log V) | O(V) |
| **Fibonacci Heap** | O(E + V log V) | O(V) |

**Note**: 
- V = number of vertices
- E = number of edges
- Binary heap implementation shown here

---

## Key Characteristics

- ✅ **Optimal**: Guarantees shortest path
- ✅ **Efficient**: O((V + E) log V) with binary heap
- ✅ **Simple**: Easy to understand and implement
- ✅ **Versatile**: Can find distances to all vertices or specific target
- ❌ **Non-negative only**: Doesn't work with negative weights
- ❌ **Not all pairs**: For all pairs, use Floyd-Warshall

---

## When to Use

- ✅ Single-source shortest path
- ✅ Non-negative edge weights
- ✅ Need optimal solution
- ❌ Negative edge weights (use Bellman-Ford)
- ❌ All pairs shortest path (use Floyd-Warshall)

---

## Related Algorithms

- **Bellman-Ford**: Works with negative weights
- **Floyd-Warshall**: All pairs shortest path
- **A\***: Informed search with heuristics

---

## Applications

1. **Routing**: Find shortest path in networks
2. **GPS Navigation**: Find shortest route
3. **Social Networks**: Find degrees of separation
4. **Game AI**: Pathfinding in games

---

_Last Updated: December 2025_


