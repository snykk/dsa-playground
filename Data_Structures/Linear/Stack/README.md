# Stack Data Structure

A stack gives back the item pushed last. The three versions here share one API and the same O(1) operations and differ only in where the items live, so the choice is about capacity and memory, not about behavior.

## Topics

Read them in this order.

| # | Topic | What it adds | Level |
|---|-------|--------------|-------|
| 1 | [Static Size Array Stack](Static_Array_Stack/) | A fixed-capacity array allocated once. Push on a full stack fails with an overflow error instead of growing. | Beginner |
| 2 | [Dynamic Size Array Stack](Dynamic_Array_Stack/) | A growable array with no capacity limit. Push is O(1) amortized because the array grows by a constant factor. | Beginner |
| 3 | [Linked List Stack](Linked_List_Stack/) | One node per item and a pointer to the top. Push and pop are O(1) in the worst case and nothing is ever copied. | Beginner |

All three offer the same operations in Python, C++ and Go: `push(x)`, `pop()`, `peek()`, `is_empty()` and `size()`. `pop` and `peek` on an empty stack fail with an error (`IndexError` in Python).

## How They Compare

| Version | Storage | When full | Per-item memory | Push | Pop, peek | Space |
|---------|---------|-----------|-----------------|------|-----------|-------|
| Static array | one array of fixed capacity, allocated once (default 100) | `push` raises `OverflowError` and the stack is unchanged | one slot | O(1) worst case | O(1) | O(capacity) |
| Dynamic array | a growable array (`list`, `vector`, slice) | never full: the array grows, and an occasional push copies it | one slot, plus spare capacity | O(1) amortized | O(1) | O(n) |
| Linked list | one node per item, linked from the top | never full: each push allocates one node | value + pointer | O(1) worst case | O(1) | O(n) |

The static stack's capacity must be at least 1; a smaller value raises `ValueError` in Python. It pays for its whole capacity up front, even when empty. Before the capacity bound is reached, the three stacks behave identically.

## Choosing One

| Situation | Use | Why |
|-----------|-----|-----|
| The maximum depth is known, or must be enforced | Static array | memory is fixed and overflow is an explicit error |
| General use, the size is not known in advance | Dynamic array | compact, cache-friendly and no limit other than memory |
| Every push must be O(1) in the worst case, not just on average | Linked list | no resize ever happens, so no single push is slow |
| Items are small and there are many of them | Dynamic array | the linked list adds a pointer and an allocation to every item |

## Common Pitfalls

- Popping or peeking an empty stack raises an error (`IndexError` in Python). Check `is_empty()` first.
- A full static stack rejects the push and keeps the old state, so a swallowed overflow error loses the item.
- The static stack never grows: its capacity is fixed when you create it.
- In the array versions, slots above the top may hold old values. Use `peek()` and `size()`, not the raw array.
- Dynamic push is O(1) on average, but one push in a while copies the whole array.

## Related

- [Array](../Array/): read first.
- [Singly Linked List](../Linked_List/Singly/): read first.
- [Queue](../Queue/): the first-in, first-out counterpart.
- [Monotonic Stack](../../../Problem_Patterns/Monotonic_Stack/): next greater element and similar questions.
- [Depth-First Search](../../../Algorithms/Graph_Algorithms/Traversal/DFS/): an explicit stack replaces the call stack.
