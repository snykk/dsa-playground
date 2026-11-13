# Manacher's Algorithm -- Python Implementation

Longest palindromic substring in O(n).

## Files

| File | Contents |
|------|----------|
| `manacher.py` | `manacher` and a small demo under `__main__` |
| `manacher_test.py` | 5 `unittest` tests: the basic case, the returned tuple and tie-breaking, edge cases, inputs containing `^` and `$` (regression), and an exhaustive comparison with brute force over the alphabet `ab^$` up to length 7 |

## API

- `manacher(s: str) -> Tuple[str, int, int]`: returns `(substring, start, length)` of the first longest palindromic substring (the earliest on ties). For an empty string it returns `("", 0, 0)`.

```python
manacher("babad")   # ('bab', 0, 3)
manacher("cbbd")    # ('bb', 1, 2)
```

## Python-Specific Notes

- The transformed string is `"#" + "#".join(s) + "#"`; no sentinel characters are used, so `^`, `$` and `#` are safe in the input.
- Indices are code points; C++ counts bytes and Go slices at rune boundaries.
- Python is the only version that also returns the start index and the length.

## How to Run

```bash
python3 -m unittest manacher_test
python3 manacher.py
```

(Run them from this folder.)

## Key Takeaways

1. The `#` transform removes the odd and even case split.
2. `p[i] = min(right - i, p[mirror])` is the whole trick; everything else is bounds checking.
3. Never use an input character as a sentinel.
