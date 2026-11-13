# Disjoint Set Union -- Go Implementation

Union by rank plus path compression, with a size slice and a component counter.

## Files

- `main.go`: the `DSU` type and a demo `main`.
- `main_test.go`: unit tests.
- `go.mod`: module file.

## API

| Method | Description | Time |
|--------|-------------|------|
| `NewDSU(n)` | n singleton sets (panics if `n < 0`) | O(n) |
| `Find(x)` | root with path compression (panics outside `[0, n)`) | O(alpha(n)) |
| `Union(x, y)` | merge by rank; true if merged | O(alpha(n)) |
| `Connected(x, y)` | same set? | O(alpha(n)) |
| `GetSize(x)` | size of the set of x | O(alpha(n)) |
| `GetComponentCount()` | number of sets | O(1) |
| `GetComponents()` | map root to member slice | O(n alpha(n)) |
| `GetParent(x)` | raw parent, no compression | O(1) |

## Go-Specific Notes

- Bad input is not checked by the code: a negative size or an out-of-range element panics through Go's own slice bounds checks.
- `GetComponents` returns a map, so iteration order is random.
- `Find` is recursive, with depth at most log2(n).

## How to Run

```bash
go test ./...
go run main.go
```

## Key Takeaways

- Two small optimizations make find and union almost constant.
- Go panics on bad input rather than returning an error.
- `Find(x)` identifies the set; `GetParent` is for tests.
