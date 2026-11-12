# Linked List Stack

A **stack** is last-in, first-out (LIFO). This version stores each item in a node that points to the node below it, and the stack is a pointer to the top node. Push, pop and peek are O(1) in the worst case, with no capacity limit and no resizing, at the cost of one pointer and one allocation per item.

## Intuition

The stack is a singly linked list used only at its head. Each node holds a value and a `next` pointer to the node pushed before it. The stack keeps `top` (the first node) and a `size` counter. Because every operation works on the head, nothing ever walks the list.

Invariant: `top` is null exactly when the stack is empty, and otherwise it is the most recently pushed node. Following `next` from `top` visits items from newest to oldest.

## Visual

```text
top
 |
 v
+----+---+    +----+---+    +----+------+
| 30 | *-+--->| 20 | *-+--->| 10 | null |
+----+---+    +----+---+    +----+------+
```

Push `40` (the order of steps matters):

```text
1. node = new Node(40)
2. node.next = top        // link first: the old stack stays reachable
3. top = node             // then move top

top -> [40] -> [30] -> [20] -> [10] -> null
```

## Operations

| Operation | Description | Time |
| --- | --- | --- |
| `push(x)` | allocate a node, link it to the current top, make it the top | O(1) |
| `pop()` | return the top value, move `top` to the next node; error when empty | O(1) |
| `peek()` | return the top value; error when empty | O(1) |
| `is_empty()` / `size()` | `top == null` and the stored counter | O(1) |

Empty-stack behaviour: Python raises `IndexError`, C++ throws `std::underflow_error`, Go returns `(int, error)` from `Pop` and `Peek`. Method names: `is_empty()` in Python, `isEmpty()` in C++, `IsEmpty()` in Go.

## Step-by-Step Trace

| Operation | Stack (top first) | Returns |
| --- | --- | --- |
| `push(10)` | `10` | |
| `push(20)` | `20 -> 10` | |
| `push(30)` | `30 -> 20 -> 10` | |
| `peek()` | `30 -> 20 -> 10` | 30 |
| `pop()` | `20 -> 10` | 30 |
| `pop()` | `10` | 20 |

## Complexity

| Operation | Time | Why |
| --- | --- | --- |
| push | O(1) | one allocation and two pointer writes, never a copy |
| pop, peek | O(1) | read or move `top` |
| is_empty, size | O(1) | the size is kept in a counter |
| destroy (C++) | O(n) | every remaining node is freed once |
| search | O(n) | walk from the top |

Space is O(n): each item costs a node with the value and one pointer, plus allocator overhead. There is no spare capacity.

## When to Use

Use it when every operation must be constant time in the worst case, or when the size swings widely: undo history, expression evaluation, backtracking, explicit-stack DFS. Prefer an array stack (see [Dynamic Size](../Array%20Based/Dynamic%20Size)) when speed and memory per item matter, because it is contiguous.

## Linked List vs. Array Stacks

| Stack | Push | Memory | Cache behaviour |
| --- | --- | --- | --- |
| Linked list | O(1) worst case | value + pointer per item | nodes are scattered |
| [Dynamic array](../Array%20Based/Dynamic%20Size) | O(1) amortized, occasional O(n) copy | contiguous, spare capacity | good |
| [Static array](../Array%20Based/Static%20Size) | O(1), fails when full | fixed block up front | good |

## Common Pitfalls

- Moving `top` before linking the new node: the old stack becomes unreachable.
- Forgetting to free nodes in C++: without the destructor every node left on the stack leaks, and `pop()` must `delete` the popped node.
- Copying a C++ stack: a shallow copy shares nodes and both stacks free them, so the copy operations are deleted.
- Popping or peeking an empty stack without checking `is_empty()`.
- Forgetting to update the `size` counter in push or pop.

## Implementations

| Language | Folder | Main file | Notes |
| --- | --- | --- | --- |
| Python | [Python](Python) | `linked_list_stack.py` | `Node` class; garbage collected; raises `IndexError` |
| C++ | [C++](C++) | `linked_list_stack.cpp` | private `Node`; destructor frees nodes; copy deleted; `isEmpty()` |
| Go | [Go](Go) | `main.go` | `Node` struct; garbage collected; has its own `go.mod` |

## Practice Problems

- LeetCode 20: Valid Parentheses.
- LeetCode 155: Min Stack.
- LeetCode 232: Implement Queue using Stacks.
- LeetCode 71: Simplify Path.

## Related

- [Dynamic Size stack](../Array%20Based/Dynamic%20Size)
- [Static Size stack](../Array%20Based/Static%20Size)
- [Singly Linked List](../../Linked%20List/Singly)
- [Stack overview](../README.md)
