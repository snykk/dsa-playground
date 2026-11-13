# Heap Sort -- Go Implementation

## Files

- `main.go`: `HeapSort` and `heapify`.
- `main_test.go`: tests (basic sort and a table of edge cases: empty, single, duplicates, sorted, reversed).
- `go.mod`: the Go module for the folder.

## API

- `HeapSort(arr []int)`: sorts in place.
- `heapify(arr []int, n, i int)`: unexported sift-down used by `HeapSort`.

```go
arr := []int{64, 34, 25, 12, 22, 11, 90}
HeapSort(arr)
```

## Go-Specific Notes

- Signed `int` indices make `n/2 - 1` safe for an empty slice: the loops simply do not run.
- `heapify` is recursive, using O(log n) stack.
- Not stable. For production code use `slices.Sort` or `sort.Ints`, or `container/heap` for a priority queue.

## How to Run

```bash
go test ./...
```

## Key Takeaways

- Build bottom-up, then extract the maximum to the end.
- O(n log n) in every case.
