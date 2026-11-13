# Binary Search Tree -- C++ Implementation

## Files

- `bst.cpp`: `TreeNode` and `BinarySearchTree` (a single file, included by the test).
- `bst_test.cpp`: assert-based tests, a randomized comparison with `std::set`, a 3,000-node chain, and a compile-time check that the class is not copyable.

## API

- `insert(int)`, `search(int)`, `deleteNode(int)`: duplicates and missing keys are ignored.
- `findMin()`, `findMax()`: throw `std::runtime_error` on an empty tree.
- `inorderTraversal()`, `preorderTraversal()`, `postorderTraversal()`, `levelOrderTraversal()`: `std::vector<int>`.
- `height()` in edges (empty = -1), `size()`, `isEmpty()`.

```cpp
#include "bst.cpp"

int main() {
    BinarySearchTree bst;
    for (int k : {50, 30, 70, 20, 40, 60, 80}) bst.insert(k);
    bst.deleteNode(50);
    return bst.search(60) ? 0 : 1;
}
```

## C++-Specific Notes

- Nodes are raw pointers freed by the destructor, so copy construction and assignment are deleted (copying used to double free).
- The destructor is iterative; insert, search and delete are recursive, so a chain of hundreds of thousands of nodes can still overflow the stack.
- Keys are `int`.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD bst_test.cpp -o bst_test && ./bst_test
```

## Key Takeaways

- Own raw memory, forbid copies.
- The two-child delete uses the in-order successor.
- Height here is in edges.
