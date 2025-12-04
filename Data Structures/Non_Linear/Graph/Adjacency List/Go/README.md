# Adjacency List - Go

This folder contains a Go implementation of **Adjacency List** graph representation.

An **Adjacency List** is a collection of lists where each list represents the neighbors of a vertex. This is the most common and efficient representation for graphs.

---

## Concept

- **Map of Slices**: Each vertex maps to a slice of edges
- **Edge Structure**: Contains `To` (neighbor) and `Weight` fields
- **Dynamic**: Can add vertices dynamically
- **Space Efficient**: O(V + E) - only stores existing edges

---

## Operations

| Operation | Description | Time Complexity |
| --------- | ----------- | --------------- |
| `AddVertex(vertex)` | Add a vertex to the graph | O(1) |
| `AddEdge(from, to, weight)` | Add an edge between vertices | O(1) |
| `RemoveEdge(from, to)` | Remove an edge | O(V) |
| `HasEdge(from, to)` | Check if edge exists | O(V) |
| `GetNeighbors(vertex)` | Get all neighbors of a vertex | O(1) |
| `BFS(start)` | Breadth-First Search traversal | O(V + E) |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| Initialize | O(V) | O(V) |
| Add Edge | O(1) | O(1) |
| Remove Edge | O(V) | O(1) |
| Check Edge | O(V) | O(1) |
| Get Neighbors | O(1) | O(degree) |
| BFS | O(V + E) | O(V) |
| Space | O(V + E) | O(V + E) |

---

## Usage

```go
package main

import "fmt"

func main() {
    // Unweighted undirected graph
    graph := NewAdjacencyList(false, false)
    graph.AddEdge(1, 2, 1.0)
    graph.AddEdge(2, 3, 1.0)

    hasEdge := graph.HasEdge(1, 2)  // true
    neighbors := graph.GetNeighbors(2)  // [1, 3]

    // Weighted directed graph
    weighted := NewAdjacencyList(true, true)
    weighted.AddEdge(1, 2, 5.0)
    weighted.AddEdge(2, 3, 3.0)

    bfsResult := weighted.BFS(1)
    fmt.Println(bfsResult)
}
```

---

## Example: Unweighted Undirected Graph

```go
graph := NewAdjacencyList(false, false)

// Add edges
graph.AddEdge(0, 1, 1.0)
graph.AddEdge(1, 2, 1.0)
graph.AddEdge(2, 3, 1.0)
graph.AddEdge(3, 0, 1.0)

// Adjacency List representation:
// 0: [{To: 1, Weight: 1.0}, {To: 3, Weight: 1.0}]
// 1: [{To: 0, Weight: 1.0}, {To: 2, Weight: 1.0}]
// 2: [{To: 1, Weight: 1.0}, {To: 3, Weight: 1.0}]
// 3: [{To: 2, Weight: 1.0}, {To: 0, Weight: 1.0}]

// Traverse
bfsResult := graph.BFS(0)  // [0, 1, 3, 2]
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

- Uses `map[int][]Edge` for adjacency list storage
- Edge struct contains `To int` and `Weight float64`
- Supports dynamic vertex addition
- For undirected graphs, adds reverse edges automatically
- BFS uses `container/list` package for queue
- All edges stored with weight (even if unweighted, weight = 1.0)

