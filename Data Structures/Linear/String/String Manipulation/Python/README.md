# String Manipulation -- Python Implementation

## Files

| File | Contents |
| --- | --- |
| `string_manipulation.py` | the eight functions |
| `string_manipulation_test.py` | unit tests (`from string_manipulation import *`) |

## API

- `reverse_string(s)`: `s[::-1]`.
- `is_palindrome(s)`: `s == s[::-1]`; case sensitive.
- `count_vowels(s)`: characters in `aeiouAEIOU`.
- `replace_char(s, old, new)`: `s.replace(old, new)`; `old` is a substring, and an empty `old` inserts `new` between every character.
- `to_upper(s)`, `to_lower(s)`: `str.upper()` and `str.lower()`.
- `split_string(s, sep=" ")`: `s.split(sep)`; keeps empty fields.
- `join_string(lst, sep=" ")`: `sep.join(lst)`.

## Python-Specific Notes

- Each function is a short wrapper around a built-in, so it is clear and fast, but the file does not implement the algorithms from scratch.
- Strings are sequences of code points: reversing keeps multi-byte characters intact.
- `s.split(" ")` keeps empty fields; `s.split()` without an argument would split on runs of whitespace and drop them.
- Python has no `str.reverse()`; slicing with step -1 builds the reversed copy.
- Build long strings with `"".join(parts)`, not `+=` in a loop.

## How to Run

```bash
cd "Data Structures/Linear/String/String Manipulation/Python"
python3 -m unittest string_manipulation_test
```

The tests cover each function plus empty and single-character strings, palindrome edge cases, split with empty fields, join of zero or one items, substring replacement and a non-ASCII string.

## Key Takeaways

- The built-ins do the work; know what they promise.
- `split(" ")` and `split()` are different operations.
- Reversal and comparison are by code point.
