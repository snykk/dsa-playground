# Dijkstra's Algorithm - Python

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

## Implementation Details

### Functions

1. **`dijkstra(graph, start)`**
   - Finds shortest distances from start to all vertices
   - Returns dictionary mapping vertex to distance
   - Time: O((V + E) log V), Space: O(V)

2. **`dijkstra_with_path(graph, start, target)`**
   - Finds shortest path from start to target
   - Returns tuple of (distance, path) or None
   - Time: O((V + E) log V), Space: O(V)

3. **`dijkstra_all_pairs(graph)`**
   - Finds shortest distances between all pairs
   - Returns nested dictionary
   - Time: O(V * (V + E) log V), Space: O(V²)

---

## Usage

```python
from dijkstra import dijkstra, dijkstra_with_path
import heapq

# Graph: vertex -> [(neighbor, weight), ...]
graph = {
    1: [(2, 4), (3, 2)],
    2: [(4, 5)],
    3: [(4, 1)],
    4: []
}

# Find shortest distances
distances = dijkstra(graph, 1)
print(distances)  # {1: 0, 2: 4, 3: 2, 4: 3}

# Find shortest path
result = dijkstra_with_path(graph, 1, 4)
if result:
    distance, path = result
    print(f"Distance: {distance}, Path: {path}")  # Distance: 3, Path: [1, 3, 4]
```

---

## Important Notes

1. **Non-negative weights**: Only works with non-negative edge weights
2. **Priority queue**: Uses `heapq` for efficient minimum extraction
3. **Greedy choice**: Always processes minimum distance vertex first
4. **Optimal**: Guarantees shortest path for non-negative weights

---

## Advantages

1. ✅ **Optimal**: Guarantees shortest path
2. ✅ **Efficient**: O((V + E) log V) with binary heap
3. ✅ **Simple**: Easy to understand and implement
4. ✅ **Versatile**: Can find distances to all vertices or specific target

---

## Disadvantages

1. ❌ **Non-negative only**: Doesn't work with negative weights
2. ❌ **Not all pairs**: For all pairs, use Floyd-Warshall
3. ❌ **Dense graphs**: For dense graphs, may be slower than Floyd-Warshall

---

## When to Use

- ✅ Single-source shortest path
- ✅ Non-negative edge weights
- ✅ Need optimal solution
- ❌ Negative edge weights (use Bellman-Ford)
- ❌ All pairs shortest path (use Floyd-Warshall)

---

## Testing

```bash
python dijkstra_test.py
```

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

## References

- "Introduction to Algorithms" by CLRS (Chapter 24)
- "Algorithm Design Manual" by Steven Skiena

---

_Last Updated: December 2025_

