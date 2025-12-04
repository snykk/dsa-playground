# Edge List - Go

This folder contains a Go implementation of **Edge List** graph representation.

An **Edge List** is a simple way to represent a graph by storing all edges in a list. Each edge is represented as a struct containing the source vertex, destination vertex, and weight.

---

## Concept

- **Slice of Edges**: All edges stored in a slice
- **Edge Structure**: Contains `From`, `To`, and `Weight` fields
- **Space Efficient**: O(E) space - only stores edges
- **Simple Structure**: Easy to understand

---

## Operations

| Operation | Description | Time Complexity |
| --------- | ----------- | --------------- |
| `AddEdge(from, to, weight)` | Add an edge to the graph | O(1) |
| `RemoveEdge(from, to)` | Remove an edge | O(E) |
| `HasEdge(from, to)` | Check if edge exists | O(E) |
| `GetWeight(from, to)` | Get edge weight | O(E) |
| `GetNeighbors(vertex)` | Get all neighbors of a vertex | O(E) |
| `GetEdgeCount()` | Get number of edges | O(1) |
| `BFS(start)` | Breadth-First Search traversal | O(V + E) |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| Add Edge | O(1) | O(1) |
| Remove Edge | O(E) | O(1) |
| Check Edge | O(E) | O(1) |
| Get Neighbors | O(E) | O(V) |
| BFS | O(V + E) | O(V) |
| Space | O(E) | O(E) |

---

## Usage

```go
package main

import "fmt"

func main() {
    // Unweighted undirected graph
    graph := NewEdgeList(false, false)
    graph.AddEdge(1, 2, 1.0)
    graph.AddEdge(2, 3, 1.0)

    hasEdge := graph.HasEdge(1, 2)  // true
    edgeCount := graph.GetEdgeCount()  // 2

    // Weighted directed graph
    weighted := NewEdgeList(true, true)
    weighted.AddEdge(1, 2, 5.0)
    weighted.AddEdge(2, 3, 3.0)

    weight := weighted.GetWeight(1, 2)  // 5.0
    fmt.Println(weight)
}
```

---

## Running Tests

```bash
# Run tests
go test

# Or run specific test file
go test -v
```

---

## Notes

- Uses `[]Edge` slice for edge storage
- Edge struct contains `From int`, `To int`, and `Weight float64`
- For undirected graphs, edges appear twice in the list
- `GetEdgeCount()` returns unique edge count (divides by 2 for undirected)
- BFS uses `container/list` package for queue

