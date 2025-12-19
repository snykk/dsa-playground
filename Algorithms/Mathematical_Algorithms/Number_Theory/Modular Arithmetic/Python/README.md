# Modular Arithmetic (Python)

**Modular Arithmetic** is a system of arithmetic for integers, where numbers "wrap around" after reaching a certain value (the modulus).

---

## Overview

Modular arithmetic is fundamental in number theory, cryptography, and computer science. It operates on the principle of congruence modulo m, where two numbers are considered equivalent if their difference is divisible by m.

**Key Characteristics:**
- Operations: Addition, subtraction, multiplication, division, exponentiation
- Essential for cryptography: RSA, Diffie-Hellman, elliptic curves
- Efficient: O(1) for basic operations

---

## Operations

### Basic Operations

1. **Addition**: (a + b) mod m
2. **Subtraction**: (a - b) mod m
3. **Multiplication**: (a × b) mod m
4. **Division**: (a / b) mod m = (a × b^(-1)) mod m
5. **Exponentiation**: (a^b) mod m
6. **Inverse**: Find x such that (a × x) mod m = 1

---

## Complexity Analysis

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| **mod_add** | O(1) | O(1) |
| **mod_subtract** | O(1) | O(1) |
| **mod_multiply** | O(1) | O(1) |
| **mod_divide** | O(log min(b, m)) | O(log min(b, m)) |
| **mod_inverse** | O(log min(a, m)) | O(log min(a, m)) |
| **mod_power** | O(log exponent) | O(1) |

---

## Implementation Details

### Functions

1. **`mod_add(a, b, m)`**
   - Compute (a + b) mod m
   - Time: O(1), Space: O(1)

2. **`mod_subtract(a, b, m)`**
   - Compute (a - b) mod m (always non-negative)
   - Time: O(1), Space: O(1)

3. **`mod_multiply(a, b, m)`**
   - Compute (a × b) mod m
   - Time: O(1), Space: O(1)

4. **`mod_divide(a, b, m)`**
   - Compute (a / b) mod m using modular inverse
   - Returns None if inverse doesn't exist
   - Time: O(log min(b, m)), Space: O(log min(b, m))

5. **`mod_inverse(a, m)`**
   - Compute modular multiplicative inverse
   - Returns None if inverse doesn't exist
   - Time: O(log min(a, m)), Space: O(log min(a, m))

6. **`mod_power(base, exponent, m)`**
   - Compute (base^exponent) mod m using binary exponentiation
   - Time: O(log exponent), Space: O(1)

---

## Usage

```python
from modular_arithmetic import mod_add, mod_multiply, mod_power, mod_inverse

m = 11

# Addition
result = mod_add(7, 5, m)  # 1

# Multiplication
result = mod_multiply(7, 5, m)  # 2

# Exponentiation
result = mod_power(2, 5, m)  # 10

# Inverse
inv = mod_inverse(3, m)  # 4
```

---

## Properties

- **Commutative**: (a + b) mod m = (b + a) mod m
- **Associative**: ((a + b) + c) mod m = (a + (b + c)) mod m
- **Distributive**: (a × (b + c)) mod m = ((a × b) + (a × c)) mod m
- **Modular Inverse**: Only exists when GCD(a, m) = 1

---

## Applications

1. **Cryptography**: RSA, Diffie-Hellman, elliptic curves
2. **Hash Functions**: Modular hashing
3. **Random Number Generation**: Linear congruential generators
4. **Error Detection**: Checksums, parity bits
5. **Number Theory**: Various mathematical problems

---

## Testing

Run tests with:

```bash
python -m unittest modular_arithmetic_test.py
```

Or:

```bash
python modular_arithmetic_test.py
```

---

## References

- "Introduction to Algorithms" by CLRS (Chapter 31)
- "Number Theory" by Rosen
- "Algorithm Design Manual" by Steven Skiena

---

_Last Updated: December 2025_

