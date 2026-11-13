# Climbing Stairs -- Go Implementation

The two-variable loop for steps 1 and 2.

## Files

| File | Contents |
|------|----------|
| `main.go` | `ClimbingStairs` |
| `main_test.go` | tests: values up to `n = 90`, zero, and a negative `n` |
| `go.mod` | module `climbingstairs` (Go 1.21) |

## API

| Function | Description | Time | Space |
|----------|-------------|------|-------|
| `ClimbingStairs(n int) int64` | number of ways to climb `n` stairs with steps 1 and 2; `ClimbingStairs(0)` is 1 | O(n) | O(1) |

It panics for a negative `n`. There is no memoized or variable-step version here; the Python folder has them.

## Go-Specific Notes

- The result is `int64` and exact up to `n = 91`. For larger `n` the sum wraps around silently.
- The package is `main` with no `main` function, so only `go test` runs it.

## How to Run

```bash
go test ./...
```

## Key Takeaways

- `ways(n) = F(n + 1)`.
- Go does not report overflow, so bound `n` yourself.
- A negative `n` panics.
