# Binary Tree - C++

This folder contains a C++ implementation of a **Binary Tree**.

A **Binary Tree** is a hierarchical data structure where each node has at most two children, referred to as the left child and right child. Unlike Binary Search Trees, Binary Trees don't enforce any ordering constraint on the nodes.

---

## Concept

- Each node can have at most **2 children** (left and right)
- No ordering constraint (unlike BST)
- Hierarchical structure with a root node
- Can be empty (no nodes)
- Used as a foundation for more specialized trees (BST, AVL, etc.)

---

## Operations

| Operation                | Description                                    | Time Complexity |
| ------------------------- | ---------------------------------------------- | --------------- |
| `insert(data)`           | Insert data using level-order insertion        | O(n)            |
| `search(data)`           | Search for data in the tree                    | O(n)            |
| `inorderTraversal()`     | Traverse: Left, Root, Right                    | O(n)            |
| `preorderTraversal()`    | Traverse: Root, Left, Right                    | O(n)            |
| `postorderTraversal()`   | Traverse: Left, Right, Root                    | O(n)            |
| `levelOrderTraversal()`  | Traverse level by level (BFS)                  | O(n)            |
| `height()`               | Calculate height of the tree                   | O(n)            |
| `size()`                 | Get total number of nodes                      | O(n)            |
| `isEmpty()`              | Check if tree is empty                         | O(1)            |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
| --------- | --------------- | ---------------- |
| insert    | O(n)            | O(n)             |
| search    | O(n)            | O(h)             |
| Traversal | O(n)            | O(h)             |
| height    | O(n)            | O(h)             |
| size      | O(n)            | O(h)             |
| Space     | O(n)            | O(n)             |

Where `h` is the height of the tree (O(log n) for balanced tree, O(n) for skewed tree).

---

## Usage

```cpp
#include "binary_tree.cpp"
#include <iostream>
using namespace std;

int main() {
    BinaryTree tree;

    // Insert elements
    tree.insert(1);
    tree.insert(2);
    tree.insert(3);
    tree.insert(4);
    tree.insert(5);

    // Search for an element
    cout << tree.search(3) << endl;  // 1 (true)
    cout << tree.search(6) << endl;  // 0 (false)

    // Get tree properties
    cout << tree.size() << endl;      // 5
    cout << tree.height() << endl;    // 2
    cout << tree.isEmpty() << endl;   // 0 (false)

    // Traverse the tree
    vector<int> inorder = tree.inorderTraversal();
    // Output: [4, 2, 5, 1, 3]

    return 0;
}
```

---

## Traversal Methods

### 1. Inorder Traversal (Left, Root, Right)
```cpp
vector<int> result = tree.inorderTraversal();
// For tree:     1
//              / \
//             2   3
// Output: [2, 1, 3]
```

### 2. Preorder Traversal (Root, Left, Right)
```cpp
vector<int> result = tree.preorderTraversal();
// Output: [1, 2, 3]
```

### 3. Postorder Traversal (Left, Right, Root)
```cpp
vector<int> result = tree.postorderTraversal();
// Output: [2, 3, 1]
```

### 4. Level-Order Traversal (Breadth-First)
```cpp
vector<int> result = tree.levelOrderTraversal();
// Output: [1, 2, 3]
```

---

## Compile and Run

```bash
# Compile
g++ -o binary_tree_test binary_tree_test.cpp

# Run
./binary_tree_test
```

Or compile and run in one command:

```bash
g++ binary_tree_test.cpp -o binary_tree_test && ./binary_tree_test
```

---

## Notes

- This implementation uses level-order insertion (fills from left to right)
- Destructor properly deallocates all nodes to prevent memory leaks
- For more specialized trees, consider Binary Search Tree (BST) which enforces ordering
- Traversal methods use recursion, which may cause stack overflow for very deep trees
- For iterative implementations, use explicit stack/queue data structures

