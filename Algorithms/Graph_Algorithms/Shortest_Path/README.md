# Shortest Path Algorithms

Algorithms for finding optimal paths in weighted graphs.

## Topics

| Algorithm | Description |
|-----------|-------------|
| [Dijkstra's Algorithm](Dijkstra's_Algorithm/) | Single-source shortest path (non-negative weights) |
| [Bellman-Ford Algorithm](Bellman-Ford_Algorithm/) | Single-source with negative weights |
| [Floyd-Warshall Algorithm](Floyd-Warshall_Algorithm/) | All-pairs shortest paths |

## Complexity Comparison

| Algorithm | Time | Space | Negative Weights |
|-----------|------|-------|------------------|
| Dijkstra | O((V+E) log V) | O(V) | No |
| Bellman-Ford | O(VE) | O(V) | Yes |
| Floyd-Warshall | O(V³) | O(V²) | Yes |

## When to Use

- **Dijkstra**: Non-negative weights, single source
- **Bellman-Ford**: Negative weights, detect negative cycles
- **Floyd-Warshall**: All pairs, dense graphs

