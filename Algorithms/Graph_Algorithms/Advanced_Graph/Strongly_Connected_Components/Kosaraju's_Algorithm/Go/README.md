# Kosaraju's Algorithm (Go)

**Kosaraju's Algorithm** finds all strongly connected components (SCCs) in a directed graph. A strongly connected component is a maximal set of vertices where every vertex is reachable from every other vertex in the component.

---

## Overview

Kosaraju's algorithm is one of the most intuitive algorithms for finding strongly connected components. It uses two DFS passes:
1. First DFS on original graph to determine finish times
2. Second DFS on reversed graph in order of decreasing finish times

**Example**:
- Graph: 1 → 2 → 3 → 1 (cycle), 4 → 5 → 6 → 4 (cycle)
- SCCs: {1, 2, 3} and {4, 5, 6}
- Each cycle forms a strongly connected component

---

## Algorithm

1. **First DFS**: Perform DFS on original graph
   - Record finish times (when DFS finishes exploring vertex)
   - Add vertices to finish order when backtracking
2. **Reverse Graph**: Create transpose of graph (reverse all edges)
3. **Second DFS**: Perform DFS on reversed graph
   - Process vertices in reverse finish order (from first DFS)
   - Each DFS tree in second pass is one SCC

**Key Insight**: In reversed graph, vertices in same SCC are still reachable from each other, but vertices in different SCCs are not.

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

**Note**: Two DFS passes, each O(V + E), so total is still O(V + E).

---

## Implementation Details

### Functions

1. **`KosarajuSCC(graph)`**
   - Finds all strongly connected components
   - Returns slice of slices, each inner slice is an SCC
   - Time: O(V + E), Space: O(V)

2. **`KosarajuSCCCount(graph)`**
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
    
    sccs := KosarajuSCC(graph)
    fmt.Printf("Number of SCCs: %d\n", len(sccs))  // 2
    
    // Check if strongly connected
    is_sc := IsStronglyConnected(graph)
    fmt.Printf("Is strongly connected: %v\n", is_sc)  // false
}
```

---

## Important Notes

1. **Directed graphs**: Only works on directed graphs
2. **Two DFS passes**: Requires two complete DFS traversals
3. **Graph reversal**: Must reverse graph for second pass
4. **Finish order**: Critical to process in reverse finish order
5. **Go maps**: Uses map[int][]int for graph representation

---

## Advantages

1. ✅ **Intuitive**: Easy to understand algorithm
2. ✅ **Efficient**: O(V + E) time complexity
3. ✅ **Complete**: Finds all strongly connected components
4. ✅ **Simple implementation**: Straightforward DFS-based

---

## Disadvantages

1. ❌ **Two passes**: Requires two DFS passes
2. ❌ **Graph reversal**: Must reverse graph (O(E) operation)
3. ❌ **Memory**: Requires O(V) space for visited and finish order

---

## When to Use

- ✅ Finding strongly connected components
- ✅ Checking if graph is strongly connected
- ✅ Cycle detection in directed graphs
- ❌ Undirected graphs (use DFS for connected components)
- ❌ When only need to know if cycle exists (simpler algorithms)

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
    
    sccs := KosarajuSCC(graph)
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

- **Tarjan's Algorithm**: Alternative SCC algorithm (single pass)
- **DFS**: Used in both passes
- **Graph Reversal**: Transpose operation

---

## Applications

1. **Compiler Design**: Finding loops and dependencies
2. **Social Networks**: Finding communities
3. **Web Analysis**: Finding related web pages
4. **Circuit Design**: Finding feedback loops

---

## References

- Kosaraju, S. R. (1978). "Analysis of structured programs"
- "Introduction to Algorithms" by CLRS (Chapter 22)
- "Algorithm Design Manual" by Steven Skiena

---

_Last Updated: December 2025_

