# Linked List Stack -- Python Implementation

A LIFO stack on a singly linked list. See the [topic README](../README.md) for the concept.

## Files

| File | Contents |
| --- | --- |
| `linked_list_stack.py` | the `Node` and `LinkedListStack` classes |
| `linked_list_stack_test.py` | unit tests (`unittest`) |

## API

| Method | Description | Time |
| --- | --- | --- |
| `LinkedListStack()` | create an empty stack | O(1) |
| `push(value)` | new node becomes the top | O(1) |
| `pop()` | remove and return the top; raises `IndexError` if empty | O(1) |
| `peek()` | return the top; raises `IndexError` if empty | O(1) |
| `is_empty()`, `size()` | state queries | O(1) |

## Python-Specific Notes

- Popped nodes are reclaimed by the garbage collector; nothing is freed by hand.
- `size()` returns a counter (`_size`), so it does not walk the list.
- Each node is a Python object, so the per-item memory is much larger than one pointer. A plain `list` is the practical choice for a Python stack.

## How to Run

```bash
cd "Data Structures/Linear/Stack/Linked_List_Stack/Python"
python3 -m unittest linked_list_stack_test
```

## Key Takeaways

- Link the new node to the old top before moving `top`.
- All operations touch only the head, so all are O(1).
