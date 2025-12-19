# Miller-Rabin Primality Test (Go)

**Miller-Rabin Primality Test** is a probabilistic algorithm for determining whether a number is prime. It is based on Fermat's little theorem and is widely used in practice.

---

## Overview

The Miller-Rabin test is one of the most practical primality tests. It's faster than deterministic tests for large numbers and is commonly used in cryptographic applications.

**Key Characteristics:**
- Probabilistic: Can give false positives (very rare with sufficient iterations)
- Efficient: O(k log³ n) time complexity
- Widely used: Standard in cryptography libraries

---

## Complexity Analysis

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| **MillerRabin** | O(k log³ n) | O(1) |
| **IsPrimeMillerRabin** | O(k log³ n) | O(1) |
| **MillerRabinDeterministic** | O(log³ n) | O(1) |

Where k is the number of iterations (default: 5)

---

## Implementation Details

### Functions

1. **`MillerRabin(n, k)`**
   - Miller-Rabin primality test
   - Returns true if n is probably prime, false if composite
   - Time: O(k log³ n), Space: O(1)

2. **`IsPrimeMillerRabin(n, k)`**
   - Check if n is prime using Miller-Rabin test
   - Handles edge cases (n < 2, n == 2, even numbers)
   - Time: O(k log³ n), Space: O(1)

3. **`MillerRabinDeterministic(n)`**
   - Deterministic version for n < 2^64
   - Uses specific bases known to work for all numbers < 2^64
   - Time: O(log³ n), Space: O(1)

---

## Usage

```go
package main

import "fmt"

func main() {
    // Probabilistic test
    if IsPrimeMillerRabin(97, 10) {
        fmt.Println("97 is probably prime")
    }
    
    // Deterministic test (for n < 2^64)
    if MillerRabinDeterministic(101) {
        fmt.Println("101 is prime")
    }
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

- "Introduction to Algorithms" by CLRS (Chapter 31)
- "Algorithm Design Manual" by Steven Skiena
- "Number Theory" by Rosen

---

_Last Updated: December 2025_

