# Strassen's Matrix Multiplication -- Go Implementation

Strassen's algorithm for square `[][]int` matrices, with a naive cutoff at n <= 64. See the [topic README](../README.md) for the idea and the trace.

## Files

- `main.go` - the algorithm and its helpers (`package main`, no `main` function).
- `main_test.go` - tests, including sizes above the cutoff.
- `go.mod` - the module `strassenmatrix`.

## API

- `StrassenMultiply(A, B [][]int) [][]int` - multiply two n x n matrices. Pads an odd size by one zero row and column.
- `naiveMultiply`, `matrixAdd`, `matrixSubtract`, `splitMatrix`, `combineMatrices`, `padMatrix` - unexported helpers.

```go
C := StrassenMultiply([][]int{{1, 2}, {3, 4}}, [][]int{{5, 6}, {7, 8}}) // [[19 22] [43 50]]
```

## Go-Specific Notes

- Entries are `int` (64-bit on common platforms); overflow wraps silently instead of panicking.
- Only square matrices are supported; there is no rectangular wrapper like Python's `strassen_multiply_general`.
- The folder is `package main` without a `main` function, so `go test` works but `go run .` and `go build` do not.
- Every call allocates new slices for sums and products; there is no reuse of buffers.

## How to Run

From this folder:

```bash
go test ./...
go test -v ./...
```

## Key Takeaways

- Seven recursive products per split give O(n^2.81).
- Odd sizes are padded by one zero row and column, so any square size works.
- The test compares against `naiveMultiply` at sizes 65, 128 and 130.
