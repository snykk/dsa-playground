# Z-Algorithm -- Go Implementation

The Z-array and a linear-time pattern search built on it.

## Files

| File | Contents |
|------|----------|
| `main.go` | package `main`: `buildZArray`, `ZAlgorithmSearch`, and a demo `main` |
| `main_test.go` | `TestZAlgorithmSearch` and `TestBuildZArray`, both table-driven |
| `go.mod` | module `z_algorithm` |

## API

- `ZAlgorithmSearch(text, pattern string) []int`: all start indices, in increasing order; an empty slice for an empty pattern, an empty text, or a pattern longer than the text. O(n + m).
- `buildZArray(s string) []int` (unexported): the Z-array, with `z[0] = 0`. O(n).

## Go-Specific Notes

- Strings are indexed by byte, so indices are byte offsets.
- The search keeps positions with `z[i] >= m`; `>=` is required because a `$` inside the input can make `z[i]` exceed `m`.
- The search returns `nil` (not an empty slice) when the loop finds nothing for non-empty valid input; the early exits return `[]int{}`.

## How to Run

```bash
go test -v ./...
```

## Key Takeaways

1. The Z-box never moves left, which gives the linear bound.
2. Test `>=`, not `==`, for matches.
