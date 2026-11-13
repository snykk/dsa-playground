# Square Root Decomposition -- Go Implementation

## Files

| File | Contents |
|------|----------|
| `main.go` | the `SqrtDecomposition` type and a demo `main()` |
| `main_test.go` | tests |
| `go.mod` | module `square_root_decomposition` |

## API

| Function | Description |
|----------|-------------|
| `NewSqrtDecomposition(arr []int) *SqrtDecomposition` | copies `arr`, block size at least 1 |
| `Update(index, value int)` | sets `arr[index]`, O(1) |
| `Query(left, right int) int` | inclusive range sum, O(sqrt n) |

## Go-Specific Notes

- The slice is copied, so `Update` never changes the caller's slice.
- Sums are `int` (64-bit on most platforms).
- Indices are not validated; a bad index panics.

## How to Run

```bash
go test ./...
go run main.go
```

## Key Takeaways

- Same algorithm as Python and C++.
- Empty input is safe: the block size is clamped to 1.
