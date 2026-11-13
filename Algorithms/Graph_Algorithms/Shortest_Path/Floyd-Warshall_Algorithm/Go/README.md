# Floyd-Warshall Algorithm - Go

**Floyd-Warshall Algorithm** finds shortest paths between all pairs of vertices in a weighted graph.

---

## Overview

Floyd-Warshall implementation in Go using:
- 2D slice for distance matrix
- `math.MaxInt` for infinity

---

## Complexity Analysis

| Complexity | Time | Space |
|------------|------|-------|
| **All Cases** | O(V³) | O(V²) |

---

## Implementation Details

### Functions

1. **`FloydWarshall(graph, numVertices)`**
   - Finds shortest distances between all pairs
   - Returns 2D slice, or nil if a negative cycle exists
   - Time: O(V³), Space: O(V²)

---

## Usage

```go
package main

import "fmt"

func main() {
    graph := map[int][]struct {
        Neighbor int
        Weight   int
    }{
        0: {{Neighbor: 1, Weight: 4}, {Neighbor: 2, Weight: 2}},
        1: {{Neighbor: 3, Weight: 5}},
        2: {{Neighbor: 3, Weight: 1}},
        3: {},
    }
    
    dist := FloydWarshall(graph, 4)
    fmt.Println(dist[0][3])  // 3
}
```

---

## Running Tests

```bash
go test -v
```

---

_Last Updated: December 2025_


