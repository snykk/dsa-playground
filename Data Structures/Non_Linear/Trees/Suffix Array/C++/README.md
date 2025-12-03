# Suffix Array - C++

This folder contains a C++ implementation of a **Suffix Array**.

---

## Operations

| Operation                | Description                          | Time Complexity |
| ------------------------- | ------------------------------------ | --------------- |
| `search(pattern)`        | Search for pattern in text           | O(m log n)      |

---

## Usage

```cpp
#include "suffix_array.cpp"

SuffixArray sa("banana");
vector<int> result = sa.search("ana");
// Returns positions where "ana" appears
```

