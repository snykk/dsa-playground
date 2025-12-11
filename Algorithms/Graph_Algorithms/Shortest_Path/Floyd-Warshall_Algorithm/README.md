# Floyd-Warshall Algorithm

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

## Key Characteristics

- ✅ **All pairs**: Finds all pairs shortest paths
- ✅ **Simple**: Very simple implementation
- ✅ **Negative weights**: Works with negative weights
- ✅ **Dense graphs**: Good for dense graphs
- ❌ **Slow**: O(V³) time complexity
- ❌ **Space**: O(V²) space complexity

---

## When to Use

- ✅ All pairs shortest paths needed
- ✅ Dense graphs
- ✅ Negative weights (but not cycles)
- ❌ Single-source shortest path (use Dijkstra's or Bellman-Ford)
- ❌ Sparse graphs (may be inefficient)

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

_Last Updated: December 2025_


