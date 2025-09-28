# 🚀 Go - Static Array-Based Stack (Fixed Size)

This folder contains a **Go implementation of a static (fixed-size) array-based stack** using arrays.

---

## ⚙️ Features

- Core operations:
  - `Push(value int)` → add element to top (panics if full)
  - `Pop() int` → remove and return top element (panics if empty)
  - `Peek() int` → view top element (panics if empty)
  - `IsEmpty() bool` → check if stack is empty
  - `Size() int` → current number of elements
- Fixed capacity defined at initialization
- Simple, memory-efficient

---

## 📝 Example Usage

```go
package main

import "fmt"

func main() {
    stack := NewArrayStack(3) // max size 3
    stack.Push(10)
    stack.Push(20)
    stack.Push(30)

    fmt.Println(stack.Peek())    // 30
    fmt.Println(stack.Pop())     // 30
    fmt.Println(stack.Pop())     // 20
    fmt.Println(stack.IsEmpty()) // false
    fmt.Println(stack.Pop())     // 10
    fmt.Println(stack.IsEmpty()) // true

    // stack.Push(40) // Would panic if stack is full
}
```

---

## ▶️ Running Tests

```bash
go test
```
