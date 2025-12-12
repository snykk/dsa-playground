# Ford-Fulkerson Algorithm (Python)

**Ford-Fulkerson Algorithm** finds the maximum flow in a flow network. It uses DFS to find augmenting paths and updates flow along these paths until no more augmenting paths exist.

---

## Overview

Ford-Fulkerson algorithm is a greedy method for computing maximum flow. It repeatedly finds augmenting paths (paths from source to sink with available capacity) and pushes flow along them.

**Key Concepts**:
- **Residual Graph**: Graph with residual capacities (original capacity - current flow)
- **Augmenting Path**: Path from source to sink with positive residual capacity
- **Max-Flow Min-Cut Theorem**: Maximum flow equals minimum cut capacity

**Example**:
- Graph: 0 →(10)→ 1 →(5)→ 3, 0 →(5)→ 2 →(7)→ 4 →(6)→ 5
- Max flow: Limited by bottleneck edges

---

## Algorithm

1. **Initialize**: Create residual graph (copy of original graph)
2. **Find augmenting path**: Use DFS to find path from source to sink with positive capacity
3. **Update flow**: Push minimum capacity along path, update residual graph
4. **Repeat**: Continue until no augmenting path exists
5. **Result**: Sum of flows pushed equals maximum flow

**Key Insight**: Residual graph allows "undoing" flow by using reverse edges.

---

## Complexity Analysis

| Operation | Time | Space |
|-----------|------|-------|
| **Maximum Flow** | O(E × max_flow) | O(V + E) |
| **With Paths** | O(E × max_flow) | O(V + E) |
| **Min Cut** | O(E × max_flow) | O(V + E) |

Where:
- V = number of vertices
- E = number of edges
- max_flow = value of maximum flow

**Note**: Worst case is O(E × max_flow) when DFS finds long paths. In practice, often much better.

---

## Implementation Details

### Functions

1. **`ford_fulkerson(graph, source, sink)`**
   - Finds maximum flow using DFS
   - Returns maximum flow value
   - Time: O(E × max_flow), Space: O(V + E)

2. **`ford_fulkerson_with_path(graph, source, sink)`**
   - Finds maximum flow and returns augmenting paths
   - Returns tuple of (max_flow, list of paths with capacities)
   - Time: O(E × max_flow), Space: O(V + E)

3. **`min_cut(graph, source, sink)`**
   - Finds minimum cut using max-flow min-cut theorem
   - Returns tuple of (cut_value, source_side, sink_side)
   - Time: O(E × max_flow), Space: O(V + E)

---

## Usage

```python
from ford_fulkerson import ford_fulkerson, min_cut

# Flow network
graph = {
    0: {1: 16, 2: 13},
    1: {2: 10, 3: 12},
    2: {1: 4, 4: 14},
    3: {2: 9, 5: 20},
    4: {3: 7, 5: 4}
}

# Find maximum flow
max_flow = ford_fulkerson(graph, 0, 5)
print(max_flow)  # 23

# Find minimum cut
cut_value, source_side, sink_side = min_cut(graph, 0, 5)
print(cut_value)  # 23
print(source_side)  # {0, 1, 2, 4}
print(sink_side)  # {3, 5}
```

---

## Important Notes

1. **Residual graph**: Must maintain residual capacities
2. **Reverse edges**: Add reverse edges with capacity 0 initially
3. **Augmenting paths**: Must find paths with positive residual capacity
4. **Termination**: Algorithm terminates when no augmenting path exists
5. **Integer capacities**: Works best with integer capacities

---

## Advantages

1. ✅ **Simple**: Easy to understand and implement
2. ✅ **Flexible**: Can use different path-finding methods (DFS, BFS)
3. ✅ **Correct**: Guaranteed to find maximum flow
4. ✅ **Min cut**: Can find minimum cut as byproduct

---

## Disadvantages

1. ❌ **Slow worst case**: O(E × max_flow) can be slow for large flows
2. ❌ **DFS inefficiency**: DFS may find long paths
3. ❌ **Non-polynomial**: Not polynomial time in worst case
4. ❌ **Floating point**: May have issues with floating point capacities

---

## When to Use

- ✅ Maximum flow problems
- ✅ Network capacity problems
- ✅ Bipartite matching (with transformation)
- ✅ When need simple implementation
- ❌ When need guaranteed polynomial time (use Edmonds-Karp)
- ❌ Very large flow values

---

## Comparison: Ford-Fulkerson vs Edmonds-Karp

| Aspect | Ford-Fulkerson | Edmonds-Karp |
|--------|----------------|--------------|
| **Path Finding** | DFS | BFS |
| **Time Complexity** | O(E × max_flow) | O(V × E²) |
| **Worst Case** | Can be slow | Polynomial |
| **Implementation** | Simpler | Slightly more complex |

---

## Usage

```python
from ford_fulkerson import ford_fulkerson, min_cut

# Flow network
graph = {
    0: {1: 16, 2: 13},
    1: {2: 10, 3: 12},
    2: {1: 4, 4: 14},
    3: {2: 9, 5: 20},
    4: {3: 7, 5: 4}
}

# Find maximum flow
max_flow = ford_fulkerson(graph, 0, 5)
print(max_flow)  # 23

# Find minimum cut
cut_value, source_side, sink_side = min_cut(graph, 0, 5)
print(cut_value)  # 23
print(source_side)  # {0, 1, 2, 4}
print(sink_side)  # {3, 5}
```

## Testing

Run tests with:

```bash
# Python
python -m unittest ford_fulkerson_test.py

# Or run directly
python ford_fulkerson_test.py

# Or run the main file to see example usage
python ford_fulkerson.py
```

---

## Related Algorithms

- **Edmonds-Karp**: BFS-based variant (polynomial time)
- **Dinic's Algorithm**: More efficient algorithm
- **Push-Relabel**: Alternative approach
- **Max-Flow Min-Cut**: Fundamental theorem

---

## Applications

1. **Network Flow**: Maximum flow in networks
2. **Bipartite Matching**: Maximum matching in bipartite graphs
3. **Image Segmentation**: Min-cut for segmentation
4. **Resource Allocation**: Allocating resources optimally
5. **Transportation**: Maximum goods transport

---

## References

- Ford, L. R., & Fulkerson, D. R. (1956). "Maximal flow through a network"
- "Introduction to Algorithms" by CLRS (Chapter 26)
- "Algorithm Design Manual" by Steven Skiena

---

_Last Updated: December 2025_
