# Longest Common Subsequence -- Go Implementation

Bottom-up LCS length over a 2D table.

## Files

| File | Contents |
|------|----------|
| `main.go` | `LCSLength` |
| `main_test.go` | table-driven test, in both argument orders |
| `go.mod` | module `lcs` (Go 1.21) |

## API

| Function | Description | Time | Space |
|----------|-------------|------|-------|
| `LCSLength(s1, s2 string) int` | length of the LCS | O(m * n) | O(m * n) |

There is no sequence reconstruction and no two-row version here; the Python folder has both.

## Go-Specific Notes

- Strings are indexed by byte, so a multi-byte UTF-8 character is compared byte by byte. Convert both strings to `[]rune` first for character semantics.
- The table is a slice of slices, `(m + 1) x (n + 1)`.

## How to Run

```bash
go test ./...
```

## Key Takeaways

- Cell `dp[i][j]` compares `s1[i-1]` and `s2[j-1]`.
- A match adds 1 to the diagonal; a mismatch takes the larger of up and left.
- It works on bytes, not runes.
