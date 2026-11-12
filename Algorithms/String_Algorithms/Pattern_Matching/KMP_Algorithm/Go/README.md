# KMP Algorithm -- Go Implementation

Knuth-Morris-Pratt search with an LPS table.

## Files

| File | Contents |
|------|----------|
| `main.go` | package `main`: `BuildLPS`, `KMPSearch`, `KMPSearchCount`, `KMPSearchFirst`, and a demo `main` |
| `main_test.go` | `TestKMPSearch` (table-driven: matches, overlaps, empty inputs, a pattern longer than the text) and `TestBuildLPS` |
| `go.mod` | module `kmp` |

## API

- `BuildLPS(pattern string) []int`: the LPS table. O(m).
- `KMPSearch(text, pattern string) []int`: all start indices, in increasing order; an empty slice for an empty pattern, an empty text, or a pattern longer than the text. O(n + m).
- `KMPSearchCount(text, pattern string) int`: the number of occurrences.
- `KMPSearchFirst(text, pattern string) int`: the first index or `-1`.

## Go-Specific Notes

- Strings are indexed by byte, so indices are byte offsets.
- When a valid search finds nothing, the result is a nil slice; the early exits return `[]int{}`.
- `strings.Index` is the standard-library way to find a substring.

## How to Run

```bash
go test -v ./...
```

## Key Takeaways

1. Only the pattern pointer falls back on a mismatch.
2. `lps[j-1]` is the border to keep.
