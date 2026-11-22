# Simple Queue

A **queue** serves items in first-in, first-out (FIFO) order: the item that has waited longest leaves first. This folder holds a simple array-backed queue. Enqueue is O(1) amortized, and dequeue is O(n) in Python and C++ (items shift) but O(1) in Go (reslice).

## Intuition

A queue is a line. New items join at the back (`enqueue`), the item at the front leaves first (`dequeue`), and nothing in the middle can be touched. The invariant is that items leave in exactly the order they arrived: `enqueue` only touches the back, `dequeue` and `peek` only touch the front.

The items are stored in a growable array (Python `list`, C++ `std::vector<int>`, Go `[]int`), with the front at index 0.

## Visual

```text
 dequeue <-- front                        back <-- enqueue
               |                            |
               v                            v
             +----+----+----+
             | 10 | 20 | 30 |
             +----+----+----+
 index          0    1    2
```

## Operations

| Operation | Description | Time |
| --- | --- | --- |
| `enqueue(x)` | append at the back | O(1) amortized |
| `dequeue()` | remove and return the front item | O(n) in Python and C++, O(1) in Go |
| `peek()` | return the front item without removing it | O(1) |
| `is_empty()` / `size()` | length checks | O(1) |

Go names them `Enqueue`, `Dequeue`, `Peek`, `IsEmpty`, `Size`. Dequeue and peek on an empty queue raise `IndexError` (Python), throw `std::runtime_error` (C++) or return an error (Go). `Peek` and `Dequeue` in Go return `(int, error)`.

Why dequeue is O(n): Python's `list.pop(0)` and C++ `vector::erase(begin())` move every remaining item one slot left. Go's `q.queue = q.queue[1:]` only moves the start of the slice view, so nothing is copied. The dropped slot stays in the backing array until a later `append` reallocates.

## Step-by-Step Trace

| Operation | Queue (front to back) | Returns |
| --- | --- | --- |
| `enqueue(10)` | `[10]` | |
| `enqueue(20)` | `[10, 20]` | |
| `enqueue(30)` | `[10, 20, 30]` | |
| `dequeue()` | `[20, 30]` | 10 |
| `enqueue(40)` | `[20, 30, 40]` | |
| `peek()` | `[20, 30, 40]` | 20 |

## Complexity

| Operation | Python list | C++ vector | Go slice |
| --- | --- | --- | --- |
| enqueue | O(1) amortized | O(1) amortized | O(1) amortized |
| dequeue | O(n) | O(n) | O(1) |
| peek | O(1) | O(1) | O(1) |
| is_empty, size | O(1) | O(1) | O(1) |
| space | O(n) | O(n) | O(n) |

Enqueue is amortized because an append sometimes reallocates and copies the array; growing geometrically makes the average constant. Draining n items costs O(n^2) in Python and C++ and O(n) in Go.

## When to Use

Use it to learn, or when queues are small and arrival order matters: BFS frontiers, task handling in arrival order, buffers, simulations. For large queues use a design with O(1) dequeue.

## Simple Queue vs. Alternatives

| Design | Enqueue | Dequeue | Notes |
| --- | --- | --- | --- |
| Array with shifting (Python, C++ here) | O(1) | O(n) | simplest |
| Array with a head index (Go here) | O(1) | O(1) | dead prefix reclaimed on growth |
| [Circular Queue](../Circular_Queue) | O(1) | O(1) | bounded, reuses slots |
| Linked list with head and tail | O(1) | O(1) | unbounded, one node per item (not in this folder) |
| [Deque](../Deque) | O(1) at the back | see the Deque topic | works at both ends |
| [Priority Queue](../Priority_Queue) | O(log n) | O(log n) | removes by priority |

## Common Pitfalls

- Assuming dequeue is O(1): in Python and C++ it shifts every item, so draining a large queue is quadratic. Use `collections.deque` or `std::queue`, or the circular queue.
- Dequeuing or peeking an empty queue without checking `is_empty()`.
- Removing from the back by mistake, which gives LIFO instead of FIFO.

## Implementations

| Language | Folder | Main file | Notes |
| --- | --- | --- | --- |
| Python | [Python](Python) | `simple_queue.py` | `list`; `pop(0)` shifts |
| C++ | [C++](C++) | `simple_queue.cpp` | `std::vector<int>`; `erase(begin())` shifts; accessors are `const` |
| Go | [Go](Go) | `main.go` | slice; `Dequeue` reslices in O(1) |

## Practice Problems

- [Number of Recent Calls (LeetCode 933)](https://leetcode.com/problems/number-of-recent-calls/)
- [Implement Queue using Stacks (LeetCode 232)](https://leetcode.com/problems/implement-queue-using-stacks/)
- [Implement Stack using Queues (LeetCode 225)](https://leetcode.com/problems/implement-stack-using-queues/)
- [Binary Tree Level Order Traversal (LeetCode 102)](https://leetcode.com/problems/binary-tree-level-order-traversal/)

## Related

- [Circular Queue](../Circular_Queue)
- [Deque](../Deque)
- [Priority Queue](../Priority_Queue)
- [Queue overview](../README.md)
