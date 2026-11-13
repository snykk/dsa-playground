# Suffix Array -- Python Implementation

Suffix array construction by sorting, with binary-search pattern lookup.

## Files

| File | Contents |
|------|----------|
| `suffix_array.py` | `build_suffix_array`, `search_pattern`, and a demo under `__main__` |
| `suffix_array_test.py` | 5 `unittest` tests: the length, search counts, the exact order and sortedness for `banana` and `mississippi`, exact search results including overlaps, empty pattern and empty text |

## API

- `build_suffix_array(s: str) -> List[int]`: the start indices of the suffixes in sorted order. O(n^2 log n) worst case, O(n^2) memory.
- `search_pattern(suffix_array, text, pattern) -> List[int]`: all start indices of `pattern`, in increasing order. An empty pattern returns `0..n-1` on a non-empty text.

```python
sa = build_suffix_array("banana")      # [5, 3, 1, 0, 4, 2]
search_pattern(sa, "banana", "ana")    # [1, 3]
```

## Python-Specific Notes

- Construction slices every suffix (`s[i:]`) and sorts the pairs, so memory is O(n^2) and the time is not O(n log n).
- Search slices the probed suffix (`text[idx:]`), copying O(n) per probe: O(n log n) per query, not O(m log n).
- Indices are code points; C++ and Go count bytes.
- There is no LCP array and no prefix-doubling build.

## How to Run

```bash
python3 -m unittest suffix_array_test
python3 suffix_array.py
```

(Run them from this folder.)

## Key Takeaways

1. The matches form one block of the sorted suffixes.
2. Count copies and comparison cost before quoting a complexity.
