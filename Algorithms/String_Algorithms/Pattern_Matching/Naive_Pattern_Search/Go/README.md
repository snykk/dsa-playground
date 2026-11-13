# Naive Pattern Search -- Go Implementation

Brute-force search for every occurrence of a pattern.

## Files

| File | Contents |
|------|----------|
| `main.go` | package `main`: `NaivePatternSearch`, `NaivePatternSearchCount`, `NaivePatternSearchFirst`, and a demo `main` |
| `main_test.go` | table-driven tests for search, count and first (matches, overlaps, empty inputs, a pattern longer than the text, a match at the end) |
| `go.mod` | module `naive_pattern_search` |

## API

- `NaivePatternSearch(text, pattern string) []int`: all start indices, in increasing order; an empty slice for an empty pattern, an empty text, or a pattern longer than the text. O(n*m).
- `NaivePatternSearchCount(text, pattern string) int`: the number of occurrences.
- `NaivePatternSearchFirst(text, pattern string) int`: the first index or `-1`.

## Go-Specific Notes

- Strings are indexed by byte, so indices are byte offsets.
- A search that finds nothing for valid input returns a nil slice; the early exits return `[]int{}`.
- `strings.Index` is the standard-library way to find a substring.

## How to Run

```bash
go test -v ./...
```

## Key Takeaways

1. Try every start `0..n-m`.
2. Keep the algorithm as the oracle for faster searches.
