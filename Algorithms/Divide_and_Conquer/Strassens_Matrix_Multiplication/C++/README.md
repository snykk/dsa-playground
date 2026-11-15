# Strassen's Matrix Multiplication -- C++ Implementation

Strassen's algorithm for square `int` matrices, with a naive cutoff (n <= 64 by default). See the [topic README](../README.md) for the idea and the trace.

## Files

- `strassen_matrix.cpp` - the algorithm and its helpers (no header; the test includes the .cpp).
- `strassen_matrix_test.cpp` - assert-based tests, including sizes above the cutoff.

## API

- `using Matrix = std::vector<std::vector<int>>`
- `Matrix strassenMultiply(const Matrix& A, const Matrix& B, int cutoff = 64)` - multiply two n x n matrices. Sizes n <= `cutoff` use the naive loop; a cutoff below 1 throws `std::invalid_argument`. Pads an odd size by one zero row and column.
- `matrixAdd`, `matrixSubtract` - element-wise helpers.
- `splitMatrix(matrix, A11, A12, A21, A22)` - fill the four quadrants.
- `combineMatrices(C11, C12, C21, C22)` - join four quadrants.

```cpp
#include "strassen_matrix.cpp"

Matrix C = strassenMultiply({{1, 2}, {3, 4}}, {{5, 6}, {7, 8}});      // {{19, 22}, {43, 50}}
Matrix D = strassenMultiply({{1, 2}, {3, 4}}, {{5, 6}, {7, 8}}, 1);   // same, from seven 1 x 1 products
```

## C++-Specific Notes

- Entries are `int`: intermediate sums and products can overflow for large inputs, which is undefined behavior for signed integers.
- Only square matrices are supported; there is no rectangular wrapper like Python's `strassen_multiply_general`.
- The functions are non-template and non-inline, so include the .cpp in exactly one translation unit. Compiling `strassen_matrix.cpp` and the test together gives duplicate symbols.
- Each level allocates fresh `vector`s for sums and products; there is no buffer reuse.

## How to Run

From this folder (the test already includes the implementation):

```bash
g++ -std=c++17 -O2 -Wall strassen_matrix_test.cpp -o strassen_test && ./strassen_test
```

## Key Takeaways

- Seven recursive products per split give O(n^2.81).
- Odd sizes are padded by one zero row and column, so any square size works.
- Include the .cpp, do not link it twice.
