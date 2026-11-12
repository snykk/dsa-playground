# Dynamic Size Array Stack -- Python Implementation

A LIFO stack backed by a Python `list`. See the [topic README](../README.md) for the concept.

## Files

| File | Contents |
| --- | --- |
| `array_stack.py` | the `ArrayStack` class |
| `array_stack_test.py` | unit tests (`unittest`) |

## API

| Method | Description | Time |
| --- | --- | --- |
| `ArrayStack()` | create an empty stack | O(1) |
| `push(value)` | `list.append` | O(1) amortized |
| `pop()` | remove and return the top; raises `IndexError` if empty | O(1) |
| `peek()` | return the top; raises `IndexError` if empty | O(1) |
| `is_empty()`, `size()` | length checks | O(1) |

## Python-Specific Notes

- The list resizes itself; the class stores no capacity.
- Any Python object can be pushed.
- A plain `list` with `append` and `pop` is already a stack; this class adds the error messages and the names.

## How to Run

```bash
cd "Data Structures/Linear/Stack/Dynamic_Array_Stack/Python"
python3 -m unittest array_stack_test
```

## Key Takeaways

- Push and pop at the end of a list are O(1).
- The list grows by a factor, which gives the amortized bound.
