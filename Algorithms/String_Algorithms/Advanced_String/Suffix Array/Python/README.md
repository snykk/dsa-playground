# Suffix Array (Python)

Suffix array is a sorted array of all suffixes of a string. Useful for pattern matching and string processing.

**Time Complexity:** O(n log n) construction, O(m log n) search  
**Space Complexity:** O(n)

---

## Usage

```python
from suffix_array import build_suffix_array, search_pattern

sa = build_suffix_array(text)
occurrences = search_pattern(sa, text, pattern)
```

---

## Testing

```bash
python -m unittest suffix_array_test.py
python suffix_array.py
```

---

_Last Updated: December 2025_

