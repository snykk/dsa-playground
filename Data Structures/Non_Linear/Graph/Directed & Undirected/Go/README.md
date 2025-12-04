# Directed & Undirected Graph - Go

This folder contains a Go implementation of **Graph** that supports both directed and undirected graphs.

A **Graph** is a collection of vertices (nodes) connected by edges. Graphs can be classified based on the direction of their edges.

---

## Concept

- **Directed Graph**: Edges have direction (A → B)
- **Undirected Graph**: Edges are bidirectional (A ↔ B)
- **Adjacency List**: Uses `map[int][]int` for storage
- **Dynamic**: Can add vertices dynamically

---

## Operations

| Operation | Description | Time Complexity |
| --------- | ----------- | --------------- |
| `AddVertex(vertex)` | Add a vertex to the graph | O(1) |
| `AddEdge(from, to)` | Add an edge between vertices | O(1) |
| `RemoveEdge(from, to)` | Remove an edge | O(V) |
| `HasEdge(from, to)` | Check if edge exists | O(V) |
| `GetNeighbors(vertex)` | Get all neighbors of a vertex | O(1) |
| `GetEdges()` | Get all edges in the graph | O(E) |
| `GetDegree(vertex)` | Get degree of a vertex | O(V) |
| `BFS(start)` | Breadth-First Search traversal | O(V + E) |
| `DFS(start)` | Depth-First Search traversal | O(V + E) |
| `IsConnected()` | Check if graph is connected | O(V + E) |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| Add Vertex | O(1) | O(1) |
| Add Edge | O(1) | O(1) |
| Remove Edge | O(V) | O(1) |
| Check Edge | O(V) | O(1) |
| Get Neighbors | O(1) | O(degree) |
| BFS/DFS | O(V + E) | O(V) |
| Space | O(V + E) | O(V + E) |

---

## Usage

```go
package main

import "fmt"

func main() {
    // Undirected graph
    undirectedGraph := NewGraph(false)
    undirectedGraph.AddEdge(1, 2)
    undirectedGraph.AddEdge(2, 3)

    hasEdge := undirectedGraph.HasEdge(1, 2)  // true
    hasReverse := undirectedGraph.HasEdge(2, 1)  // true (bidirectional)

    // Directed graph
    directedGraph := NewGraph(true)
    directedGraph.AddEdge(1, 2)
    directedGraph.AddEdge(2, 3)

    hasEdge = directedGraph.HasEdge(1, 2)  // true
    hasReverse = directedGraph.HasEdge(2, 1)  // false (not bidirectional)

    bfsResult := undirectedGraph.BFS(1)
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

- Uses `map[int][]int` for adjacency list storage
- For undirected graphs, edges are stored in both directions
- Supports dynamic vertex addition
- BFS uses `container/list` package for queue
- DFS uses `container/list` package for stack
- `IsConnected()` only works for undirected graphs (panics if called on directed)

