# B-Tree - Go

This folder contains a Go implementation of a **B-Tree**.

---

## Operations

| Operation                | Description                          | Time Complexity |
| ------------------------- | ------------------------------------ | --------------- |
| `Search(key)`            | Search for a key                     | O(log n)        |
| `Insert(key)`            | Insert a key                         | O(log n)        |

---

## Usage

```go
btree := NewBTree(3)  // min_degree = 3
btree.Insert(10)
btree.Insert(20)
fmt.Println(btree.Search(10))  // true
```

