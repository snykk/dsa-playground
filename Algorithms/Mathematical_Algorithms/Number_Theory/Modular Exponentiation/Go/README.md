# Modular Exponentiation (Go)

**Modular Exponentiation** computes (base^exponent) mod modulus efficiently using binary exponentiation (also known as fast exponentiation).

---

## Overview

Modular exponentiation is a fundamental operation in number theory and cryptography. The naive approach of computing base^exponent first and then taking modulo is inefficient for large numbers. Binary exponentiation reduces the time complexity from O(exponent) to O(log exponent).

**Key Characteristics:**
- Efficient: O(log exponent) time complexity
- Essential for cryptography: RSA, Diffie-Hellman
- Uses binary representation of exponent

---

## Complexity Analysis

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| **ModPow** | O(log exponent) | O(1) |
| **ModInverse** | O(log min(a, m)) | O(log min(a, m)) |

---

## Implementation Details

### Functions

1. **`ModPow(base, exponent, modulus)`**
   - Compute (base^exponent) mod modulus using iterative binary exponentiation
   - Returns result
   - Time: O(log exponent), Space: O(1)

2. **`ModInverse(a, m)`**
   - Compute modular multiplicative inverse using Extended Euclidean Algorithm
   - Returns inverse x where (a * x) mod m = 1, or -1 if it doesn't exist
   - Time: O(log min(a, m)), Space: O(log min(a, m))

---

## Usage

```go
package main

import "fmt"

func main() {
    // Compute modular exponentiation
    result := ModPow(2, 10, 1000)
    fmt.Println(result)  // 24
    
    // Compute modular inverse
    inv := ModInverse(3, 11)
    fmt.Println(inv)  // 4
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

