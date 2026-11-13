# Centroid Decomposition -- Go Implementation

## Files

| File | Contents |
|------|----------|
| `main.go` | the `CentroidDecomposition` type and a demo `main()` |
| `main_test.go` | tests |
| `go.mod` | module `centroid_decomposition` |

## API

| Function | Description |
|----------|-------------|
| `NewCentroidDecomposition(n int, adj [][]int) *CentroidDecomposition` | stores the adjacency list of a tree on `0..n-1` |
| `Build(root int)` | resets state and decomposes the component containing `root` |
| `GetParent() []int` | centroid-tree parent of each node, `-1` for the root (the internal slice, not a copy) |

## Go-Specific Notes

- The size DFS is recursive; Go grows goroutine stacks on demand, so long paths are fine.
- The adjacency list is stored, not copied, and `GetParent` returns the live slice.
- `Build` resets both `parent` and `removed`.

## How to Run

```bash
go test ./...
go run main.go
```

## Key Takeaways

- Same algorithm as Python and C++.
- `Build` can be called repeatedly and gives the same parent array.
