# Binary Search Tree (BST) - C++

This folder contains a C++ implementation of a **Binary Search Tree (BST)**.

A **Binary Search Tree** is a binary tree with an ordering property: for each node, all values in the left subtree are less than the node's value, and all values in the right subtree are greater than the node's value. This property enables efficient search, insertion, and deletion operations.

---

## Concept

- **BST Property**: For each node, `left child < node < right child`
- **Ordered Structure**: Inorder traversal produces sorted sequence
- **Efficient Operations**: O(log n) average case for search, insert, delete
- **No Duplicates**: This implementation doesn't allow duplicate values
- **Memory Management**: Proper cleanup in destructor

---

## Operations

| Operation                | Description                                    | Time Complexity |
| ------------------------- | ---------------------------------------------- | --------------- |
| `insert(data)`           | Insert data maintaining BST property           | O(log n) avg    |
| `search(data)`           | Search for data in the BST                    | O(log n) avg    |
| `deleteNode(data)`       | Delete data from the BST                       | O(log n) avg    |
| `findMin()`              | Find minimum value in BST                      | O(log n) avg    |
| `findMax()`              | Find maximum value in BST                      | O(log n) avg    |
| `inorderTraversal()`     | Traverse: Left, Root, Right (sorted order)     | O(n)            |
| `preorderTraversal()`    | Traverse: Root, Left, Right                    | O(n)            |
| `postorderTraversal()`   | Traverse: Left, Right, Root                    | O(n)            |
| `levelOrderTraversal()`  | Traverse level by level (BFS)                  | O(n)            |
| `height()`               | Calculate height of the tree                   | O(n)            |
| `size()`                 | Get total number of nodes                      | O(n)            |
| `isEmpty()`              | Check if tree is empty                         | O(1)            |

---

## Complexity

| Operation | Time Complexity (Average) | Time Complexity (Worst) | Space Complexity |
| --------- | -------------------------- | ----------------------- | ---------------- |
| insert    | O(log n)                   | O(n)                    | O(h)             |
| search    | O(log n)                   | O(n)                    | O(h)             |
| delete    | O(log n)                   | O(n)                    | O(h)             |
| find_min  | O(log n)                   | O(n)                    | O(1)             |
| find_max  | O(log n)                   | O(n)                    | O(1)             |
| Traversal | O(n)                       | O(n)                    | O(h)             |
| height    | O(n)                       | O(n)                    | O(h)             |
| size      | O(n)                       | O(n)                    | O(h)             |

Where:
- `n` = number of nodes
- `h` = height of tree (O(log n) for balanced, O(n) for skewed)

**Note**: Worst case occurs when tree becomes a linked list (skewed tree).

---

## Usage

```cpp
#include "bst.cpp"
#include <iostream>
using namespace std;

int main() {
    BinarySearchTree bst;

    // Insert elements
    bst.insert(5);
    bst.insert(3);
    bst.insert(7);
    bst.insert(1);
    bst.insert(4);

    // Search
    cout << bst.search(3) << endl;  // 1 (true)
    cout << bst.search(6) << endl;  // 0 (false)

    // Find min and max
    cout << bst.findMin() << endl;  // 1
    cout << bst.findMax() << endl;  // 7

    // Delete
    bst.deleteNode(3);
    cout << bst.search(3) << endl;  // 0 (false)

    // Traverse
    vector<int> inorder = bst.inorderTraversal();
    // Output: [1, 4, 5, 7] (sorted!)

    return 0;
}
```

---

## Delete Operation

BST delete has three cases:

1. **No children (Leaf)**: Simply remove the node
2. **One child**: Replace node with its child
3. **Two children**: 
   - Find inorder successor (minimum in right subtree)
   - Replace node's data with successor's data
   - Delete the successor

---

## Compile and Run

```bash
# Compile
g++ -o bst_test bst_test.cpp

# Run
./bst_test
```

Or compile and run in one command:

```bash
g++ bst_test.cpp -o bst_test && ./bst_test
```

---

## Notes

- This implementation doesn't allow duplicate values
- Destructor properly deallocates all nodes to prevent memory leaks
- For balanced BST operations, consider AVL Tree or Red-Black Tree
- Inorder traversal always produces sorted sequence
- Insertion order affects tree structure but not the sorted property
- Worst case O(n) occurs when tree becomes skewed (like a linked list)

