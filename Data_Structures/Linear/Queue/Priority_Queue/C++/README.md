# Priority Queue -- C++ Implementation

A min-heap priority queue with hand-written sift up and sift down over a `std::vector`. See the [topic README](../README.md) for the concept.

## Files

| File | Contents |
| --- | --- |
| `priority_queue.cpp` | `PQItem` (priority, counter, item) and the `PriorityQueue` class |
| `priority_queue_test.cpp` | assert-based tests, built with `-DIS_TEST_BUILD` |

## API

| Member | Description | Time |
| --- | --- | --- |
| `void enqueue(int item, int priority)` | add an item; lower priority value leaves first | O(log n) |
| `int dequeue()` | remove and return the best item; throws `std::runtime_error` if empty | O(log n) |
| `int peek()` | return the best item; throws `std::runtime_error` if empty | O(1) |
| `bool is_empty()`, `int size()` | length checks | O(1) |
| `void clear()` | remove everything and reset the counter | O(n) |

## C++-Specific Notes

- `PQItem::operator<` compares priority first and then the insertion counter, which makes equal priorities first in, first out.
- The counter is a `uint64_t`; a 32-bit signed counter would overflow (undefined behaviour) after 2^31 enqueues without a `clear()`.
- `heapify_up` and `heapify_down` are the same loops as in the Min Heap topic.
- `std::priority_queue` is a max heap by default and is not stable.
- Items and priorities are `int`.

## How to Run

```bash
cd "Data_Structures/Linear/Queue/Priority_Queue/C++"
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD priority_queue_test.cpp -o priority_queue_test
./priority_queue_test
```

## Key Takeaways

- A comparison on `(priority, counter)` gives a stable priority queue.
- Use a 64-bit counter for the tie-break.
