# Suffix Tree - Python

This folder contains a Python implementation of a **Suffix Tree**.

A **Suffix Tree** is a compressed trie containing all suffixes of a given string. It allows O(m) pattern search where m is pattern length, making it faster than Suffix Array for pattern matching.

---

## Concept

- **Compressed Trie**: All suffixes stored in tree structure
- **O(m) Pattern Search**: Linear time pattern matching
- **Space Efficient**: Compressed representation
- **Complex Construction**: O(n) with Ukkonen's algorithm

---

## Operations

| Operation                | Description                          | Time Complexity |
| ------------------------- | ------------------------------------ | --------------- |
| `search(pattern)`        | Search for pattern in text           | O(m)            |
| `get_all_suffixes()`     | Get all suffixes stored in tree      | O(n)            |

Where `m` = pattern length, `n` = text length.

---

## Complexity

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| Build     | O(n) with Ukkonen's | O(n)      |
| Search    | O(m)            | O(1)             |
| Space     | O(n)            | O(n)             |

**Note**: This implementation uses simplified O(n²) construction for clarity. For production, use Ukkonen's algorithm for O(n) construction.

---

## Usage

```python
from suffix_tree import SuffixTree

# Create suffix tree
text = "banana"
st = SuffixTree(text)

# Search for pattern
result = st.search("ana")
print(result)  # [1, 3] - positions where "ana" appears

# Get all suffixes
suffixes = st.get_all_suffixes()
print(suffixes)  # All suffixes in sorted order
```

---

## Comparison with Suffix Array

| Feature         | Suffix Tree | Suffix Array |
| --------------- | ----------- | ------------ |
| Construction    | O(n)        | O(n log n)   |
| Pattern Search  | **O(m)**    | O(m log n)   |
| Space           | O(n)        | O(n)         |
| Implementation  | Complex     | Simpler      |
| Use Case        | Fast search | Simpler code |

**Use Suffix Tree when**: You need fast pattern matching (O(m))
**Use Suffix Array when**: You want simpler implementation

---

## Applications

- Pattern matching in strings
- Longest common substring
- String compression
- Bioinformatics (DNA sequence analysis)

---

## Run Test

```bash
python -m unittest suffix_tree_test.py
```

---

## Notes

- More complex than Suffix Array but faster for pattern search
- O(n) construction with Ukkonen's algorithm
- O(m) pattern search vs O(m log n) for Suffix Array
- Used in advanced string algorithms

