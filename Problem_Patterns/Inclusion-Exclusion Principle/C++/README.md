# Inclusion-Exclusion Principle (C++)

Count elements in the union of multiple sets by alternately adding and subtracting intersection sizes, avoiding double-counting.

## Files

| File | Description |
|------|-------------|
| `inclusion_exclusion.cpp` | Main implementation with divisibility counting and set union |
| `inclusion_exclusion_test.cpp` | Test cases for GCD and divisibility counting |

## How to Run

```bash
# Run the demo
g++ -std=c++17 -o ie inclusion_exclusion.cpp
./ie

# Run tests
g++ -std=c++17 -DTESTING -o test inclusion_exclusion_test.cpp
./test
```

## Key Functions

| Function | Description | Time Complexity |
|----------|-------------|-----------------|
| `gcd` | Computes greatest common divisor of two integers | O(log min(a,b)) |
| `countDivisible` | Counts integers in [1..n] divisible by at least one divisor using inclusion-exclusion over bitmasks | O(2^k) |
| `countUnionSets` | Counts the size of the union of k sets via inclusion-exclusion with set intersection | O(2^k * m) |

## Complexity

| Aspect | Complexity |
|--------|-----------|
| Time | O(2^k) where k is the number of divisors/sets |
| Space | O(m) for intermediate set intersections |

## Notes

- Both functions enumerate all non-empty subsets using bitmask iteration (1 to 2^k - 1).
- Odd-sized subsets are added; even-sized subsets are subtracted.
- `countDivisible` computes LCM on-the-fly to handle divisibility by multiple values.
- Practical only for small k (typically k <= 20) due to exponential enumeration.

---

_Last Updated: April 2026_
