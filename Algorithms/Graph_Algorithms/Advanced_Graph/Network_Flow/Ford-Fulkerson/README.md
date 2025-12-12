# Ford-Fulkerson Algorithm

**Ford-Fulkerson Algorithm** finds the maximum flow in a flow network. It uses DFS to find augmenting paths and updates flow along these paths.

---

## Overview

Ford-Fulkerson algorithm is a greedy method for computing maximum flow. It repeatedly finds augmenting paths (paths from source to sink with available capacity) and pushes flow along them.

---

## Algorithm

1. **Initialize**: Create residual graph
2. **Find augmenting path**: Use DFS to find path from source to sink
3. **Update flow**: Push minimum capacity along path
4. **Repeat**: Continue until no augmenting path exists

---

## Complexity Analysis

| Operation | Time | Space |
|-----------|------|-------|
| **Maximum Flow** | O(E × max_flow) | O(V + E) |

---

## Implementations

- **Python** (`Python/`)
- **C++** (`C++/`)
- **Go** (`Go/`)

---

## Related Algorithms

- **Edmonds-Karp**: BFS-based variant (polynomial time)
- **Dinic's Algorithm**: More efficient algorithm

---

_Last Updated: December 2025_

