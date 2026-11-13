# Matrix Chain Multiplication -- Python Implementation

Bottom-up interval DP for the cheapest matrix chain order.

## Files

| File | Contents |
|------|----------|
| `matrix_chain.py` | `matrix_chain_multiplication` |
| `matrix_chain_test.py` | `unittest` cases |

## API

| Function | Description | Time | Space |
|----------|-------------|------|-------|
| `matrix_chain_multiplication(dims)` | minimum number of scalar multiplications; matrix `i` is `dims[i-1] x dims[i]`; returns 0 for fewer than two matrices | O(n^3) | O(n^2) |

```python
from matrix_chain import matrix_chain_multiplication

print(matrix_chain_multiplication([40, 20, 30, 10, 30]))  # 26000
print(matrix_chain_multiplication([5, 10]))               # 0 (one matrix)
```

It returns only the cost. There is no function that returns the parenthesization.

## Python-Specific Notes

- Integers are unbounded, so there is no overflow: `[2000, 2000, 2000]` gives 8000000000.
- The table uses `float('inf')` as the starting value of each cell; every cell is overwritten before it is read, so the result is always an `int`.
- `dims` of length 0, 1 or 2 (no matrix pair) returns 0 instead of raising.

## How to Run

From this folder:

```bash
python3 -m unittest matrix_chain_test
```

## Key Takeaways

- Fill the table by chain length so both sub-chains are ready.
- `n` matrices need `n + 1` dimensions.
- The cost is a minimum over split points, so the work is cubic.
