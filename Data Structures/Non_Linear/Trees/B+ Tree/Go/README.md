# B+ Tree - Go

This folder contains a Go implementation of a **B+ Tree**.

---

## Operations

| Operation                | Description                          | Time Complexity |
| ------------------------- | ------------------------------------ | --------------- |
| `Search(key)`            | Search for a key                     | O(log n)        |
| `Insert(key, value)`     | Insert a key-value pair              | O(log n)        |

---

## Usage

```go
bptree := NewBPlusTree(3)
bptree.Insert(10, "value10")
fmt.Println(bptree.Search(10))  // "value10"
```

