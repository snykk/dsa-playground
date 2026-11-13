# Coordinate Compression -- Go Implementation

Maps `int` values to dense ranks `0..k-1` with a `map` and `sort.Ints`.

## Files

| File | Description |
|------|-------------|
| `main.go` | `compressCoordinates`, `decompressCoordinates`, `compress2DCoordinates` and a demo `main` |
| `main_test.go` | Tests (4) |
| `go.mod` | Module `coordinate_compression` |

## API

These functions are unexported (package `main`):

- `compressCoordinates(coords []int) map[int]int`: value to rank in sorted order.
- `decompressCoordinates(mapping map[int]int) []int`: the values in rank order.
- `compress2DCoordinates(points [][]int) (map[int]int, map[int]int)`: independent x and y mappings; each point is a slice `{x, y}`.

## Go-Specific Notes

- Go map iteration order is random, so the code collects the distinct values and sorts them before assigning ranks.
- To rank a value that is not in the data, keep the sorted slice and use `sort.SearchInts`.
- `compress2DCoordinates` panics if a point has fewer than two elements.

## How to Run

```bash
go test ./...
go run .
```

## Key Takeaways

- Sort the distinct values; the rank is the index.
- Never rely on map iteration order.
