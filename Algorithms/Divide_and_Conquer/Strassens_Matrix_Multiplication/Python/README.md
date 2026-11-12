# Strassen's Matrix Multiplication -- Python Implementation

Strassen's algorithm in Python: seven recursive block products, a naive cutoff at n <= 64, and a wrapper for arbitrary sizes. See the [topic README](../README.md) for the idea and the trace.

## Files

- `strassen_matrix.py` - the algorithm and its helpers.
- `strassen_matrix_test.py` - unit tests, including sizes above the cutoff.

## API

- `strassen_multiply(A, B)` - multiply two n x n matrices (lists of lists). Pads an odd size by one zero row and column.
- `strassen_multiply_general(A, B)` - multiply an m x n matrix by an n x p matrix: pads to the next power of two, multiplies, crops to m x p. Raises `ValueError` if the inner dimensions differ.
- `matrix_multiply_naive(A, B)` - the O(n^3) triple loop, used below the cutoff and as the test oracle.
- `matrix_add`, `matrix_subtract`, `split_matrix`, `combine_matrices`, `pad_matrix`, `next_power_of_2` - helpers.

```python
from strassen_matrix import strassen_multiply, strassen_multiply_general

strassen_multiply([[1, 2], [3, 4]], [[5, 6], [7, 8]])        # [[19, 22], [43, 50]]
strassen_multiply_general([[1, 2, 3], [4, 5, 6]], [[1, 2], [3, 4], [5, 6]])  # [[22, 28], [49, 64]]
```

## Python-Specific Notes

- Python integers do not overflow, so the results are exact for any entry size.
- The recursion depth is only log2(n), far below the interpreter limit.
- Pure Python is slow: the cutoff of 64 means the naive loop does most of the work, and the crossover versus a tuned library (NumPy) is far out of reach.
- Rows must be lists of equal length; the functions do not validate shapes except the inner dimension check in `strassen_multiply_general`.

## How to Run

From this folder:

```bash
python3 -m unittest strassen_matrix_test
```

## Key Takeaways

- Seven products per split give O(n^2.81); the cutoff keeps small blocks on the fast naive path.
- Odd sizes are padded by one zero row and column, so any square size works.
- The tests compare against the naive product at sizes 65, 128 and 130, which reach the seven-product recursion.
