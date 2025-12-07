# Strassen's Matrix Multiplication (Python)

**Strassen's Matrix Multiplication** is a divide and conquer algorithm that multiplies two matrices faster than the naive O(n³) approach.

---

## Overview

Strassen's algorithm reduces matrix multiplication from O(n³) to O(n^log₂ 7) ≈ O(n^2.81) by using a clever divide and conquer strategy that requires only 7 recursive multiplications instead of 8.

---

## Algorithm

1. **Divide**: Split each matrix into 4 quadrants
2. **Conquer**: Calculate 7 products recursively (not 8!)
3. **Combine**: Combine products to form result quadrants

---

## Complexity Analysis

| Complexity | Time | Space |
|------------|------|-------|
| **Best Case** | O(n^log₂ 7) | O(n²) |
| **Average Case** | O(n^log₂ 7) | O(n²) |
| **Worst Case** | O(n^log₂ 7) | O(n²) |

**Note**: 
- log₂ 7 ≈ 2.81
- Faster than naive O(n³) for large matrices
- Overhead makes it slower for small matrices

---

## Strassen's 7 Products

Instead of 8 multiplications, Strassen uses 7:

1. P1 = A11 × (B12 - B22)
2. P2 = (A11 + A12) × B22
3. P3 = (A21 + A22) × B11
4. P4 = A22 × (B21 - B11)
5. P5 = (A11 + A22) × (B11 + B22)
6. P6 = (A12 - A22) × (B21 + B22)
7. P7 = (A11 - A21) × (B11 + B12)

Result quadrants:
- C11 = P5 + P4 - P2 + P6
- C12 = P1 + P2
- C21 = P3 + P4
- C22 = P5 + P1 - P3 - P7

---

## Implementation Details

### Functions

1. **`strassen_multiply(A, B)`**
   - Main Strassen's algorithm
   - Works with matrices of size power of 2
   - Uses threshold (64) to switch to naive for small matrices

2. **`strassen_multiply_general(A, B)`**
   - Handles matrices of any size
   - Automatically pads to power of 2
   - Removes padding from result

3. **`matrix_multiply_naive(A, B)`**
   - Naive O(n³) implementation for comparison

---

## Usage

```python
from strassen_matrix import strassen_multiply, strassen_multiply_general

# For power-of-2 sized matrices
A = [[1, 2], [3, 4]]
B = [[5, 6], [7, 8]]
C = strassen_multiply(A, B)
# C = [[19, 22], [43, 50]]

# For any size matrices
A = [[1, 2, 3], [4, 5, 6]]
B = [[1, 2], [3, 4], [5, 6]]
C = strassen_multiply_general(A, B)
```

---

## Advantages

1. ✅ **Faster**: O(n^2.81) vs O(n³) for large matrices
2. ✅ **Asymptotically better**: Better time complexity
3. ✅ **Divide and Conquer**: Classic example

---

## Disadvantages

1. ❌ **Overhead**: Slower for small matrices due to recursion overhead
2. ❌ **Memory**: Requires O(n²) space
3. ❌ **Complexity**: More complex than naive approach
4. ❌ **Numerical stability**: Can have precision issues

---

## When to Use

- ✅ Very large matrices (typically > 1000x1000)
- ✅ When asymptotic performance matters
- ✅ Theoretical interest
- ❌ Small matrices (use naive multiplication)
- ❌ When numerical precision is critical

---

## Practical Considerations

- **Threshold**: Algorithm switches to naive multiplication for small subproblems
- **Padding**: Non-power-of-2 matrices are padded, adding overhead
- **Cache**: May have worse cache performance than naive approach

---

## Testing

Run the test suite:

```bash
python strassen_matrix_test.py
```

---

## Related Algorithms

- **Naive Matrix Multiplication**: O(n³) standard approach
- **Coppersmith-Winograd**: O(n^2.376) theoretical improvement
- **Block Matrix Multiplication**: Cache-efficient variant

---

## References

- Strassen, Volker (1969). "Gaussian elimination is not optimal"
- "Introduction to Algorithms" by CLRS (Chapter 4)

---

_Last Updated: December 2025_

