# Deque -- Python Implementation

A list-backed double-ended queue. See the [topic README](../README.md) for the concept.

## Files

| File | Contents |
| --- | --- |
| `deque.py` | the `Deque` class |
| `deque_test.py` | unit tests (`unittest`) |

## API

| Method | Description | Time |
| --- | --- | --- |
| `push_front(item)` | `list.insert(0, item)` | O(n) |
| `push_back(item)` | `list.append(item)` | O(1) amortized |
| `pop_front()` | `list.pop(0)`; raises `IndexError` if empty | O(n) |
| `pop_back()` | `list.pop()`; raises `IndexError` if empty | O(1) |
| `peek_front()`, `peek_back()` | read an end; raise `IndexError` if empty | O(1) |
| `is_empty()`, `size()` | length checks | O(1) |
| `display()` | copy of the items as a list, front first | O(n) |

## Python-Specific Notes

- Any Python object can be stored.
- `collections.deque` from the standard library gives O(1) at both ends; this class exists to show the array-backed cost.
- The module name `deque.py` does not clash with `collections.deque`, but avoid `from deque import *` next to it.

## How to Run

```bash
cd "Data_Structures/Linear/Queue/Deque/Python"
python3 -m unittest deque_test
```

## Key Takeaways

- A list is cheap at the back and costly at the front.
- Use `collections.deque` when both ends matter.
