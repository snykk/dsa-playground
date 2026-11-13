# Tarjan's SCC Algorithm -- Go Implementation

SCCs in one DFS pass. For the idea, the trace and the complexity, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `main.go` | `TarjanSCC`, `TarjanSCCCount`, `IsStronglyConnected` and a demo `main` |
| `main_test.go` | 6 tests: basic count, strongly connected, component contents and order, neighbour-only vertex, self-loop and empty graph, a 200000-vertex cycle |
| `go.mod` | Module definition (`go 1.21`) |

## API

- `TarjanSCC(graph map[int][]int) [][]int`: components, sinks first (an empty graph returns an empty slice).
- `TarjanSCCCount(graph map[int][]int) int`: number of components.
- `IsStronglyConnected(graph map[int][]int) bool`: exactly one component.

## Go-Specific Notes

- **Recursive closure** `strongConnect`. Goroutine stacks start at about 2 KB and grow on demand, so a 200000-vertex cycle is fine.
- **Maps.** `indices`, `lowLink` and `onStack` are maps, so any `int` is a vertex id, and vertices that only appear as neighbours are handled.
- **Random iteration order.** Map iteration is randomised, so the order of unrelated components can change between runs; sink-before-source order always holds.
- **Bridges** are not in the Go version; see `Tarjan_Bridges_Articulation`.

## How to Run

```bash
go test ./...
go run main.go      # demo
```

## Key Takeaways

1. The stack slice and the `onStack` map are the heart of the algorithm.
2. Compare components after sorting: vertex order inside and between unrelated components varies.
3. Reverse topological output is what 2-SAT needs.
