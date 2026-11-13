# Longest Common Subsequence -- Python Implementation

Three bottom-up LCS functions: length, the sequence itself, and a two-row length-only version.

## Files

| File | Contents |
|------|----------|
| `lcs.py` | `lcs_length`, `lcs_sequence`, `lcs_optimized` |
| `lcs_test.py` | `unittest` cases |

## API

| Function | Description | Time | Space |
|----------|-------------|------|-------|
| `lcs_length(s1, s2)` | length of the LCS | O(m * n) | O(m * n) |
| `lcs_sequence(s1, s2)` | one LCS as a string, by traceback | O(m * n) | O(m * n) |
| `lcs_optimized(s1, s2)` | length only, using two rows of the shorter length | O(m * n) | O(min(m, n)) |

```python
from lcs import lcs_length, lcs_sequence

print(lcs_length("ABCBDAB", "BDCAB"))    # 4
print(lcs_sequence("ABCBDAB", "BDCAB"))  # BDAB
```

When the cell above and the cell on the left are equal, the traceback moves left. That is why `BDAB` is returned and not the equally long `BCAB`.

## Python-Specific Notes

- Strings are compared by Unicode code point, so an accented letter is one character (C++ and Go compare bytes).
- `lcs_optimized` swaps the arguments so the inner rows have the shorter length; the LCS length is symmetric, so the result is the same.
- Only `len` and indexing are used, so lists of comparable items also work (`lcs_sequence` then joins characters, so pass strings to it).

## How to Run

From this folder:

```bash
python3 -m unittest lcs_test
```

## Key Takeaways

- A match extends the diagonal by 1; a mismatch takes the larger of up and left.
- The two-row version cannot recover the sequence.
- The returned LCS depends on the tie rule; it is one of possibly several.
