# Simple Queue -- Go Implementation

A FIFO queue of `int` backed by a slice. See the [topic README](../README.md) for the concept.

## Files

| File | Contents |
| --- | --- |
| `main.go` | the `SimpleQueue` type and a small `main` demo |
| `main_test.go` | tests for basic behaviour, FIFO order over 50 items and the empty-queue errors |
| `go.mod` | module definition |

## API

| Function | Description | Time |
| --- | --- | --- |
| `NewSimpleQueue() *SimpleQueue` | create an empty queue | O(1) |
| `Enqueue(x int)` | `append` | O(1) amortized |
| `Dequeue() (int, error)` | reslice with `[1:]`; error if empty | O(1) |
| `Peek() (int, error)` | return the front item; error if empty | O(1) |
| `IsEmpty()`, `Size()` | length checks | O(1) |

## Go-Specific Notes

- `Dequeue` reslices, so no element is copied. This differs from the Python and C++ versions, which shift every item.
- The skipped slot stays in the backing array until a later `append` reallocates. The new array then holds only the live items, so the backing array does not grow without bound.
- `Peek` and `Dequeue` return `(int, error)`: `fmt.Println(q.Peek())` prints the value and `<nil>`.

## How to Run

```bash
cd "Data Structures/Linear/Queue/Simple Queue/Go"
go test ./...
go run main.go
```

## Key Takeaways

- Reslicing gives an O(1) dequeue without a linked list.
- Check the error returned by `Dequeue` and `Peek`.
