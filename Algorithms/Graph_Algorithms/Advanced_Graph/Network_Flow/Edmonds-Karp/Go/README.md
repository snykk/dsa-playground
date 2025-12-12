# Edmonds-Karp Algorithm (Go)

**Edmonds-Karp Algorithm** finds the maximum flow using BFS, guaranteeing polynomial time complexity.

---

## Complexity Analysis

| Operation | Time | Space |
|-----------|------|-------|
| **Maximum Flow** | O(V × E²) | O(V + E) |

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

maxFlow := edmondsKarp(graph, 0, 5)
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
    
    maxFlow := edmondsKarp(graph, 0, 5)
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

- Edmonds, J., & Karp, R. M. (1972). "Theoretical improvements in algorithmic efficiency"
- "Introduction to Algorithms" by CLRS (Chapter 26)

---

_Last Updated: December 2025_

