# String Manipulation (Go)

Common string manipulation operations including reversal, palindrome checking, case conversion, and splitting/joining.

## Files

| File | Description |
|------|-------------|
| `main.go` | Core string manipulation functions |
| `main_test.go` | Unit tests for all functions |
| `go.mod` | Go module definition |

## How to Run

```bash
# Run tests
go test ./...

# Run tests with verbose output
go test -v ./...
```

## Key Functions

| Function | Description | Time Complexity |
|----------|-------------|-----------------|
| `ReverseString` | Reverses a string using rune swap (Unicode-safe) | O(n) |
| `IsPalindrome` | Checks if a string reads the same forwards and backwards | O(n) |
| `CountVowels` | Counts vowel characters (upper and lower case) in a string | O(n) |
| `ReplaceChar` | Replaces all occurrences of a rune with another rune | O(n) |
| `ToUpper` | Converts a string to upper case | O(n) |
| `ToLower` | Converts a string to lower case | O(n) |
| `SplitString` | Splits a string by a separator into a slice | O(n) |
| `JoinString` | Joins a string slice with a separator | O(n) |

## Complexity

| Aspect | Complexity |
|--------|-----------|
| Time | O(n) per operation where n is the string length |
| Space | O(n) -- each function returns a new string |

## Notes

- `ReverseString` converts to `[]rune` for correct handling of multi-byte Unicode characters.
- `IsPalindrome` delegates to `ReverseString` for a simple equality check.
- Most functions wrap Go's standard `strings` package for idiomatic implementations.

---

_Last Updated: April 2026_
