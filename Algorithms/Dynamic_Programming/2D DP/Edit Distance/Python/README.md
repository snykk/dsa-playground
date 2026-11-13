# Edit Distance -- Python Implementation

Bottom-up Levenshtein distance over a 2D table.

## Files

| File | Contents |
|------|----------|
| `edit_distance.py` | `edit_distance` |
| `edit_distance_test.py` | `unittest` cases |

## API

| Function | Description | Time | Space |
|----------|-------------|------|-------|
| `edit_distance(s1, s2)` | minimum number of inserts, deletes and replaces turning `s1` into `s2` | O(m * n) | O(m * n) |

```python
from edit_distance import edit_distance

print(edit_distance("kitten", "sitting"))  # 3
print(edit_distance("", "abc"))            # 3
```

It returns only the number: there is no traceback and no space-optimized version.

## Python-Specific Notes

- Python strings are sequences of Unicode code points, so an accented letter is one character and costs one edit.
- The table is built with a list comprehension so rows are separate lists.
- Inputs must be strings (any sequence of comparable items also works, since only `len` and indexing are used).

## How to Run

From this folder:

```bash
python3 -m unittest edit_distance_test
```

## Key Takeaways

- Each cell depends on three neighbors: up (delete), left (insert), diagonal (replace or match).
- The result is symmetric in the two strings.
- Time is O(m * n) for every input.
