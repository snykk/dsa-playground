# Longest Common Substring -- Python Implementation

Dynamic-programming search for the longest run of characters shared by two strings.

## Files

| File | Contents |
|------|----------|
| `longest_common_substring.py` | `longest_common_substring` and a small demo under `__main__` |
| `longest_common_substring_test.py` | 6 `unittest` tests: the basic case, start indices, no common character and empty inputs, tie-breaking, substring versus subsequence, identical and contained strings |

## API

- `longest_common_substring(s1: str, s2: str) -> Tuple[str, int, int, int]`: returns `(substring, length, start_in_s1, start_in_s2)`. With no common character it returns `("", 0, 0, 0)`. Among equally long answers, the one that ends first in `s1` wins.

```python
longest_common_substring("ABABC", "BABCA")   # ('BABC', 4, 1, 0)
```

## Python-Specific Notes

- Uses a full `(m+1) x (n+1)` list of lists: O(m*n) time and space.
- Indices are code points; C++ and Go count bytes.
- Python is the only version that also returns the start positions.
- Unlike the other two languages, it records the column too, so `start_in_s2` is exact.

## How to Run

```bash
python3 -m unittest longest_common_substring_test
```

(Run it from this folder.)

## Key Takeaways

1. A mismatch resets the cell to 0; that is what makes it a substring and not a subsequence.
2. The answer is the maximum cell, not the bottom-right one.
3. Two rolling rows would cut the memory to O(min(m, n)).
