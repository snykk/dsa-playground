# Euclidean Algorithm -- C++ Implementation

## Files

- `euclidean_algorithm.cpp`: the functions below (no `main`; the test file includes it).
- `euclidean_algorithm_test.cpp`: assert-based tests (gcd, lcm, extended gcd, negative inputs, 20,000 pseudo-random signed pairs checking `a*x + b*y == gcd`, an lcm whose plain product overflows, gcd above 2^53).

## API

- `long long gcd(long long a, long long b)`: recursive Euclid on absolute values.
- `long long gcdIterative(long long a, long long b)`: loop version.
- `long long lcm(long long a, long long b)`: `|a| / gcd * |b|`; 0 if either is 0.
- `ExtendedGCD extendedGcd(long long a, long long b)`: `{gcd, x, y}` with `a*x + b*y == gcd`, for any signs.

## C++-Specific Notes

- `lcm` divides before it multiplies, so `lcm(4000000000, 4000000000)` is exact. The result itself must fit in `long long`; there is no overflow check.
- `LLONG_MIN` is not supported (`std::abs(LLONG_MIN)` is undefined).
- `std::gcd` and `std::lcm` in `<numeric>` (C++17) are the standard equivalents.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD euclidean_algorithm_test.cpp -o euclid_test && ./euclid_test
```

## Key Takeaways

- Always divide by the gcd before multiplying in an lcm.
- Fix the signs of `x` and `y` when the inputs are negative.
