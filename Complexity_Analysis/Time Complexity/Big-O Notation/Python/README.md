# Big-O Notation -- Python Implementation

## Files

- `big_o_notation.py`: eight example functions and `demonstrate_big_o`.
- `big_o_notation_test.py`: unit tests for every example.

## API

- `constant_time_example(n)`: returns 42, O(1).
- `logarithmic_time_example(n)`: number of halvings of `n`, O(log n).
- `linear_time_example(arr)`: sum of a list, O(n).
- `linearithmic_time_example(arr)`: merge sort, returns a new sorted list, O(n log n).
- `quadratic_time_example(arr)`: all pairs `(arr[i], arr[j])` with `i < j`, O(n^2).
- `cubic_time_example(n)`: counts `n^3` iterations, O(n^3).
- `exponential_time_example(n)`: naive Fibonacci, O(2^n) (valid but loose).
- `factorial_time_example(n)`: all permutations of `0..n-1`; O(n * n!) time and space.

```python
from big_o_notation import linear_time_example, linearithmic_time_example

linear_time_example([1, 2, 3])             # 6
linearithmic_time_example([5, 2, 8, 1])    # [1, 2, 5, 8]
```

## Python-Specific Notes

- Only Python has the factorial example and a hand-written merge sort.
- `factorial_time_example` slices lists, so it costs `n` per permutation: O(n * n!), not O(n!).
- Naive Fibonacci hits Python's default recursion limit only at depth about 1,000, but its running time becomes impractical near `n = 35`.

## How to Run

```bash
cd "Complexity_Analysis/Time Complexity/Big-O Notation/Python"
python3 -m unittest big_o_notation_test
python3 big_o_notation.py
```

## Key Takeaways

- Big-O is an upper bound on a function; best, average and worst case are different functions you can bound.
- Drop constants and lower-order terms; keep the dominant term.
- To prove a bound, exhibit `c` and `n0`.

