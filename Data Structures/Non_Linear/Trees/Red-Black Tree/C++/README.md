# Red-Black Tree - C++

This folder contains a C++ implementation of a **Red-Black Tree**.

A **Red-Black Tree** is a self-balancing Binary Search Tree that guarantees O(log n) time complexity for all operations.

---

## Operations

| Operation                | Description                          | Time Complexity |
| ------------------------- | ------------------------------------ | --------------- |
| `insert(data)`           | Insert data with auto-balancing      | O(log n)        |
| `search(data)`           | Search for data                      | O(log n)        |
| `inorderTraversal()`     | Traverse in sorted order             | O(n)            |
| `size()`                 | Get total number of nodes            | O(n)            |
| `isEmpty()`              | Check if tree is empty               | O(1)            |

---

## Usage

```cpp
#include "red_black_tree.cpp"

RedBlackTree rbt;
rbt.insert(10);
rbt.insert(20);
rbt.insert(30);
cout << rbt.search(20) << endl;  // 1 (true)
```

---

## Notes

- Guarantees O(log n) for all operations
- Fewer rotations than AVL Tree
- Proper memory management with destructor

