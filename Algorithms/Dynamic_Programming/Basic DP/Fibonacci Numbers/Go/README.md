# Fibonacci Numbers (Go)

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

1. **`FibonacciTabulation(n)`**
   - Bottom-up Dynamic Programming
   - Fills array iteratively
   - Returns F(n)
   - Time: O(n), Space: O(n)

2. **`FibonacciOptimized(n)`**
   - Space-optimized version
   - Only stores last two values
   - Returns F(n)
   - Time: O(n), Space: O(1)

---

## Usage

```go
package main

import "fmt"

func main() {
    // Tabulation (standard)
    result := FibonacciTabulation(10)
    fmt.Println(result)  // Output: 55

    // Space-optimized (best for most cases)
    result = FibonacciOptimized(50)
    fmt.Println(result)  // Output: 12586269025
}
```

---

## Important Notes

1. **Integer Overflow**: Fibonacci grows exponentially, use `int64` or `big.Int` for large n
2. **Modulo Arithmetic**: Often needed in competitive programming (e.g., F(n) mod 10^9+7)
3. **Space Optimization**: Can reduce space from O(n) to O(1)
4. **Matrix Method**: Optimal for very large n (n > 10^9)
5. **Go Types**: Use `int64` for n up to ~90, `big.Int` for larger
6. **Negative n**: both functions panic for n < 0

---

## Advantages

1. ✅ **Multiple Approaches**: Choose based on constraints
2. ✅ **Educational Value**: Perfect DP learning example
3. ✅ **Space Optimization**: Can achieve O(1) space
4. ✅ **Fast Methods**: Matrix exponentiation for very large n

---

## Disadvantages

1. ❌ **Naive Recursive**: Exponential time, not practical
2. ❌ **Large Numbers**: Fibonacci grows exponentially, need big integers
3. ❌ **Memory**: Tabulation requires O(n) space

---

## When to Use

- ✅ **Tabulation/Optimized**: General purpose, n < 10^6
- ✅ **Matrix Exponentiation**: Very large n (n > 10^9)
- ✅ **Memoization**: When recursive structure is more intuitive
- ❌ **Naive Recursive**: Never in production, only for learning

---

## Testing

Run the test suite:

```bash
go test -v
```

---

## Related Algorithms

- **Climbing Stairs**: Same recurrence relation
- **Coin Change**: Similar DP pattern
- **Linear Recurrences**: General pattern for similar problems

---

## Applications

1. **Mathematics**: Golden ratio, number theory
2. **Nature**: Plant growth patterns, spiral formations
3. **Computer Science**: Algorithm analysis, DP examples
4. **Cryptography**: Some encryption schemes

---

## References

- "Introduction to Algorithms" by CLRS (Chapter 15)
- "Algorithm Design Manual" by Steven Skiena
- Fibonacci sequence in nature and mathematics

---

_Last Updated: December 2025_
