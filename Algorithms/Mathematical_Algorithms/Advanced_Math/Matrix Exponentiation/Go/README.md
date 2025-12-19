# Matrix Exponentiation (Go)

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
| **MatrixMultiply** | O(n × m × p) | O(n × p) |
| **MatrixPower** | O(n³ log k) | O(n²) |
| **MatrixPowerIterative** | O(n³ log k) | O(n²) |
| **FibonacciMatrix** | O(log n) | O(1) |

---

## Implementation Details

### Functions

1. **`MatrixMultiply(A, B, mod)`**
   - Multiply two matrices A and B
   - Optional modulus for modular arithmetic (use -1 for no mod)
   - Time: O(n × m × p), Space: O(n × p)

2. **`MatrixPower(A, k, mod)`**
   - Compute A^k using recursive binary exponentiation
   - Time: O(n³ log k), Space: O(n²)

3. **`MatrixPowerIterative(A, k, mod)`**
   - Compute A^k using iterative binary exponentiation
   - Time: O(n³ log k), Space: O(n²)

4. **`FibonacciMatrix(n, mod)`**
   - Compute nth Fibonacci number using matrix exponentiation
   - Time: O(log n), Space: O(1)

---

## Usage

```go
package main

import "fmt"

func main() {
    // Compute matrix power
    A := [][]int64{{1, 1}, {1, 0}}
    A_5 := MatrixPower(A, 5, -1)
    
    // Compute Fibonacci
    fib_10 := FibonacciMatrix(10, -1)
    fmt.Println(fib_10)  // 55
}
```

---

## Testing

Run tests with:

```bash
# Run tests
go test -v

# Or run the main file to see example usage
go run main.go
```

---

## References

- "Introduction to Algorithms" by CLRS
- "Algorithm Design Manual" by Steven Skiena
- "Competitive Programming" by Halim & Halim

---

_Last Updated: December 2025_

