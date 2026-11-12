# Counting Sort -- Python Implementation

## Files

- `counting_sort.py`: `counting_sort`, `counting_sort_simple` and the private helper `_value_range`.
- `counting_sort_test.py`: unit tests (basic, sorted, empty, single, duplicates, negatives, too-small `max_val`, random comparison with `sorted`).

## API

- `counting_sort(arr, max_val=None)`: stable counting sort; returns a new list (an empty input is returned as is). Negative values are allowed. Raises `ValueError` if `max_val` is smaller than the largest value.
- `counting_sort_simple(arr, max_val=None)`: counts, then rebuilds the list by writing each value `count` times. Same range handling; only suitable for bare integers.

```python
from counting_sort import counting_sort

print(counting_sort([4, 2, 2, 8, 3, 3, 1]))  # [1, 2, 2, 3, 3, 4, 8]
print(counting_sort([3, -1, 2]))             # [-1, 2, 3]
```

## Python-Specific Notes

- The maximum is detected automatically when `max_val` is omitted; C++ and Go require it.
- The count array has `max - min + 1` entries, so `[1, 10**9]` allocates a list with a billion entries.
- Both functions leave the input list unchanged and return a new one.
- Python 3.9 and later.

## How to Run

```bash
python3 -m unittest counting_sort_test
```

## Key Takeaways

- Subtracting the minimum makes negative numbers work.
- The back-to-front placement is what makes it stable.
- Linear time only when the range is not much larger than `n`.
