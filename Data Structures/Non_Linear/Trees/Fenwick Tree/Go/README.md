# Fenwick Tree (Binary Indexed Tree) - Go

This folder contains a Go implementation of a **Fenwick Tree**.

---

## Operations

| Operation                | Description                          | Time Complexity |
| ------------------------- | ------------------------------------ | --------------- |
| `Query(left, right)`     | Get sum in range [left, right]       | O(log n)        |
| `PrefixSum(index)`       | Get sum from 0 to index              | O(log n)        |
| `Update(index, delta)`   | Add delta to value at index          | O(log n)        |
| `Get(index)`             | Get value at index                   | O(log n)        |

---

## Usage

```go
arr := []int{1, 3, 5, 7, 9, 11}
ft := NewFenwickTree(arr)
fmt.Println(ft.Query(0, 2))  // 9
```

