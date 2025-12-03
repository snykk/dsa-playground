# Red-Black Tree - Go

This folder contains a Go implementation of a **Red-Black Tree**.

A **Red-Black Tree** is a self-balancing Binary Search Tree that guarantees O(log n) time complexity.

---

## Operations

| Operation                | Description                          | Time Complexity |
| ------------------------- | ------------------------------------ | --------------- |
| `Insert(data)`           | Insert data with auto-balancing      | O(log n)        |
| `Search(data)`           | Search for data                      | O(log n)        |
| `InorderTraversal()`     | Traverse in sorted order             | O(n)            |
| `Size()`                 | Get total number of nodes            | O(n)            |
| `IsEmpty()`              | Check if tree is empty               | O(1)            |

---

## Usage

```go
rbt := NewRedBlackTree()
rbt.Insert(10)
rbt.Insert(20)
rbt.Insert(30)
fmt.Println(rbt.Search(20))  // true
```

---

## Notes

- Guarantees O(log n) for all operations
- Fewer rotations than AVL Tree

