# Circular Queue - Go

Go implementation of a **Circular Queue** (fixed-size FIFO) using slices.

## Usage

```go
q := NewCircularQueue(3)
q.Enqueue(10)
q.Enqueue(20)
q.Enqueue(30)
val, _ := q.Dequeue()
fmt.Println(val) // 10
q.Enqueue(40)
peek, _ := q.Peek()
fmt.Println(peek) // 20
```

---

## Run Test

```bash
go test
```
