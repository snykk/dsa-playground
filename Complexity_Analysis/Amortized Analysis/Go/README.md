# Amortized Analysis -- Go Implementation

## Files

- `main.go`: `DynamicArray`, `BinaryCounter` and `DemonstrateAmortizedAnalysis` (package `main`, so it cannot be imported).
- `main_test.go`: tests, including the zero-capacity regression and the aggregate bounds.
- `go.mod`: the Go module for the folder.

## API

- `NewDynamicArray(initialCapacity int) *DynamicArray`: `Append(value)`, `Get(index)` (panics out of range); fields `size`, `capacity`, `copies`.
- `NewBinaryCounter(nBits int) *BinaryCounter`: `Increment()`, `GetValue()`; fields `bits`, `flips`.

```go
arr := NewDynamicArray(1)
for i := 0; i < 1000; i++ {
    arr.Append(i)
}
// arr.copies <= 2000
```

## Go-Specific Notes

- This code manages its own backing slice to count the copies. Go's built-in `append` also grows geometrically (2x for small slices, then a smaller factor), so it is amortized O(1) as well.
- The growth rule uses the built-in `max(1, capacity*2)` (Go 1.21 or newer), so capacity 0 is safe.
- Benchmarks (`go test -bench`) report cost per operation over many iterations, which is what an amortized bound describes.

## How to Run

```bash
cd "Complexity_Analysis/Amortized Analysis/Go"
go test ./...
go run .
```

## Key Takeaways

- A resize costs O(n), but doubling makes the total of `n` appends O(n): O(1) amortized.
- Amortized is a worst-case bound over a sequence, not an average over random input.
- The tests assert the aggregate bounds: copies at most 2n and bit flips at most 2n.

