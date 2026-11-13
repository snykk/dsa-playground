# Queue

A queue serves items by a rule: first come first served, or by priority, or from either end. The four versions here differ in that rule and in how they store items, which decides whether removing the front is O(1) or O(n).

## Topics

Read them in this order.

| # | Topic | What it adds | Level |
|---|-------|--------------|-------|
| 1 | [Simple Queue](Simple_Queue/) | The baseline FIFO queue on a growable array. Enqueue is O(1), but dequeue shifts the items in Python and C++. | Beginner |
| 2 | [Circular Queue](Circular_Queue/) | A ring buffer of fixed capacity. The indices wrap around, so enqueue and dequeue are O(1) and nothing shifts. | Beginner |
| 3 | [Deque](Deque/) | Add and remove at both ends, so it works as a stack, a queue or both. The array-backed front is O(n). | Beginner |
| 4 | [Priority Queue](Priority_Queue/) | Serves the lowest priority value first, on a binary min heap. Equal priorities leave in insertion order. | Intermediate |

## How They Compare

| Structure | Next to leave | Storage | Bounded | Enqueue | Dequeue | Space |
|-----------|---------------|---------|---------|---------|---------|-------|
| Simple queue | the oldest item | growable array, front at index 0 | no | O(1) amortized | O(n); O(1) in Go | O(n) |
| Circular queue | the oldest item | fixed array used as a ring | yes, by `capacity` | O(1) | O(1) | O(capacity) |
| Deque | either end, your choice | growable array, front at index 0 | no | O(1) at the back, O(n) at the front | O(1) at the back, O(n) at the front; Go front is O(1) | O(n) |
| Priority queue | the lowest priority value | binary min heap | no | O(log n) | O(log n) | O(n) |

Peek is O(1) in all four. The circular queue is the only bounded one: `enqueue` on a full queue raises `OverflowError` in Python, and the capacity must be at least 1.

## Choosing One

| Situation | Use | Why |
|-----------|-----|-----|
| Learning the idea, or a short queue that is rarely drained | Simple queue | the least code, and the shifting is cheap for a few items |
| A bounded buffer that is filled and drained all the time | Circular queue | O(1) at both ends and the memory never grows |
| Work at both ends, such as a sliding window | Deque | one structure serves as stack and queue |
| The most urgent item must go first | Priority queue | serves by priority in O(log n), with FIFO among ties |
| A large queue with O(1) at both ends in everyday code | a library type | Python `collections.deque` and C++ `std::deque` are O(1) at both ends |

## Common Pitfalls

- Dequeue is not O(1) in the simple queue: in Python and C++ it shifts every remaining item. Only Go reslices.
- The deque's front is not the fast end: it is array-backed here, so `push_front` is O(n) in every language.
- Enqueueing on a full circular queue raises `OverflowError` in Python instead of growing.
- The priority queue is lowest-first. For max behavior, negate the priorities.
- Only the next item is guaranteed by the priority queue; the heap array is not in sorted order.

## Related

- [Array](../Array/): read first.
- [Stack](../Stack/): the last-in, first-out counterpart; a deque can act as either.
- [Min Heap](../../Non_Linear/Heaps/Min_Heap/): the storage behind the priority queue.
- [Monotonic Queue](../../../Problem_Patterns/Monotonic_Queue/): a deque that keeps candidates at both ends.
- [Breadth-First Search](../../../Algorithms/Graph_Algorithms/Traversal/BFS/): the queue holds the frontier in discovery order.
