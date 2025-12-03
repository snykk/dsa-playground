# AVL Tree - Go

This folder contains a Go implementation of an **AVL Tree** (Adelson-Velsky and Landis Tree).

An **AVL Tree** is a self-balancing Binary Search Tree where the height difference between left and right subtrees of any node is at most 1. This guarantees O(log n) time complexity for all operations.

---

## Concept

- **Self-Balancing**: Automatically maintains balance after insert/delete
- **Balance Factor**: height(left) - height(right) must be -1, 0, or 1
- **Rotations**: Uses rotations to restore balance when needed
- **Guaranteed O(log n)**: All operations are O(log n) even in worst case

---

## Operations

| Operation                | Description                                    | Time Complexity |
| ------------------------- | ---------------------------------------------- | --------------- |
| `Insert(data)`           | Insert data with automatic balancing           | O(log n)        |
| `Search(data)`           | Search for data in the tree                    | O(log n)        |
| `Delete(data)`           | Delete data with automatic balancing            | O(log n)        |
| `FindMin()`              | Find minimum value                              | O(log n)        |
| `FindMax()`              | Find maximum value                              | O(log n)        |
| `InorderTraversal()`     | Traverse: Left, Root, Right (sorted)            | O(n)            |
| `Height()`               | Calculate tree height                          | O(1)            |
| `Size()`                 | Get total number of nodes                       | O(n)            |
| `IsEmpty()`              | Check if tree is empty                          | O(1)            |
| `IsBalanced()`           | Check if tree maintains AVL property            | O(n)            |

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

```go
package main

import "fmt"

func main() {
    avl := NewAVLTree()

    // Insert elements (tree auto-balances)
    avl.Insert(10)
    avl.Insert(20)
    avl.Insert(30)
    avl.Insert(40)
    avl.Insert(50)

    // Search
    fmt.Println(avl.Search(30))  // true
    fmt.Println(avl.Search(60))  // false

    // Find min and max
    min, _ := avl.FindMin()
    max, _ := avl.FindMax()
    fmt.Println("Min:", min)  // 10
    fmt.Println("Max:", max)  // 50

    // Delete (tree auto-balances)
    avl.Delete(30)
    fmt.Println(avl.Search(30))  // false
    fmt.Println(avl.IsBalanced())  // true

    // Traverse
    inorder := avl.InorderTraversal()
    fmt.Println(inorder)  // [10, 20, 40, 50] (sorted!)
}
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

- AVL Tree guarantees O(log n) for all operations
- More rotations than Red-Black Tree, but simpler to understand
- Better for read-heavy workloads
- Height is always O(log n), making it more balanced than regular BST

