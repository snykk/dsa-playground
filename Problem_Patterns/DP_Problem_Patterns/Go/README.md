# DP Problem Patterns -- Go Implementation

The same three DPs as the Python version, as exported functions.

## Files

| File | Description |
|------|-------------|
| `main.go` | `Knapsack01`, `LCS`, `LIS` and a demo `main` |
| `main_test.go` | Tests (4) |
| `go.mod` | Module `dp_patterns` (Go 1.22) |

## API

- `Knapsack01(weights, values []int, capacity int) int`: maximum value, each item once. Returns 0 for no items or a negative capacity. A zero-weight item fits in capacity 0.
- `LCS(text1, text2 string) int`: LCS length, compared byte by byte. O(N * M) time, O(min(N, M)) space.
- `LIS(nums []int) int`: length of the longest strictly increasing subsequence, via `sort.Search`. O(N log N).

## Go-Specific Notes

- Strings are compared by byte, so `LCS` works on ASCII; multi-byte characters would need runes.
- The two LCS rows are kept in sync with `copy(prev, curr)`.
- `sort.Search(len(tails), func(i int) bool { return tails[i] >= num })` is the lower bound.

## How to Run

```bash
go test ./...
go run .
```

## Key Takeaways

- Capacity is processed from high to low so each item is used once.
- Earlier, `Knapsack01` returned 0 for capacity 0 even when a zero-weight item fits; it now matches the Python and C++ versions.
