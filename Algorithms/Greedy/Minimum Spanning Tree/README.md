# Minimum Spanning Tree

**Minimum Spanning Tree (MST)** connects all vertices with minimum total edge weight.

---

## Algorithms

### Kruskal's Algorithm
- Sort edges, add greedily (avoid cycles)
- Uses Union-Find for cycle detection
- O(E log E) time

### Prim's Algorithm
- Grow tree from a vertex
- Add minimum edge to unvisited vertex
- O(E log V) time with heap

---

## Comparison

| Algorithm | Time | Space | Best For |
|-----------|------|-------|----------|
| **Kruskal's** | O(E log E) | O(V) | Sparse graphs |
| **Prim's** | O(E log V) | O(V) | Dense graphs |

---

## Implementations

- **Kruskal's** (`Kruskal's Algorithm/`)
- **Prim's** (`Prim's Algorithm/`)

---

_Last Updated: December 2025_

