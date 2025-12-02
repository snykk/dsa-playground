# Binary Search Tree (BST) - Go

This folder contains a Go implementation of a **Binary Search Tree (BST)**.

A **Binary Search Tree** is a binary tree with an ordering property: for each node, all values in the left subtree are less than the node's value, and all values in the right subtree are greater than the node's value. This property enables efficient search, insertion, and deletion operations.

---

## Concept

- **BST Property**: For each node, `left child < node < right child`
- **Ordered Structure**: Inorder traversal produces sorted sequence
- **Efficient Operations**: O(log n) average case for search, insert, delete
- **No Duplicates**: This implementation doesn't allow duplicate values

---

## Operations

| Operation                | Description                                    | Time Complexity |
| ------------------------- | ---------------------------------------------- | --------------- |
| `Insert(data)`           | Insert data maintaining BST property           | O(log n) avg    |
| `Search(data)`           | Search for data in the BST                    | O(log n) avg    |
| `Delete(data)`           | Delete data from the BST                       | O(log n) avg    |
| `FindMin()`              | Find minimum value in BST                      | O(log n) avg    |
| `FindMax()`              | Find maximum value in BST                      | O(log n) avg    |
| `InorderTraversal()`     | Traverse: Left, Root, Right (sorted order)     | O(n)            |
| `PreorderTraversal()`    | Traverse: Root, Left, Right                    | O(n)            |
| `PostorderTraversal()`   | Traverse: Left, Right, Root                    | O(n)            |
| `LevelOrderTraversal()`  | Traverse level by level (BFS)                  | O(n)            |
| `Height()`               | Calculate height of the tree                   | O(n)            |
| `Size()`                 | Get total number of nodes                      | O(n)            |
| `IsEmpty()`              | Check if tree is empty                         | O(1)            |

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

```go
package main

import "fmt"

func main() {
    bst := NewBinarySearchTree()

    // Insert elements
    bst.Insert(5)
    bst.Insert(3)
    bst.Insert(7)
    bst.Insert(1)
    bst.Insert(4)

    // Search
    fmt.Println(bst.Search(3))  // true
    fmt.Println(bst.Search(6))  // false

    // Find min and max
    min, _ := bst.FindMin()
    max, _ := bst.FindMax()
    fmt.Println("Min:", min)  // 1
    fmt.Println("Max:", max)  // 7

    // Delete
    bst.Delete(3)
    fmt.Println(bst.Search(3))  // false

    // Traverse (inorder produces sorted order)
    inorder := bst.InorderTraversal()
    fmt.Println(inorder)  // [1, 4, 5, 7]
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

## Run Test

```bash
go test -v
```

Or run the main program:

```bash
go run main.go
```

---

## Notes

- This implementation doesn't allow duplicate values
- Uses `container/list` for queue operations in level-order traversal
- For balanced BST operations, consider AVL Tree or Red-Black Tree
- Inorder traversal always produces sorted sequence
- Insertion order affects tree structure but not the sorted property
- Worst case O(n) occurs when tree becomes skewed (like a linked list)

