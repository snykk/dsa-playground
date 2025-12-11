# DFS (Depth-First Search) - Go

**DFS (Depth-First Search)** is a graph traversal algorithm that explores as far as possible along each branch before backtracking.

---

## Overview

DFS implementation in Go using:
- Slices for stack operations
- `map[int][]int` for adjacency list representation
- `map[int]bool` for visited tracking

---

## Complexity Analysis

| Complexity | Time | Space |
|------------|------|-------|
| **All Cases** | O(V + E) | O(V) |

---

## Implementation Details

### Functions

1. **`DFSAdjacencyList(graph, start)`**
   - Iterative DFS traversal
   - Returns `[]int` of vertices in DFS order
   - Time: O(V + E), Space: O(V)

2. **`DFSRecursive(graph, start)`**
   - Recursive DFS traversal
   - More intuitive but uses recursion stack
   - Time: O(V + E), Space: O(V)

3. **`DFSWithPath(graph, start, target)`**
   - Finds path from start to target
   - Returns `[]int` representing path
   - Time: O(V + E), Space: O(V)

4. **`DFSDetectCycle(graph, directed)`**
   - Detects cycle in graph
   - Works for both directed and undirected graphs
   - Time: O(V + E), Space: O(V)

---

## Usage

```go
package main

import "fmt"

func main() {
    graph := map[int][]int{
        1: {2, 4},
        2: {3},
        3: {},
        4: {},
    }
    
    // Basic DFS
    result := DFSAdjacencyList(graph, 1)
    fmt.Println(result)  // [1, 4, 2, 3] (order may vary)
    
    // Recursive DFS
    result = DFSRecursive(graph, 1)
    fmt.Println(result)  // [1, 2, 3, 4]
    
    // Find path
    path := DFSWithPath(graph, 1, 3)
    fmt.Println(path)  // [1, 2, 3]
    
    // Detect cycle
    hasCycle := DFSDetectCycle(graph, false)
    fmt.Println(hasCycle)  // false
}
```

---

## Running Tests

```bash
go test
```

Or with verbose output:

```bash
go test -v
```

---

## Important Notes

1. **Slice-based stack**: Uses slices for stack operations (LIFO)
2. **Map for graph**: Uses `map[int][]int` for adjacency list
3. **Visited tracking**: Uses `map[int]bool` for efficient lookup

---

## Testing

```bash
go test -v
```

---

_Last Updated: December 2025_

