# Adjacency List -- Go Implementation

Map-of-slices graph with optional direction and weights. See the [topic README](../README.md) for the theory, the trace and the complexity table.

## Files

- `main.go`: the `AdjacencyList` type, the `Edge` struct and a small `main` demo
- `main_test.go`: tests (add, neighbors, removal on directed and undirected graphs)
- `go.mod`: module `adjacency_list`

## API

- `NewAdjacencyList(directed, weighted bool) *AdjacencyList`
- `AddVertex(v)`, `AddEdge(from, to int, weight float64)`: O(deg(u) + deg(v))
- `RemoveEdge(from, to)`: removes both directions when undirected; unknown vertices are ignored
- `HasEdge(from, to) bool`
- `GetNeighbors(v) []int`: a new slice
- `BFS(start) []int`: empty for an unknown start vertex

## Go-Specific Notes

Edges are `Edge{To, Weight}` structs in a `map[int][]Edge`, whatever the `weighted` flag says: unweighted callers just pass any weight. `RemoveEdge` delegates to an unexported `removeOneWay`, which `AddEdge` also uses to replace an existing edge. Only the operations above exist; DFS, degrees and connectivity are in the Python version only.

## How to Run

```bash
go test ./...
go run .
```

## Key Takeaways

- A map from vertex to a slice of edges, space O(V + E).
- Undirected edges are stored in two slices and must be removed from both.
- `HasEdge` scans one slice: O(deg).
