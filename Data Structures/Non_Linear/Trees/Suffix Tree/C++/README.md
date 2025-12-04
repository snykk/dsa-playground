# Suffix Tree - C++

This folder contains a C++ implementation of a **Suffix Tree**.

---

## Operations

| Operation                | Description                          | Time Complexity |
| ------------------------- | ------------------------------------ | --------------- |
| `search(pattern)`        | Search for pattern in text           | O(m)            |

---

## Usage

```cpp
#include "suffix_tree.cpp"

SuffixTree st("banana");
vector<int> result = st.search("ana");
// Returns positions where "ana" appears
```

---

## Notes

- O(m) pattern search complexity
- More complex implementation than Suffix Array
- Faster for pattern matching operations


