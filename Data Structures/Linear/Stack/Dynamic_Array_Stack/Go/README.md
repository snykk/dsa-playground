# Dynamic Size Array Stack -- Go Implementation

A LIFO stack of `int` backed by a slice. See the [topic README](../README.md) for the concept.

## Files

| File | Contents |
| --- | --- |
| `main.go` | the `ArrayStack` type and a small `main` demo |
| `main_test.go` | tests for basic behaviour, panics on an empty stack, and growth over 1000 pushes |
| `go.mod` | module definition |

## API

| Function | Description | Time |
| --- | --- | --- |
| `Push(value int)` | `append` | O(1) amortized |
| `Pop() int` | remove and return the top; panics if empty | O(1) |
| `Peek() int` | return the top; panics if empty | O(1) |
| `IsEmpty()`, `Size()` | length checks | O(1) |

The zero value `ArrayStack{}` is an empty stack ready to use.

## Go-Specific Notes

- `Pop` and `Peek` panic on an empty stack and return a single `int`, not `(int, error)`. The Static Size and Linked List Based stacks return an error instead, so check `IsEmpty()` first here.
- `append` reallocates with a larger capacity when needed, so the cost is amortized.
- `Pop` reslices (`s.stack[:len-1]`) and does not shrink the backing array.

## How to Run

```bash
cd "Data Structures/Linear/Stack/Dynamic_Array_Stack/Go"
go test ./...
go run main.go
```

## Key Takeaways

- A slice with `append` and reslicing is a complete stack.
- Guard `Pop` and `Peek` with `IsEmpty()`.
