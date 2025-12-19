# Matrix Exponentiation (C++)

**Matrix Exponentiation** computes A^k efficiently using binary exponentiation, where A is a square matrix and k is a non-negative integer.

---

## Overview

Matrix exponentiation is a powerful technique for computing high powers of matrices efficiently. It's particularly useful for solving linear recurrences, computing Fibonacci numbers, and solving dynamic programming problems.

**Key Characteristics:**
- Efficient: O(n³ log k) time complexity
- Applications: Fibonacci, linear recurrences, graph paths
- Supports modular arithmetic

---

## Complexity Analysis

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| **matrixMultiply** | O(n × m × p) | O(n × p) |
| **matrixPower** | O(n³ log k) | O(n²) |
| **matrixPowerIterative** | O(n³ log k) | O(n²) |
| **fibonacciMatrix** | O(log n) | O(1) |

---

## Implementation Details

### Functions

1. **`matrixMultiply(A, B, mod)`**
   - Multiply two matrices A and B
   - Optional modulus for modular arithmetic
   - Time: O(n × m × p), Space: O(n × p)

2. **`matrixPower(A, k, mod)`**
   - Compute A^k using recursive binary exponentiation
   - Time: O(n³ log k), Space: O(n²)

3. **`matrixPowerIterative(A, k, mod)`**
   - Compute A^k using iterative binary exponentiation
   - Time: O(n³ log k), Space: O(n²)

4. **`fibonacciMatrix(n, mod)`**
   - Compute nth Fibonacci number using matrix exponentiation
   - Time: O(log n), Space: O(1)

---

## Usage

```cpp
#include "matrix_exponentiation.cpp"
#include <vector>

int main() {
    // Compute matrix power
    Matrix A = {{1, 1}, {1, 0}};
    Matrix A_5 = matrixPower(A, 5);
    
    // Compute Fibonacci
    long long fib_10 = fibonacciMatrix(10);
    
    return 0;
}
```

---

## Testing

Run tests with:

```bash
# Compile
g++ -o matrix_exponentiation_test matrix_exponentiation_test.cpp

# Run
./matrix_exponentiation_test
```

Or compile and run in one command:

```bash
g++ matrix_exponentiation_test.cpp -o matrix_exponentiation_test && ./matrix_exponentiation_test
```

---

## References

- "Introduction to Algorithms" by CLRS
- "Algorithm Design Manual" by Steven Skiena
- "Competitive Programming" by Halim & Halim

---

_Last Updated: December 2025_

