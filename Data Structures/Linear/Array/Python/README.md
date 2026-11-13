# Array -- Python Implementation

Python has one reusable array type here, `DynamicArray`, plus two demonstration scripts.

## Files

| File | Contents |
| --- | --- |
| `dynamic_array.py` | `DynamicArray`: a resizable array that doubles when full and halves at one quarter full |
| `dynamic_array_test.py` | tests for `DynamicArray` (append, pop, bounds, reference release, shrink) |
| `static_array.py` | demo with `array.array('i', ...)`: create, read, update |
| `static_array_test.py` | tests for `array.array` behaviour (they do not import the demo) |
| `multi_dimensional_array.py` | demo with a 3x3 list of lists and a row-major flatten |
| `multi_dimensional_array_test.py` | tests for list-of-lists behaviour (they do not import the demo) |

## API

`DynamicArray()`:

- `len(a)`: number of stored elements.
- `a[k]`: element at `k`; raises `IndexError` unless `0 <= k < len(a)` (negative indexes are rejected).
- `a.append(value)`: add at the end, doubling the capacity when full. Amortized O(1).
- `a.pop()`: remove and return the last element; raises `IndexError` when empty. It clears the slot and halves the capacity when the length is at most a quarter of it.

There is no `insert`, `remove`, `__setitem__` or iteration protocol.

## Python-Specific Notes

- A built-in `list` is already a dynamic array of references. CPython over-allocates by roughly 12.5 percent, not by doubling; the cost is still amortized O(1) because the growth is geometric.
- `array.array` stores raw typed values (one type code for all elements), which uses less memory than a list of `int` objects.
- Nested lists are rows stored separately, so rows can differ in length; use one flat list and `i * cols + j` for a contiguous layout. For numeric work use NumPy.
- `pop` sets the vacated slot to `None`; otherwise the array would keep the popped object alive until the slot is overwritten.

## How to Run

```bash
cd "Data Structures/Linear/Array/Python"
python3 -m unittest dynamic_array_test static_array_test multi_dimensional_array_test
python3 dynamic_array.py
```

## Key Takeaways

- Doubling on growth makes append amortized O(1); shrinking at one quarter avoids resize thrashing.
- Clear popped slots so garbage collection can reclaim the object.
- Only `dynamic_array_test.py` exercises repository code; the other two test files check Python built-ins.
