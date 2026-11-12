# Directed & Undirected Graphs -- Go Implementation

One `Graph` type for both kinds, stored as `map[int][]int`. See the [topic README](../README.md) for the theory, the trace and the complexity table.

## Files

- `main.go`: the `Graph` type plus a small `main` demo
- `main_test.go`: tests (add, remove, copy semantics, traversals, connectivity)
- `go.mod`: module `graph`

## API

- `NewGraph(directed bool) *Graph`
- `AddVertex(v)`, `AddEdge(u, v)`, `RemoveEdge(u, v)`
- `HasEdge(u, v)`, `GetNeighbors(u)` (a new slice), `GetVertices()`, `GetEdges()`
- `BFS(start)`, `DFS(start)`, `DFSRecursive(start)`
- `IsConnected()`: panics on a directed graph
- `GetDegree(u)`: directed graphs return in-degree plus out-degree

## Go-Specific Notes

`GetVertices` and `GetEdges` iterate over maps, so the order of their results is not deterministic; sort before comparing. `RemoveEdge` ignores unknown vertices instead of creating empty entries.

## How to Run

```bash
go test ./...
go run .
```

## Key Takeaways

- The `directed` flag controls only whether the reverse entry is stored.
- Results from map iteration have no fixed order.
- `IsConnected` is defined only for undirected graphs.
