# Cartesian Tree (C++)

A **Cartesian Tree** is a binary tree derived from a sequence of numbers with min-heap property and inorder traversal that produces the original sequence.

---

## Overview

Cartesian Trees are built from arrays such that the inorder traversal returns the original array, while maintaining a min-heap structure.

---

## Operations

### 1. Build from Array

```cpp
std::vector<int> array = {9, 3, 7, 1, 8, 12, 10};
CartesianTree tree(array);
```

**Time Complexity**: O(n)

### 2. Traversals

```cpp
std::vector<int> inorder = tree.inorderTraversal();    // Original array
std::vector<int> preorder = tree.preorderTraversal();  // Root, Left, Right
std::vector<int> postorder = tree.postorderTraversal(); // Left, Right, Root
```

**Time Complexity**: O(n)

### 3. Range Minimum Query

```cpp
int min_idx = tree.getMinIndex(0, 4);  // Find min in range [0, 4]
```

**Time Complexity**: O(log n) average

---

## Complexity Analysis

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| Build     | O(n)           | O(n)             |
| Inorder   | O(n)           | O(n)             |
| RMQ       | O(log n) avg   | O(1)             |
| Height    | O(n)           | O(h)             |
| Size      | O(n)           | O(h)             |

---

## Example Usage

```cpp
#include "cartesian_tree.cpp"
#include <iostream>

int main() {
    std::vector<int> array = {9, 3, 7, 1, 8, 12, 10};
    CartesianTree tree(array);
    
    // Inorder returns original array
    std::vector<int> result = tree.inorderTraversal();
    for (int val : result) {
        std::cout << val << " ";
    }
    
    // Root is minimum
    std::cout << "\nRoot value: " << tree.getRootValue() << std::endl;
    
    return 0;
}
```

---

## Compilation

```bash
g++ -std=c++11 cartesian_tree.cpp cartesian_tree_test.cpp -o cartesian_tree_test
./cartesian_tree_test
```

---

## Testing

Run the test suite:

```bash
g++ -std=c++11 cartesian_tree_test.cpp -o test
./test
```

---

## Related Data Structures

- **Segment Tree**: Another structure for range queries
- **Sparse Table**: Static RMQ with O(1) queries
- **Treap**: Combination of BST and heap

