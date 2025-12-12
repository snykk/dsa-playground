# Edmonds-Karp Algorithm

**Edmonds-Karp Algorithm** finds the maximum flow in a flow network. It's a variant of Ford-Fulkerson that uses BFS to find shortest augmenting paths, guaranteeing polynomial time complexity.

---

## Overview

Edmonds-Karp algorithm is a polynomial-time algorithm for maximum flow. It uses BFS instead of DFS to find augmenting paths, ensuring the shortest path is found each time.

---

## Algorithm

1. **Initialize**: Create residual graph
2. **Find shortest augmenting path**: Use BFS to find shortest path
3. **Update flow**: Push minimum capacity along path
4. **Repeat**: Continue until no augmenting path exists

---

## Complexity Analysis

| Operation | Time | Space |
|-----------|------|-------|
| **Maximum Flow** | O(V × E²) | O(V + E) |

---

## Implementations

- **Python** (`Python/`)
- **C++** (`C++/`)
- **Go** (`Go/`)

---

## Related Algorithms

- **Ford-Fulkerson**: DFS-based variant
- **Dinic's Algorithm**: More efficient algorithm

---

_Last Updated: December 2025_

