# Priority Queue

A **priority queue** serves the item with the best priority first instead of the one that arrived first. This folder builds it on a binary min heap: enqueue and dequeue are O(log n), peek is O(1), and equal priorities leave in insertion order.

## Intuition

A simple queue answers "who came first?", a priority queue answers "who matters most?". Each entry carries a priority, and `dequeue` returns the entry with the best one.

In this folder a **lower number is a higher priority**: `dequeue` returns the item with the smallest priority value. For the largest first, negate the priority when enqueueing.

The structure behind it is a binary min heap in an array (see the [Min Heap](../../../Non_Linear/Heaps/Min_Heap) topic for sift up, sift down and the index formulas). Each entry is `(priority, counter, item)`, where the counter is the insertion number. The heap orders entries by priority and then by counter, so equal priorities come out first in, first out.

## Visual

Heap after enqueueing `write report` (3), `fix bug` (1), `email` (3), `deploy` (2), `review` (1). Each node shows `priority #counter`:

```text
                1 #1            <- next to leave (fix bug)
              /      \
          1 #4        3 #2
         /    \
     3 #0      2 #3

array: [1 #1, 1 #4, 3 #2, 3 #0, 2 #3]
```

## Operations

| Operation | Description | Time |
| --- | --- | --- |
| `enqueue(item, priority)` | append an entry, sift it up | O(log n) |
| `dequeue()` | remove the root, move the last entry to the root, sift it down; returns the item only | O(log n) |
| `peek()` | the root item | O(1) |
| `is_empty()` / `size()` | length checks | O(1) |
| `clear()` | drop all entries, reset the counter | O(1) in Python and Go, O(n) in C++ |

Dequeue or peek on an empty queue raises `IndexError` (Python), throws `std::runtime_error` (C++) or returns an error (Go).

Sift up: swap the new entry with its parent while it is smaller (by priority, then counter). Sift down: swap the sinking entry with its smaller child while it is larger. A heap of n entries has about log2(n) levels, which bounds both loops.

## Step-by-Step Trace

Python run, enqueueing in this order: `write report` (3), `fix bug` (1), `email` (3), `deploy` (2), `review` (1).

| Enqueue | Heap array (`priority #counter`) |
| --- | --- |
| `write report` | `[3 #0]` |
| `fix bug` | `[1 #1, 3 #0]` (swapped with the root) |
| `email` | `[1 #1, 3 #0, 3 #2]` |
| `deploy` | `[1 #1, 2 #3, 3 #2, 3 #0]` (swapped with its parent `3 #0`) |
| `review` | `[1 #1, 1 #4, 3 #2, 3 #0, 2 #3]` (swapped with `2 #3`, stopped under `1 #1`) |

Dequeuing everything returns `fix bug`, `review`, `deploy`, `write report`, `email`. The two priority-1 items leave in insertion order, as do the two priority-3 items.

## Complexity

| Operation | Time | Why |
| --- | --- | --- |
| enqueue | O(log n) | one swap per level at most |
| dequeue | O(log n) | one sift down |
| peek | O(1) | the best entry is at index 0 |
| search for an arbitrary item | O(n) | a heap is ordered only along parent-child paths |

Space is O(n), plus one counter per entry.

## When to Use

Use it when the next item to process depends on a priority: schedulers, shortest-path algorithms, event simulation, top-k selection, merging sorted lists. Do not use it when you need sorted iteration, or to change the priority of an item already queued (this implementation has no decrease-key).

## Priority Queue vs. Other Representations

| Representation | Enqueue | Dequeue | Notes |
| --- | --- | --- | --- |
| Binary heap (here) | O(log n) | O(log n) | standard choice |
| Unsorted array | O(1) | O(n) | scan on every dequeue |
| Sorted array | O(n) | O(1) | inserts shift items |
| Balanced BST | O(log n) | O(log n) | also gives sorted order |

Against the other queues in this section ([Simple Queue](../Simple_Queue), [Circular Queue](../Circular_Queue), [Deque](../Deque)), which all remove in arrival order or from an end, a priority queue removes by priority.

## Common Pitfalls

- Treating a bigger number as higher priority. For a max priority queue negate the priority: after enqueueing -10, -5, -1 the first `dequeue` returns the item with priority -10.
- Expecting `dequeue` to return the priority; it returns the item only.
- Expecting sorted iteration; only the root is guaranteed.
- Relying on tie order from a plain heap: a bare heap is not stable, the counter is what keeps equal priorities in insertion order.
- Dequeuing from an empty queue without checking `is_empty()`.

## Implementations

| Language | Folder | Main file | Notes |
| --- | --- | --- | --- |
| Python | [Python](Python) | `priority_queue.py` | `heapq` on `(priority, counter, item)` tuples; any item type |
| C++ | [C++](C++) | `priority_queue.cpp` | hand-written sift up and sift down on a `std::vector`; `int` items; 64-bit counter |
| Go | [Go](Go) | `main.go` | `container/heap`; use `PriorityQueueWrapper`; `int` items |

## Practice Problems

- [Last Stone Weight (LeetCode 1046)](https://leetcode.com/problems/last-stone-weight/)
- [Kth Largest Element in a Stream (LeetCode 703)](https://leetcode.com/problems/kth-largest-element-in-a-stream/)
- [Kth Largest Element in an Array (LeetCode 215)](https://leetcode.com/problems/kth-largest-element-in-an-array/)
- [Top K Frequent Elements (LeetCode 347)](https://leetcode.com/problems/top-k-frequent-elements/)
- [Merge k Sorted Lists (LeetCode 23)](https://leetcode.com/problems/merge-k-sorted-lists/)
- [Room Allocation (CSES 1164)](https://cses.fi/problemset/task/1164)

## Related

- [Min Heap](../../../Non_Linear/Heaps/Min_Heap)
- [Max Heap](../../../Non_Linear/Heaps/Max_Heap)
- [Simple Queue](../Simple_Queue)
- [Queue overview](../README.md)
