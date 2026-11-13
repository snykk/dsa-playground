# Dynamic Size Array Stack

A **stack** is last-in, first-out (LIFO). This version keeps its items in a growable array, so it has no fixed capacity: `push`, `pop` and `peek` are O(1), with `push` amortized because the array occasionally grows.

## Intuition

A stack adds and removes at one end only, the top, like a pile of plates. In an array the bottom is index 0 and the top is the last used index, so push and pop touch only the end and never move other items. The invariant is that only the end of the array is read or changed, and the end always holds the most recently pushed item.

"Dynamic" means the array is not a fixed size. When it is full, a larger array replaces it. The three implementations here do not manage capacity themselves: they push with the built-in growable array (`list.append`, `vector::push_back`, Go `append`).

## Visual

```text
index:    0    1    2
        +----+----+----+
        | 10 | 20 | 30 |   <- top (push and pop happen here)
        +----+----+----+
 bottom                ^
```

Growth with the textbook doubling scheme (capacity 1, 2, 4, 8):

```text
push a:  [a]                    capacity 1
push b:  [a b]                  full: capacity 2, copy 1
push c:  [a b c _]              full: capacity 4, copy 2
push d:  [a b c d]              room left: no copy
push e:  [a b c d e _ _ _]      full: capacity 8, copy 4
```

## Operations

| Operation | Description | Time |
| --- | --- | --- |
| `push(x)` | append at the top | O(1) amortized |
| `pop()` | remove and return the top item; fails when empty | O(1) |
| `peek()` | return the top item; fails when empty | O(1) |
| `is_empty()` / `size()` | length checks | O(1) |

Empty-stack behaviour differs: Python raises `IndexError`, C++ throws `std::out_of_range`, Go panics (its `Pop` and `Peek` return a plain `int`). The C++ and Python method is `is_empty()`, Go uses `IsEmpty()`.

## Step-by-Step Trace

| Operation | Stack (bottom to top) | Returns |
| --- | --- | --- |
| `push(10)` | `[10]` | |
| `push(20)` | `[10, 20]` | |
| `push(30)` | `[10, 20, 30]` | |
| `peek()` | `[10, 20, 30]` | 30 |
| `pop()` | `[10, 20]` | 30 |
| `pop()` | `[10]` | 20 |

## Complexity

| Operation | Time | Why |
| --- | --- | --- |
| push | O(1) amortized | a plain write plus an occasional O(n) resize |
| push (one worst call) | O(n) | the array is full and every item is copied |
| pop, peek | O(1) | only the last slot is touched |
| search | O(n) | only the top is directly reachable |

Why amortized: with doubling, n pushes copy 1 + 2 + 4 + ... up to at most n items, a geometric series below 2n. With the n plain writes the total is under 3n, so under 3 operations per push. Growing by a fixed amount (for example 10 slots) would make the copies add up to about n^2 / 20, so the growth must be by a constant factor. None of the implementations shrinks the array on pop.

Space is O(n); the unused capacity is a constant factor of the size.

## When to Use

Use it when the maximum size is unknown: undo history, expression evaluation, parenthesis matching, explicit-stack DFS, monotonic stack problems. Use the [Static Size](../Static_Array_Stack) stack when memory must be bounded, and the [Linked List Based](../Linked_List_Stack) stack when every push must be O(1) in the worst case.

## Dynamic Array Stack vs. Alternatives

| Structure | Push | Pop | Notes |
| --- | --- | --- | --- |
| Dynamic array stack | O(1) amortized | O(1) | contiguous, no limit |
| [Static array stack](../Static_Array_Stack) | O(1) | O(1) | fixed capacity, push fails when full |
| [Linked-list stack](../Linked_List_Stack) | O(1) | O(1) | no copying, a pointer per item |

## Common Pitfalls

- Popping or peeking an empty stack: check `is_empty()` first (Go panics).
- Growing by a constant amount instead of a factor.
- Keeping a pointer or reference into the array across a push: a resize moves the items.
- Assuming the stack is bounded: endless pushes exhaust memory.

## Implementations

| Language | Folder | Main file | Notes |
| --- | --- | --- | --- |
| Python | [Python](Python) | `array_stack.py` | `list`; raises `IndexError` |
| C++ | [C++](C++) | `array_stack.cpp` | `std::vector<int>`; throws `std::out_of_range` |
| Go | [Go](Go) | `main.go` | slice; `Pop` and `Peek` panic when empty |

## Practice Problems

- LeetCode 20: Valid Parentheses.
- LeetCode 155: Min Stack.
- LeetCode 150: Evaluate Reverse Polish Notation.
- LeetCode 739: Daily Temperatures.
- LeetCode 232: Implement Queue using Stacks.

## Related

- [Static Size stack](../Static_Array_Stack)
- [Linked List Based stack](../Linked_List_Stack)
- [Array-based stacks overview](..)
- [Stack overview](../README.md)
