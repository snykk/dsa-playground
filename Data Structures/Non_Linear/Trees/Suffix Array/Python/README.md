# Suffix Array - Python

This folder contains a Python implementation of a **Suffix Array**.

A **Suffix Array** is a sorted array of all suffixes of a string. It's a simpler alternative to Suffix Tree with similar functionality for pattern matching and string operations.

---

## Concept

- **Sorted Suffixes**: All suffixes of string sorted lexicographically
- **Pattern Matching**: Efficient pattern search using binary search
- **Simpler than Suffix Tree**: Easier to implement and understand
- **Space Efficient**: O(n) space vs O(n) for Suffix Tree (but simpler)

---

## Operations

| Operation                | Description                          | Time Complexity |
| ------------------------- | ------------------------------------ | --------------- |
| `search(pattern)`        | Search for pattern in text           | O(m log n)      |
| `get_suffixes()`         | Get all suffixes in sorted order     | O(n)            |
| `longest_common_prefix(i, j)` | LCP between two suffixes      | O(n)            |

Where `m` = pattern length, `n` = text length.

---

## Complexity

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| Build     | O(n log n)      | O(n)             |
| Search    | O(m log n)      | O(1)             |
| LCP       | O(n)            | O(1)             |
| Space     | O(n)            | O(n)             |

---

## Usage

```python
from suffix_array import SuffixArray

# Create suffix array
text = "banana"
sa = SuffixArray(text)

# Search for pattern
result = sa.search("ana")
print(result)  # [1, 3] - positions where "ana" appears

# Get sorted suffixes
suffixes = sa.get_suffixes()
print(suffixes)  # ['a', 'ana', 'anana', 'banana', 'na', 'nana']
```

---

## Applications

- Pattern matching in strings
- Longest common substring
- String compression
- Bioinformatics (DNA sequence analysis)

---

## Run Test

```bash
python -m unittest suffix_array_test.py
```

---

## Notes

- Simpler alternative to Suffix Tree
- O(n log n) construction time
- Can be optimized with enhanced suffix array
- Useful for competitive programming string problems

