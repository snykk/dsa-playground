# Maximum Subarray (Kadane's Algorithm) -- Go Implementation

The one-pass sum.

## Files

| File | Contents |
|------|----------|
| `main.go` | `KadaneAlgorithm` |
| `main_test.go` | table-driven test |
| `go.mod` | module `kadane` (Go 1.21) |

## API

| Function | Description | Time | Space |
|----------|-------------|------|-------|
| `KadaneAlgorithm(arr []int) int` | maximum subarray sum; 0 for an empty slice | O(n) | O(1) |

There is no window (index) version here; the Python folder has one.

## Go-Specific Notes

- It uses the "restart when `currentSum < 0`" form rather than `max`, which is equivalent.
- `int` is 64 bits on 64-bit platforms, so overflow is unlikely in practice.
- The package is `main` with no `main` function, so only `go test` runs it.

## How to Run

```bash
go test ./...
```

## Key Takeaways

- Start from `arr[0]` so all-negative input works.
- One pass, two variables.
- Empty input returns 0 by convention.
