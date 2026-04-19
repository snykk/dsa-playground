# String Introduction — Python Implementation

This folder walks through the **fundamental operations** every developer does on strings — access, length, traversal, concatenation, substring — but stops to ask _what actually happens in memory_ for each one. Strings look like primitive values, but internally they are arrays of code units with surprising performance cliffs.

For the conceptual overview and cross-language comparison, see the parent README: [../README.md](../README.md)

---

## Files

| File | Purpose |
|------|---------|
| `main.py` | Reference implementations of the five core operations |
| `main_test.py` | Unit tests covering empty strings, unicode, and bounds |

---

## Operations Covered

| Operation | Complexity | What it teaches |
|-----------|------------|-----------------|
| `access_char(s, i)` | O(1) | Python strings support direct indexing (not true for UTF-8 byte strings in some other languages) |
| `string_length(s)` | O(1) | `len()` reads a cached length — it does **not** walk the string |
| `traverse_string(s)` | O(n) | `for c in s` iterates over characters (code points), not bytes |
| `concatenate(s1, s2)` | O(n + m) | Creates a new string. Doing this in a loop is the classic O(n²) gotcha |
| `substring(s, l, r)` | O(r - l) | Slicing copies the underlying buffer — Python strings are **immutable** |

---

## Python-Specific Notes

- **Strings are immutable.** Every operation that "modifies" a string returns a brand-new one. Building a string in a loop via `s += part` is O(n²) because each `+=` copies the whole accumulator. Use `"".join(parts)` for O(n).
- **Unicode, not bytes.** Python 3 strings (`str`) are sequences of Unicode code points. `len("naïve")` is 5, not 6. If you need the UTF-8 byte length, use `len("naïve".encode())`.
- **Slicing is copying.** `s[100:200]` allocates a new 100-character string. In C++ you'd use `std::string_view` to share the buffer; the closest Python equivalent is `memoryview(s.encode())` for bytes.
- **`str` vs `bytes` vs `bytearray`**: `str` = immutable text, `bytes` = immutable binary, `bytearray` = mutable binary. Picking wrong leads to subtle bugs when interfacing with sockets / files.

---

## How to Run

```bash
python3 -m unittest main_test.py
```

---

## Key Takeaways for Learners

1. **String immutability is a feature, not a limitation.** It makes hashing safe, enables interning, and eliminates a class of aliasing bugs — but it means you must think about allocation.
2. **The `+=` trap is real.** Concatenating in a loop via `+=` is an interview favorite for a reason. `"".join(list_of_parts)` or `io.StringIO` solves it.
3. **Indexing gives you code points, not graphemes.** `"👨‍👩‍👦"[0]` returns the first code point (the man emoji), not the whole family sequence. For user-facing text operations, reach for the `unicodedata` module or a library like `regex` with `\X`.
