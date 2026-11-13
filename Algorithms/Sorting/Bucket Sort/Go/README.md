# Bucket Sort -- Go Implementation

## Files

- `main.go`: `BucketSort`.
- `main_test.go`: tests (basic, 1.0 and 0.0, out-of-range panics).
- `go.mod`: the Go module for the folder.

## API

- `BucketSort(arr []float64)`: sorts values in `[0.0, 1.0]` in place using `len(arr)` buckets. Panics with a descriptive message for a value outside the range or NaN. An empty slice is a no-op.

```go
arr := []float64{0.897, 0.565, 0.656, 0.1234, 0.665, 0.3434}
BucketSort(arr)
```

## Go-Specific Notes

- Buckets are a `[][]float64`; each is sorted with `sort.Float64s` (not stable).
- Index `int(x * n)` is clamped to `n - 1` so that `1.0` goes to the last bucket.
- The range check `!(x >= 0 && x <= 1)` rejects NaN as well.
- There is no integer variant.

## How to Run

```bash
go test ./...
```

## Key Takeaways

- Validate the range before indexing; Go would otherwise panic with an index error.
- Linear time needs an even spread of values.
