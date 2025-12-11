# Bellman-Ford Algorithm

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

## Key Characteristics

- ✅ **Negative weights**: Works with negative edge weights
- ✅ **Cycle detection**: Can detect negative cycles
- ✅ **Simple**: Easier to implement than Dijkstra's
- ✅ **Optimal**: Guarantees shortest path if no negative cycles
- ❌ **Slower**: O(V * E) time complexity
- ❌ **Not efficient**: For graphs without negative weights, Dijkstra's is better

---

## When to Use

- ✅ Graphs with negative edge weights
- ✅ Need to detect negative cycles
- ✅ Simple implementation needed
- ❌ Non-negative weights only (use Dijkstra's)
- ❌ Dense graphs (may be slow)

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

_Last Updated: December 2025_


