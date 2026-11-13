# Union-Find Applications -- Go Implementation

A disjoint set union with path compression and union by rank. See the [topic README](../README.md) for the applications.

## Files

| File | Contents |
|------|----------|
| `main.go` | `UnionFind` type and a demo `main` |
| `main_test.go` | `TestUnionFind` and `TestLargeUnion` |
| `go.mod` | Module definition |

## API

- `NewUnionFind(size int) *UnionFind`
- `(*UnionFind).Find(x int) int`: root with path compression.
- `(*UnionFind).Union(x, y int) bool`: `true` if merged, `false` if already connected.
- `(*UnionFind).Connected(x, y int) bool`
- `(*UnionFind).GetCount() int`

## Go-Specific Notes

- There are no bounds checks: an out-of-range index panics, and `NewUnionFind(-1)` panics in `make`.
- There is no `count_components` helper in Go; call `Union` for each edge and read `GetCount()`.
- `Find` is recursive; union by rank keeps trees shallow.

## How to Run

```bash
go test ./...
go run main.go
```

## Key Takeaways

- `Union` returning `false` marks a redundant edge.
- Validate indices yourself before calling `Find` or `Union`.
- The count after all unions is the number of components.
