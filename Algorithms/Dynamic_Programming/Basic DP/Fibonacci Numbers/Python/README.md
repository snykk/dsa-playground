# Fibonacci Numbers (Python)

**Fibonacci Numbers** are a classic example of Dynamic Programming, demonstrating overlapping subproblems and optimal substructure.

---

## Overview

The Fibonacci sequence is defined as F(n) = F(n-1) + F(n-2) with base cases F(0) = 0 and F(1) = 1. This sequence appears naturally in many areas: mathematics, computer science, nature (golden ratio), and serves as the perfect introduction to Dynamic Programming concepts.

**Sequence**: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, ...

---

## Algorithm

The naive recursive approach has exponential time complexity because it recalculates the same values multiple times. Dynamic Programming solves this by storing previously computed values.

### Recursive Relation
- **Base Cases**: F(0) = 0, F(1) = 1
- **Recurrence**: F(n) = F(n-1) + F(n-2) for n > 1

---

## Complexity Analysis

| Approach | Time | Space | Notes |
|----------|------|-------|-------|
| **Naive Recursive** | O(2^n) | O(n) | Recalculates same values |
| **Memoization** | O(n) | O(n) | Top-down DP, stores computed values |
| **Tabulation** | O(n) | O(n) | Bottom-up DP, fills table iteratively |
| **Space-Optimized** | O(n) | O(1) | Only stores last two values |
| **Matrix Exponentiation** | O(log n) | O(1) | Uses matrix power for fast computation |

**Note**: Matrix exponentiation is optimal for very large n (e.g., n > 10^9).

---

## Implementation Details

### Functions

1. **`fibonacci_naive(n)`**
   - Naive recursive implementation
   - O(2^n) time complexity
   - Demonstrates why DP is needed
   - Not recommended for production

2. **`fibonacci_memoization(n, memo=None)`**
   - Top-down Dynamic Programming
   - Uses dictionary to cache results
   - O(n) time and space
   - More intuitive (recursive style)

3. **`fibonacci_tabulation(n)`**
   - Bottom-up Dynamic Programming
   - Fills array iteratively
   - O(n) time and space
   - Standard DP approach

4. **`fibonacci_optimized(n)`**
   - Space-optimized version
   - Only stores last two values
   - O(n) time, O(1) space
   - Best for most practical cases

5. **`fibonacci_matrix(n)`**
   - Matrix exponentiation approach
   - O(log n) time complexity
   - Uses transformation matrix [[1,1],[1,0]]
   - Best for very large n

6. **`fibonacci_sequence(n)`**
   - Generates first n Fibonacci numbers
   - Returns list of sequence
   - Useful for visualization

---

## Usage

```python
from fibonacci import (
    fibonacci_naive,
    fibonacci_memoization,
    fibonacci_tabulation,
    fibonacci_optimized,
    fibonacci_matrix,
    fibonacci_sequence
)

# Standard tabulation (recommended for most cases)
result = fibonacci_tabulation(10)
print(result)  # Output: 55

# Space-optimized (best for large n when space matters)
result = fibonacci_optimized(100)
print(result)  # Output: 354224848179261915075

# Matrix exponentiation (best for very large n)
result = fibonacci_matrix(1000)
print(result)  # Very fast even for large n

# Generate sequence
seq = fibonacci_sequence(10)
print(seq)  # Output: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]

# Memoization (top-down approach)
result = fibonacci_memoization(50)
print(result)  # Output: 12586269025
```

---

## DP Pattern Demonstration

Fibonacci perfectly demonstrates core DP concepts:

1. **Overlapping Subproblems**: 
   - F(5) requires F(4) and F(3)
   - F(4) requires F(3) and F(2)
   - F(3) is calculated twice!
   - Naive approach: O(2^n) recalculations
   - DP approach: Calculate once, reuse

2. **Optimal Substructure**:
   - F(n) = F(n-1) + F(n-2)
   - Optimal solution contains optimal solutions to subproblems

3. **Memoization vs Tabulation**:
   - **Memoization**: Top-down, recursive, cache as you go
   - **Tabulation**: Bottom-up, iterative, fill table completely

---

## Important Notes

1. **Integer Overflow**: For very large n, use big integers or modulo arithmetic
2. **Matrix Exponentiation**: Best for n > 10^6 or when modulo is needed
3. **Space Optimization**: Use optimized version when space is constrained
4. **Base Cases**: Always handle F(0) and F(1) correctly

---

## Advantages

1. ✅ **Multiple Approaches**: Choose based on constraints
2. ✅ **Educational Value**: Perfect DP learning example
3. ✅ **Practical Applications**: Used in many algorithms
4. ✅ **Space Optimization**: Can achieve O(1) space

---

## Disadvantages

1. ❌ **Naive Recursive**: Exponential time, not practical
2. ❌ **Large Numbers**: Fibonacci grows exponentially, need big integers
3. ❌ **Matrix Overhead**: Matrix exponentiation has constant factor overhead

---

## When to Use

- ✅ **Tabulation/Optimized**: General purpose, n < 10^6
- ✅ **Matrix Exponentiation**: Very large n (> 10^6) or modulo arithmetic needed
- ✅ **Memoization**: When recursive structure is more intuitive
- ❌ **Naive Recursive**: Never in production, only for learning

---

## Practical Considerations

- **Modulo Arithmetic**: Often needed in competitive programming (e.g., F(n) mod 10^9+7)
- **Precomputation**: For multiple queries, precompute and store
- **Cache Performance**: Tabulation has better cache locality than memoization
- **Recursion Depth**: Memoization may hit recursion limits for large n

---

## Testing

Run the test suite:

```bash
python fibonacci_test.py
```

The test suite includes:
- Base case verification
- Small value tests
- Comparison between all approaches
- Sequence generation tests

---

## Related Algorithms

- **Climbing Stairs**: Same recurrence relation, different problem
- **Tribonacci**: Extension with F(n) = F(n-1) + F(n-2) + F(n-3)
- **Lucas Numbers**: Similar sequence with different base cases
- **Pell Numbers**: Related sequence with different recurrence

---

## Applications

1. **Algorithm Analysis**: Used in algorithm complexity analysis
2. **Golden Ratio**: Ratio of consecutive Fibonacci numbers approaches φ
3. **Nature**: Appears in flower petals, pinecones, shells
4. **Cryptography**: Used in some cryptographic algorithms
5. **Financial Modeling**: Fibonacci retracements in trading

---

## References

- "Introduction to Algorithms" by CLRS (Chapter 15)
- "Algorithm Design Manual" by Steven Skiena
- Fibonacci sequence on Wikipedia

---

_Last Updated: December 2025_

