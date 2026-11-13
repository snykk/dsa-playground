# Bellman-Ford Algorithm - Go

**Bellman-Ford Algorithm** finds shortest paths from a source vertex to all other vertices in a weighted graph, even with negative edge weights.

---

## Overview

Bellman-Ford implementation in Go using:
- Edge list representation
- `map[int]int` for distances
- `math.MaxInt` for infinity

---

## Complexity Analysis

| Complexity | Time | Space |
|------------|------|-------|
| **All Cases** | O(V * E) | O(V) |

---

## Implementation Details

### Functions

1. **`BellmanFord(edges, numVertices, start)`**
   - Finds shortest distances from start to all vertices
   - Returns `map[int]int` or nil if negative cycle exists
   - Panics if an edge endpoint is outside `0..numVertices-1`
   - Time: O(V * E), Space: O(V)

---

## Usage

```go
package main

import "fmt"

func main() {
    edges := []Edge{
        {0, 1, 4},
        {0, 2, 2},
        {1, 3, 5},
        {2, 3, 1},
    }
    
    distances := BellmanFord(edges, 4, 0)
    fmt.Println(distances)  // map[0:0 1:4 2:2 3:3]
}
```

---

## Running Tests

```bash
go test -v
```

---

_Last Updated: December 2025_


