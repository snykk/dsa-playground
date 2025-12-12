# Topological Sort (C++)

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

---

## Complexity Analysis

| Algorithm | Time | Space |
|-----------|------|-------|
| **Kahn's Algorithm** | O(V + E) | O(V) |

Where:
- V = number of vertices
- E = number of edges

---

## Implementation Details

### Functions

1. **`topologicalSortKahn(graph)`**
   - Kahn's algorithm (BFS-based)
   - Returns topological ordering or empty vector if cycle detected
   - Time: O(V + E), Space: O(V)

2. **`isDAG(graph)`**
   - Check if graph is DAG
   - Returns true if DAG, false otherwise
   - Time: O(V + E), Space: O(V)

---

## Usage

```cpp
#include <unordered_map>
#include <vector>
#include <iostream>
#include "topological_sort.cpp"

int main() {
    std::unordered_map<int, std::vector<int>> graph = {
        {1, {2, 4}},
        {2, {3}},
        {3, {}},
        {4, {}}
    };
    
    auto order = topologicalSortKahn(graph);
    
    // Print ordering
    std::cout << "Topological order: ";
    for (int v : order) {
        std::cout << v << " ";
    }
    std::cout << "\n";  // Output: 1 2 4 3 or 1 4 2 3
    
    // Check if DAG
    bool is_valid = isDAG(graph);
    std::cout << "Is DAG: " << (is_valid ? "true" : "false") << "\n";  // true
    
    return 0;
}
```

## Testing

Run tests with:

```bash
# Compile and run tests
g++ -std=c++11 topological_sort_test.cpp -o test && ./test

# Or compile with main example (uncomment main in topological_sort.cpp)
g++ -std=c++11 topological_sort.cpp -o example && ./example
```

---

## Important Notes

1. **DAG requirement**: Only works on Directed Acyclic Graphs
2. **Cycle detection**: Returns empty vector if cycle detected
3. **Multiple orderings**: There may be multiple valid orderings
4. **In-degree calculation**: Must account for all vertices
5. **C++ containers**: Uses std::unordered_map and std::queue

---

## Advantages

1. ✅ **Efficient**: O(V + E) time complexity
2. ✅ **Simple**: Easy to understand and implement
3. ✅ **Cycle detection**: Can detect cycles
4. ✅ **Queue-based**: Natural BFS approach

---

## Disadvantages

1. ❌ **DAG only**: Doesn't work on graphs with cycles
2. ❌ **Directed only**: Only works on directed graphs
3. ❌ **Memory**: Requires O(V) space for queue and in-degrees

---

## When to Use

- ✅ Task scheduling with dependencies
- ✅ Course prerequisites ordering
- ✅ Build system dependency resolution
- ✅ Event ordering in distributed systems
- ❌ Graphs with cycles (must remove cycles first)
- ❌ Undirected graphs (not applicable)

---

## Compilation

```bash
g++ -std=c++11 topological_sort.cpp topological_sort_test.cpp -o test
./test
```

---

## Testing

Run the test suite:

```bash
g++ -std=c++11 topological_sort_test.cpp -o test && ./test
```

---

## Related Algorithms

- **DFS**: Can be used for DFS-based topological sort
- **BFS**: Used in Kahn's algorithm
- **Cycle Detection**: Topological sort detects cycles

---

## Applications

1. **Task Scheduling**: Order tasks with dependencies
2. **Course Prerequisites**: Determine course order
3. **Build Systems**: Resolve build dependencies
4. **Package Managers**: Resolve package dependencies

---

## References

- Kahn, A. B. (1962). "Topological sorting of large networks"
- "Introduction to Algorithms" by CLRS (Chapter 22)
- "Algorithm Design Manual" by Steven Skiena

---

_Last Updated: December 2025_

