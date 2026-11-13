# Circular Queue -- Python Implementation

A bounded FIFO queue over a preallocated list, using a `front = -1` sentinel for the empty state. See the [topic README](../README.md) for the concept.

## Files

| File | Contents |
| --- | --- |
| `circular_queue.py` | the `CircularQueue` class |
| `circular_queue_test.py` | unit tests (`unittest`) |

## API

| Method | Description |
| --- | --- |
| `CircularQueue(capacity)` | create a queue; raises `ValueError` if `capacity < 1` |
| `enqueue(item)` | add at the rear; raises `OverflowError` when full |
| `dequeue()` | remove and return the front item; raises `IndexError` when empty |
| `peek()` | return the front item; raises `IndexError` when empty |
| `is_empty()`, `is_full()`, `size()` | state queries |

All operations are O(1).

## Python-Specific Notes

- The list `[None] * capacity` is allocated once; items are overwritten in place.
- `dequeue` sets the vacated slot back to `None` so the removed object can be garbage collected.
- Any Python object can be stored, not only numbers.
- `collections.deque(maxlen=n)` is the standard-library way to get a bounded queue, but it silently drops the oldest item when full instead of raising.

## How to Run

```bash
cd "Data_Structures/Linear/Queue/Circular_Queue/Python"
python3 -m unittest circular_queue_test
```

## Key Takeaways

- Moving `front` and `rear` with `% capacity` avoids shifting.
- Validate the capacity: 0 would divide by zero.
- Python and C++ use the `front = -1` sentinel; Go uses a size counter.
