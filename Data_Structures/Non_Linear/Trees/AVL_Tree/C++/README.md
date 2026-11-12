# AVL Tree -- C++ Implementation

## Files

- `avl_tree.cpp`: `AVLNode` and `AVLTree` (a single file, included by the test).
- `avl_tree_test.cpp`: assert-based tests, a randomized comparison against `std::set` with a balance check after every operation, and a compile-time check that the class is not copyable.

## API

- `insert(int)`, `search(int)`, `deleteNode(int)`: duplicates and missing keys are ignored.
- `findMin()`, `findMax()`: throw `std::runtime_error` on an empty tree.
- `inorderTraversal()`: `std::vector<int>`.
- `height()` (leaf = 1, empty = 0), `size()`, `isEmpty()`, `isBalanced()`.

```cpp
#include "avl_tree.cpp"

int main() {
    AVLTree avl;
    for (int k : {10, 20, 30, 40, 50}) avl.insert(k);
    avl.deleteNode(30);
    return avl.isBalanced() ? 0 : 1;
}
```

## C++-Specific Notes

- Nodes are raw pointers freed by the destructor, so copy construction and assignment are deleted. Copying used to double free.
- Only in-order traversal exists (Python also has pre-order, post-order and level order).
- Keys are `int`. Recursion depth is the tree height, about log n.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD avl_tree_test.cpp -o avl_test && ./avl_test
```

## Key Takeaways

- Own raw memory, forbid copies.
- Rebalance on the way back up after every change.
- The balance factor of the heavy child decides single versus double rotation after a delete.
