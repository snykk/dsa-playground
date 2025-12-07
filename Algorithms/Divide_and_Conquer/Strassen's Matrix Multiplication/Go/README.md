# Strassen's Matrix Multiplication (Go)

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

```go
package main

import "fmt"

func main() {
    A := [][]int{{1, 2}, {3, 4}}
    B := [][]int{{5, 6}, {7, 8}}
    C := StrassenMultiply(A, B)
    // C = {{19, 22}, {43, 50}}
    fmt.Println(C)
}
```

---

## Implementation Details

### Functions

- **`StrassenMultiply(A, B)`**: Main Strassen's algorithm
- **`matrixAdd(A, B)`**: Matrix addition
- **`matrixSubtract(A, B)`**: Matrix subtraction
- **`splitMatrix(matrix)`**: Split into 4 quadrants
- **`combineMatrices(...)`**: Combine 4 quadrants
- **`naiveMultiply(A, B)`**: Naive O(n³) for small matrices

---

## Testing

Run the test suite:

```bash
go test
```

Run with verbose output:

```bash
go test -v
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
