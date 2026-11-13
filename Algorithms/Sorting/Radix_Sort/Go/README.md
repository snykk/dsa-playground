# Radix Sort -- Go Implementation

## Files

- `main.go`: `RadixSort` and the unexported `countingSortByDigit`.
- `main_test.go`: tests (basic, negative numbers, extreme values, random input).
- `go.mod`: the Go module for the folder.

## API

- `RadixSort(arr []int)`: LSD radix sort, base 10, in place. Negative values are allowed; an empty slice is a no-op.

```go
arr := []int{170, 45, 75, 90, 802, 24, 2, 66}
RadixSort(arr)
```

## Go-Specific Notes

- The key (`value - minimum`) and the exponent are `uint64`; the modular subtraction gives the exact non-negative distance even when it exceeds the `int` range.
- The loop stops before `exp * 10` could overflow.
- Only `[]int` is supported.

## How to Run

```bash
go test ./...
```

## Key Takeaways

- Shift by the minimum to handle negatives, and do the arithmetic in unsigned 64-bit.
- Each pass is a stable counting sort on one digit.
