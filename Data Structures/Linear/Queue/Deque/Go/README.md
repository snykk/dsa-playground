# Deque -- Go Implementation

A slice-backed double-ended queue. See the [topic README](../README.md) for the concept.

## Files

| File | Contents |
| --- | --- |
| `main.go` | the `Deque` type and a small `main` demo |
| `main_test.go` | tests for every operation, including the empty-deque errors |
| `go.mod` | module definition |

## API

| Function | Description | Time |
| --- | --- | --- |
| `NewDeque() *Deque` | create an empty deque | O(1) |
| `PushFront(item int)` | allocates a new slice and copies | O(n) |
| `PushBack(item int)` | `append` | O(1) amortized |
| `PopFront() (int, error)` | reslices with `[1:]`; error if empty | O(1) |
| `PopBack() (int, error)` | reslices with `[:len-1]`; error if empty | O(1) |
| `PeekFront()`, `PeekBack() (int, error)` | read an end; error if empty | O(1) |
| `IsEmpty()`, `Size()` | length checks | O(1) |

## Go-Specific Notes

- `PopFront` is O(1) because reslicing moves nothing. The skipped slot stays in the backing array until an `append` reallocates, so the slice can hold a dead prefix for a while. The Python and C++ versions pay O(n) for the same operation.
- `PushFront` builds `append([]int{item}, dq.deque...)`, a new slice, so it is O(n).
- Errors are returned, never panicked.

## How to Run

```bash
cd "Data Structures/Linear/Queue/Deque/Go"
go test ./...
go run main.go
```

## Key Takeaways

- Slices make the back and the front-pop cheap, but not the front-push.
- Check the returned error on pop and peek.
