# Edge List -- Go Implementation

Slice-based edge list with optional direction and weights. See the [topic README](../README.md) for the theory, the trace and the complexity table.

## Files

- `main.go`: the `EdgeList` type, the `Edge` struct and a small `main` demo
- `main_test.go`: tests (add, weights, self-loops, undirected removal)
- `go.mod`: module `edge_list`

## API

- `NewEdgeList(directed, weighted bool) *EdgeList`
- `AddEdge(from, to int, weight float64)`: O(E)
- `RemoveEdge(from, to int)`: removes both entries when undirected
- `HasEdge(from, to) bool`, `GetWeight(from, to) float64` (-1.0 when absent or unweighted)
- `GetNeighbors(v) []int`
- `GetEdgeCount() int`: undirected edges and self-loops counted once
- `BFS(start) []int`

## Go-Specific Notes

Edges are `Edge{From, To, Weight}` structs in one slice; unweighted graphs store weight 1.0. `RemoveEdge` rebuilds the slice, so it allocates. `get_edges`, `dfs`, `is_connected` and `to_adjacency_list` exist only in the Python version.

## How to Run

```bash
go test ./...
go run .
```

## Key Takeaways

- Every query is a scan of the slice: O(E).
- An undirected edge takes two entries, a self-loop one.
- `GetWeight` returns -1.0 for "absent", which can be a legal weight.
