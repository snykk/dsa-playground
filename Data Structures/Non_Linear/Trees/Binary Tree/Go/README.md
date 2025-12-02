# Binary Tree - Go

This folder contains a Go implementation of a **Binary Tree**.

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
| `Insert(data)`           | Insert data using level-order insertion        | O(n)            |
| `Search(data)`           | Search for data in the tree                    | O(n)            |
| `InorderTraversal()`     | Traverse: Left, Root, Right                    | O(n)            |
| `PreorderTraversal()`    | Traverse: Root, Left, Right                    | O(n)            |
| `PostorderTraversal()`   | Traverse: Left, Right, Root                    | O(n)            |
| `LevelOrderTraversal()`  | Traverse level by level (BFS)                  | O(n)            |
| `Height()`               | Calculate height of the tree                   | O(n)            |
| `Size()`                 | Get total number of nodes                      | O(n)            |
| `IsEmpty()`              | Check if tree is empty                         | O(1)            |

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

```go
package main

import "fmt"

func main() {
    tree := NewBinaryTree()

    // Insert elements
    tree.Insert(1)
    tree.Insert(2)
    tree.Insert(3)
    tree.Insert(4)
    tree.Insert(5)

    // Search for an element
    fmt.Println(tree.Search(3))  // true
    fmt.Println(tree.Search(6))  // false

    // Get tree properties
    fmt.Println(tree.Size())     // 5
    fmt.Println(tree.Height())   // 2
    fmt.Println(tree.IsEmpty())  // false

    // Traverse the tree
    inorder := tree.InorderTraversal()
    fmt.Println(inorder)  // [4, 2, 5, 1, 3]
}
```

---

## Traversal Methods

### 1. Inorder Traversal (Left, Root, Right)
```go
result := tree.InorderTraversal()
// For tree:     1
//              / \
//             2   3
// Output: [2, 1, 3]
```

### 2. Preorder Traversal (Root, Left, Right)
```go
result := tree.PreorderTraversal()
// Output: [1, 2, 3]
```

### 3. Postorder Traversal (Left, Right, Root)
```go
result := tree.PostorderTraversal()
// Output: [2, 3, 1]
```

### 4. Level-Order Traversal (Breadth-First)
```go
result := tree.LevelOrderTraversal()
// Output: [1, 2, 3]
```

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

- This implementation uses level-order insertion (fills from left to right)
- Uses `container/list` for queue operations in level-order traversal
- For more specialized trees, consider Binary Search Tree (BST) which enforces ordering
- Traversal methods use recursion, which may cause stack overflow for very deep trees
- For iterative implementations, use explicit stack/queue data structures

