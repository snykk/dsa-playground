# Union-Find (Disjoint Set Union) -- Go Implementation

`UnionFind` with path compression and union by rank. For the idea, the trace and the complexity, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `main.go` | `UnionFind`, `UnionFindCycleDetection` and a demo `main` |
| `main_test.go` | 5 tests: basics, cycle detection, the README arrays, a repeated union, a 10^6-union chain |
| `go.mod` | Module definition (`go 1.21`) |

## API

- `NewUnionFind(n int) *UnionFind`: elements `0..n-1`.
- `(*UnionFind).Find(x int) int`: the root, with path compression.
- `(*UnionFind).Union(x, y int) bool`: merge by rank; false if already in one set.
- `(*UnionFind).Connected(x, y int) bool` and `GetCount() int`.
- `UnionFindCycleDetection(edges [][]int, n int) bool`.

There are no components, MST or largest-component helpers in Go (Python has them).

## Go-Specific Notes

- **Recursive `Find`.** Union by rank keeps trees at most `log2(n)` high, and goroutine stacks grow anyway (10^6 chained unions are tested).
- **No bounds checks.** An id outside `0..n-1` panics with an index out of range.
- **Slices** `parent` and `rank` are unexported but the test file (same package) reads them to check the trace.
- **Method name** is `Union` here, `unite` in C++ and `union` in Python.

## How to Run

```bash
go test ./...
go run main.go      # demo
```

## Key Takeaways

1. Path compression and union by rank are a few lines each.
2. `Union` returning false marks a cycle-closing edge.
3. Validate ids before calling if the input is untrusted.
