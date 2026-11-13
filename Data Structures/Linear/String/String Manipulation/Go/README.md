# String Manipulation -- Go Implementation

## Files

| File | Contents |
| --- | --- |
| `main.go` | package `manipulation` with the eight functions |
| `main_test.go` | tests in package `manipulation` |
| `go.mod` | module `string_manipulation` |

## API

- `ReverseString(s string) string`: reverses the runes.
- `IsPalindrome(s string) bool`: two indexes over a `[]rune`; case sensitive.
- `CountVowels(s string) int`: runes in `aeiouAEIOU`.
- `ReplaceChar(s string, oldr, newr rune) string`: replaces every occurrence of one rune.
- `ToUpper(s string) string`, `ToLower(s string) string`: `strings.ToUpper` and `strings.ToLower`.
- `SplitString(s, sep string) []string`: `strings.Split`; keeps empty fields.
- `JoinString(arr []string, sep string) string`: `strings.Join`.

## Go-Specific Notes

- Converting a string to `[]rune` decodes UTF-8 into code points and costs O(n) space. Invalid bytes become U+FFFD, so `ReverseString` is not an exact inverse for invalid UTF-8.
- `IsPalindrome` compares runes directly instead of comparing `s` with a re-encoded reversed copy, so a lone invalid byte counts as a palindrome.
- Strings are immutable; use `strings.Builder` to build results incrementally.
- `strings.Split("", " ")` returns `[""]`, one empty field, as the other languages now do.
- The tests are sequential `if` checks; they are not table-driven, except `TestIsPalindromeEdgeCases`.

## How to Run

```bash
cd "Data Structures/Linear/String/String Manipulation/Go"
go test ./...
```

## Key Takeaways

- Rune slices give character-level access at O(n) space.
- The standard `strings` package covers case, split, join and replace.
- Compare in place instead of building a reversed copy when you only need a yes or no.
