# Heavy-Light Decomposition -- Go Implementation

## Files

| File | Contents |
|------|----------|
| `main.go` | the `HLD` type and a demo `main()` |
| `main_test.go` | tests (LCA, rebuild) |
| `go.mod` | module `heavy_light_decomposition` |

## API

| Function | Description |
|----------|-------------|
| `NewHLD(n int, adj [][]int) *HLD` | stores the adjacency list of a tree on `0..n-1` |
| `Build(root int)` | resets state and builds the decomposition |
| `LCA(u, v int) int` | lowest common ancestor, O(log n) |

There is no path-query or segment-tree API in Go; only `LCA`.

## Go-Specific Notes

- `dfsSize` and `decompose` are recursive; Go grows its stack on demand, so deep trees are fine.
- The adjacency list is stored, not copied.

## How to Run

```bash
go test ./...
go run main.go
```

## Key Takeaways

- The Go version implements the decomposition and LCA only.
- `Build` resets `heavy`, `parent`, `depth`, `size` and the position counter, so it can be repeated.
