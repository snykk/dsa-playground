# 🚀 Linked List-Based Stack (Go)

This folder contains the **Go implementation** of a stack using a **singly linked list**.

---

## 📌 Files

- `main.go` → Implementation
- `main_test.go` → Unit tests using Go’s `testing` package

---

## ⚡ Example Usage

```go
stack := NewStack()
stack.Push(10)
stack.Push(20)
fmt.Println(stack.Peek()) // 20
fmt.Println(stack.Pop())  // 20
fmt.Println(stack.Size()) // 1

```

---

## 🧪 Run Tests

```bash
go test
```

---

## ⏱️ Complexity

| Operation | Time Complexity |
| --------- | --------------- |
| Push      | O(1)            |
| Pop       | O(1)            |
| Peek      | O(1)            |
| isEmpty   | O(1)            |
| Size      | O(1)            |
