# Amortized Analysis -- Python Implementation

## Files

- `amortized_analysis.py`: `DynamicArray`, `BinaryCounter`, and the demos `aggregate_method_example`, `accounting_method_example`, `potential_method_example`, `binary_counter_example`, `demonstrate_amortized_analysis`.
- `amortized_analysis_test.py`: unit tests, including the zero-capacity regression and the aggregate bounds.

## API

- `DynamicArray(initial_capacity=4)`: `append(value)`, `get(index)` (raises `IndexError` out of range); attributes `size`, `capacity`, `copies`.
- `BinaryCounter(n_bits=8)`: `increment()`, `get_value()`; attributes `bits`, `flips`. The counter wraps around after `2**n_bits - 1`.

```python
from amortized_analysis import DynamicArray, BinaryCounter

arr = DynamicArray(initial_capacity=1)
for i in range(1000):
    arr.append(i)
print(arr.copies)  # 1023 or less, never more than 2 * 1000
```

## Python-Specific Notes

- Python lists already grow geometrically, but `DynamicArray` keeps its own `data` list of `None` so the copy cost is visible and countable.
- Capacity grows with `max(1, capacity * 2)`, so an initial capacity of 0 works.
- The three demos print their steps; they are the executable version of the aggregate, accounting and potential arguments.

## How to Run

```bash
cd "Complexity_Analysis/Amortized Analysis/Python"
python3 -m unittest amortized_analysis_test
python3 amortized_analysis.py
```

## Key Takeaways

- A resize costs O(n), but doubling makes the total of `n` appends O(n): O(1) amortized.
- Amortized is a worst-case bound over a sequence, not an average over random input.
- The tests assert the aggregate bounds: copies at most 2n and bit flips at most 2n.

