# Longest Common Substring -- Go Implementation

Dynamic-programming search for the longest run of characters shared by two strings.

## Files

| File | Contents |
|------|----------|
| `main.go` | package `main`: `LongestCommonSubstring` and a demo `main` |
| `main_test.go` | a table-driven test with exact expected results: the basic case, no common substring, identical strings, one shared character, empty inputs, tie-breaking, overlap, subsequence versus substring |
| `go.mod` | module `longest_common_substring` |

## API

- `LongestCommonSubstring(s1, s2 string) string`: the longest common substring, or `""` if there is none. Among equally long answers, the one that ends first in `s1` wins.

## Go-Specific Notes

- Strings are indexed by byte, so a multi-byte UTF-8 character can be split by the answer; convert to `[]rune` for character-level results.
- The table is a slice of slices built row by row: O(m*n) time and space.
- Slicing the result (`s1[endI-maxLen : endI]`) shares memory with `s1`.
- Only the substring is returned, not its position.

## How to Run

```bash
go test -v ./...
```

## Key Takeaways

1. Reset to 0 on a mismatch; the answer is the largest cell.
2. Two rolling rows would reduce the memory to O(min(m, n)).
