# Modular Arithmetic (Go)

**Modular Arithmetic** is a system of arithmetic for integers, where numbers "wrap around" after reaching a certain value (the modulus).

---

## Overview

Modular arithmetic is fundamental in number theory, cryptography, and computer science. It operates on the principle of congruence modulo m, where two numbers are considered equivalent if their difference is divisible by m.

**Key Characteristics:**
- Operations: Addition, subtraction, multiplication, division, exponentiation
- Essential for cryptography: RSA, Diffie-Hellman, elliptic curves
- Efficient: O(1) for basic operations

---

## Complexity Analysis

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| **ModAdd** | O(1) | O(1) |
| **ModSubtract** | O(1) | O(1) |
| **ModMultiply** | O(1) | O(1) |
| **ModDivide** | O(log min(b, m)) | O(log min(b, m)) |
| **ModInverse** | O(log min(a, m)) | O(log min(a, m)) |
| **ModPower** | O(log exponent) | O(1) |

---

## Implementation Details

### Functions

1. **`ModAdd(a, b, m)`**
   - Compute (a + b) mod m
   - Time: O(1), Space: O(1)

2. **`ModSubtract(a, b, m)`**
   - Compute (a - b) mod m (always non-negative)
   - Time: O(1), Space: O(1)

3. **`ModMultiply(a, b, m)`**
   - Compute (a × b) mod m
   - Time: O(1), Space: O(1)

4. **`ModDivide(a, b, m)`**
   - Compute (a / b) mod m using modular inverse
   - Returns -1 if inverse doesn't exist
   - Time: O(log min(b, m)), Space: O(log min(b, m))

5. **`ModInverse(a, m)`**
   - Compute modular multiplicative inverse
   - Returns -1 if inverse doesn't exist
   - Time: O(log min(a, m)), Space: O(log min(a, m))

6. **`ModPower(base, exponent, m)`**
   - Compute (base^exponent) mod m using binary exponentiation
   - Time: O(log exponent), Space: O(1)

---

## Usage

```go
package main

import "fmt"

func main() {
    m := int64(11)
    
    // Addition
    result := ModAdd(7, 5, m)
    fmt.Println(result)  // 1
    
    // Multiplication
    result = ModMultiply(7, 5, m)
    fmt.Println(result)  // 2
    
    // Exponentiation
    result = ModPower(2, 5, m)
    fmt.Println(result)  // 10
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
- "Number Theory" by Rosen
- "Algorithm Design Manual" by Steven Skiena

---

_Last Updated: December 2025_

