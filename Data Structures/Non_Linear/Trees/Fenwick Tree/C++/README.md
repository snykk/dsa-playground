# Fenwick Tree (Binary Indexed Tree) - C++

This folder contains a C++ implementation of a **Fenwick Tree**.

---

## Operations

| Operation                | Description                          | Time Complexity |
| ------------------------- | ------------------------------------ | --------------- |
| `query(left, right)`     | Get sum in range [left, right]       | O(log n)        |
| `prefixSum(index)`       | Get sum from 0 to index              | O(log n)        |
| `update(index, delta)`   | Add delta to value at index          | O(log n)        |
| `get(index)`             | Get value at index                   | O(log n)        |

---

## Usage

```cpp
#include "fenwick_tree.cpp"
#include <vector>

vector<int> arr = {1, 3, 5, 7, 9, 11};
FenwickTree ft(arr);
cout << ft.query(0, 2) << endl;  // 9
ft.update(2, 5);
cout << ft.query(0, 2) << endl;  // 14
```

