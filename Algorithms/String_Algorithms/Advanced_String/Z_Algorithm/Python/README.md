# Z-Algorithm -- Python Implementation

The Z-array and a linear-time pattern search built on it.

## Files

| File | Contents |
|------|----------|
| `z_algorithm.py` | `build_z_array`, `z_algorithm_search`, and a demo under `__main__` |
| `z_algorithm_test.py` | 17 `unittest` tests: Z-arrays (empty, single character, all equal, the classic example, no repetition) and searches (matches, overlaps, empty pattern or text, pattern longer than the text, Unicode, a `$` inside the input) |

## API

- `build_z_array(s: str) -> List[int]`: `z[i]` is the length of the longest match of `s[i:]` with a prefix of `s`; `z[0]` is 0. O(n).
- `z_algorithm_search(text: str, pattern: str) -> List[int]`: all start indices of `pattern` in `text`, in increasing order. Returns `[]` for an empty pattern, an empty text, or a pattern longer than the text. O(n + m).

```python
build_z_array("aabxaabxaab")                # [0, 1, 0, 0, 7, 1, 0, 0, 3, 1, 0]
z_algorithm_search("aabxaabaab", "aab")     # [0, 4, 7]
```

## Python-Specific Notes

- The search builds `pattern + "$" + text` and keeps positions with `z[i] >= m`. The `>=` is needed because a `$` inside the input can make `z[i]` exceed `m`.
- Indices are code points, not bytes.
- The combined string costs O(n + m) memory.

## How to Run

```bash
python3 -m unittest z_algorithm_test
python3 z_algorithm.py
```

(Run them from this folder.)

## Key Takeaways

1. The Z-box turns a quadratic computation into a linear one.
2. Always test `>=`, not `==`, when searching on `pattern + "$" + text`.
