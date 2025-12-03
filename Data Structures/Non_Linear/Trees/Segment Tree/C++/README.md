# Segment Tree - C++

This folder contains a C++ implementation of a **Segment Tree**.

A **Segment Tree** is used for efficient range queries and point updates.

---

## Operations

| Operation                | Description                          | Time Complexity |
| ------------------------- | ------------------------------------ | --------------- |
| `query(left, right)`     | Get sum in range [left, right]       | O(log n)        |
| `update(index, value)`   | Update value at index                | O(log n)        |
| `get(index)`             | Get value at index                   | O(1)            |

---

## Usage

```cpp
#include "segment_tree.cpp"
#include <vector>

vector<int> arr = {1, 3, 5, 7, 9, 11};
SegmentTree st(arr);
cout << st.query(0, 2) << endl;  // 9
st.update(2, 10);
cout << st.query(0, 2) << endl;  // 14
```

