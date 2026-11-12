# KMP Algorithm -- Python Implementation

Knuth-Morris-Pratt search with an LPS table.

## Files

| File | Contents |
|------|----------|
| `kmp.py` | `build_lps`, `kmp_search`, `kmp_search_count`, `kmp_search_first`, and a demo under `__main__` |
| `kmp_test.py` | 11 `unittest` tests: basic and multiple matches, no match, LPS tables, count, first occurrence, overlaps, empty inputs, a pattern longer than the text, a match at the end |

## API

- `build_lps(pattern: str) -> List[int]`: the LPS table; `[]` for an empty pattern. O(m).
- `kmp_search(text: str, pattern: str) -> List[int]`: all start indices, in increasing order; `[]` for an empty pattern, an empty text, or a pattern longer than the text. O(n + m).
- `kmp_search_count(text, pattern) -> int`: the number of occurrences.
- `kmp_search_first(text, pattern) -> int`: the first index or `-1` (it computes all matches first).

```python
build_lps("ABABCABC")                          # [0, 0, 1, 2, 0, 1, 2, 0]
kmp_search("ABABDABACDABABCABC", "ABABCABC")   # [10]
```

## Python-Specific Notes

- Indices are code points.
- After a full match `j = lps[j - 1]`, so overlapping matches are reported.
- For everyday searching use `str.find`.

## How to Run

```bash
python3 -m unittest kmp_test
python3 kmp.py
```

(Run them from this folder.)

## Key Takeaways

1. Only `j` falls back on a mismatch; `i` never decreases.
2. The fall back uses `lps[j - 1]`, not `lps[j]`.
