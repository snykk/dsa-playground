# Boyer-Moore Algorithm -- Go Implementation

Boyer-Moore search with the bad-character rule.

## Files

| File | Contents |
|------|----------|
| `main.go` | package `main`: `buildBadCharTable`, `BoyerMooreSearch`, and a demo `main` |
| `main_test.go` | a table-driven `TestBoyerMooreSearch` (matches, overlaps, no match, empty inputs, the textbook example) and `TestBuildBadCharTable` |
| `go.mod` | module `boyer_moore` |

## API

- `BoyerMooreSearch(text, pattern string) []int`: all start indices, in increasing order; an empty slice for an empty pattern, an empty text, or a pattern longer than the text.
- `buildBadCharTable(pattern string) map[byte]int` (unexported): each byte to its rightmost index.

## Go-Specific Notes

- Strings are indexed by byte, so indices are byte offsets.
- A missing key is detected with the `ok` form of the map lookup, so an absent byte counts as `-1`.
- Only the bad-character rule is implemented.

## How to Run

```bash
go test -v ./...
```

## Key Takeaways

1. The rightmost occurrence goes in the table.
2. Clamp the shift to at least 1.
