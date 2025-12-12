# Ford-Fulkerson Algorithm (Go)

**Ford-Fulkerson Algorithm** finds the maximum flow in a flow network using DFS to find augmenting paths.

---

## Overview

Ford-Fulkerson algorithm is a greedy method for computing maximum flow. It repeatedly finds augmenting paths and pushes flow along them.

---

## Complexity Analysis

| Operation | Time | Space |
|-----------|------|-------|
| **Maximum Flow** | O(E × max_flow) | O(V + E) |

---

## Usage

```go
graph := map[int]map[int]int{
    0: {1: 16, 2: 13},
    1: {2: 10, 3: 12},
    2: {1: 4, 4: 14},
    3: {2: 9, 5: 20},
    4: {3: 7, 5: 4},
}

maxFlow := fordFulkerson(graph, 0, 5)
```

---

## Usage

```go
package main

import "fmt"

func main() {
    graph := map[int]map[int]int{
        0: {1: 16, 2: 13},
        1: {2: 10, 3: 12},
        2: {1: 4, 4: 14},
        3: {2: 9, 5: 20},
        4: {3: 7, 5: 4},
    }
    
    maxFlow := fordFulkerson(graph, 0, 5)
    fmt.Printf("Maximum flow: %d\n", maxFlow)  // 23
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

## References

- Ford, L. R., & Fulkerson, D. R. (1956). "Maximal flow through a network"
- "Introduction to Algorithms" by CLRS (Chapter 26)

---

_Last Updated: December 2025_

