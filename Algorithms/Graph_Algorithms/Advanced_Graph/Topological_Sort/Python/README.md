# Topological Sort (Python)

**Topological Sort** is a linear ordering of vertices in a directed acyclic graph (DAG) such that for every directed edge (u, v), vertex u comes before v in the ordering.

---

## Overview

Topological sort is used to find a valid ordering of tasks with dependencies. It only works on Directed Acyclic Graphs (DAGs) - graphs with no cycles. If a cycle exists, topological sort is impossible.

**Example**:
- Graph: 1 → 2 → 3, 1 → 4
- Valid orderings: [1, 2, 4, 3] or [1, 4, 2, 3]
- Note: 1 must come before 2 and 4, 2 must come before 3

---

## Algorithm

### Kahn's Algorithm (BFS-based)

1. **Calculate in-degrees**: Count incoming edges for each vertex
2. **Initialize queue**: Add all vertices with in-degree 0
3. **Process**: While queue is not empty:
   - Remove vertex from queue
   - Add to result
   - Reduce in-degree of all neighbors
   - Add neighbors with in-degree 0 to queue
4. **Check**: If result contains all vertices, return ordering; else cycle exists

### DFS-based Algorithm

1. **DFS traversal**: Perform DFS on graph
2. **Track recursion stack**: Detect cycles using recursion stack
3. **Add to result**: When finishing DFS of vertex, add to result
4. **Reverse**: Reverse result (DFS gives reverse topological order)

---

## Complexity Analysis

| Algorithm | Time | Space |
|-----------|------|-------|
| **Kahn's Algorithm** | O(V + E) | O(V) |
| **DFS-based** | O(V + E) | O(V) |
| **All Orders** | O(V! × E) | O(V) |

Where:
- V = number of vertices
- E = number of edges

**Note**: Both algorithms have same complexity. Kahn's is more intuitive, DFS-based is more memory efficient.

---

## Implementation Details

### Functions

1. **`topological_sort_kahn(graph)`**
   - Kahn's algorithm (BFS-based)
   - Returns topological ordering or None if cycle detected
   - Time: O(V + E), Space: O(V)

2. **`topological_sort_dfs(graph)`**
   - DFS-based algorithm
   - Returns topological ordering or None if cycle detected
   - Time: O(V + E), Space: O(V)

3. **`topological_sort_all_orders(graph)`**
   - Find all possible topological orderings
   - Uses backtracking
   - Returns list of all valid orderings
   - Time: O(V! × E), Space: O(V)

4. **`is_dag(graph)`**
   - Check if graph is DAG
   - Returns True if DAG, False otherwise
   - Time: O(V + E), Space: O(V)

5. **`longest_path_dag(graph, weights, source=None)`**
   - Find longest path in weighted DAG
   - Uses topological sort
   - Returns dictionary of longest distances for every vertex: from `source` if given (`-inf` if unreachable), otherwise from any vertex with no incoming edges; `{}` if the graph has a cycle
   - Time: O(V + E), Space: O(V)

---

## Usage

```python
from topological_sort import (
    topological_sort_kahn,
    topological_sort_dfs,
    topological_sort_all_orders,
    is_dag,
    longest_path_dag
)

# Basic topological sort
graph = {
    1: [2, 4],
    2: [3],
    3: [],
    4: []
}
order = topological_sort_kahn(graph)
print(order)  # [1, 2, 4, 3] or [1, 4, 2, 3]

# Check if DAG
graph_with_cycle = {
    1: [2],
    2: [3],
    3: [1]  # Cycle!
}
is_valid = is_dag(graph_with_cycle)
print(is_valid)  # False

# Find all orderings
all_orders = topological_sort_all_orders(graph)
print(all_orders)  # [[1, 2, 3, 4], [1, 2, 4, 3], [1, 4, 2, 3]]

# Longest path in weighted DAG
graph = {0: [1, 2], 1: [3], 2: [3], 3: []}
weights = {(0, 1): 5, (0, 2): 3, (1, 3): 2, (2, 3): 4}
distances = longest_path_dag(graph, weights)
print(distances)  # {0: 0, 1: 5, 2: 3, 3: 7}
```

---

## Important Notes

1. **DAG requirement**: Only works on Directed Acyclic Graphs
2. **Cycle detection**: Returns None if cycle detected
3. **Multiple orderings**: There may be multiple valid orderings
4. **In-degree calculation**: Must account for all vertices
5. **Edge cases**: Handle empty graph, single vertex, disconnected components

---

## Advantages

1. ✅ **Efficient**: O(V + E) time complexity
2. ✅ **Simple**: Easy to understand and implement
3. ✅ **Cycle detection**: Can detect cycles
4. ✅ **Multiple algorithms**: Both Kahn's and DFS-based available

---

## Disadvantages

1. ❌ **DAG only**: Doesn't work on graphs with cycles
2. ❌ **Directed only**: Only works on directed graphs
3. ❌ **All orders expensive**: Finding all orderings is exponential

---

## When to Use

- ✅ Task scheduling with dependencies
- ✅ Course prerequisites ordering
- ✅ Build system dependency resolution
- ✅ Event ordering in distributed systems
- ❌ Graphs with cycles (must remove cycles first)
- ❌ Undirected graphs (not applicable)

---

## Applications

1. **Task Scheduling**: Order tasks with dependencies
2. **Course Prerequisites**: Determine course order
3. **Build Systems**: Resolve build dependencies
4. **Package Managers**: Resolve package dependencies
5. **Event Ordering**: Order events in distributed systems

---

## Usage

```python
from topological_sort import (
    topological_sort_kahn,
    topological_sort_dfs,
    topological_sort_all_orders,
    is_dag,
    longest_path_dag
)

# Basic topological sort
graph = {
    1: [2, 4],
    2: [3],
    3: [],
    4: []
}
order = topological_sort_kahn(graph)
print(order)  # [1, 2, 4, 3] or [1, 4, 2, 3]

# Check if DAG
graph_with_cycle = {
    1: [2],
    2: [3],
    3: [1]  # Cycle!
}
is_valid = is_dag(graph_with_cycle)
print(is_valid)  # False

# Find all orderings
all_orders = topological_sort_all_orders(graph)
print(all_orders)  # [[1, 2, 3, 4], [1, 2, 4, 3], [1, 4, 2, 3]]

# Longest path in weighted DAG
graph = {0: [1, 2], 1: [3], 2: [3], 3: []}
weights = {(0, 1): 5, (0, 2): 3, (1, 3): 2, (2, 3): 4}
distances = longest_path_dag(graph, weights)
print(distances)  # {0: 0, 1: 5, 2: 3, 3: 7}
```

## Testing

Run tests with:

```bash
# Python
python -m unittest topological_sort_test.py

# Or run directly
python topological_sort_test.py

# Or run the main file to see example usage
python topological_sort.py
```

---

## Related Algorithms

- **DFS**: Used in DFS-based topological sort
- **BFS**: Used in Kahn's algorithm
- **Longest Path**: Can use topological sort for DAG longest path
- **Cycle Detection**: Topological sort detects cycles

---

## References

- Kahn, A. B. (1962). "Topological sorting of large networks"
- "Introduction to Algorithms" by CLRS (Chapter 22)
- "Algorithm Design Manual" by Steven Skiena

---

_Last Updated: December 2025_
