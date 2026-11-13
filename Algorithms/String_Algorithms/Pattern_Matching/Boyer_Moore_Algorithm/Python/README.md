# Boyer-Moore Algorithm -- Python Implementation

Boyer-Moore search with the bad-character rule.

## Files

| File | Contents |
|------|----------|
| `boyer_moore.py` | `build_bad_char_table`, `boyer_moore_search`, `boyer_moore_search_count`, `boyer_moore_search_first`, and a demo under `__main__` |
| `boyer_moore_test.py` | 9 `unittest` tests: basic and multiple matches, the textbook example, overlaps, no match and edge cases, a worst-case input, a match at the end, the table, count and first |

## API

- `build_bad_char_table(pattern: str) -> Dict[str, int]`: each character to its rightmost index in the pattern.
- `boyer_moore_search(text: str, pattern: str) -> List[int]`: all start indices, in increasing order; `[]` for an empty pattern, an empty text, or a pattern longer than the text.
- `boyer_moore_search_count(text, pattern) -> int`: the number of occurrences.
- `boyer_moore_search_first(text, pattern) -> int`: the first index, or `-1`. It computes all matches first.

```python
boyer_moore_search("HERE IS A SIMPLE EXAMPLE", "EXAMPLE")   # [17]
```

## Python-Specific Notes

- Indices are code points.
- Only the bad-character rule is implemented; the worst case is O(n*m).
- After a match the shift is `m - last[text[s + m]]` (or 1 at the end of the text).
- `str.find` is the right tool in real code.

## How to Run

```bash
python3 -m unittest boyer_moore_test
python3 boyer_moore.py
```

(Run them from this folder.)

## Key Takeaways

1. Compare from the right so the mismatch can jump the whole pattern.
2. The table stores the rightmost occurrence, and the shift is at least 1.
