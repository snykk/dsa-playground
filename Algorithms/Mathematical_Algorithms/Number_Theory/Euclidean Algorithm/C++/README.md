# Euclidean Algorithm (C++)

**Euclidean Algorithm** is an efficient method for computing the greatest common divisor (GCD) of two integers. It can also be used to compute the least common multiple (LCM).

---

## Overview

The Euclidean algorithm is one of the oldest algorithms still in use today. It is based on the principle that the GCD of two numbers also divides their difference.

**Key Characteristics:**
- Efficient: O(log min(a, b)) time complexity
- Simple: Easy to understand and implement
- Versatile: Can compute GCD, LCM, and solve linear Diophantine equations

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

2. **`gcdIterative(a, b)`**
   - Compute GCD using iterative Euclidean algorithm
   - Returns GCD of a and b
   - Time: O(log min(a, b)), Space: O(1)

3. **`lcm(a, b)`**
   - Compute LCM using GCD
   - Returns LCM of a and b
   - Time: O(log min(a, b)), Space: O(1)

4. **`extendedGcd(a, b)`**
   - Extended Euclidean algorithm
   - Returns ExtendedGCD struct with gcd, x, y where ax + by = gcd
   - Time: O(log min(a, b)), Space: O(log min(a, b))

---

## Usage

```cpp
#include "euclidean_algorithm.cpp"

// Compute GCD
long long result = gcd(48, 18);
// result = 6

// Compute LCM
result = lcm(12, 18);
// result = 36

// Extended GCD
ExtendedGCD egcd = extendedGcd(48, 18);
// egcd.gcd = 6, egcd.x = -1, egcd.y = 3
// Verification: 48*(-1) + 18*3 = 6
```

---

## Testing

Run tests with:

```bash
# Compile
g++ -o euclidean_algorithm_test euclidean_algorithm_test.cpp

# Run
./euclidean_algorithm_test
```

Or compile and run in one command:

```bash
g++ euclidean_algorithm_test.cpp -o euclidean_algorithm_test && ./euclidean_algorithm_test
```

---

## References

- "Introduction to Algorithms" by CLRS (Chapter 31)
- "Algorithm Design Manual" by Steven Skiena
- "Number Theory" by Rosen

---

_Last Updated: December 2025_
