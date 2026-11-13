# Circular Queue -- Go Implementation

A bounded FIFO queue over a slice, using an explicit `size` counter to tell empty from full. See the [topic README](../README.md) for the concept.

## Files

| File | Contents |
| --- | --- |
| `main.go` | the `CircularQueue` type |
| `main_test.go` | tests: basic behaviour, full and empty errors, wrap-around over many laps |
| `go.mod` | module definition |

## API

| Function | Description |
| --- | --- |
| `NewCircularQueue(cap int) *CircularQueue` | create a queue with a fixed capacity |
| `Enqueue(x int) error` | add at the rear; returns an error when full |
| `Dequeue() (int, error)` | remove and return the front item; error when empty |
| `Peek() (int, error)` | return the front item; error when empty |
| `IsEmpty()`, `IsFull()`, `Size()` | state queries |

All operations are O(1). The fields are `front`, `rear`, `capacity` and `size`.

## Go-Specific Notes

- The backing slice is created once with `make([]int, cap)`; there is no `append` and no growth.
- The constructor has no error return, so it does not validate `cap`: capacity 0 gives a queue that reports both empty and full, and a negative capacity panics inside `make`.
- Because `size` is stored, `front == rear` never needs to be interpreted; this differs from the sentinel scheme of the Python and C++ versions.
- The queue is not safe for concurrent use. A buffered channel (`make(chan int, n)`) is the idiomatic bounded queue between goroutines.

## How to Run

```bash
cd "Data_Structures/Linear/Queue/Circular_Queue/Go"
go test ./...
```

## Key Takeaways

- An explicit size counter is the simplest way to separate empty from full.
- `(rear + 1) % capacity` is the whole wrap-around trick.
- Check the error returned by `Enqueue`.
