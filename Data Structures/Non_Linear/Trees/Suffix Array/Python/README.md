# Suffix Array -- Python Implementation

A suffix array built by sorting the materialized suffixes, with binary-search pattern lookup.

## Files

| File | Contents |
|------|----------|
| `suffix_array.py` | class `SuffixArray` |
| `suffix_array_test.py` | 6 `unittest` tests: search, sorted suffixes, the exact suffix order of `banana`, exact search results, LCP values, empty text |

## API

- `SuffixArray(text)`: builds `self.suffix_array`, the sorted start indices.
- `search(pattern) -> list`: all start indices of `pattern`, in increasing order; `[]` if absent. An empty pattern returns `0..n-1` on a non-empty text.
- `get_suffixes() -> list`: the suffixes in sorted order. O(n^2).
- `longest_common_prefix(i, j) -> int`: common prefix length of the suffixes starting at `i` and `j`, by direct comparison. O(n).

```python
sa = SuffixArray("banana")
sa.suffix_array        # [5, 3, 1, 0, 4, 2]
sa.search("ana")       # [1, 3]
sa.get_suffixes()      # ['a', 'ana', 'anana', 'banana', 'na', 'nana']
```

## Python-Specific Notes

- Construction slices every suffix (`text[i:]`) and sorts the pairs: O(n^2) memory and O(n^2 log n) worst-case time, not O(n log n).
- `search` slices the probed suffix at each step (`text[idx:]`), which copies O(n) per probe, so a search is O(n log n) rather than O(m log n).
- Indices are code points. The C++ and Go versions use byte offsets.
- There is no LCP array and no prefix-doubling build.

## How to Run

```bash
python3 -m unittest suffix_array_test
```

(Run it from this folder.)

## Key Takeaways

1. Suffixes starting with a pattern form one contiguous block, so two binary searches find them all.
2. Store indices, not strings, in a production build; this version copies for clarity.
3. The LCP array is what makes suffix arrays useful for repeat queries.
