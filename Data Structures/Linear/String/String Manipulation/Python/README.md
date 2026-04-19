# String Manipulation — Python Implementation

This folder implements **eight common string operations** from scratch: reverse, palindrome check, vowel count, character replacement, case conversion, split, and join. The point isn't to replace `str.reverse()` — it's to internalize what each builtin actually costs.

For the conceptual overview and cross-language comparison, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `string_manipulation.py` | Reference implementations of all eight operations |
| `string_manipulation_test.py` | Unit tests covering empty strings, unicode, and mixed case |

---

## Operations Covered

| Operation | Builtin equivalent | Complexity |
|-----------|-------------------|------------|
| `reverse_string(s)` | `s[::-1]` | O(n) |
| `is_palindrome(s)` | `s == s[::-1]` | O(n) |
| `count_vowels(s)` | `sum(c in "aeiou" for c in s)` | O(n) |
| `replace_char(s, old, new)` | `s.replace(old, new)` | O(n) |
| `to_upper(s)` / `to_lower(s)` | `s.upper()` / `s.lower()` | O(n) |
| `split_string(s, sep)` | `s.split(sep)` | O(n) |
| `join_string(parts, sep)` | `sep.join(parts)` | O(total length) |

---

## Python-Specific Notes

- **Slicing reverses in one line**: `s[::-1]` is idiomatic Python and implemented in C under the hood — almost always faster than a manual loop.
- **Palindrome check: the two-pointer trick matters.** `s == s[::-1]` is elegant but allocates a full reverse copy (O(n) space). For large strings, a two-pointer loop (`left += 1`, `right -= 1`) is O(1) space.
- **Case conversion is Unicode-aware.** `"İ".lower()` gives `"i̇"` (dotted i + combining dot). Most interview questions assume ASCII — be explicit about the assumption.
- **`str.replace` returns a new string.** Strings are immutable, so "replace" always allocates. Use `str.translate()` for multi-character substitutions in a single pass.
- **`split` vs `split(sep)` is different.** `s.split()` splits on any whitespace and discards empty entries; `s.split(" ")` splits on exactly one space and keeps empty entries.

---

## How to Run

```bash
python3 -m unittest string_manipulation_test.py
```

---

## Key Takeaways for Learners

1. **Two-pointer palindrome is the first optimization to know.** Interviewers expect you to spot that reversing the full string costs O(n) extra space when a walk from both ends suffices.
2. **Builtins beat hand-rolled Python loops.** For any operation that has a stdlib equivalent, the C implementation is 10–100× faster than your `for c in s:` loop.
3. **Know your Unicode edge cases.** Vowel counting "aeiou" misses `á`, `é`, `ö`. Palindrome checks get weird with combining marks. Be explicit about normalization (`unicodedata.normalize("NFC", s)`) when it matters.
