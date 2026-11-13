# Big-Theta (Theta) -- Python Implementation

## Files

- `big_theta.py`: four example functions and `demonstrate_big_theta`.
- `big_theta_test.py`: unit tests, including one that counts element reads to show binary search's best case is constant.

## API

- `tight_bound_example(arr)`: sum of the list, `Theta(n)` on every input.
- `merge_sort_example(arr)`: a real merge sort, returns a new list, `Theta(n log n)` on every input.
- `binary_search_example(arr, target)`: index or -1; best case `Theta(1)`, worst case `Theta(log n)`.
- `matrix_multiplication_naive(A, B)`: product of two `n` by `n` matrices, `Theta(n^3)` on every input.

```python
from big_theta import binary_search_example, merge_sort_example

merge_sort_example([64, 34, 25, 12])           # [12, 25, 34, 64]
binary_search_example([1, 3, 5, 7, 9], 5)      # 2 (found at the first probe)
```

## Python-Specific Notes

- Binary search computes `mid = (left + right) // 2`; Python integers do not overflow.
- `merge_sort_example` slices lists, so it allocates new lists at every level; space is O(n).
- This is the only language folder with the matrix multiplication example.

## How to Run

```bash
cd "Complexity_Analysis/Time_Complexity/Big_Theta/Python"
python3 -m unittest big_theta_test
python3 big_theta.py
```

## Key Takeaways

- Big-Theta is a tight bound on one function; best, average and worst case each get their own Theta.
- `f = Theta(g)` exactly when `f = O(g)` and `f = Omega(g)`.
- Binary search is `Theta(1)` in the best case and `Theta(log n)` in the worst case.

