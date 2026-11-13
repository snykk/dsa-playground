# Matrix Chain Multiplication -- C++ Implementation

Bottom-up interval DP for the cheapest matrix chain order.

## Files

| File | Contents |
|------|----------|
| `matrix_chain.cpp` | `matrixChainMultiplication` |
| `matrix_chain_test.cpp` | `assert`-based tests; it `#include`s `matrix_chain.cpp` |

## API

| Function | Description | Time | Space |
|----------|-------------|------|-------|
| `long long matrixChainMultiplication(const std::vector<int>& dims)` | minimum number of scalar multiplications; returns 0 for fewer than two matrices | O(n^3) | O(n^2) |

It returns only the cost, not the parenthesization.

## C++-Specific Notes

- The table and the return type are `long long`; the product of three `int` dimensions is widened before it is multiplied (`static_cast<long long>(dims[i - 1]) * dims[k] * dims[j]`). A previous `int` version overflowed for `[2000, 2000, 2000]`.
- `LLONG_MAX` is the starting value of each cell and is always replaced before use.
- The test file includes the `.cpp`, so compile only the test file.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD matrix_chain_test.cpp -o matrix_chain_test
./matrix_chain_test
```

## Key Takeaways

- Use 64-bit costs: three dimensions of 2000 already exceed `INT_MAX`.
- `n` matrices need `n + 1` dimensions, and fewer than two matrices cost 0.
- Fill by chain length.
