# Floyd-Warshall Algorithm - Python

**Floyd-Warshall Algorithm** finds shortest paths between all pairs of vertices in a weighted graph. It works with negative edge weights but not negative cycles.

---

## Overview

Floyd-Warshall algorithm is a dynamic programming approach that:
- Finds all pairs shortest paths
- Works with negative edge weights (but not negative cycles)
- Uses adjacency matrix representation
- Simpler implementation but O(V³) time complexity

**Key Insight**: For each intermediate vertex k, update shortest path from i to j via k.

---

## Algorithm

1. **Initialize**: Create distance matrix, set diagonal to 0, edges to weights
2. **For each intermediate vertex k**:
   - For each pair (i, j):
     - dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])
3. **Check cycles**: If dist[i][i] < 0 for any i, negative cycle exists
4. **Return**: Distance matrix

---

## Complexity Analysis

| Complexity | Time | Space |
|------------|------|-------|
| **All Cases** | O(V³) | O(V²) |

**Note**: 
- V = number of vertices
- Very simple but cubic time complexity
- Good for dense graphs or when all pairs needed

---

## Implementation Details

### Functions

1. **`floyd_warshall(graph, num_vertices)`**
   - Finds shortest distances between all pairs
   - Returns 2D list or None if negative cycle exists
   - Time: O(V³), Space: O(V²)

2. **`floyd_warshall_path(graph, num_vertices)`**
   - Finds distances and path reconstruction matrix
   - Returns (distance matrix, next matrix)
   - Time: O(V³), Space: O(V²)

3. **`reconstruct_path(next_vertex, start, end)`**
   - Reconstructs path from next matrix
   - Returns path as list or None
   - Time: O(V), Space: O(V)

---

## Usage

```python
from floyd_warshall import floyd_warshall, floyd_warshall_path, reconstruct_path

graph = {
    0: [(1, 4), (2, 2)],
    1: [(3, 5)],
    2: [(3, 1)],
    3: []
}

# Find all pairs shortest distances
dist = floyd_warshall(graph, 4)
print(dist[0][3])  # 3 (shortest distance from 0 to 3)

# With path reconstruction
dist, next_vertex = floyd_warshall_path(graph, 4)
path = reconstruct_path(next_vertex, 0, 3)
print(path)  # [0, 2, 3]
```

---

## Important Notes

1. **All pairs**: Finds shortest paths between all pairs
2. **Negative weights**: Works with negative weights (but not cycles)
3. **Dense graphs**: Good for dense graphs
4. **Simple**: Very simple implementation

---

## Advantages

1. ✅ **All pairs**: Finds all pairs shortest paths
2. ✅ **Simple**: Very simple implementation
3. ✅ **Negative weights**: Works with negative weights
4. ✅ **Dense graphs**: Good for dense graphs

---

## Disadvantages

1. ❌ **Slow**: O(V³) time complexity
2. ❌ **Space**: O(V²) space complexity
3. ❌ **Not efficient**: For single-source, use Dijkstra's or Bellman-Ford

---

## When to Use

- ✅ All pairs shortest paths needed
- ✅ Dense graphs
- ✅ Negative weights (but not cycles)
- ❌ Single-source shortest path (use Dijkstra's or Bellman-Ford)
- ❌ Sparse graphs (may be inefficient)

---

## Testing

```bash
python floyd_warshall_test.py
```

---

## Related Algorithms

- **Dijkstra's**: Single-source shortest path
- **Bellman-Ford**: Single-source with negative weights
- **Johnson's**: All pairs using Dijkstra's

---

## Applications

1. **Network Routing**: Find shortest paths between all nodes
2. **Transitive Closure**: Find reachability between all pairs
3. **Social Networks**: Find degrees of separation
4. **Game Theory**: Find optimal strategies

---

## References

- "Introduction to Algorithms" by CLRS (Chapter 25)
- "Algorithm Design Manual" by Steven Skiena

---

_Last Updated: December 2025_


