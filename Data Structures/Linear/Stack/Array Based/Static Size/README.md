# Static Size Array Stack

A **stack** is last-in, first-out (LIFO). This version keeps its items in an array of fixed capacity, allocated once. Push, pop and peek are O(1) with no resizing, and pushing onto a full stack fails with an overflow error.

## Intuition

A stack adds and removes at one end only, the top. The array has a fixed length, the capacity, and a `top` index records the last used slot (`-1` means empty). Push writes to slot `top + 1`, pop reads slot `top`, and no item ever moves.

Invariant: the stack is the slots `0 .. top`. It is empty when `top == -1` and full when `top == capacity - 1`.

## Visual

Capacity 5 holding 10, 20, 30:

```text
index:    0    1    2    3    4
        +----+----+----+----+----+
        | 10 | 20 | 30 |    |    |
        +----+----+----+----+----+
                    ^
                   top = 2        size = top + 1 = 3
```

## Operations

| Operation | Description | Time |
| --- | --- | --- |
| `push(x)` | increment `top`, store `x`; overflow error when full | O(1) |
| `pop()` | return the item at `top`, decrement `top`; error when empty | O(1) |
| `peek()` | return the item at `top`; error when empty | O(1) |
| `is_empty()` / `size()` | `top == -1` and `top + 1` | O(1) |

The capacity must be at least 1 and defaults to 100. Errors by language:

- Python: `OverflowError` (full push), `IndexError` (empty pop or peek), `ValueError` (bad capacity).
- C++: `std::overflow_error`, `std::underflow_error`, `std::invalid_argument`.
- Go: `Push` returns an `error`, `Pop` and `Peek` return `(int, error)`, `NewArrayStack` returns an error for a bad capacity.

## Step-by-Step Trace

Capacity 3 (Python run):

| Operation | Array | top | Result |
| --- | --- | --- | --- |
| `push(10)` | `[10, _, _]` | 0 | |
| `push(20)` | `[10, 20, _]` | 1 | |
| `push(30)` | `[10, 20, 30]` | 2 | full |
| `push(40)` | `[10, 20, 30]` | 2 | `OverflowError`, nothing changes |
| `pop()` | `[10, 20, _]` | 1 | returns 30 |

## Complexity

| Operation | Time | Why |
| --- | --- | --- |
| push | O(1) | one bounds check and one write, never a copy |
| pop, peek | O(1) | read slot `top` |
| is_empty, size | O(1) | arithmetic on `top` |
| create | O(capacity) | the array is allocated once |

Space is O(capacity), whether the stack is empty or full. No push ever costs more than constant time.

## When to Use

Use it when memory must be bounded or predictable (embedded code, no allocation after setup), when the maximum depth is known, or when latency spikes from resizing are unacceptable. Use the [Dynamic Size](../Dynamic%20Size) stack when the size is unknown.

## Static vs. Dynamic and Linked Stacks

| Stack | Push | Capacity | Memory |
| --- | --- | --- | --- |
| Static array | O(1), fails when full | fixed at creation | O(capacity) up front |
| [Dynamic array](../Dynamic%20Size) | O(1) amortized | grows by a factor | O(n) with spare room |
| [Linked list](../../Linked%20List%20Based) | O(1) | limited by memory | one node per item |

## Common Pitfalls

- Off-by-one on the full test: full is `top == capacity - 1`.
- Reading above `top`: those slots hold old or default values.
- Ignoring the overflow error (in Go, dropping the error returned by `Push` loses the item).
- Capacity 0 or negative: all three constructors reject it.
- Copying the C++ stack: it owns a raw array, so copy is deleted.

## Implementations

| Language | Folder | Main file | Notes |
| --- | --- | --- | --- |
| Python | [Python](Python) | `array_stack.py` | preallocated `[None] * capacity`; clears popped slots |
| C++ | [C++](C++) | `array_stack.cpp` | raw `new int[capacity]`; destructor, copy deleted; method `isEmpty()` |
| Go | [Go](Go) | `main.go` | `make([]int, 0, capacity)`; `Push` returns an error |

## Practice Problems

- LeetCode 20: Valid Parentheses.
- LeetCode 155: Min Stack.
- LeetCode 232: Implement Queue using Stacks.
- LeetCode 150: Evaluate Reverse Polish Notation.

## Related

- [Dynamic Size stack](../Dynamic%20Size)
- [Linked List Based stack](../../Linked%20List%20Based)
- [Array-based stacks overview](../README.md)
- [Stack overview](../../README.md)
