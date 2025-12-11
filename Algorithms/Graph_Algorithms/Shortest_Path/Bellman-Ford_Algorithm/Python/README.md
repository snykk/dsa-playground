# Bellman-Ford Algorithm - Python

**Bellman-Ford Algorithm** finds shortest paths from a source vertex to all other vertices in a weighted graph, even with negative edge weights. It can also detect negative cycles.

---

## Overview

Bellman-Ford algorithm is a dynamic programming approach that:
- Works with negative edge weights
- Can detect negative cycles
- Simpler than Dijkstra's but slower
- Guarantees optimal solution if no negative cycles

**Key Insight**: Relax all edges V-1 times, then check for negative cycles.

---

## Algorithm

1. **Initialize**: Set distance to start = 0, all others = infinity
2. **Relax**: For V-1 iterations:
   - For each edge (u, v, weight):
     - If distance[u] + weight < distance[v]:
       - Update distance[v] = distance[u] + weight
3. **Check cycles**: For each edge:
   - If distance[u] + weight < distance[v]:
     - Negative cycle detected
4. **Return**: Distances or None if negative cycle exists

---

## Complexity Analysis

| Complexity | Time | Space |
|------------|------|-------|
| **All Cases** | O(V * E) | O(V) |

**Note**: 
- V = number of vertices
- E = number of edges
- Slower than Dijkstra's but works with negative weights

---

## Implementation Details

### Functions

1. **`bellman_ford(edges, num_vertices, start)`**
   - Finds shortest distances from start to all vertices
   - Returns dictionary or None if negative cycle exists
   - Time: O(V * E), Space: O(V)

2. **`bellman_ford_with_path(edges, num_vertices, start, target)`**
   - Finds shortest path from start to target
   - Returns (distance, path) or None
   - Time: O(V * E), Space: O(V)

---

## Usage

```python
from bellman_ford import bellman_ford, bellman_ford_with_path

# Graph as edge list: [(u, v, weight), ...]
edges = [
    (0, 1, 4),
    (0, 2, 2),
    (1, 3, 5),
    (2, 3, 1)
]

# Find shortest distances
distances = bellman_ford(edges, 4, 0)
print(distances)  # {0: 0, 1: 4, 2: 2, 3: 3}

# Find shortest path
result = bellman_ford_with_path(edges, 4, 0, 3)
if result:
    distance, path = result
    print(f"Distance: {distance}, Path: {path}")  # Distance: 3, Path: [0, 2, 3]
```

---

## Important Notes

1. **Negative weights**: Works with negative edge weights
2. **Negative cycles**: Can detect negative cycles
3. **Slower**: O(V * E) vs O((V + E) log V) for Dijkstra's
4. **Edge list**: Uses edge list representation

---

## Advantages

1. ✅ **Negative weights**: Works with negative edge weights
2. ✅ **Cycle detection**: Can detect negative cycles
3. ✅ **Simple**: Easier to implement than Dijkstra's
4. ✅ **Optimal**: Guarantees shortest path if no negative cycles

---

## Disadvantages

1. ❌ **Slower**: O(V * E) time complexity
2. ❌ **Not efficient**: For graphs without negative weights, Dijkstra's is better
3. ❌ **Edge list**: Requires edge list representation

---

## When to Use

- ✅ Graphs with negative edge weights
- ✅ Need to detect negative cycles
- ✅ Simple implementation needed
- ❌ Non-negative weights only (use Dijkstra's)
- ❌ Dense graphs (may be slow)

---

## Testing

```bash
python bellman_ford_test.py
```

---

## Related Algorithms

- **Dijkstra's**: Faster for non-negative weights
- **Floyd-Warshall**: All pairs shortest path
- **SPFA**: Optimized version of Bellman-Ford

---

## Applications

1. **Routing**: Find shortest path with negative costs
2. **Arbitrage**: Detect arbitrage opportunities
3. **Network Analysis**: Analyze networks with negative weights
4. **Game Theory**: Find optimal strategies

---

## References

- "Introduction to Algorithms" by CLRS (Chapter 24)
- "Algorithm Design Manual" by Steven Skiena

---

_Last Updated: December 2025_


