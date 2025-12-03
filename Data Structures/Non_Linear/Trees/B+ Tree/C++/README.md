# B+ Tree - C++

This folder contains a C++ implementation of a **B+ Tree**.

---

## Operations

| Operation                | Description                          | Time Complexity |
| ------------------------- | ------------------------------------ | --------------- |
| `search(key)`            | Search for a key                     | O(log n)        |
| `insert(key, value)`     | Insert a key-value pair              | O(log n)        |

---

## Usage

```cpp
#include "b_plus_tree.cpp"

BPlusTree bptree(3);
bptree.insert(10, "value10");
cout << bptree.search(10) << endl;  // "value10"
```

