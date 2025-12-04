# Sparse Table - Go

This folder contains a Go implementation of a **Sparse Table**.

A **Sparse Table** is a static data structure that supports O(1) range minimum/maximum queries (RMQ) after O(n log n) preprocessing. It does not support updates.

---

## Concept

- **Static Structure**: Array cannot be modified after construction
- **O(1) Queries**: Fastest query time for RMQ (Range Minimum/Maximum Query)
- **O(n log n) Preprocessing**: Build time is O(n log n)
- **No Updates**: Cannot update array elements (use Segment Tree if updates needed)

---

## Operations

| Operation                | Description                          | Time Complexity |
| ------------------------ | ------------------------------------ | --------------- |
| `Query(left, right)`     | Get min/max in range [left, right]   | O(1)            |
| `Get(index)`             | Get value at index                   | O(1)            |

---

## Complexity

| Operation     | Time Complexity | Space Complexity |
| ------------- | --------------- | ---------------- |
| Build         | O(n log n)      | O(n log n)       |
| Query         | O(1)            | O(1)             |
| Update        | Not supported   | -                |
| Space         | O(n log n)      | O(n log n)       |

---

## Usage

```go
package main

import "fmt"

func main() {
    // Initialize with array (min query)
    arr := []int{1, 3, 5, 7, 9, 11, 2, 4, 6, 8}
    stMin := NewSparseTable(arr, "min")
    
    // Range minimum query
    fmt.Println(stMin.Query(0, 2))   // 1
    fmt.Println(stMin.Query(1, 3))   // 3
    
    // Initialize with array (max query)
    stMax := NewSparseTable(arr, "max")
    
    // Range maximum query
    fmt.Println(stMax.Query(0, 2))   // 5
    fmt.Println(stMax.Query(1, 3))   // 7
}
```

---

## Run Test

```bash
go test
```

---

## Applications

- Range minimum/maximum queries (RMQ)
- Static array queries (no updates)
- Competitive programming (when updates are not needed)
- LCA (Lowest Common Ancestor) in trees

