# Meet in the Middle -- Go Implementation

Exact subset-sum existence using meet in the middle with maps as sets.

## Files

| File | Description |
|------|-------------|
| `main.go` | `subsetSumMeetInMiddle` and a demo `main` |
| `main_test.go` | Tests (2) |
| `go.mod` | Module `meet_in_middle` |

## API

- `subsetSumMeetInMiddle(arr []int, target int) bool` (unexported): true if some subset of `arr` (the empty subset counts) sums to exactly `target`. Negative values are allowed. O(2^(n/2)) average time and space.

## Go-Specific Notes

- Each half is a `map[int]bool`; every round builds the new sums in a temporary map and merges them back, so a map is never modified while it is being iterated.
- `int` is 64 bits on common platforms, so overflow is far less likely than in the C++ version.
- It checks existence of an exact sum; the closest-sum variant exists only in the Python version.

## How to Run

```bash
go test ./...
go run .
```

## Key Takeaways

- Map lookups give the combine step in O(1) on average.
- Build new sums in a separate map to avoid changing a map while ranging over it.
