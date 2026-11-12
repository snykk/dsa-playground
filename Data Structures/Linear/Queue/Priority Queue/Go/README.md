# Priority Queue -- Go Implementation

A min-heap priority queue on `container/heap`. See the [topic README](../README.md) for the concept.

## Files

| File | Contents |
| --- | --- |
| `main.go` | `PQItem`, the heap type `PriorityQueue`, the API type `PriorityQueueWrapper` and a small `main` demo |
| `main_test.go` | tests for ordering, ties, peek, size, clear and the empty-queue errors |
| `go.mod` | module definition |

## API

| Function | Description | Time |
| --- | --- | --- |
| `NewPriorityQueueWrapper() *PriorityQueueWrapper` | create an empty queue | O(1) |
| `Enqueue(item, priority int)` | add an item; lower priority value leaves first | O(log n) |
| `Dequeue() (int, error)` | remove and return the best item; error if empty | O(log n) |
| `Peek() (int, error)` | return the best item; error if empty | O(1) |
| `IsEmpty()`, `Size()` | length checks | O(1) |
| `Clear()` | remove everything and reset the counter | O(1) |

## Go-Specific Notes

- `PriorityQueue` is the raw heap slice that satisfies `heap.Interface` (`Len`, `Less`, `Swap`, `Push`, `Pop`). Use `PriorityQueueWrapper` instead; it adds the counter and the error handling.
- `Less` compares priority and then the insertion counter, so equal priorities are first in, first out.
- `container/heap` is a min heap. For the largest first, enqueue `-priority`.
- Items and priorities are `int`.

## How to Run

```bash
cd "Data Structures/Linear/Queue/Priority Queue/Go"
go test ./...
go run main.go
```

## Key Takeaways

- Implementing `heap.Interface` is all that `container/heap` needs.
- Wrap the heap to hide the raw `Push` and `Pop`.
