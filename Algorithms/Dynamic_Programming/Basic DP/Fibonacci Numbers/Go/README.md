# Fibonacci Numbers -- Go Implementation

Two ways to compute Fibonacci numbers with `int64` results.

## Files

| File | Contents |
|------|----------|
| `main.go` | the functions below |
| `main_test.go` | tests: values, agreement of both versions for `n = 0..92`, negative input |
| `go.mod` | module `fibonacci` (Go 1.21) |

## API

| Function | Description | Time | Space |
|----------|-------------|------|-------|
| `FibonacciTabulation(n int) int64` | bottom-up table | O(n) | O(n) |
| `FibonacciOptimized(n int) int64` | two variables | O(n) | O(1) |

Both panic for a negative `n`. There is no memoized, naive, matrix or sequence version here; the Python folder has them.

## Go-Specific Notes

- `F(92)` is the largest value that fits in `int64`. For `n >= 93` the sum wraps around silently, so the result is wrong without any error.
- Go has no recursion limit problem for these functions, since both are loops.
- The package is `main` with no `main` function, so only `go test` runs it.

## How to Run

```bash
go test ./...
```

## Key Takeaways

- Results are exact for `n <= 92` only; Go does not report overflow.
- The loop with two variables is the one to use.
- A negative `n` panics.
