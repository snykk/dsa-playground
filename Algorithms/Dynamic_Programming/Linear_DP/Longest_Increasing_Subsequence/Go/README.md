# Longest Increasing Subsequence -- Go Implementation

The O(n^2) table for the length.

## Files

| File | Contents |
|------|----------|
| `main.go` | `LISDP` |
| `main_test.go` | table-driven test, including duplicates and negative values |
| `go.mod` | module `lis` (Go 1.21) |

## API

| Function | Description | Time | Space |
|----------|-------------|------|-------|
| `LISDP(arr []int) int` | length of the longest strictly increasing subsequence; 0 for an empty slice | O(n^2) | O(n) |

There is no O(n log n) version and no sequence recovery here; the Python folder has both.

## Go-Specific Notes

- The maximum of `dp` is found with an explicit loop.
- Equal values do not extend a run, so `[]int{7, 7, 7, 7}` gives 1.
- The package is `main` with no `main` function, so only `go test` runs it.

## How to Run

```bash
go test ./...
```

## Key Takeaways

- Take the maximum over all entries of `dp`.
- Strict comparison excludes duplicates.
- Quadratic time limits it to a few tens of thousands of elements.
