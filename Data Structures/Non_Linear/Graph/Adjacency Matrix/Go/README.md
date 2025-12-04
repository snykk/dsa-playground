# Adjacency Matrix - Go

This folder contains a Go implementation of **Adjacency Matrix** graph representation.

An **Adjacency Matrix** is a 2D array representation of a graph where `matrix[i][j]` represents an edge from vertex `i` to vertex `j`.

---

## Concept

- **2D Slice**: `V × V` matrix where V is the number of vertices
- **Unweighted**: Values are `0` (no edge) or `1` (edge exists)
- **Weighted**: Values are edge weights or `Inf` (infinity) if no edge
- **Fast Lookups**: O(1) to check if edge exists
- **Space**: O(V²) - always uses V² space

---

## Operations

| Operation | Description | Time Complexity |
| --------- | ----------- | --------------- |
| `AddEdge(from, to, weight)` | Add an edge between vertices | O(1) |
| `HasEdge(from, to)` | Check if edge exists | O(1) |
| `GetNeighbors(vertex)` | Get all neighbors of a vertex | O(V) |
| `BFS(start)` | Breadth-First Search traversal | O(V²) |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| Initialize | O(V²) | O(V²) |
| Add Edge | O(1) | O(1) |
| Check Edge | O(1) | O(1) |
| Get Neighbors | O(V) | O(V) |
| BFS | O(V²) | O(V) |
| Space | O(V²) | O(V²) |

---

## Usage

```go
package main

import "fmt"

func main() {
    // Unweighted undirected graph
    graph := NewAdjacencyMatrix(5, false, false)
    graph.AddEdge(0, 1, 1.0)
    graph.AddEdge(1, 2, 1.0)

    hasEdge := graph.HasEdge(0, 1)  // true
    neighbors := graph.GetNeighbors(1)  // [0, 2]

    // Weighted directed graph
    weighted := NewAdjacencyMatrix(5, true, true)
    weighted.AddEdge(0, 1, 5.0)
    weighted.AddEdge(1, 2, 3.0)

    bfsResult := weighted.BFS(0)
    fmt.Println(bfsResult)
}
```

---

## Example: Unweighted Undirected Graph

```go
graph := NewAdjacencyMatrix(4, false, false)

// Add edges
graph.AddEdge(0, 1, 1.0)
graph.AddEdge(1, 2, 1.0)
graph.AddEdge(2, 3, 1.0)
graph.AddEdge(3, 0, 1.0)

// Matrix representation:
//     0  1  2  3
//  0 [0  1  0  1]
//  1 [1  0  1  0]
//  2 [0  1  0  1]
//  3 [1  0  1  0]

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

- Matrix uses `math.Inf(1)` for infinity in weighted graphs
- Diagonal is set to `0` (no self-loops by default)
- For undirected graphs, matrix is symmetric
- Vertices are 0-indexed
- Uses `[][]float64` for matrix storage
- Requires `container/list` package for BFS queue

