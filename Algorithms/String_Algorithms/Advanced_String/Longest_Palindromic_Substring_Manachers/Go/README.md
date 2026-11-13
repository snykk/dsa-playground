# Manacher's Algorithm -- Go Implementation

Longest palindromic substring in O(n).

## Files

| File | Contents |
|------|----------|
| `main.go` | package `main`: `Manacher` and a demo `main` |
| `main_test.go` | `TestManacher` (table-driven), `TestSentinelCharactersInInput` and `TestMultiByteRunes` (regressions) |
| `go.mod` | module `manacher` |

## API

- `Manacher(s string) string`: the first longest palindromic substring (the earliest on ties); `""` for an empty string.

## Go-Specific Notes

- Works on runes: it records each rune and its byte offset, runs the algorithm on the runes, and slices the original string at those offsets. A multi-byte character is never split.
- A separator is represented by `-1`, which is never a valid rune, so no input character can collide with it.
- Each invalid UTF-8 byte is read as the replacement rune U+FFFD, so two different invalid bytes compare equal.

## How to Run

```bash
go test -v ./...
```

## Key Takeaways

1. Transform and index the same unit (runes), or multi-byte text breaks the index mapping.
2. A value outside the rune range makes a safe separator.
