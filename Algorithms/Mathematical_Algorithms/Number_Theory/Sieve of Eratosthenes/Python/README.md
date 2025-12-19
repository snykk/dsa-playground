# Sieve of Eratosthenes (Python)

**Sieve of Eratosthenes** is an efficient algorithm for finding all prime numbers up to a given limit n.

---

## Overview

The Sieve of Eratosthenes is one of the most efficient ways to find all primes smaller than n when n is smaller than about 10 million. It works by iteratively marking the multiples of each prime number starting from 2.

**Key Characteristics:**
- Efficient: O(n log log n) time complexity
- Simple: Easy to understand and implement
- Space: O(n) for boolean array

---

## Algorithm

**Steps:**
1. Create a boolean array of size n+1, initialize all as True
2. Mark 0 and 1 as False (not prime)
3. Start from 2, for each prime number:
   - Mark all its multiples as composite (False)
4. All remaining True values are primes

**Optimization:**
- Only check up to √n (if i*i > n, all multiples are already marked)
- Start marking from i*i (smaller multiples already marked by smaller primes)

---

## Complexity Analysis

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| **sieve_of_eratosthenes** | O(n log log n) | O(n) |
| **sieve_boolean** | O(n log log n) | O(n) |
| **is_prime_sieve** | O(1) | O(1) |

---

## Implementation Details

### Functions

1. **`sieve_of_eratosthenes(n)`**
   - Find all prime numbers up to n
   - Returns list of primes
   - Time: O(n log log n), Space: O(n)

2. **`sieve_boolean(n)`**
   - Return boolean array indicating primes
   - Returns list where is_prime[i] = True if i is prime
   - Time: O(n log log n), Space: O(n)

3. **`is_prime_sieve(n, sieve)`**
   - Check if n is prime using precomputed sieve
   - Returns True if prime, False otherwise
   - Time: O(1), Space: O(1)

---

## Usage

```python
from sieve_of_eratosthenes import sieve_of_eratosthenes, sieve_boolean

# Find all primes up to 100
primes = sieve_of_eratosthenes(100)
print(primes)  # [2, 3, 5, 7, 11, ...]

# Use boolean array for O(1) prime checking
sieve = sieve_boolean(1000)
if sieve[17]:
    print("17 is prime")
```

---

## Applications

1. **Prime Generation**: Generate list of primes
2. **Prime Factorization**: Precompute primes for factorization
3. **Number Theory**: Various mathematical problems
4. **Cryptography**: RSA key generation
5. **Competitive Programming**: Fast prime checking

---

## Important Notes

- **Efficient for n < 10^7**: For larger n, use segmented sieve
- **Memory Usage**: Requires O(n) space
- **Precomputation**: Once computed, O(1) prime checking

---

## Testing

Run tests with:

```bash
python -m unittest sieve_of_eratosthenes_test.py
```

Or:

```bash
python sieve_of_eratosthenes_test.py
```

---

## References

- "Introduction to Algorithms" by CLRS
- "Algorithm Design Manual" by Steven Skiena
- "Number Theory" by Rosen

---

_Last Updated: December 2025_

