# Weighted & Unweighted Graph - Go

This folder contains a Go implementation of **Weighted Graph** that supports both weighted and unweighted edges.

A **Weighted Graph** is a graph where edges have associated weights (costs, distances, or values). An **Unweighted Graph** treats all edges as having equal weight (typically 1).

---

## Concept

- **Edge Weights**: Each edge can have a weight value
- **Edge Structure**: Contains `To` (neighbor) and `Weight` fields
- **Unweighted Default**: Default weight is 1.0 for unweighted edges
- **Adjacency List**: Uses `map[int][]Edge` for storage

---

## Operations

| Operation | Description | Time Complexity |
| --------- | ----------- | --------------- |
| `AddVertex(vertex)` | Add a vertex to the graph | O(1) |
| `AddEdge(from, to, weight)` | Add a weighted edge | O(1) |
| `RemoveEdge(from, to)` | Remove an edge | O(V) |
| `HasEdge(from, to)` | Check if edge exists | O(V) |
| `GetWeight(from, to)` | Get edge weight | O(V) |
| `GetNeighbors(vertex)` | Get all neighbors | O(1) |
| `GetTotalWeight()` | Get sum of all edge weights | O(E) |
| `BFS(start)` | Breadth-First Search | O(V + E) |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| Add Edge | O(1) | O(1) |
| Get Weight | O(V) | O(1) |
| Get Neighbors | O(1) | O(degree) |
| BFS | O(V + E) | O(V) |
| Total Weight | O(E) | O(1) |

---

## Usage

```go
package main

import "fmt"

func main() {
    graph := NewWeightedGraph(false)
    graph.AddEdge(1, 2, 5.0)
    graph.AddEdge(2, 3, 3.0)

    weight := graph.GetWeight(1, 2)  // 5.0
    total := graph.GetTotalWeight()  // 8.0

    bfsResult := graph.BFS(1)
    fmt.Println(bfsResult)
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

- Uses `map[int][]Edge` for adjacency list storage
- Edge struct contains `To int` and `Weight float64`
- Default weight is 1.0 if not specified
- For undirected graphs, both directions have same weight
- BFS uses `container/list` package for queue

