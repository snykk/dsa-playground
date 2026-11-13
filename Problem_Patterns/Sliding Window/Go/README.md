# Sliding Window -- Go Implementation

Fixed and variable windows over arrays and strings. See the [topic README](../README.md) for the idea.

## Files

| File | Contents |
|------|----------|
| `main.go` | The four functions and a demo `main` |
| `main_test.go` | Table-driven tests, including `k <= 0` and negative sums |
| `go.mod` | Module definition |

## API

- `maxSumSubarray(arr []int, k int) int`: 0 if `k <= 0` or `k > len(arr)`.
- `longestSubstringKDistinct(s string, k int) int`
- `minWindowSubstring(s, t string) string`
- `longestSubstringNoRepeat(s string) int`

## Go-Specific Notes

- Strings are indexed by byte (`map[byte]int`), so multi-byte UTF-8 characters count as several.
- The functions are unexported; call them from within the package.
- `int` is 64-bit on common platforms, so sums rarely overflow.

## How to Run

```bash
go test ./...
go run main.go
```

## Key Takeaways

- Both pointers only move forward, so the pass is O(n).
- Delete zero counts so the map size means "distinct characters".
- For the shortest window, record the answer inside the shrink loop.
