# Strassen's Matrix Multiplication

**Strassen's Matrix Multiplication** is a divide and conquer algorithm that multiplies two matrices faster than the naive O(n³) approach.

---

## Overview

Strassen's algorithm reduces matrix multiplication from O(n³) to O(n^log₂ 7) ≈ O(n^2.81) by using only 7 recursive multiplications instead of 8.

---

## Complexity Analysis

| Complexity | Time | Space |
|------------|------|-------|
| **All Cases** | O(n^log₂ 7) ≈ O(n^2.81) | O(n²) |

---

## Key Insight

Instead of 8 multiplications for 2x2 blocks, Strassen uses 7:
- P1 = A11 × (B12 - B22)
- P2 = (A11 + A12) × B22
- P3 = (A21 + A22) × B11
- P4 = A22 × (B21 - B11)
- P5 = (A11 + A22) × (B11 + B22)
- P6 = (A12 - A22) × (B21 + B22)
- P7 = (A11 - A21) × (B11 + B12)

---

## Implementations

- **Python** (`Python/`) - Complete implementation
- **C++** (`C++/`) - Template-based
- **Go** (`Go/`) - Basic structure

---

## When to Use

- ✅ Very large matrices (> 1000x1000)
- ✅ When asymptotic performance matters
- ❌ Small matrices (use naive O(n³))

---

## References

- Strassen, Volker (1969). "Gaussian elimination is not optimal"
- "Introduction to Algorithms" by CLRS

---

_Last Updated: December 2025_

