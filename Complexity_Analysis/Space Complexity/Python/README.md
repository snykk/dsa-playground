# Space Complexity -- Python Implementation

## Files

- `space_complexity.py`: seven example functions and `demonstrate_space_complexity`.
- `space_complexity_test.py`: unit tests for every example.

## API

- `constant_space_example(n)`: sum of 1..n, O(1) space.
- `linear_space_example(n)`: list `[1..n]`, O(n) space.
- `quadratic_space_example(n)`: n by n matrix of `i * n + j`, O(n^2) space.
- `logarithmic_space_example(n)`: two recursive calls on `n // 2`; O(n) time, O(log n) space (depth log2(n) + 1).
- `recursive_fibonacci_naive(n)`: O(2^n) time, O(n) space.
- `in_place_reverse(arr)`: reverses and returns the same list, O(1) space.
- `merge_sort_space(arr)`: returns a new sorted list, O(n) auxiliary space.

```python
from space_complexity import in_place_reverse, merge_sort_space

in_place_reverse([1, 2, 3, 4, 5])           # [5, 4, 3, 2, 1]
merge_sort_space([64, 34, 25, 12, 22, 11])  # [11, 12, 22, 25, 34, 64]
```

## Python-Specific Notes

- The default recursion limit is about 1,000 frames, so `recursive_fibonacci_naive(2000)` raises `RecursionError` long before time becomes the problem.
- `merge_sort_space` slices lists (`arr[:mid]`), which copies. That is fine for a demo but passing indices would avoid the copies.
- Python integers and lists have per-object overhead, so real memory is larger than the cell counts used in complexity analysis.

## How to Run

```bash
cd "Complexity_Analysis/Space Complexity/Python"
python3 -m unittest space_complexity_test
python3 space_complexity.py
```

## Key Takeaways

- Space complexity counts auxiliary memory, including the recursion stack, not the input.
- Count what is alive at the same time, not everything ever allocated.
- Recursion depth `d` costs O(d) memory.

