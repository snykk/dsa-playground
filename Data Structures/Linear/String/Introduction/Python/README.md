# Introduction to Strings -- Python Implementation

## Files

| File | Contents |
| --- | --- |
| `main.py` | the five string functions |
| `main_test.py` | unit tests (`from main import *`) |

## API

- `access_char(s, index)`: `s[index]`; raises `IndexError` out of range; negative indexes count from the end. O(1).
- `string_length(s)`: `len(s)`, in code points. O(1).
- `traverse_string(s)`: list of characters. O(n).
- `concatenate(s1, s2)`: `s1 + s2`. O(n + m).
- `substring(s, start, end)`: `s[start:end]`; Python slicing clamps out-of-range ends, and an empty range gives `""`. O(k).

## Python-Specific Notes

- A `str` is a sequence of code points and is immutable. `len` and indexing are by code point, so a character outside ASCII counts as one.
- CPython stores a string with 1, 2 or 4 bytes per character, chosen from the widest character, so indexing is O(1).
- Slices copy. Join pieces with `"".join(parts)` instead of `+=` in a loop.

## How to Run

```bash
cd "Data Structures/Linear/String/Introduction/Python"
python3 -m unittest main_test
```

The tests cover each function, empty strings, a non-ASCII string, clamped and empty substring ranges and negative indexes.

## Key Takeaways

- Python indexes by code point; C++ and Go by byte.
- Slicing never raises; direct indexing does.
- Build long strings with `join`.
