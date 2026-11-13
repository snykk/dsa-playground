# Cartesian Tree -- C++ Implementation

## Files

- `cartesian_tree.cpp`: `CartesianNode` and `CartesianTree` (a single file, included by the test).
- `cartesian_tree_test.cpp`: build, sorted and empty inputs, traversals, range queries compared with brute force, a 1,000,000-element sorted array, a rebuild test, and a compile-time check that the class is not copyable.

## API

- `CartesianTree()`, `CartesianTree(const std::vector<int>&)`, `buildFromArray(const std::vector<int>&)`: O(n); a rebuild frees the previous tree.
- `getMinIndex(left, right)`: leftmost index of the minimum in `array[left..right]`; -1 for an empty tree or an invalid range. O(h).
- `inorderTraversal()`, `preorderTraversal()`, `postorderTraversal()`: `std::vector<int>`.
- `height()` in edges (empty = -1), `size()`, `isEmpty()`, `getRootValue()` (`INT_MIN` when empty).
- `root`: public member pointer, used by the tests.

```cpp
#include "cartesian_tree.cpp"

int main() {
    CartesianTree tree({9, 3, 7, 1, 8, 12, 10, 20, 15, 18, 5});
    return tree.getMinIndex(4, 8) == 4 ? 0 : 1;
}
```

## C++-Specific Notes

- Nodes are raw pointers freed by the destructor, so copy construction and assignment are deleted.
- Traversals, height, size and the destructor are iterative: a sorted array of 1,000,000 values makes a chain, and the recursive versions crashed on it.
- `buildFromArray` on an existing tree used to leak the old nodes; it now frees them first.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD cartesian_tree_test.cpp -o cartesian_test && ./cartesian_test
```

## Key Takeaways

- Own raw memory, forbid copies, free before rebuilding.
- Keep every walk over a possibly degenerate tree iterative.
- A range minimum is the LCA of its ends.
