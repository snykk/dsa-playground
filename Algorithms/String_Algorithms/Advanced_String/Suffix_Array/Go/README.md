# Suffix Array -- Go Implementation

Suffix array construction by sorting, with binary-search pattern lookup.

## Files

| File | Contents |
|------|----------|
| `main.go` | package `main`: `BuildSuffixArray`, `SearchPattern`, `GetSuffixes`, `LongestCommonPrefix`, the `SuffixArray` type, and a demo `main` |
| `main_test.go` | tests: all indices present, search counts and indices, no match, a single character, an empty text, the exact order of `banana`, exact results, the empty pattern, overlaps, sorted suffixes, LCP of two suffixes, the type, a random comparison with brute force |
| `go.mod` | module `suffix_array` |

## API

- `BuildSuffixArray(s string) []int`: the start indices of the suffixes in sorted order.
- `SearchPattern(suffixArray []int, text, pattern string) []int`: all start indices, in increasing order; `nil` when absent. An empty pattern returns `0..n-1` on a non-empty text.

- `GetSuffixes(suffixArray []int, text string) []string`: the suffixes in sorted order.
- `LongestCommonPrefix(text string, i, j int) int`: common prefix length of the suffixes starting at `i` and `j`, O(n).
- `NewSuffixArray(text)` returns a `*SuffixArray` with methods `Search`, `Suffixes`, `LongestCommonPrefix`.

## Go-Specific Notes

- Suffixes are slices (`s[i:]`) that share the string's memory, so the list takes O(n) memory. The sort still compares long shared prefixes: O(n^2 log n) worst-case time.
- Search uses `strings.HasPrefix` on a slice, with no copying: O(m log n).
- Indices are byte offsets.

## How to Run

```bash
go test -v ./...
```

## Key Takeaways

1. Go's string slices avoid the memory cost that Python and C++ pay.
2. Two binary searches return every occurrence.
