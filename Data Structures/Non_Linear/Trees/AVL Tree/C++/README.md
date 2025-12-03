# AVL Tree - C++

This folder contains a C++ implementation of an **AVL Tree** (Adelson-Velsky and Landis Tree).

An **AVL Tree** is a self-balancing Binary Search Tree where the height difference between left and right subtrees of any node is at most 1. This guarantees O(log n) time complexity for all operations.

---

## Concept

- **Self-Balancing**: Automatically maintains balance after insert/delete
- **Balance Factor**: height(left) - height(right) must be -1, 0, or 1
- **Rotations**: Uses rotations to restore balance when needed
- **Guaranteed O(log n)**: All operations are O(log n) even in worst case
- **Memory Management**: Proper cleanup in destructor

---

## Operations

| Operation                | Description                                    | Time Complexity |
| ------------------------- | ---------------------------------------------- | --------------- |
| `insert(data)`           | Insert data with automatic balancing           | O(log n)        |
| `search(data)`           | Search for data in the tree                    | O(log n)        |
| `deleteNode(data)`       | Delete data with automatic balancing            | O(log n)        |
| `findMin()`              | Find minimum value                              | O(log n)        |
| `findMax()`              | Find maximum value                              | O(log n)        |
| `inorderTraversal()`     | Traverse: Left, Root, Right (sorted)            | O(n)            |
| `height()`               | Calculate tree height                          | O(1)            |
| `size()`                 | Get total number of nodes                       | O(n)            |
| `isEmpty()`              | Check if tree is empty                          | O(1)            |
| `isBalanced()`           | Check if tree maintains AVL property            | O(n)            |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| insert    | O(log n)        | O(log n)         |
| search    | O(log n)        | O(log n)         |
| delete    | O(log n)        | O(log n)         |
| find_min  | O(log n)        | O(1)             |
| find_max  | O(log n)        | O(1)             |
| Traversal | O(n)            | O(log n)         |
| height    | O(1)            | O(1)             |
| size      | O(n)            | O(log n)         |

**Key Advantage**: All operations are **guaranteed O(log n)** even in worst case.

---

## Usage

```cpp
#include "avl_tree.cpp"
#include <iostream>
using namespace std;

int main() {
    AVLTree avl;

    // Insert elements (tree auto-balances)
    avl.insert(10);
    avl.insert(20);
    avl.insert(30);
    avl.insert(40);
    avl.insert(50);

    // Search
    cout << avl.search(30) << endl;  // 1 (true)
    cout << avl.search(60) << endl;  // 0 (false)

    // Find min and max
    cout << avl.findMin() << endl;  // 10
    cout << avl.findMax() << endl;  // 50

    // Delete (tree auto-balances)
    avl.deleteNode(30);
    cout << avl.search(30) << endl;  // 0 (false)
    cout << avl.isBalanced() << endl;  // 1 (true)

    // Traverse
    vector<int> inorder = avl.inorderTraversal();
    // Output: [10, 20, 40, 50] (sorted!)

    return 0;
}
```

---

## Compile and Run

```bash
# Compile
g++ -o avl_tree_test avl_tree_test.cpp

# Run
./avl_tree_test
```

---

## Notes

- AVL Tree guarantees O(log n) for all operations
- Destructor properly deallocates all nodes
- More rotations than Red-Black Tree, but simpler to understand
- Better for read-heavy workloads
- Height is always O(log n), making it more balanced than regular BST

