# Pattern Matching -- Go Implementation

Naive search and KMP, each returning a `[]int` of start indices.

## Files

| File | Contents |
|------|----------|
| `main.go` | package `pattern`: `NaiveSearch`, `ComputeLPS`, `KMPSearch` |
| `main_test.go` | `TestPatternMatching` (the `ababcabcabc` / `abc` fixture), `TestEmptyPattern`, and a table-driven `TestEdgeCases` (pattern longer than the text, empty text, overlapping matches, no match) |
| `go.mod` | module `pattern_matching` |

## API

- `NaiveSearch(text, pattern string) []int`: compare every window. O(n*m).
- `ComputeLPS(pattern string) []int`: the LPS table. O(m).
- `KMPSearch(text, pattern string) []int`: KMP search. O(n + m).

An empty pattern returns `[0, 1, ..., n]` from both searches; no match returns an empty, non-nil slice. Rabin-Karp and Boyer-Moore exist only in the Python version of this topic.

## Go-Specific Notes

- Strings are indexed by **byte**, so offsets are byte offsets. Convert both strings to `[]rune` first for rune-level matching.
- Slicing a string (`text[i:i+m]`) does not copy, so the naive search allocates nothing per alignment.
- `strings.Index` is the standard-library answer for finding a substring.
- Results are built with `append` on a slice that starts empty (`[]int{}`), so callers can compare with `reflect.DeepEqual` against `[]int{}`.

## How to Run

```bash
go test -v ./...
```

## Key Takeaways

1. KMP reads each text byte a bounded number of times: the LPS table lets `j` fall back without moving `i`.
2. Guard `m == 0` before indexing the pattern.
3. Use `strings.Index` in production code.
