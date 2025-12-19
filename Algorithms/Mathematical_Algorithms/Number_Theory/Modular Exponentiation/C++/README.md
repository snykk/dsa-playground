# Modular Exponentiation (C++)

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
| **modPow** | O(log exponent) | O(1) |
| **modInverse** | O(log min(a, m)) | O(log min(a, m)) |

---

## Implementation Details

### Functions

1. **`modPow(base, exponent, modulus)`**
   - Compute (base^exponent) mod modulus using iterative binary exponentiation
   - Returns result
   - Time: O(log exponent), Space: O(1)

2. **`modInverse(a, m)`**
   - Compute modular multiplicative inverse using Extended Euclidean Algorithm
   - Returns inverse x where (a * x) mod m = 1, or -1 if it doesn't exist
   - Time: O(log min(a, m)), Space: O(log min(a, m))

---

## Usage

```cpp
#include "modular_exponentiation.cpp"

// Compute modular exponentiation
long long result = modPow(2, 10, 1000);
// result = 24

// Compute modular inverse
long long inv = modInverse(3, 11);
// inv = 4
```

---

## Testing

Run tests with:

```bash
# Compile
g++ -o modular_exponentiation_test modular_exponentiation_test.cpp

# Run
./modular_exponentiation_test
```

Or compile and run in one command:

```bash
g++ modular_exponentiation_test.cpp -o modular_exponentiation_test && ./modular_exponentiation_test
```

---

## References

- "Introduction to Algorithms" by CLRS (Chapter 31)
- "Algorithm Design Manual" by Steven Skiena
- "Number Theory" by Rosen

---

_Last Updated: December 2025_

