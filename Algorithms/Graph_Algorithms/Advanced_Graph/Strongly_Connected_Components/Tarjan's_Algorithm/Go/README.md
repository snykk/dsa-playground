# Tarjan's Algorithm (Go)

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

Where:
- V = number of vertices
- E = number of edges

**Note**: Single DFS pass makes it more efficient than Kosaraju's in practice.

---

## Implementation Details

### Functions

1. **`TarjanSCC(graph)`**
   - Finds all strongly connected components
   - Returns slice of slices, each inner slice is an SCC
   - Time: O(V + E), Space: O(V)

2. **`TarjanSCCCount(graph)`**
   - Counts number of strongly connected components
   - Returns integer count
   - Time: O(V + E), Space: O(V)

3. **`IsStronglyConnected(graph)`**
   - Checks if graph is strongly connected (one SCC)
   - Returns true if strongly connected, false otherwise
   - Time: O(V + E), Space: O(V)

---

## Usage

```go
package main

import "fmt"

func main() {
    graph := map[int][]int{
        1: {2},
        2: {3},
        3: {1},  // Cycle: 1 -> 2 -> 3 -> 1
        4: {5},
        5: {6},
        6: {4},  // Cycle: 4 -> 5 -> 6 -> 4
    }
    
    sccs := TarjanSCC(graph)
    fmt.Printf("Number of SCCs: %d\n", len(sccs))  // 2
    
    // Check if strongly connected
    is_sc := IsStronglyConnected(graph)
    fmt.Printf("Is strongly connected: %v\n", is_sc)  // false
}
```

---

## Important Notes

1. **Single pass**: Only requires one DFS pass (more efficient than Kosaraju's)
2. **Low-link tracking**: Critical concept for identifying SCC roots
3. **Stack maintenance**: Must maintain stack of vertices in current path
4. **Directed graphs**: For SCCs, works on directed graphs
5. **Go slices**: Uses slices for stack implementation

---

## Advantages

1. ✅ **Single pass**: Only one DFS pass needed
2. ✅ **Efficient**: O(V + E) time complexity
3. ✅ **Complete**: Finds all strongly connected components
4. ✅ **No graph reversal**: Doesn't need to reverse graph

---

## Disadvantages

1. ❌ **More complex**: More complex than Kosaraju's algorithm
2. ❌ **Low-link concept**: Requires understanding of low-link values
3. ❌ **Stack management**: Must carefully manage stack

---

## When to Use

- ✅ Finding strongly connected components (preferred over Kosaraju's)
- ✅ Checking if graph is strongly connected
- ✅ When single pass is important
- ❌ When simplicity is more important (use Kosaraju's)

---

## Usage

```go
package main

import "fmt"

func main() {
    graph := map[int][]int{
        1: {2},
        2: {3},
        3: {1},  // Cycle: 1 -> 2 -> 3 -> 1
        4: {5},
        5: {6},
        6: {4},  // Cycle: 4 -> 5 -> 6 -> 4
    }
    
    sccs := TarjanSCC(graph)
    fmt.Printf("Number of SCCs: %d\n", len(sccs))  // 2
    
    is_sc := IsStronglyConnected(graph)
    fmt.Printf("Is strongly connected: %v\n", is_sc)  // false
}
```

## Testing

Run tests with:

```bash
# Run tests
go test -v

# Or run the main file to see example usage
go run main.go
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

---

## References

- Tarjan, R. E. (1972). "Depth-first search and linear graph algorithms"
- "Introduction to Algorithms" by CLRS (Chapter 22)
- "Algorithm Design Manual" by Steven Skiena

---

_Last Updated: December 2025_

