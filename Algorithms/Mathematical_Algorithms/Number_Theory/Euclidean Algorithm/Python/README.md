# Euclidean Algorithm (Python)

**Euclidean Algorithm** is an efficient method for computing the greatest common divisor (GCD) of two integers. It can also be used to compute the least common multiple (LCM).

---

## Overview

The Euclidean algorithm is one of the oldest algorithms still in use today. It is based on the principle that the GCD of two numbers also divides their difference.

**Key Characteristics:**
- Efficient: O(log min(a, b)) time complexity
- Simple: Easy to understand and implement
- Versatile: Can compute GCD, LCM, and solve linear Diophantine equations

---

## Algorithm

### GCD Computation

The algorithm is based on the property:
```
GCD(a, b) = GCD(b, a mod b)
```

**Steps:**
1. If b = 0, return a
2. Otherwise, compute GCD(b, a mod b)

### LCM Computation

LCM can be computed using GCD:
```
LCM(a, b) = |a × b| / GCD(a, b)
```

### Extended Euclidean Algorithm

Finds integers x and y such that:
```
ax + by = GCD(a, b)
```

This is known as Bézout's identity.

---

## Complexity Analysis

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| **GCD** | O(log min(a, b)) | O(1) iterative, O(log min(a, b)) recursive |
| **LCM** | O(log min(a, b)) | O(1) |
| **Extended GCD** | O(log min(a, b)) | O(log min(a, b)) |

---

## Implementation Details

### Functions

1. **`gcd(a, b)`**
   - Compute GCD using recursive Euclidean algorithm
   - Returns GCD of a and b
   - Time: O(log min(a, b)), Space: O(log min(a, b))

2. **`gcd_iterative(a, b)`**
   - Compute GCD using iterative Euclidean algorithm
   - Returns GCD of a and b
   - Time: O(log min(a, b)), Space: O(1)

3. **`lcm(a, b)`**
   - Compute LCM using GCD
   - Returns LCM of a and b
   - Time: O(log min(a, b)), Space: O(1)

4. **`extended_gcd(a, b)`**
   - Extended Euclidean algorithm
   - Returns tuple (gcd, x, y) where ax + by = gcd
   - Time: O(log min(a, b)), Space: O(log min(a, b))

---

## Usage

```python
from euclidean_algorithm import gcd, lcm, extended_gcd

# Compute GCD
result = gcd(48, 18)
print(result)  # 6

# Compute LCM
result = lcm(12, 18)
print(result)  # 36

# Extended GCD
gcd_val, x, y = extended_gcd(48, 18)
print(f"GCD = {gcd_val}, x = {x}, y = {y}")
# GCD = 6, x = -1, y = 3
# Verification: 48*(-1) + 18*3 = 6
```

---

## Applications

1. **Fraction Simplification**: Reduce fractions to lowest terms
2. **Modular Inverses**: Find modular multiplicative inverse
3. **Linear Diophantine Equations**: Solve ax + by = c
4. **Cryptography**: RSA algorithm, modular arithmetic
5. **Number Theory**: Various number theory problems

---

## Properties

- **Commutative**: GCD(a, b) = GCD(b, a)
- **Associative**: GCD(GCD(a, b), c) = GCD(a, GCD(b, c))
- **Distributive**: GCD(ka, kb) = k × GCD(a, b) for k > 0
- **LCM Relationship**: LCM(a, b) × GCD(a, b) = |a × b|

---

## Testing

Run tests with:

```bash
python -m unittest euclidean_algorithm_test.py
```

Or:

```bash
python euclidean_algorithm_test.py
```

---

## References

- "Introduction to Algorithms" by CLRS (Chapter 31)
- "Algorithm Design Manual" by Steven Skiena
- "Number Theory" by Rosen

---

_Last Updated: December 2025_

