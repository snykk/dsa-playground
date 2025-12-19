# Euclidean Algorithm

A comprehensive implementation of the **Euclidean Algorithm** for computing Greatest Common Divisor (GCD) and Least Common Multiple (LCM).

---

## Overview

The Euclidean algorithm is one of the oldest algorithms still in use today. It efficiently computes the GCD of two integers and can be extended to solve linear Diophantine equations.

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

## Implementations

This folder contains implementations in three languages:

- **Python** (`Python/`) - Recursive and iterative implementations
- **C++** (`C++/`) - Using long long for large numbers
- **Go** (`Go/`) - Using int64 for large numbers

Each implementation includes:
- Complete source code
- Comprehensive test suite
- Detailed README with usage examples

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

## Related Algorithms

- **Modular Arithmetic**: Uses GCD for modular inverses
- **Chinese Remainder Theorem**: Uses Extended GCD
- **RSA Algorithm**: Uses Extended GCD for key generation

---

## References

- "Introduction to Algorithms" by CLRS (Chapter 31)
- "Algorithm Design Manual" by Steven Skiena
- "Number Theory" by Rosen

---

_Last Updated: December 2025_

