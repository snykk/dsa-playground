# String Manipulation

String manipulation covers the everyday text operations: reverse, palindrome check, vowel count, replace, case conversion, split and join. Each is a single O(n) pass. The two-pointer idea behind reverse and palindrome applies to many interview problems.

## Intuition

Most of these operations look at each character once. Reverse and palindrome use two pointers: one starts at each end and they move toward each other, swapping (reverse) or comparing (palindrome). Split and join are inverses: split cuts at every separator and keeps empty fields, join puts the separator back, so `join(split(s, sep), sep) == s`.

What differs between languages is the unit: Python works on code points, Go on runes (code points) and C++ `std::string` on bytes. That matters for any text outside ASCII.

## Visual

```text
Reverse "hello" with two pointers:

 h e l l o      i = 0, j = 4   swap
 o e l l h      i = 1, j = 3   swap
 o l l e h      i = 2 = j      stop    -> "olleh"

Palindrome "abca":   a b c a
                     i     j   a = a, move in
                       i j     b != c  -> false

Split "a b " on " ":   "a" | "b" | ""      (trailing separator -> empty last field)

C++ byte reversal of "h" + e-acute:   68 C3 A9  ->  A9 C3 68   (invalid UTF-8)
```

## Operations

| Operation | What it does | Time |
| --- | --- | --- |
| `reverse_string` | characters in opposite order | O(n) |
| `is_palindrome` | reads the same both ways; case sensitive, no filtering | O(n) |
| `count_vowels` | number of characters in `aeiouAEIOU` | O(n) |
| `replace_char` | replace occurrences (see below) | O(n) |
| `to_upper`, `to_lower` | case conversion | O(n) |
| `split_string` | split at a separator, keeping empty fields | O(n) |
| `join_string` | join with a separator | O(total length) |

Go names: `ReverseString`, `IsPalindrome`, `CountVowels`, `ReplaceChar`, `ToUpper`, `ToLower`, `SplitString`, `JoinString`.

### How the languages differ

| | Python | C++ | Go |
| --- | --- | --- | --- |
| unit | code points | bytes | runes |
| `replace_char` | replaces every occurrence of a substring (empty `old` inserts between all characters) | replaces one `char` | replaces one rune |
| palindrome | `s == s[::-1]`: O(n) extra space | two pointers on bytes: O(1) extra space | two pointers on a `[]rune`: O(n) space |
| case | Unicode rules | ASCII letters only; bytes >= 0x80 unchanged | Unicode rules |
| split default | `" "` | `' '` | separator required |

### Split and join edge cases (same in all three languages)

| Call | Result |
| --- | --- |
| `split("a b c", " ")` | `["a", "b", "c"]` |
| `split("a b ", " ")` | `["a", "b", ""]` |
| `split("a  b", " ")` | `["a", "", "b"]` |
| `split("", " ")` | `[""]` |
| `join([], "-")` | `""` |
| `join(["x"], "-")` | `"x"` |

Python's `str.split()` with no argument is different (it splits on runs of whitespace and drops empty fields); `split_string` always passes a separator.

## Step-by-Step Trace

Reversing `hello`:

| Step | i | j | String |
| --- | --- | --- | --- |
| start | 0 | 4 | hello |
| swap | 1 | 3 | oellh |
| swap | 2 | 2 | olleh |

Checking `racecar`: `r`=`r`, `a`=`a`, `c`=`c`, then the pointers meet: palindrome. Checking `abca`: `a`=`a`, then `b` != `c`: not a palindrome.

## Complexity

| Operation | Time | Extra space |
| --- | --- | --- |
| reverse | O(n) | O(n) (a new string) |
| palindrome | O(n) | O(1) in C++, O(n) in Python and Go |
| count vowels | O(n) | O(1) |
| replace, case, split | O(n) | O(n) |
| join | O(total length) | O(total length) |

Each one must look at every character, so O(n) is optimal. In Python and Go, building a result with `+=` in a loop is O(n^2); collect pieces and join once. In C++, `+=` on a `std::string` is amortized O(1).

## When to Use

Use these functions for per-character transformations, input cleaning and parsing. For finding a pattern use Pattern Matching; for many edits to a huge text use a Rope; for regular-language matching use a regex library.

## String Manipulation vs. Alternatives

| Need | Use | Why |
| --- | --- | --- |
| per-character transformations | this topic | one pass, simple |
| find a pattern | Pattern Matching (KMP, Boyer-Moore, Rabin-Karp) | avoids the naive O(nm) search |
| many edits to a huge text | Rope | edits in O(log n) |
| classes and repetition | a regex library | more expressive |

## Common Pitfalls

- Treating bytes as characters: C++ `reverse_string` corrupts UTF-8.
- `split()` versus `split(" ")` in Python.
- Forgetting the empty field after a trailing separator.
- `+=` in a loop on immutable strings.
- Two-pointer off-by-one: start `j` at `n - 1`, loop while `i < j`, and handle the empty string.
- C++: calling `toupper` on a signed `char` (undefined for bytes >= 0x80); the code casts to `unsigned char`.
- Python `replace_char` with an empty `old` inserts between every character.
- Go `ReverseString` converts to runes, so invalid UTF-8 bytes become the replacement character; it is not an exact inverse for such input.

## Implementations

| Language | Folder | Main file | Notes |
| --- | --- | --- | --- |
| Python | [`Python/`](Python) | `string_manipulation.py` | one-line library wrappers; code points |
| C++ | [`C++/`](C++) | `string_manipulation.cpp` | byte-based; two-pointer palindrome |
| Go | [`Go/`](Go) | `main.go` | package `manipulation`; rune-based |

## Practice Problems

- [Reverse String](https://leetcode.com/problems/reverse-string/)
- [Valid Palindrome](https://leetcode.com/problems/valid-palindrome/)
- [Reverse Words in a String](https://leetcode.com/problems/reverse-words-in-a-string/)
- [Reverse Vowels of a String](https://leetcode.com/problems/reverse-vowels-of-a-string/)
- [String Compression](https://leetcode.com/problems/string-compression/)

## Related

- [Introduction to Strings](../String_Basics)
- [Pattern Matching](../../../../Algorithms/String_Algorithms/Pattern_Matching/)
- [Rope](../Rope)
- [Two Pointers](../../../../Problem_Patterns/Two_Pointers)
