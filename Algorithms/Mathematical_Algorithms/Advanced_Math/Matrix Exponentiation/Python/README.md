# Matrix Exponentiation (Python)

**Matrix Exponentiation** computes A^k efficiently using binary exponentiation, where A is a square matrix and k is a non-negative integer.

---

## Overview

Matrix exponentiation is a powerful technique for computing high powers of matrices efficiently. It uses the same binary exponentiation principle as modular exponentiation, but applied to matrix multiplication.

**Key Characteristics:**
- Efficient: O(n³ log k) time complexity
- Useful for linear recurrences: Fibonacci, linear transformations
- Binary exponentiation: Same principle as number exponentiation

---

## Algorithm

### Binary Exponentiation for Matrices

The algorithm uses the same principle as number exponentiation:
- If k = 0: return identity matrix
- If k = 1: return A
- If k is even: A^k = (A^(k/2))^2
- If k is odd: A^k = A × A^(k-1)

---

## Complexity Analysis

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| **matrix_multiply** | O(n × m × p) | O(n × p) |
| **matrix_power** | O(n³ log k) | O(n²) |
| **matrix_power_iterative** | O(n³ log k) | O(n²) |
| **fibonacci_matrix** | O(log n) | O(1) |

Where n is the size of the square matrix, and k is the exponent.

---

## Implementation Details

### Functions

1. **`matrix_multiply(A, B, mod=None)`**
   - Multiply two matrices
   - Returns result matrix
   - Time: O(n × m × p), Space: O(n × p)

2. **`matrix_identity(n)`**
   - Create n × n identity matrix
   - Returns identity matrix
   - Time: O(n²), Space: O(n²)

3. **`matrix_power(A, k, mod=None)`**
   - Compute A^k using recursive binary exponentiation
   - Returns A^k
   - Time: O(n³ log k), Space: O(n²)

4. **`matrix_power_iterative(A, k, mod=None)`**
   - Compute A^k using iterative binary exponentiation
   - Returns A^k
   - Time: O(n³ log k), Space: O(n²)

5. **`fibonacci_matrix(n, mod=None)`**
   - Compute nth Fibonacci number using matrix exponentiation
   - Returns Fibonacci number
   - Time: O(log n), Space: O(1)

---

## Usage

```python
from matrix_exponentiation import matrix_power, fibonacci_matrix

# Compute matrix power
A = [[1, 1], [1, 0]]
A_10 = matrix_power(A, 10)
print(A_10)

# Compute Fibonacci using matrix exponentiation
fib_100 = fibonacci_matrix(100)
print(fib_100)

# With modulus
fib_100_mod = fibonacci_matrix(100, mod=1000)
print(fib_100_mod)
```

---

## Applications

1. **Linear Recurrences**: Fibonacci, linear transformations
2. **Graph Algorithms**: Counting paths in graphs
3. **Dynamic Programming**: State transitions
4. **Cryptography**: Some cryptographic protocols
5. **Computer Graphics**: Transformations

---

## Fibonacci Example

The Fibonacci sequence can be computed using matrix exponentiation:

```
[F(n+1)]   [1  1]^n   [F(1)]
[F(n)  ] = [1  0]   × [F(0)]
```

This allows computing F(n) in O(log n) time instead of O(n).

---

## Important Notes

- **Square Matrices**: Matrix must be square for exponentiation
- **Modular Arithmetic**: Supports optional modulus for large numbers
- **Efficiency**: Much faster than naive O(k) multiplications

---

## Testing

Run tests with:

```bash
python -m unittest matrix_exponentiation_test.py
```

Or:

```bash
python matrix_exponentiation_test.py
```

---

## References

- "Introduction to Algorithms" by CLRS
- "Algorithm Design Manual" by Steven Skiena
- "Concrete Mathematics" by Graham, Knuth, Patashnik

---

_Last Updated: December 2025_

