# Adjacency Matrix -- Go Implementation

`[][]float64` graph with optional direction and weights. See the [topic README](../README.md) for the theory, the trace and the complexity table.

## Files

- `main.go`: the `AdjacencyMatrix` type plus a small `main` demo
- `main_test.go`: tests (add, neighbors, zero and negative weights)
- `go.mod`: module `adjacency_matrix`

## API

- `NewAdjacencyMatrix(numVertices int, directed, weighted bool) *AdjacencyMatrix`
- `AddEdge(from, to int, weight float64)`: out-of-range vertices are ignored
- `HasEdge(from, to int) bool`: O(1)
- `GetNeighbors(v int) []int`: O(V)
- `BFS(start int) []int`

## Go-Specific Notes

A `[][]bool` presence table records which edges exist; the weight table uses `math.Inf(1)` for absent cells and 0 on the diagonal. There is no `RemoveEdge`, `GetWeight` or `DFS` in the Go version (they exist in Python).

## How to Run

```bash
go test ./...
go run .
```

## Key Takeaways

- Edge lookup is a single indexed read.
- Presence is tracked separately from weights, so weight 0 is a real edge.
- Space is O(V^2) whatever the number of edges.
