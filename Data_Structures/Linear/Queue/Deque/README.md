# Deque

A **deque** (double-ended queue, said "deck") supports adding and removing items at both the front and the back, so it can act as a stack, a queue, or both. The implementations in this folder are array-backed: the back is O(1) and the front costs O(n).

## Intuition

A queue adds at one end and removes at the other, a stack uses one end only. A deque allows all four moves. Using just the back gives a stack; pushing at the back and popping at the front gives a queue.

The items live in a growable array (Python `list`, C++ `std::vector<int>`, Go slice) with the front at index 0 and the back at the last index. Growable arrays are cheap to change at the end and expensive to change at index 0, because the other items must shift. That is the whole cost story of this implementation.

## Visual

```text
front                       back
  |                           |
  v                           v
+---+---+---+---+
| 3 | 1 | 2 | 4 |   push_front / pop_front   push_back / pop_back
+---+---+---+---+   (shifts items)            (no shifting)
  index 0 ...  3
```

## Operations

| Operation | Description | Time here |
| --- | --- | --- |
| `push_back(x)` | append at the back | O(1) amortized |
| `pop_back()` | remove and return the back item | O(1) |
| `push_front(x)` | insert at index 0 | O(n) |
| `pop_front()` | remove and return index 0 | O(n) in Python and C++, O(1) in Go |
| `peek_front()` / `peek_back()` | read an end | O(1) |
| `is_empty()` / `size()` | length checks | O(1) |

Go uses `PushFront`, `PopBack` and so on. Popping or peeking an empty deque raises `IndexError` (Python), throws `std::runtime_error` (C++) or returns an error (Go). Python also offers `display()`, a copy of the items as a list.

Go's `PopFront` reslices (`dq.deque[1:]`), which moves nothing; its `PushFront` builds a new slice and copies every item.

## Step-by-Step Trace

Python run: `push_back(1)`, `push_back(2)`, `push_front(3)`, `push_back(4)`, `pop_front()`, `pop_back()`.

| Step | Deque (front to back) | Items moved |
| --- | --- | --- |
| `push_back(1)` | `[1]` | 0 |
| `push_back(2)` | `[1, 2]` | 0 |
| `push_front(3)` | `[3, 1, 2]` | 2 (everything shifts right) |
| `push_back(4)` | `[3, 1, 2, 4]` | 0 |
| `pop_front()` returns 3 | `[1, 2, 4]` | 3 (everything shifts left) |
| `pop_back()` returns 4 | `[1, 2]` | 0 |

## Complexity

| Operation | Array-backed (this folder) | Ring buffer | Doubly linked list |
| --- | --- | --- | --- |
| push_back | O(1) amortized | O(1) amortized | O(1) |
| pop_back | O(1) | O(1) | O(1) |
| push_front | O(n) | O(1) amortized | O(1) |
| pop_front | O(n) (O(1) in Go) | O(1) | O(1) |
| peek | O(1) | O(1) | O(1) |
| Space | O(n) | O(n) | O(n) plus two pointers per item |

The back is amortized because an append occasionally reallocates; doubling the capacity keeps the average constant. A ring buffer moves a `front` index (with wrap-around, see [Circular Queue](../Circular_Queue)) instead of shifting items, and grows by copying into a larger array when full.

## When to Use

Use a deque when you need both ends: sliding-window maximum with a monotonic queue, palindrome checks, bounded undo history, 0-1 BFS. For real code prefer `collections.deque` (Python) or `std::deque` (C++), which give O(1) at both ends. Use a plain queue or stack when only one end is needed.

## Deque vs. Other Structures

| Structure | Add / remove | Use it when |
| --- | --- | --- |
| [Stack](../../Stack) | one end | LIFO is enough |
| [Simple Queue](../Simple_Queue) | add back, remove front | FIFO is enough |
| [Circular Queue](../Circular_Queue) | queue with a hard size limit | bounded buffers |
| Deque | both ends | you need both ends |
| [Priority Queue](../Priority_Queue) | by priority | order is not arrival order |

## Common Pitfalls

- Assuming both ends are O(1): here `push_front` in a loop makes the whole loop O(n^2).
- Popping or peeking an empty deque without checking `is_empty()`.
- Mixing up the ends: the front is index 0, the back is the last index.
- Using a deque where a stack or queue would be clearer.

## Implementations

| Language | Folder | Main file | Notes |
| --- | --- | --- | --- |
| Python | [Python](Python) | `deque.py` | `list`; `insert(0, x)` and `pop(0)` shift items |
| C++ | [C++](C++) | `deque.cpp` | `std::vector<int>`; no `display()` |
| Go | [Go](Go) | `main.go` | slice; `PopFront` reslices (O(1)), `PushFront` copies (O(n)) |

## Practice Problems

- LeetCode 641: Design Circular Deque.
- LeetCode 239: Sliding Window Maximum.
- LeetCode 1438: Longest Continuous Subarray With Absolute Diff Less Than or Equal to Limit.
- LeetCode 1368: Minimum Cost to Make at Least One Valid Path in a Grid (0-1 BFS).

## Related

- [Circular Queue](../Circular_Queue)
- [Simple Queue](../Simple_Queue)
- [Doubly Linked List](../../Linked_List/Doubly)
- [Queue overview](../README.md)
