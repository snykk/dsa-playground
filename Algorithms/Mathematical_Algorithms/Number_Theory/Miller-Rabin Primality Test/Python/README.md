# Miller-Rabin Primality Test (Python)

**Miller-Rabin Primality Test** is a probabilistic algorithm for determining whether a number is prime. It is based on Fermat's little theorem and is widely used in practice.

---

## Overview

The Miller-Rabin test is one of the most practical primality tests. It can quickly determine if a number is composite, and with high probability, if it is prime. For numbers less than 2^64, a deterministic version exists using specific bases.

**Key Characteristics:**
- Probabilistic: Can give false positives (very rare with enough iterations)
- Fast: O(k log³ n) time complexity
- Practical: Used in cryptography and number theory
- Deterministic variant exists for n < 2^64

---

## Algorithm

### Probabilistic Version

1. Write n-1 as d × 2^r (where d is odd)
2. For k iterations:
   - Pick random witness a (2 ≤ a ≤ n-2)
   - Compute x = a^d mod n
   - If x = 1 or x = n-1, continue to next iteration
   - For r-1 times: square x, if x = n-1, break
   - If loop completes without finding x = n-1, n is composite
3. If all iterations pass, n is probably prime

### Deterministic Version

For n < 2^64, use specific bases: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37]

---

## Complexity Analysis

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| **miller_rabin** | O(k log³ n) | O(1) |
| **is_prime_miller_rabin** | O(k log³ n) | O(1) |
| **miller_rabin_deterministic** | O(log³ n) | O(1) |

Where k is the number of iterations.

---

## Accuracy

- **Error Probability**: ≤ 4^(-k) for k iterations
- **k = 5**: Error probability ≤ 1/1024 ≈ 0.1%
- **k = 10**: Error probability ≤ 1/1,048,576 ≈ 0.0001%
- **Deterministic**: 100% accurate for n < 2^64

---

## Implementation Details

### Functions

1. **`miller_rabin(n, k=5)`**
   - Probabilistic Miller-Rabin test
   - Returns True if probably prime, False if composite
   - Time: O(k log³ n), Space: O(1)

2. **`is_prime_miller_rabin(n, k=5)`**
   - Wrapper function with edge case handling
   - Returns True if probably prime, False if composite
   - Time: O(k log³ n), Space: O(1)

3. **`miller_rabin_deterministic(n)`**
   - Deterministic version for n < 2^64
   - Returns True if prime, False if composite
   - Time: O(log³ n), Space: O(1)

---

## Usage

```python
from miller_rabin import is_prime_miller_rabin, miller_rabin_deterministic

# Probabilistic test
result = is_prime_miller_rabin(97, k=5)
print(result)  # True

# Deterministic test (for n < 2^64)
result = miller_rabin_deterministic(97)
print(result)  # True
```

---

## Applications

1. **Cryptography**: RSA key generation, prime number generation
2. **Number Theory**: Prime verification in mathematical problems
3. **Competitive Programming**: Fast primality testing
4. **Random Number Generation**: Generating large primes

---

## Important Notes

- **Probabilistic**: Small chance of false positives (very rare with k ≥ 5)
- **Carmichael Numbers**: Correctly identified as composite (unlike Fermat test)
- **Deterministic**: Only works for n < 2^64
- **Performance**: Much faster than trial division for large numbers

---

## Testing

Run tests with:

```bash
python -m unittest miller_rabin_test.py
```

Or:

```bash
python miller_rabin_test.py
```

---

## References

- "Introduction to Algorithms" by CLRS
- "Algorithm Design Manual" by Steven Skiena
- "Number Theory" by Rosen
- Miller, G. L. (1976). "Riemann's Hypothesis and Tests for Primality"

---

_Last Updated: December 2025_

