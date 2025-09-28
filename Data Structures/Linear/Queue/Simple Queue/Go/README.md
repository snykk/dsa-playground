# Simple Queue - Go

Go implementation of a **Simple Queue** (FIFO) using slices.

## Usage

```go
q := NewSimpleQueue()
q.Enqueue(1)
q.Enqueue(2)
val, _ := q.Dequeue()
fmt.Println(val) // Output: 1
```

---

## Run Test

```bash
go test
```
