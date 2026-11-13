# Bubble Sort -- Go Implementation

## Files

- `main.go`: `BubbleSort` and `BubbleSortGeneric`.
- `main_test.go`: tests (basic, sorted, empty, single, duplicates and negatives, stability of the generic version).
- `go.mod`: module `bubblesort`, Go 1.21.

## API

- `BubbleSort(arr []int)`: sorts in place with early exit.
- `BubbleSortGeneric[T any](arr []T, less func(T, T) bool)`: same algorithm for any element type, ordered by `less`. Stable: it swaps only when `less(arr[j+1], arr[j])` is true.

```go
arr := []int{64, 34, 25, 12, 22, 11, 90}
BubbleSort(arr)
```

## Go-Specific Notes

- Both functions modify the slice in place and return nothing.
- The generic version needs only the `any` constraint, since ordering comes from the `less` function.
- For production code use `sort.Ints` or `slices.Sort`.

## How to Run

```bash
go test ./...
```

## Key Takeaways

- A `less` function makes one sort work for structs and custom orders.
- Equal elements keep their order.
- O(n^2) time, O(1) space.
