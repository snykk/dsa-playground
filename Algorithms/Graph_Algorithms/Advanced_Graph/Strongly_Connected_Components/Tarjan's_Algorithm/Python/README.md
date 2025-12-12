# Tarjan's Algorithm (Python)

**Tarjan's Algorithm** finds all strongly connected components (SCCs) in a directed graph using a single DFS pass. It's more efficient than Kosaraju's in terms of number of passes.

---

## Overview

Tarjan's algorithm uses DFS with low-link values to identify strongly connected components in a single pass. It maintains a stack of vertices in the current DFS path and identifies SCC roots when low-link equals discovery time.

**Example**:
- Graph: 1 → 2 → 3 → 1 (cycle), 4 → 5 → 6 → 4 (cycle)
- SCCs: {1, 2, 3} and {4, 5, 6}
- Each cycle forms a strongly connected component

---

## Algorithm

1. **DFS with tracking**: Perform DFS, maintaining:
   - `indices`: Discovery time for each vertex
   - `low_link`: Lowest discovery time reachable from vertex
   - `stack`: Stack of vertices in current DFS path
2. **Update low-link**: For each edge (u, v):
   - If v not visited: recurse, then `low_link[u] = min(low_link[u], low_link[v])`
   - If v in stack: `low_link[u] = min(low_link[u], indices[v])`
3. **Identify SCC root**: When `low_link[vertex] == indices[vertex]`:
   - Vertex is root of SCC
   - Pop stack until vertex, all popped vertices form one SCC

**Key Insight**: Low-link value tracks the earliest vertex in the same SCC that can be reached.

---

## Complexity Analysis

| Operation | Time | Space |
|-----------|------|-------|
| **Find All SCCs** | O(V + E) | O(V) |
| **Count SCCs** | O(V + E) | O(V) |
| **Check Strongly Connected** | O(V + E) | O(V) |
| **Find Bridges** | O(V + E) | O(V) |
| **Find Articulation Points** | O(V + E) | O(V) |

Where:
- V = number of vertices
- E = number of edges

**Note**: Single DFS pass makes it more efficient than Kosaraju's in practice.

---

## Implementation Details

### Functions

1. **`tarjan_scc(graph)`**
   - Finds all strongly connected components
   - Returns list of SCCs, each as list of vertices
   - Time: O(V + E), Space: O(V)

2. **`tarjan_scc_count(graph)`**
   - Counts number of strongly connected components
   - Returns integer count
   - Time: O(V + E), Space: O(V)

3. **`is_strongly_connected(graph)`**
   - Checks if graph is strongly connected (one SCC)
   - Returns True if strongly connected, False otherwise
   - Time: O(V + E), Space: O(V)

4. **`tarjan_bridges(graph)`**
   - Finds bridges (critical edges) in undirected graph
   - Returns list of (u, v) tuples
   - Time: O(V + E), Space: O(V)

5. **`tarjan_articulation_points(graph)`**
   - Finds articulation points (cut vertices) in undirected graph
   - Returns set of vertices
   - Time: O(V + E), Space: O(V)

---

## Usage

```python
from tarjan import (
    tarjan_scc,
    tarjan_scc_count,
    is_strongly_connected,
    tarjan_bridges,
    tarjan_articulation_points
)

# Graph with cycles
graph = {
    1: [2],
    2: [3],
    3: [1],  # Cycle: 1 -> 2 -> 3 -> 1
    4: [5],
    5: [6],
    6: [4]  # Cycle: 4 -> 5 -> 6 -> 4
}

# Find all SCCs
sccs = tarjan_scc(graph)
print(sccs)  # [[1, 2, 3], [4, 5, 6]] or [[4, 5, 6], [1, 2, 3]]

# Count SCCs
count = tarjan_scc_count(graph)
print(count)  # 2

# Check if strongly connected
is_sc = is_strongly_connected(graph)
print(is_sc)  # False

# Find bridges in undirected graph
undirected_graph = {
    1: [2, 3],
    2: [1],
    3: [1, 4],
    4: [3]
}
bridges = tarjan_bridges(undirected_graph)
print(bridges)  # [(3, 4)] or [(4, 3)]

# Find articulation points
ap = tarjan_articulation_points(undirected_graph)
print(ap)  # {3}
```

---

## Important Notes

1. **Single pass**: Only requires one DFS pass (more efficient than Kosaraju's)
2. **Low-link tracking**: Critical concept for identifying SCC roots
3. **Stack maintenance**: Must maintain stack of vertices in current path
4. **Directed graphs**: For SCCs, works on directed graphs
5. **Bridges/AP**: Can also find bridges and articulation points in undirected graphs

---

## Advantages

1. ✅ **Single pass**: Only one DFS pass needed
2. ✅ **Efficient**: O(V + E) time complexity
3. ✅ **Complete**: Finds all strongly connected components
4. ✅ **Versatile**: Can also find bridges and articulation points
5. ✅ **No graph reversal**: Doesn't need to reverse graph

---

## Disadvantages

1. ❌ **More complex**: More complex than Kosaraju's algorithm
2. ❌ **Low-link concept**: Requires understanding of low-link values
3. ❌ **Stack management**: Must carefully manage stack

---

## When to Use

- ✅ Finding strongly connected components (preferred over Kosaraju's)
- ✅ Checking if graph is strongly connected
- ✅ Finding bridges in undirected graphs
- ✅ Finding articulation points in undirected graphs
- ❌ When simplicity is more important (use Kosaraju's)

---

## Comparison: Tarjan vs Kosaraju

| Aspect | Tarjan's | Kosaraju's |
|--------|----------|------------|
| **Passes** | 1 DFS pass | 2 DFS passes |
| **Graph Reversal** | Not required | Required |
| **Complexity** | O(V + E) | O(V + E) |
| **Intuition** | More complex | More intuitive |
| **Memory** | O(V) | O(V) |
| **Bridges/AP** | Can find | Cannot find |

---

## Usage

```python
from tarjan import (
    tarjan_scc,
    tarjan_scc_count,
    is_strongly_connected,
    tarjan_bridges,
    tarjan_articulation_points
)

# Graph with cycles
graph = {
    1: [2],
    2: [3],
    3: [1],  # Cycle: 1 -> 2 -> 3 -> 1
    4: [5],
    5: [6],
    6: [4]  # Cycle: 4 -> 5 -> 6 -> 4
}

# Find all SCCs
sccs = tarjan_scc(graph)
print(sccs)  # [[1, 2, 3], [4, 5, 6]] or [[4, 5, 6], [1, 2, 3]]

# Count SCCs
count = tarjan_scc_count(graph)
print(count)  # 2

# Check if strongly connected
is_sc = is_strongly_connected(graph)
print(is_sc)  # False

# Find bridges in undirected graph
undirected_graph = {
    1: [2, 3],
    2: [1],
    3: [1, 4],
    4: [3]
}
bridges = tarjan_bridges(undirected_graph)
print(bridges)  # [(3, 4)] or [(4, 3)]

# Find articulation points
ap = tarjan_articulation_points(undirected_graph)
print(ap)  # {3}
```

## Testing

Run tests with:

```bash
# Python
python -m unittest tarjan_test.py

# Or run directly
python tarjan_test.py

# Or run the main file to see example usage
python tarjan.py
```

---

## Related Algorithms

- **Kosaraju's Algorithm**: Alternative SCC algorithm (two passes)
- **DFS**: Core traversal algorithm
- **Low-link values**: Key concept for SCC identification

---

## Applications

1. **Compiler Design**: Finding loops and dependencies
2. **Social Networks**: Finding communities
3. **Web Analysis**: Finding related web pages
4. **Network Analysis**: Finding critical edges and vertices
5. **Graph Decomposition**: Breaking graph into components

---

## References

- Tarjan, R. E. (1972). "Depth-first search and linear graph algorithms"
- "Introduction to Algorithms" by CLRS (Chapter 22)
- "Algorithm Design Manual" by Steven Skiena

---

_Last Updated: December 2025_
