# Edit Distance -- Go Implementation

Bottom-up Levenshtein distance over a 2D table.

## Files

| File | Contents |
|------|----------|
| `main.go` | `EditDistance` |
| `main_test.go` | table-driven test, including the swapped argument order |
| `go.mod` | module `editdistance` (Go 1.21) |

## API

| Function | Description | Time | Space |
|----------|-------------|------|-------|
| `EditDistance(s1, s2 string) int` | minimum number of inserts, deletes and replaces | O(m * n) | O(m * n) |

It returns only the distance, with no traceback and no two-row version.

## Go-Specific Notes

- Strings are indexed by byte, so a UTF-8 character that takes two bytes counts as two edits. Convert to `[]rune` first for character semantics.
- The three-way minimum is written with explicit comparisons and a local named `best`, which avoids shadowing the `min` builtin of Go 1.21.

## How to Run

```bash
go test ./...
```

## Key Takeaways

- The table is `(m + 1) x (n + 1)`; cell `dp[i][j]` compares `s1[i-1]` and `s2[j-1]`.
- The distance is symmetric, and the test checks both argument orders.
- It works on bytes, not runes.
