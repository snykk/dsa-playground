# Static Size Array Stack -- Python Implementation

A LIFO stack over a preallocated list of fixed capacity. See the [topic README](../README.md) for the concept.

## Files

| File | Contents |
| --- | --- |
| `array_stack.py` | the `ArrayStack` class |
| `array_stack_test.py` | unit tests (`unittest`) |

## API

| Method | Description | Time |
| --- | --- | --- |
| `ArrayStack(capacity=100)` | create a stack; raises `ValueError` if `capacity < 1` | O(capacity) |
| `push(value)` | add on top; raises `OverflowError` when full | O(1) |
| `pop()` | remove and return the top; raises `IndexError` if empty | O(1) |
| `peek()` | return the top; raises `IndexError` if empty | O(1) |
| `is_empty()`, `size()` | length checks | O(1) |

## Python-Specific Notes

- The list `[None] * capacity` is created once and never resized; an integer `top` marks the last used slot.
- `pop` sets the vacated slot back to `None` so the removed object can be garbage collected.
- Any Python object can be pushed.
- A plain `list` would grow without limit; the bound is the point of this class.

## How to Run

```bash
cd "Data_Structures/Linear/Stack/Static_Array_Stack/Python"
python3 -m unittest array_stack_test
```

## Key Takeaways

- Fixed capacity needs an explicit overflow check.
- `top == -1` is empty and `top == capacity - 1` is full.
