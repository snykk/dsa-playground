# Matrix Chain Multiplication (Python)

**Matrix Chain Multiplication** finds the optimal order of multiplying a chain of matrices to minimize the number of scalar multiplications. The order of multiplication significantly affects the computational cost.

---

## Overview

Given a chain of matrices A₁, A₂, ..., Aₙ with dimensions p₀×p₁, p₁×p₂, ..., pₙ₋₁×pₙ, we want to find the order of multiplication that minimizes the number of scalar multiplications. Matrix multiplication is associative, so different parenthesizations give the same result but different costs.

**Example**:
- Matrices: A₁(10×20), A₂(20×30), A₃(30×40)
- Dimensions: [10, 20, 30, 40]
- Option 1: (A₁×A₂)×A₃: 10×20×30 + 10×30×40 = 6,000 + 12,000 = 18,000
- Option 2: A₁×(A₂×A₃): 20×30×40 + 10×20×40 = 24,000 + 8,000 = 32,000
- Minimum: 18,000 (Option 1)

---

## Algorithm

1. **DP State**: `dp[i][j]` = minimum cost to multiply matrices from index `i` to `j`
2. **Recurrence**: 
   - `dp[i][j] = min(dp[i][k] + dp[k+1][j] + cost)` for all `k` in `[i, j-1]`
   - `cost = p[i-1] × p[k] × p[j]` (cost of multiplying result of [i,k] and [k+1,j])
3. **Base Case**: `dp[i][i] = 0` (single matrix, no multiplication needed)
4. **Result**: `dp[1][n]` (multiply all matrices from 1 to n)

**Intuition**: Try all possible split points `k`, and choose the one that minimizes total cost.

---

## Complexity Analysis

| Approach | Time | Space | Notes |
|----------|------|-------|-------|
| **Naive Recursive** | O(2^n) | O(n) | Exponential, tries all parenthesizations |
| **DP Tabulation** | O(n³) | O(n²) | Standard DP approach |
| **With Parenthesization** | O(n³) | O(n²) | Also stores optimal split points |

Where `n` = number of matrices.

**Note**: O(n³) is the classic DP bound, not the best possible: Hu and Shing's algorithm solves the problem in O(n log n).

---

## Implementation Details

### Functions

1. **`matrix_chain_multiplication(dims)`**
   - Standard DP approach
   - `dims` is list of dimensions: [p₀, p₁, p₂, ..., pₙ]
   - Returns minimum number of scalar multiplications
   - Time: O(n³), Space: O(n²)

---

## Usage

```python
from matrix_chain import matrix_chain_multiplication

# Example: 4 matrices
# A₁(1×2), A₂(2×3), A₃(3×4), A₄(4×3)
dims = [1, 2, 3, 4, 3]

# Minimum cost only
min_ops = matrix_chain_multiplication(dims)
print(min_ops)  # Output: 30

# Real example from overview
dims = [10, 20, 30, 40]  # 3 matrices
min_ops = matrix_chain_multiplication(dims)
print(min_ops)  # Output: 18000
```

---

## Important Notes

1. **Dimensions array**: `dims[i]` represents dimension of matrix i (pᵢ₋₁×pᵢ)
2. **Indexing**: Usually 1-indexed for matrices (A₁ to Aₙ)
3. **Associativity**: Matrix multiplication is associative, so result is same
4. **Cost calculation**: Cost of multiplying A(p×q) × B(q×r) is p×q×r
5. **Optimal substructure**: Optimal solution contains optimal solutions to subproblems
6. **Fewer than two matrices**: if `dims` has fewer than 3 entries (`[]`, `[5]`, `[5, 10]`) the function returns 0

---

## Advantages

1. ✅ **Optimal**: DP guarantees optimal solution
2. ✅ **Efficient**: O(n³) time complexity (the classic DP bound; Hu-Shing reaches O(n log n))
3. ✅ **Practical**: Significant speedup for large matrix chains
4. ✅ **Parenthesization**: Can reconstruct optimal order

---

## Disadvantages

1. ❌ **Cubic time**: O(n³) can be slow for very long chains
2. ❌ **Memory**: O(n²) space for DP table
3. ❌ **Only for chains**: Works for linear chains, not general graphs

---

## When to Use

- ✅ **Matrix chains**: When multiplying chain of matrices
- ✅ **Compiler optimization**: Optimizing expression evaluation
- ✅ **Scientific computing**: Large matrix computations
- ❌ **General graphs**: Different algorithm for DAG multiplication

---

## Practical Impact

For a chain of 10 matrices there are Catalan(9) = 4,862 possible parenthesizations, while DP solves it in O(10³) = 1000 operations. For 20 matrices there are Catalan(19) = 1,767,263,190, while DP needs only O(20³) = 8,000 operations.

---

## Testing

Run the test suite:

```bash
python matrix_chain_test.py
```

---

## Related Algorithms

- **Optimal Binary Search Tree**: Similar DP structure (O(n³))
- **Polygon Triangulation**: Similar recurrence relation
- **Chain Matrix Multiplication**: Generalization to DAGs

---

## Applications

1. **Compiler Optimization**: Optimize expression evaluation order
2. **Scientific Computing**: Optimize large matrix computations
3. **Linear Algebra Libraries**: BLAS, LAPACK use similar optimizations
4. **Machine Learning**: Optimize neural network computations

---

## References

- "Introduction to Algorithms" by CLRS (Chapter 15)
- "Algorithm Design Manual" by Steven Skiena
- Cormen, T. H., et al. (2009). "Introduction to Algorithms"

---

_Last Updated: December 2025_
