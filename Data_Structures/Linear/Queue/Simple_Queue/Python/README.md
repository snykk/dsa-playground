# Simple Queue -- Python Implementation

A FIFO queue backed by a Python `list`. See the [topic README](../README.md) for the concept.

## Files

| File | Contents |
| --- | --- |
| `simple_queue.py` | the `SimpleQueue` class |
| `simple_queue_test.py` | unit tests (`unittest`) |

## API

| Method | Description | Time |
| --- | --- | --- |
| `enqueue(item)` | append at the back | O(1) amortized |
| `dequeue()` | `list.pop(0)`; raises `IndexError` if empty | O(n) |
| `peek()` | return the front item; raises `IndexError` if empty | O(1) |
| `is_empty()`, `size()` | length checks | O(1) |

## Python-Specific Notes

- The implementation raises `IndexError` on an empty queue. It does not return `None`.
- `pop(0)` shifts every remaining item. `collections.deque` gives O(1) `popleft()` and is the standard choice.
- Any Python object can be stored.

## How to Run

```bash
cd "Data_Structures/Linear/Queue/Simple_Queue/Python"
python3 -m unittest simple_queue_test
```

## Key Takeaways

- FIFO order comes from appending at the back and removing at the front.
- `list.pop(0)` makes dequeue linear.
