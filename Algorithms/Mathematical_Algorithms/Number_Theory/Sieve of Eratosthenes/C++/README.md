# Sieve of Eratosthenes (C++)

**Sieve of Eratosthenes** is an efficient algorithm for finding all prime numbers up to a given limit n.

---

## Overview

The Sieve of Eratosthenes is one of the most efficient ways to find all primes smaller than n when n is smaller than about 10 million. It works by iteratively marking the multiples of each prime number starting from 2.

**Key Characteristics:**
- Efficient: O(n log log n) time complexity
- Simple: Easy to understand and implement
- Space: O(n) for boolean array

---

## Complexity Analysis

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| **sieveOfEratosthenes** | O(n log log n) | O(n) |
| **sieveBoolean** | O(n log log n) | O(n) |
| **isPrimeSieve** | O(1) | O(1) |

---

## Implementation Details

### Functions

1. **`sieveOfEratosthenes(n)`**
   - Find all prime numbers up to n
   - Returns vector of primes
   - Time: O(n log log n), Space: O(n)

2. **`sieveBoolean(n)`**
   - Return boolean array indicating primes
   - Returns vector where isPrime[i] = true if i is prime
   - Time: O(n log log n), Space: O(n)

3. **`isPrimeSieve(n, sieve)`**
   - Check if n is prime using precomputed sieve
   - Returns true if prime, false otherwise
   - Time: O(1), Space: O(1)

---

## Usage

```cpp
#include "sieve_of_eratosthenes.cpp"
#include <iostream>

int main() {
    // Find all primes up to 100
    std::vector<int> primes = sieveOfEratosthenes(100);
    
    // Use boolean array for O(1) prime checking
    std::vector<bool> sieve = sieveBoolean(1000);
    if (sieve[17]) {
        std::cout << "17 is prime" << std::endl;
    }
    
    return 0;
}
```

---

## Testing

Run tests with:

```bash
# Compile
g++ -o sieve_of_eratosthenes_test sieve_of_eratosthenes_test.cpp

# Run
./sieve_of_eratosthenes_test
```

Or compile and run in one command:

```bash
g++ sieve_of_eratosthenes_test.cpp -o sieve_of_eratosthenes_test && ./sieve_of_eratosthenes_test
```

---

## References

- "Introduction to Algorithms" by CLRS
- "Algorithm Design Manual" by Steven Skiena
- "Number Theory" by Rosen

---

_Last Updated: December 2025_

