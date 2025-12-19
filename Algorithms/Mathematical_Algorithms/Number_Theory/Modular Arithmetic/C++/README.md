# Modular Arithmetic (C++)

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
| **modAdd** | O(1) | O(1) |
| **modSubtract** | O(1) | O(1) |
| **modMultiply** | O(1) | O(1) |
| **modDivide** | O(log min(b, m)) | O(log min(b, m)) |
| **modInverse** | O(log min(a, m)) | O(log min(a, m)) |
| **modPower** | O(log exponent) | O(1) |

---

## Implementation Details

### Functions

1. **`modAdd(a, b, m)`**
   - Compute (a + b) mod m
   - Time: O(1), Space: O(1)

2. **`modSubtract(a, b, m)`**
   - Compute (a - b) mod m (always non-negative)
   - Time: O(1), Space: O(1)

3. **`modMultiply(a, b, m)`**
   - Compute (a × b) mod m
   - Time: O(1), Space: O(1)

4. **`modDivide(a, b, m)`**
   - Compute (a / b) mod m using modular inverse
   - Returns -1 if inverse doesn't exist
   - Time: O(log min(b, m)), Space: O(log min(b, m))

5. **`modInverse(a, m)`**
   - Compute modular multiplicative inverse
   - Returns -1 if inverse doesn't exist
   - Time: O(log min(a, m)), Space: O(log min(a, m))

6. **`modPower(base, exponent, m)`**
   - Compute (base^exponent) mod m using binary exponentiation
   - Time: O(log exponent), Space: O(1)

---

## Usage

```cpp
#include "modular_arithmetic.cpp"

long long m = 11;

// Addition
long long result = modAdd(7, 5, m);  // 1

// Multiplication
result = modMultiply(7, 5, m);  // 2

// Exponentiation
result = modPower(2, 5, m);  // 10

// Inverse
long long inv = modInverse(3, m);  // 4
```

---

## Testing

Run tests with:

```bash
# Compile
g++ -o modular_arithmetic_test modular_arithmetic_test.cpp

# Run
./modular_arithmetic_test
```

Or compile and run in one command:

```bash
g++ modular_arithmetic_test.cpp -o modular_arithmetic_test && ./modular_arithmetic_test
```

---

## References

- "Introduction to Algorithms" by CLRS (Chapter 31)
- "Number Theory" by Rosen
- "Algorithm Design Manual" by Steven Skiena

---

_Last Updated: December 2025_

