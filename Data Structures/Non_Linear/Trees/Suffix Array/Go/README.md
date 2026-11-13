# Suffix Array -- Go Implementation

A suffix array built by sorting suffix strings, with binary-search pattern lookup.

## Files

| File | Contents |
|------|----------|
| `main.go` | package `main`: `SuffixArray`, `NewSuffixArray`, `Search`, and a small demo `main` |
| `main_test.go` | `TestSearch` (table-driven: matches, absent, empty pattern), `TestSuffixOrder`, `TestEmptyText` |
| `go.mod` | module `suffix_array` |

## API

- `NewSuffixArray(text string) *SuffixArray`: builds the sorted suffix indices.
- `(*SuffixArray).Search(pattern string) []int`: all start indices, in increasing order; an empty slice if absent. An empty pattern returns `0..n-1` on a non-empty text.

## Go-Specific Notes

- Suffixes are `text[i:]` slices that share the text's memory, so construction is O(n) in memory. The sort still compares long shared prefixes, so the worst-case time is O(n^2 log n).
- `Search` uses `strings.HasPrefix` on a slice, with no copying: it matches the O(m log n) bound.
- Indices are byte offsets.

## How to Run

```bash
go test ./...
```

## Key Takeaways

1. Go's string slices make the suffix list cheap in memory.
2. Two binary searches (first and last match) return all occurrences.
