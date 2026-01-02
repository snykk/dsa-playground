# Graph Coloring - Go

This folder contains a Go implementation of **Graph Coloring** using backtracking.

---

## Concept

Colors a graph with minimum number of colors such that no two adjacent vertices have the same color. Uses backtracking to find a valid coloring.

**Key Features:**
- Backtracking algorithm
- Finds minimum chromatic number
- Validates coloring constraints

---

## Functions

| Function | Description | Time Complexity |
|----------|-------------|----------------|
| `isSafe(graph, v, color, c)` | Check if color c is safe for vertex v | O(V) |
| `graphColoring(graph, m)` | Color graph with m colors | O(m × k^n) |
| `chromaticNumber(graph)` | Find minimum colors needed | O(V × m × k^n) |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| Graph Coloring | O(m × k^n) | O(n) |
| Chromatic Number | O(V × m × k^n) | O(n) |
| Safety Check | O(V) | O(1) |

---

## Usage

```go
graph := [][]int{
    {0, 1, 1, 1},
    {1, 0, 1, 0},
    {1, 1, 0, 1},
    {1, 0, 1, 0},
}

color := graphColoring(graph, 3)
if color != nil {
    fmt.Printf("Coloring: %v\n", color)
}

chromNum := chromaticNumber(graph)
fmt.Printf("Chromatic number: %d\n", chromNum)
```

---

## Running Tests

```bash
go test
```

---

_Last Updated: December 2025_

