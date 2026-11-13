# Min Heap -- Go Implementation

Array-backed binary min heap. See the [topic README](../README.md) for the theory, the trace and the complexity table.

## Files

- `main.go`: the `MinHeap` type plus a small `main` demo
- `main_test.go`: tests (duplicates, 1000 random values, empty-heap panics, input not modified)
- `go.mod`: module `min_heap`

## API

- `NewMinHeap() *MinHeap`
- `NewMinHeapFromArray(arr []int) *MinHeap`: heapifies a copy, O(n)
- `Insert(value int)`: O(log n)
- `ExtractMin() int`: panics when empty
- `Peek() int`: panics when empty
- `Size() int`, `IsEmpty() bool`, `Clear()`

## Go-Specific Notes

Values are `int`. Empty-heap reads panic rather than returning an error, matching the exceptions in the other languages. The standard `container/heap` package is the library equivalent.

## How to Run

```bash
go test ./...
go run .
```

## Key Takeaways

- The minimum is always at index 0; insert sifts up, extract min sifts down.
- Building from an array with bottom-up heapify is O(n), cheaper than n inserts.
- Only the root is ordered: the array is not sorted.
