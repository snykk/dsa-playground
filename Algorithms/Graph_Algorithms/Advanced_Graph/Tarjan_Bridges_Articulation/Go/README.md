# Tarjan's Bridges and Articulation Points -- Go Implementation

One O(V + E) DFS that finds the bridges and the articulation points of an undirected graph. For the idea, the trace and the rules, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `main.go` | `FindBridgesAndArticulations(n, edges) Result`, the `Edge` and `Result` types, and a demo `main` |
| `main_test.go` | 12 separate test functions: standard shapes, parallel edges, a cycle with a bridge, a self-loop, a 200000-vertex path |
| `go.mod` | Module definition (`go 1.21`) |

## API

- `type Edge struct{ U, V int }`: an undirected edge.
- `type Result struct{ Bridges []Edge; Articulations []int }`.
- `FindBridgesAndArticulations(n int, edges []Edge) Result`: vertices are `0..n-1`; bridges are sorted `(min, max)` edges, articulation points are sorted.

## Go-Specific Notes

- **Recursive closure.** The inner `dfs` is a function variable that closes over `disc`, `low` and the result sets. Goroutine stacks start at about 2 KB and grow on demand, so a 200000-vertex path works.
- **Sets** are `map[Edge]struct{}` and `map[int]struct{}`; the output is sorted at the end because map iteration is random.
- **Edge ids** in `adjEntry{to, edgeID}` handle parallel edges.
- **Labels.** A vertex label outside `0..n-1` panics with an index out of range.

## How to Run

```bash
go test ./...
go run main.go      # demo: triangle with a tail
```

## Key Takeaways

1. `map[K]struct{}` is the Go idiom for a set.
2. Sort results before comparing them: map order is not stable.
3. The algorithm is the same as in Python and C++; only the DFS is recursive here.
