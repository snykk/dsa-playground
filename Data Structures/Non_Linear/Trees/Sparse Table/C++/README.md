# Sparse Table - C++

This folder contains a C++ implementation of a **Sparse Table**.

A **Sparse Table** is a static data structure that supports O(1) range minimum/maximum queries (RMQ) after O(n log n) preprocessing. It does not support updates.

---

## Concept

- **Static Structure**: Array cannot be modified after construction
- **O(1) Queries**: Fastest query time for RMQ (Range Minimum/Maximum Query)
- **O(n log n) Preprocessing**: Build time is O(n log n)
- **No Updates**: Cannot update array elements (use Segment Tree if updates needed)

---

## Operations

| Operation                | Description                          | Time Complexity |
| ------------------------ | ------------------------------------ | --------------- |
| `query(left, right)`     | Get min/max in range [left, right]   | O(1)            |
| `get(index)`             | Get value at index                   | O(1)            |

---

## Complexity

| Operation     | Time Complexity | Space Complexity |
| ------------- | --------------- | ---------------- |
| Build         | O(n log n)      | O(n log n)       |
| Query         | O(1)            | O(1)             |
| Update        | Not supported   | -                |
| Space         | O(n log n)      | O(n log n)       |

---

## Usage

```cpp
#include "sparse_table.cpp"
#include <vector>
using namespace std;

// Initialize with array (min query)
vector<int> arr = {1, 3, 5, 7, 9, 11, 2, 4, 6, 8};
SparseTable st_min(arr, "min");

// Range minimum query
cout << st_min.query(0, 2) << endl;   // 1
cout << st_min.query(1, 3) << endl;   // 3

// Initialize with array (max query)
SparseTable st_max(arr, "max");

// Range maximum query
cout << st_max.query(0, 2) << endl;   // 5
cout << st_max.query(1, 3) << endl;   // 7
```

---

## Compile and Run

```bash
# Compile
g++ -o sparse_table_test sparse_table_test.cpp

# Run
./sparse_table_test
```

---

## Applications

- Range minimum/maximum queries (RMQ)
- Static array queries (no updates)
- Competitive programming (when updates are not needed)
- LCA (Lowest Common Ancestor) in trees

