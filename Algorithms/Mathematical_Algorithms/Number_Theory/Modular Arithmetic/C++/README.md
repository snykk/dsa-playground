# Modular Arithmetic -- C++ Implementation

## Files

- `modular_arithmetic.cpp`: all functions (no `main`; the test file includes it).
- `modular_arithmetic_test.cpp`: assert-based tests (basics, ring properties, negative operands, a signed extended-gcd identity check on 20,000 pairs, inverses of negative numbers, negative exponents, moduli of 10^18 and 2^63 - 25).

## API

- `long long modAdd(a, b, m)`, `modSubtract(a, b, m)`, `modMultiply(a, b, m)`: results in `[0, m)`.
- `long long modInverse(a, m)`: inverse in `[0, m)`, or `-1`.
- `long long modDivide(a, b, m)`: `a * b^-1 mod m`, or `-1` if `b` has no inverse.
- `long long modPower(base, exponent, m)`: binary exponentiation; a negative exponent gives the inverse power, or `-1`.
- `ExtendedGCD extendedGcd(a, b)`: `{gcd, x, y}` with `a*x + b*y == gcd`, for any signs.

## C++-Specific Notes

- `%` keeps the sign of the dividend in C++, so every function normalizes with `floorMod` first. Results are always non-negative, which makes the `-1` sentinel unambiguous.
- Products use `__int128` (GCC and Clang), and sums compare against `m - y`, so any modulus up to `LLONG_MAX` is safe. The old code overflowed above about 3.04e9.
- `LLONG_MIN` as an argument is not supported.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD modular_arithmetic_test.cpp -o ma_test && ./ma_test
```

## Key Takeaways

- Normalize negative operands before anything else.
- Use a 128-bit product for `(a * b) % m` with a 64-bit modulus.
