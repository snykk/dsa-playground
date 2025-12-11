# Dijkstra's Algorithm - Go

**Dijkstra's Algorithm** finds shortest paths from a source vertex to all other vertices in a weighted graph with non-negative edge weights.

---

## Overview

Dijkstra's algorithm implementation in Go using:
- `container/heap` for priority queue
- `map[int][]struct` for graph representation
- `map[int]bool` for visited tracking

---

## Complexity Analysis

| Complexity | Time | Space |
|------------|------|-------|
| **Binary Heap** | O((V + E) log V) | O(V) |

---

## Implementation Details

### Functions

1. **`Dijkstra(graph, start)`**
   - Finds shortest distances from start to all vertices
   - Returns `map[int]int` mapping vertex to distance
   - Time: O((V + E) log V), Space: O(V)

2. **`DijkstraWithPath(graph, start, target)`**
   - Finds shortest path from start to target
   - Returns `(int, []int)` of (distance, path)
   - Time: O((V + E) log V), Space: O(V)

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
        1: {{Neighbor: 2, Weight: 4}, {Neighbor: 3, Weight: 2}},
        2: {{Neighbor: 4, Weight: 5}},
        3: {{Neighbor: 4, Weight: 1}},
        4: {},
    }
    
    // Find shortest distances
    distances := Dijkstra(graph, 1)
    fmt.Println(distances)  // map[1:0 2:4 3:2 4:3]
    
    // Find shortest path
    distance, path := DijkstraWithPath(graph, 1, 4)
    fmt.Printf("Distance: %d, Path: %v\n", distance, path)
    // Distance: 3, Path: [1 3 4]
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

1. **Priority queue**: Uses `container/heap` for efficient minimum extraction
2. **Graph representation**: Uses struct for edge representation
3. **MaxInt32**: Uses `math.MaxInt32` for infinity

---

## Testing

```bash
go test -v
```

---

_Last Updated: December 2025_


