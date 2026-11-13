# Weighted & Unweighted Graphs -- Go Implementation

`map[int][]Edge` adjacency list. See the [topic README](../README.md) for the theory, the trace and the complexity table.

## Files

- `main.go`: the `WeightedGraph` type, the `Edge` struct and a small `main` demo
- `main_test.go`: tests (weights, total weight, undirected removal)
- `go.mod`: module `weighted_graph`

## API

- `NewWeightedGraph(directed bool) *WeightedGraph`
- `AddVertex(v)`, `AddEdge(from, to int, weight float64)`, `RemoveEdge(from, to int)`
- `HasEdge(from, to) bool`, `GetWeight(from, to) float64` (-1.0 when absent)
- `GetNeighbors(v) []int`
- `GetTotalWeight() float64`, `BFS(start) []int`

## Go-Specific Notes

`AddEdge` always needs a weight; pass 1.0 for an unweighted edge. Edges are `Edge{To, Weight}` structs, and `RemoveEdge` removes both directions when the graph is undirected. `GetWeight` uses -1.0 for "absent", which is also a legal weight; call `HasEdge` first when negative weights are possible. `GetTotalWeight` builds string keys to count each undirected edge once.

## How to Run

```bash
go test ./...
go run .
```

## Key Takeaways

- Pass 1.0 for unweighted edges.
- Re-adding an edge updates its weight.
- `GetWeight` returning -1.0 is ambiguous with negative weights.
