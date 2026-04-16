# Matrix Chain Multiplication (C++)

C++ implementation of the Matrix Chain Multiplication problem using 2D interval DP to find the optimal parenthesization that minimizes the total number of scalar multiplications.

## Files

| File | Description |
|------|-------------|
| `matrix_chain.cpp` | Main implementation with interval DP approach |
| `matrix_chain_test.cpp` | Test cases for matrix chain solver |

## How to Run

```bash
g++ -std=c++17 -DTESTING -o test matrix_chain_test.cpp
./test
```

## Key Functions

| Function | Description | Time Complexity |
|----------|-------------|-----------------|
| `matrixChainMultiplication(dims)` | Finds the minimum scalar multiplications needed for a chain of matrices | O(n^3) |

## Complexity

| Aspect | Complexity |
|--------|-----------|
| Time | O(n^3) where n = number of matrices |
| Space | O(n^2) for the 2D DP table |

## Notes

- Input `dims` is a vector of length n+1 where matrix i has dimensions `dims[i-1] x dims[i]`.
- Uses interval DP: iterates over chain lengths, then starting positions, then split points.
- `dp[i][j]` stores the minimum scalar multiplications to compute matrices i through j.
- Initializes costs to `INT_MAX` before searching for optimal splits.

---

_Last Updated: April 2026_
