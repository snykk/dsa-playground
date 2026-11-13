# Big-Omega (Omega) -- Python Implementation

## Files

- `big_omega.py`: four example functions and `demonstrate_big_omega`.
- `big_omega_test.py`: unit tests, including one that shows all-equal input is sorted in a single partition.

## API

- `linear_search_best_case(arr, target)`: index of `target` or -1. `Omega(1)` on every input; best case `Theta(1)`, worst case `Theta(n)`.
- `bubble_sort_best_case(arr)`: sorts in place with the early-exit flag and returns the list. `Omega(n)` on every input; best case `Theta(n)`, worst case `Theta(n^2)`.
- `quick_sort_best_case(arr)`: three-way, out-of-place quick sort with the middle element as pivot; returns a new list.
- `matrix_traversal_lower_bound(matrix)`: sum of all elements, `Theta(n^2)` for an `n` by `n` matrix.

```python
from big_omega import linear_search_best_case, bubble_sort_best_case

linear_search_best_case([5, 3, 8, 1, 9], 5)   # 0
bubble_sort_best_case([5, 4, 3, 2, 1])        # [1, 2, 3, 4, 5]
```

## Python-Specific Notes

- `quick_sort_best_case` is a list-building quick sort: time `Theta(n)` for all-equal keys, `Theta(n log n)` on average, `Theta(n^2)` for lopsided pivots; it allocates new lists at every call.
- `bubble_sort_best_case` sorts the list it is given; pass `arr.copy()` to keep the original.
- Only Python has the quick sort example.

## How to Run

```bash
cd "Complexity_Analysis/Time_Complexity/Big_Omega/Python"
python3 -m unittest big_omega_test
python3 big_omega.py
```

## Key Takeaways

- Big-Omega is a lower bound on a function; best, average and worst case are different functions you can bound.
- Useful lower bounds are the largest you can prove; `Omega(1)` is always true.
- Comparison sorting is `Omega(n log n)` in the worst case, not on every input.

