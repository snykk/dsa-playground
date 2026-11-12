# Binary Tree -- C++ Implementation

## Files

- `binary_tree.cpp`: `TreeNode` and `BinaryTree` (a single file, included by the test).
- `binary_tree_test.cpp`: assert-based tests, a 7-node tree with every traversal, a 1,000-node height check, and a compile-time check that the class is not copyable.

## API

- `insert(int)`: level-order insert.
- `search(int)`: returns a bool; O(n).
- `inorderTraversal()`, `preorderTraversal()`, `postorderTraversal()`, `levelOrderTraversal()`: `std::vector<int>`.
- `height()` in edges (empty = -1), `size()`, `isEmpty()`.

```cpp
#include "binary_tree.cpp"

int main() {
    BinaryTree tree;
    for (int i = 1; i <= 7; i++) tree.insert(i);
    return tree.height() == 2 ? 0 : 1;
}
```

## C++-Specific Notes

- Nodes are raw pointers freed by the destructor, so copy construction and assignment are deleted (copying used to double free).
- Level order and insert use `std::queue`.
- Keys are `int`.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD binary_tree_test.cpp -o binary_tree_test && ./binary_tree_test
```

## Key Takeaways

- Own raw memory, forbid copies.
- Level order needs a queue and uses O(width) space.
- No ordering means O(n) search.
