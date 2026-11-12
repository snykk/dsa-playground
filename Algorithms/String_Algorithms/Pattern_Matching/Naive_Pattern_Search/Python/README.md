# Naive Pattern Search -- Python Implementation

Brute-force search for every occurrence of a pattern.

## Files

| File | Contents |
|------|----------|
| `naive_pattern_search.py` | `naive_pattern_search`, `naive_pattern_search_count`, `naive_pattern_search_first`, and a demo under `__main__` |
| `naive_pattern_search_test.py` | 14 `unittest` tests: matches, multiple and overlapping occurrences, no match, empty inputs, a pattern longer than the text, pattern equals text, single character, a worst-case input, a match at the end, count and first |

## API

- `naive_pattern_search(text: str, pattern: str) -> List[int]`: all start indices, in increasing order; `[]` for an empty pattern, an empty text, or a pattern longer than the text. O(n*m).
- `naive_pattern_search_count(text, pattern) -> int`: the number of occurrences (runs the full search).
- `naive_pattern_search_first(text, pattern) -> int`: the first index or `-1` (runs the full search).

```python
naive_pattern_search("ABABDABACDABABCABC", "ABABCABC")   # [10]
```

## Python-Specific Notes

- Indices are code points.
- The inner loop compares character by character instead of slicing, so no substring is created.
- `str.find` and the `in` operator are implemented in C and are the right tools in real code.

## How to Run

```bash
python3 -m unittest naive_pattern_search_test
python3 naive_pattern_search.py
```

(Run them from this folder.)

## Key Takeaways

1. Try every start `0..n-m`; the cost is the comparisons made at each.
2. A repetitive text and pattern make it quadratic.
