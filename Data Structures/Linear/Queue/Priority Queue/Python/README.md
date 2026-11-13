# Priority Queue -- Python Implementation

A min-heap priority queue built on `heapq`. See the [topic README](../README.md) for the concept.

## Files

| File | Contents |
| --- | --- |
| `priority_queue.py` | the `PriorityQueue` class |
| `priority_queue_test.py` | unit tests (`unittest`) |

## API

| Method | Description | Time |
| --- | --- | --- |
| `enqueue(item, priority)` | add an item; lower priority value leaves first | O(log n) |
| `dequeue()` | remove and return the best item; raises `IndexError` if empty | O(log n) |
| `peek()` | return the best item; raises `IndexError` if empty | O(1) |
| `is_empty()`, `size()` | length checks | O(1) |
| `clear()` | remove everything and reset the counter | O(1) |

## Python-Specific Notes

- Entries are tuples `(priority, count, item)`. Because `count` is unique, Python never compares two items, so items need not be orderable.
- `count` is unbounded (Python integers do not overflow) and keeps equal priorities in insertion order.
- `heapq` is a min heap. To get the largest priority first, enqueue `-priority`:

```python
pq = PriorityQueue()
pq.enqueue("item1", -10)
pq.enqueue("item2", -5)
pq.enqueue("item3", -1)
print(pq.dequeue())  # item1: priority -10 is the smallest value
```

- `queue.PriorityQueue` from the standard library is the thread-safe equivalent.

## How to Run

```bash
cd "Data Structures/Linear/Queue/Priority Queue/Python"
python3 -m unittest priority_queue_test
```

## Key Takeaways

- Lower number means higher priority.
- The counter turns a heap into a stable priority queue.
