# 🚀 Go - Dynamic Array-Based Stack (Dynamic Size)

This folder contains a **Go implementation of a dynamic array-based stack** using slices.

---

## ⚙️ Features

- Core operations:
  - `Push(value int)` → add element to top
  - `Pop() int` → remove and return top element (panics if empty)
  - `Peek() int` → view top element (panics if empty)
  - `IsEmpty() bool` → check if stack is empty
  - `Size() int` → get current number of elements
- Automatic resizing handled by Go slices

---

## 📝 Example Usage

```go
package main

import "fmt"

func main() {
    stack := ArrayStack{}
    stack.Push(10)
    stack.Push(20)
    stack.Push(30)

    fmt.Println(stack.Peek())    // 30
    fmt.Println(stack.Pop())     // 30
    fmt.Println(stack.Pop())     // 20
    fmt.Println(stack.IsEmpty()) // false
    fmt.Println(stack.Pop())     // 10
    fmt.Println(stack.IsEmpty()) // true
}
```

---

## ▶️ Running Tests

```bash
go test
```
