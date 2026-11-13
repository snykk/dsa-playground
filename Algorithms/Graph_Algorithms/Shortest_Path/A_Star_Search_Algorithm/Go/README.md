# A* Search Algorithm - Go

**A* Search Algorithm** is an informed search algorithm that finds the shortest path using a heuristic function.

---

## Overview

A* implementation in Go using:
- `container/heap` for priority queue
- Function type for heuristic
- `map[int][]struct` for graph representation

---

## Complexity Analysis

| Complexity | Time | Space |
|------------|------|-------|
| **Worst Case** | O(b^d) | O(b^d) |

---

## Implementation Details

### Functions

1. **`AStar(graph, start, goal, heuristic)`**
   - Finds shortest path from start to goal
   - Returns `(int, []int)` of (distance, path)
   - Time: O(b^d), Space: O(b^d)

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
    
    heuristic := func(node int) int {
        if node == 3 {
            return 0
        }
        return 1
    }
    
    distance, path := AStar(graph, 0, 3, heuristic)
    fmt.Printf("Distance: %d, Path: %v\n", distance, path)
    // Distance: 3, Path: [0 2 3]
}
```

---

## Running Tests

```bash
go test -v
```

---

_Last Updated: December 2025_


