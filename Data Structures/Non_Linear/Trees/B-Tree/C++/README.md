# B-Tree - C++

This folder contains a C++ implementation of a **B-Tree**.

---

## Operations

| Operation                | Description                          | Time Complexity |
| ------------------------- | ------------------------------------ | --------------- |
| `search(key)`            | Search for a key                     | O(log n)        |
| `insert(key)`            | Insert a key                         | O(log n)        |

---

## Usage

```cpp
#include "b_tree.cpp"

BTree btree(3);  // min_degree = 3
btree.insert(10);
btree.insert(20);
cout << btree.search(10) << endl;  // 1 (true)
```

