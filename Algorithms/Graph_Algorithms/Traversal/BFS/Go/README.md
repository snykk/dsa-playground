# BFS (Breadth-First Search) - Go

**BFS (Breadth-First Search)** is a graph traversal algorithm that explores all vertices at the current depth level before moving to vertices at the next depth level.

---

## Overview

BFS implementation in Go using:
- Slices for queue operations
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

1. **`BFSAdjacencyList(graph, start)`**
   - Basic BFS traversal
   - Returns `[]int` of vertices in BFS order
   - Time: O(V + E), Space: O(V)

2. **`BFSWithPath(graph, start, target)`**
   - Finds shortest path from start to target
   - Returns `[]int` representing path
   - Time: O(V + E), Space: O(V)

3. **`BFSLevelOrder(graph, start)`**
   - Returns vertices grouped by level
   - Returns `[][]int` where each inner slice is a level
   - Time: O(V + E), Space: O(V)

4. **`BFSShortestDistance(graph, start)`**
   - Finds shortest distance to all vertices
   - Returns `map[int]int` mapping vertex to distance
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
    
    // Basic BFS
    result := BFSAdjacencyList(graph, 1)
    fmt.Println(result)  // [1, 2, 4, 3]
    
    // Find shortest path
    path := BFSWithPath(graph, 1, 3)
    fmt.Println(path)  // [1, 2, 3]
    
    // Level order
    levels := BFSLevelOrder(graph, 1)
    fmt.Println(levels)  // [[1], [2, 4], [3]]
    
    // Shortest distances
    distances := BFSShortestDistance(graph, 1)
    fmt.Println(distances)  // map[1:0 2:1 4:1 3:2]
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

1. **Slice-based queue**: Uses slices for queue operations (FIFO)
2. **Map for graph**: Uses `map[int][]int` for adjacency list
3. **Visited tracking**: Uses `map[int]bool` for efficient lookup

---

## Testing

```bash
go test -v
```

---

_Last Updated: December 2025_

