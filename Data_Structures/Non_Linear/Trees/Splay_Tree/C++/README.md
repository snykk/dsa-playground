# Splay Tree -- C++ Implementation

## Files

- `splay_tree.cpp`: `SplayNode` and `SplayTree` (header-style; tests include the `.cpp`).
- `splay_tree_test.cpp`: assert-based tests, including a randomized comparison with `std::map`, a 1,000,000-node deep tree and a parent-pointer check.

## API

- `void insert(int key, const std::string& value = "")`
- `std::string search(int key)`: value, or `""` on a miss (a stored empty string looks like a miss).
- `bool remove(int key)`
- `int findMin()`, `int findMax()`: `-1` on an empty tree.
- `std::vector<int> inorderTraversal()`, `int size()`, `bool isEmpty()`
- `int rootKey()` and `bool isConsistent()`: test helpers (root key or `-1`; BST order and parent links).

## C++-Specific Notes

- Nodes are raw `new` allocations owned by the tree. The destructor frees them iteratively, and copy construction and assignment are `= delete` (a shallow copy would free nodes twice).
- Traversal, size and destruction use an explicit stack, so a path-shaped tree of a million nodes does not overflow the native stack.
- Search and remove splay the last visited node on a miss.

## How to Run

```bash
cd "Data_Structures/Non_Linear/Trees/Splay_Tree/C++"
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD splay_tree_test.cpp -o splay_tree_test
./splay_tree_test
```

With AddressSanitizer:

```bash
g++ -std=c++17 -g -fsanitize=address,undefined -DIS_TEST_BUILD splay_tree_test.cpp -o splay_asan && ./splay_asan
```

## Key Takeaways

- A class that owns raw pointers must not be copyable by default.
- Delete clears parent pointers on both detached subtrees before it splays inside the left one.
