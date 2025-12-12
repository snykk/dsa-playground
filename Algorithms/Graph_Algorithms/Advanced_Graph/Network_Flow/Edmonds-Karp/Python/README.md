# Edmonds-Karp Algorithm (Python)

**Edmonds-Karp Algorithm** finds the maximum flow in a flow network. It's a variant of Ford-Fulkerson that uses BFS to find shortest augmenting paths, guaranteeing polynomial time complexity.

---

## Overview

Edmonds-Karp algorithm is a polynomial-time algorithm for maximum flow. It uses BFS instead of DFS to find augmenting paths, ensuring the shortest path is found each time.

**Key Advantage**: Polynomial time complexity O(V × E²) compared to Ford-Fulkerson's O(E × max_flow).

---

## Algorithm

1. **Initialize**: Create residual graph
2. **Find shortest augmenting path**: Use BFS to find shortest path from source to sink
3. **Update flow**: Push minimum capacity along path
4. **Repeat**: Continue until no augmenting path exists

**Key Insight**: Using BFS guarantees shortest paths, which limits the number of iterations.

---

## Complexity Analysis

| Operation | Time | Space |
|-----------|------|-------|
| **Maximum Flow** | O(V × E²) | O(V + E) |

Where:
- V = number of vertices
- E = number of edges

**Note**: Polynomial time complexity, unlike Ford-Fulkerson which can be exponential.

---

## Implementation Details

### Functions

1. **`edmonds_karp(graph, source, sink)`**
   - Finds maximum flow using BFS
   - Returns maximum flow value
   - Time: O(V × E²), Space: O(V + E)

---

## Usage

```python
from edmonds_karp import edmonds_karp

graph = {
    0: {1: 16, 2: 13},
    1: {2: 10, 3: 12},
    2: {1: 4, 4: 14},
    3: {2: 9, 5: 20},
    4: {3: 7, 5: 4}
}

max_flow = edmonds_karp(graph, 0, 5)
print(max_flow)  # 23
```

---

## Important Notes

1. **BFS-based**: Uses BFS to find shortest augmenting paths
2. **Polynomial time**: Guaranteed O(V × E²) time complexity
3. **Residual graph**: Must maintain residual capacities
4. **Termination**: Algorithm terminates when no augmenting path exists

---

## Advantages

1. ✅ **Polynomial time**: O(V × E²) guaranteed
2. ✅ **BFS-based**: Finds shortest paths
3. ✅ **Efficient**: Better than Ford-Fulkerson in worst case

---

## Disadvantages

1. ❌ **More complex**: Slightly more complex than Ford-Fulkerson
2. ❌ **BFS overhead**: BFS may be slower than DFS in practice

---

## Comparison: Edmonds-Karp vs Ford-Fulkerson

| Aspect | Edmonds-Karp | Ford-Fulkerson |
|--------|--------------|----------------|
| **Path Finding** | BFS | DFS |
| **Time Complexity** | O(V × E²) | O(E × max_flow) |
| **Worst Case** | Polynomial | Can be exponential |
| **Guarantee** | Always polynomial | Not guaranteed |

---

## Usage

```python
from edmonds_karp import edmonds_karp

graph = {
    0: {1: 16, 2: 13},
    1: {2: 10, 3: 12},
    2: {1: 4, 4: 14},
    3: {2: 9, 5: 20},
    4: {3: 7, 5: 4}
}

max_flow = edmonds_karp(graph, 0, 5)
print(max_flow)  # 23
```

## Testing

Run tests with:

```bash
# Python
python -m unittest edmonds_karp_test.py

# Or run directly
python edmonds_karp_test.py

# Or run the main file to see example usage
python edmonds_karp.py
```

---

## Related Algorithms

- **Ford-Fulkerson**: DFS-based variant
- **Dinic's Algorithm**: More efficient algorithm
- **Push-Relabel**: Alternative approach

---

## Applications

1. **Network Flow**: Maximum flow in networks
2. **Bipartite Matching**: Maximum matching in bipartite graphs
3. **Resource Allocation**: Allocating resources optimally
4. **Transportation**: Maximum goods transport

---

## References

- Edmonds, J., & Karp, R. M. (1972). "Theoretical improvements in algorithmic efficiency"
- "Introduction to Algorithms" by CLRS (Chapter 26)

---

_Last Updated: December 2025_
