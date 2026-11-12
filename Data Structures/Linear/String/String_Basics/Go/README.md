# Introduction to Strings -- Go Implementation

## Files

| File | Contents |
| --- | --- |
| `main.go` | package `intro` with the five string functions |
| `main_test.go` | tests in package `intro` |
| `go.mod` | module `introduction` |

## API

- `AccessChar(s string, index int) byte`: `s[index]`; panics out of range. O(1).
- `StringLength(s string) int`: `len(s)`, in bytes. O(1).
- `TraverseString(s string) []rune`: the code points of `s`. O(n).
- `Concatenate(s1, s2 string) string`. O(n + m).
- `Substring(s string, start, end int) string`: bytes `s[start:end]`, with both ends clamped to `[0, len(s)]`; an empty range gives `""`. O(1), no copy.

## Go-Specific Notes

- A Go string is an immutable byte sequence, usually UTF-8. `len(s)` and `s[i]` work on bytes; `[]rune(s)` or `for range` decode code points.
- `Substring`, `AccessChar` and `StringLength` use bytes; `TraverseString` returns runes. For ASCII the two agree; for other text a byte cut can split a character, and `len(TraverseString(s))` differs from `StringLength(s)`.
- Slicing shares the original bytes, so a small substring of a huge string keeps the huge string alive.
- Build long strings with `strings.Builder`, not `+=` in a loop.
- The tests are sequential tests with a small table for the bounds cases.

## How to Run

```bash
cd "Data Structures/Linear/String/String_Basics/Go"
go test ./...
```

## Key Takeaways

- Strings are bytes; runes are an explicit decoding step.
- Clamp ranges before slicing to avoid a panic.
- Slices of strings are O(1) and share memory.
