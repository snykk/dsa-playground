# Segment Tree - Go

This folder contains a Go implementation of a **Segment Tree**.

---

## Operations

| Operation                | Description                          | Time Complexity |
| ------------------------- | ------------------------------------ | --------------- |
| `Query(left, right)`     | Get sum in range [left, right]       | O(log n)        |
| `Update(index, value)`   | Update value at index                | O(log n)        |
| `Get(index)`             | Get value at index                   | O(1)            |

---

## Usage

```go
arr := []int{1, 3, 5, 7, 9, 11}
st := NewSegmentTree(arr)
fmt.Println(st.Query(0, 2))  // 9
```

