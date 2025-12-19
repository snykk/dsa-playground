# Miller-Rabin Primality Test (C++)

**Miller-Rabin Primality Test** is a probabilistic algorithm for determining whether a number is prime. It is based on Fermat's little theorem and is widely used in practice.

---

## Overview

The Miller-Rabin test is one of the most practical primality tests. It's faster than deterministic tests for large numbers and is commonly used in cryptographic applications.

**Key Characteristics:**
- Probabilistic: Can give false positives (very rare with sufficient iterations)
- Efficient: O(k log³ n) time complexity
- Widely used: Standard in cryptography libraries

---

## Complexity Analysis

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| **millerRabin** | O(k log³ n) | O(1) |
| **isPrimeMillerRabin** | O(k log³ n) | O(1) |
| **millerRabinDeterministic** | O(log³ n) | O(1) |

Where k is the number of iterations (default: 5)

---

## Implementation Details

### Functions

1. **`millerRabin(n, k)`**
   - Miller-Rabin primality test
   - Returns true if n is probably prime, false if composite
   - Time: O(k log³ n), Space: O(1)

2. **`isPrimeMillerRabin(n, k)`**
   - Check if n is prime using Miller-Rabin test
   - Handles edge cases (n < 2, n == 2, even numbers)
   - Time: O(k log³ n), Space: O(1)

3. **`millerRabinDeterministic(n)`**
   - Deterministic version for n < 2^64
   - Uses specific bases known to work for all numbers < 2^64
   - Time: O(log³ n), Space: O(1)

---

## Usage

```cpp
#include "miller_rabin.cpp"
#include <iostream>

int main() {
    // Probabilistic test
    if (isPrimeMillerRabin(97, 10)) {
        std::cout << "97 is probably prime" << std::endl;
    }
    
    // Deterministic test (for n < 2^64)
    if (millerRabinDeterministic(101)) {
        std::cout << "101 is prime" << std::endl;
    }
    
    return 0;
}
```

---

## Testing

Run tests with:

```bash
# Compile
g++ -o miller_rabin_test miller_rabin_test.cpp

# Run
./miller_rabin_test
```

Or compile and run in one command:

```bash
g++ miller_rabin_test.cpp -o miller_rabin_test && ./miller_rabin_test
```

---

## References

- "Introduction to Algorithms" by CLRS (Chapter 31)
- "Algorithm Design Manual" by Steven Skiena
- "Number Theory" by Rosen

---

_Last Updated: December 2025_

