# Prefix Sum and Difference Array -- Go Implementation

Prefix sums for range queries and difference arrays for range updates. See the [topic README](../README.md) for the idea.

## Files

| File | Contents |
|------|----------|
| `main.go` | `PrefixSum`, `DifferenceArray` and a small demo `main` |
| `main_test.go` | Tests for both types for ranges and for an update reaching the last cell |
| `go.mod` | Module definition |

## API

- `NewPrefixSum(arr []int) *PrefixSum`; `(*PrefixSum).Query(left, right int) int`: inclusive range sum.
- `NewDifferenceArray(size int) *DifferenceArray`; `Update(left, right, value int)`; `GetArray() []int`.

## Go-Specific Notes

- Sums are `int` (64-bit on common platforms), not `int64`.
- Indices are not checked; an out-of-range `Query` panics.
- There are no 2D variants or `range_sum_queries`-style helpers; see the Precomputation topic for 2D prefix sums.

## How to Run

```bash
go test ./...
go run main.go
```

## Key Takeaways

- A length `n + 1` prefix slice avoids special cases at index 0.
- `GetArray` returns a fresh slice each time.
- Batch the updates, then read once.
