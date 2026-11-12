# Circular Queue

A **circular queue** (ring buffer) is a bounded FIFO queue stored in a fixed array whose front and rear indices wrap around the end. Enqueue, dequeue and peek are all O(1), nothing is ever shifted, and memory is allocated once.

## Intuition

A plain array queue wastes the slots freed at the front. A circular queue treats the array as a ring: when an index passes the last slot, `% capacity` sends it back to slot 0, so freed slots are reused.

Two indices describe the queue: `front` (oldest item, next to dequeue) and `rear` (newest item). The queue is the run of slots from `front` to `rear`, wrapping at the end. Both indices only move forward by one slot, using `(i + 1) % capacity`.

## Visual

Capacity 5 holding `C D E F`, after the ring has wrapped:

```text
index:    0    1    2    3    4
        +----+----+----+----+----+
        | F  |    | C  | D  | E  |
        +----+----+----+----+----+
          ^         ^
         rear      front

dequeue order: C, D, E, F
```

## Operations

| Operation | Description | Time |
| --- | --- | --- |
| `enqueue(x)` | advance `rear`, store `x`; error if full | O(1) |
| `dequeue()` | return the item at `front`, advance `front`; error if empty | O(1) |
| `peek()` | return the item at `front`; error if empty | O(1) |
| `is_empty()` / `is_full()` / `size()` | index arithmetic | O(1) |

Telling empty from full: Python and C++ use a sentinel (`front == -1` means empty, full means `(rear + 1) % capacity == front`). Go keeps an explicit `size` counter. A third common choice, not used here, is to leave one slot unused.

The capacity must be at least 1. Python raises `ValueError`, C++ throws `std::invalid_argument`. Go's constructor has no error return: capacity 0 gives a queue that is always full, a negative capacity panics in `make`.

## Step-by-Step Trace

Capacity 5. States come from running the Python version.

| Step | Array | front | rear | size |
| --- | --- | --- | --- | --- |
| enqueue `A`..`E` | `[A, B, C, D, E]` | 0 | 4 | 5 (full) |
| dequeue twice (returns `A`, `B`) | `[_, _, C, D, E]` | 2 | 4 | 3 |
| enqueue `F` (`rear = (4+1) % 5 = 0`) | `[F, _, C, D, E]` | 2 | 0 | 4 |
| enqueue `G` | `[F, G, C, D, E]` | 2 | 1 | 5 (full) |

Dequeuing now returns `C, D, E, F, G`.

## Complexity

| Operation | Time | Why |
| --- | --- | --- |
| enqueue, dequeue, peek | O(1) | one modulo and one array access |
| is_empty, is_full, size | O(1) | arithmetic on the indices |
| search | O(n) | items are only reachable from the front |

Space is O(capacity), fixed at construction, with O(1) extra space per operation.

## When to Use

Use it when the queue has a natural bound and you want constant-time operations with no allocation after setup: stream and I/O buffers, "last N items", fixed-size work queues. Do not use it when the number of items is unbounded: the queue rejects an enqueue when full and never grows.

## Circular Queue vs. Other Queues

| Structure | Enqueue | Dequeue | Notes |
| --- | --- | --- | --- |
| Circular queue | O(1) | O(1) | bounded, no shifting |
| [Simple Queue](../Simple%20Queue) | O(1) | O(n) in Python and C++ | dequeue shifts items |
| Linked-list queue | O(1) | O(1) | unbounded, one pointer per item (not in this repo) |
| [Deque](../Deque) | O(1) at both ends | O(1) at both ends | works at both ends |

## Common Pitfalls

- Capacity 0 makes `% capacity` divide by zero: validate it.
- Without a counter, sentinel or spare slot, `front == rear` is ambiguous.
- Using `rear + 1` without `% capacity` runs off the array.
- `size = rear - front + 1` is wrong once the ring has wrapped (`rear < front`): add `capacity`.
- In C++ a class that owns a raw array must not be copied; this one deletes its copy operations.

## Implementations

| Language | Folder | Main file | Notes |
| --- | --- | --- | --- |
| Python | [Python](Python) | `circular_queue.py` | sentinel scheme; `ValueError` for capacity below 1; clears the slot on dequeue |
| C++ | [C++](C++) | `circular_queue.cpp` | sentinel scheme; raw `int*` array, copy deleted; `std::invalid_argument` for capacity below 1 |
| Go | [Go](Go) | `main.go` | explicit `size` counter; methods return `error` |

## Practice Problems

- LeetCode 622: Design Circular Queue.
- LeetCode 641: Design Circular Deque.
- LeetCode 346: Moving Average from Data Stream (a fixed window, naturally a ring).

## Related

- [Simple Queue](../Simple%20Queue)
- [Deque](../Deque)
- [Priority Queue](../Priority%20Queue)
- [Queue overview](../README.md)
