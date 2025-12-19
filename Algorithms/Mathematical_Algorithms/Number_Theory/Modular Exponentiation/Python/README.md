# Modular Exponentiation (Python)

**Modular Exponentiation** computes (base^exponent) mod modulus efficiently using binary exponentiation (also known as fast exponentiation).

---

## Overview

Modular exponentiation is a fundamental operation in number theory and cryptography. The naive approach of computing base^exponent first and then taking modulo is inefficient for large numbers. Binary exponentiation reduces the time complexity from O(exponent) to O(log exponent).

**Key Characteristics:**
- Efficient: O(log exponent) time complexity
- Essential for cryptography: RSA, Diffie-Hellman
- Uses binary representation of exponent

---

## Algorithm

### Binary Exponentiation

The algorithm uses the binary representation of the exponent:
- If exponent is even: base^exponent = (base^(exponent/2))^2
- If exponent is odd: base^exponent = base × base^(exponent-1)

**Steps:**
1. Initialize result = 1
2. While exponent > 0:
   - If exponent is odd, multiply result by base
   - Square base and halve exponent
3. Return result mod modulus

---

## Complexity Analysis

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| **mod_pow** | O(log exponent) | O(1) |
| **mod_pow_recursive** | O(log exponent) | O(log exponent) |
| **mod_inverse** | O(log min(a, m)) | O(log min(a, m)) |

---

## Implementation Details

### Functions

1. **`mod_pow(base, exponent, modulus)`**
   - Compute (base^exponent) mod modulus using iterative binary exponentiation
   - Returns result
   - Time: O(log exponent), Space: O(1)

2. **`mod_pow_recursive(base, exponent, modulus)`**
   - Compute (base^exponent) mod modulus using recursive binary exponentiation
   - Returns result
   - Time: O(log exponent), Space: O(log exponent)

3. **`mod_inverse(a, m)`**
   - Compute modular multiplicative inverse using Extended Euclidean Algorithm
   - Returns inverse x where (a * x) mod m = 1, or None if it doesn't exist
   - Time: O(log min(a, m)), Space: O(log min(a, m))

---

## Usage

```python
from modular_exponentiation import mod_pow, mod_inverse

# Compute modular exponentiation
result = mod_pow(2, 10, 1000)
print(result)  # 24

# Compute modular inverse
inv = mod_inverse(3, 11)
print(inv)  # 4
print((3 * inv) % 11)  # 1 (verification)
```

---

## Applications

1. **Cryptography**: RSA encryption/decryption
2. **Diffie-Hellman Key Exchange**: Secure key generation
3. **Primality Testing**: Miller-Rabin test
4. **Discrete Logarithms**: Various cryptographic protocols
5. **Number Theory**: Various mathematical problems

---

## Important Notes

- **Modulus must be positive**: For modulus = 1, result is always 0
- **Exponent should be non-negative**: Negative exponents require modular inverse
- **Modular Inverse**: Only exists when GCD(a, m) = 1 (coprime)

---

## Testing

Run tests with:

```bash
python -m unittest modular_exponentiation_test.py
```

Or:

```bash
python modular_exponentiation_test.py
```

---

## References

- "Introduction to Algorithms" by CLRS (Chapter 31)
- "Algorithm Design Manual" by Steven Skiena
- "Number Theory" by Rosen

---

_Last Updated: December 2025_

