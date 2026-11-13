# Kosaraju's Algorithm -- Go Implementation

SCCs with two DFS passes. For the idea, the trace and the complexity, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `main.go` | `KosarajuSCC`, `KosarajuSCCCount`, `IsStronglyConnected` and a demo `main` |
| `main_test.go` | 6 tests: basic count, strongly connected, component contents, neighbour-only vertex, self-loop and empty graph, a 200000-vertex cycle |
| `go.mod` | Module definition (`go 1.21`) |

## API

- `KosarajuSCC(graph map[int][]int) [][]int`: the components, source components first (an empty graph returns an empty slice).
- `KosarajuSCCCount(graph map[int][]int) int`: number of components.
- `IsStronglyConnected(graph map[int][]int) bool`: exactly one component.

## Go-Specific Notes

- **Recursive closures** `dfs1` and `dfs2`. Goroutine stacks start small (about 2 KB) and grow on demand, so a cycle of 200000 vertices is fine.
- **Maps.** Visited sets and the reversed graph are maps, so any `int` is a vertex id and a vertex that is only a neighbour gets an entry when the reverse edge is added.
- **Random iteration order.** Map iteration is randomised, so the order of unrelated components can change between runs. The partition does not.
- **No condensation function** (Python has one).

## How to Run

```bash
go test ./...
go run main.go      # demo
```

## Key Takeaways

1. The finish-order list is a slice; pass 2 walks it backwards.
2. Maps make the code independent of vertex numbering.
3. Compare components after sorting: their order is not stable in Go.
