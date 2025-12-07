# Strassen's Matrix Multiplication (C++)

**Strassen's Matrix Multiplication** reduces matrix multiplication from O(n³) to O(n^log₂ 7) ≈ O(n^2.81).

---

## Overview

Strassen's algorithm uses divide and conquer to multiply matrices faster than the naive approach by using only 7 recursive multiplications instead of 8.

---

## Complexity Analysis

| Complexity | Time | Space |
|------------|------|-------|
| **All Cases** | O(n^log₂ 7) ≈ O(n^2.81) | O(n²) |

---

## Usage

```cpp
#include "strassen_matrix.cpp"

Matrix A = {{1, 2}, {3, 4}};
Matrix B = {{5, 6}, {7, 8}};
Matrix C = strassenMultiply(A, B);
// C = {{19, 22}, {43, 50}}
```

---

## Implementation Details

### Functions

- **`strassenMultiply(A, B)`**: Main Strassen's algorithm
- **`matrixAdd(A, B)`**: Matrix addition
- **`matrixSubtract(A, B)`**: Matrix subtraction
- **`splitMatrix(matrix, ...)`**: Split into 4 quadrants
- **`combineMatrices(...)`**: Combine 4 quadrants

---

## Compilation

```bash
g++ -std=c++11 strassen_matrix.cpp strassen_matrix_test.cpp -o test
./test
```

---

## Testing

Run the test suite:

```bash
g++ -std=c++11 strassen_matrix.cpp strassen_matrix_test.cpp -o test && ./test
```

---

## When to Use

- ✅ Very large matrices (> 1000x1000)
- ✅ When asymptotic performance matters
- ❌ Small matrices (use naive O(n³))

---

## Related Algorithms

- **Naive Matrix Multiplication**: O(n³) standard approach
- **Coppersmith-Winograd**: O(n^2.376) theoretical improvement

---

## References

- Strassen, Volker (1969). "Gaussian elimination is not optimal"
- "Introduction to Algorithms" by CLRS (Chapter 4)

---

_Last Updated: December 2025_
