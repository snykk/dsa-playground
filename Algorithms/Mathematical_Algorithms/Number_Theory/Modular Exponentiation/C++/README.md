# Modular Exponentiation -- C++ Implementation

## Files

- `modular_exponentiation.cpp`: the functions below (no `main`; the test file includes it).
- `modular_exponentiation_test.cpp`: assert-based tests (basics, exponent 0, base 0, modulus 1, a 60-bit modulus, Fermat checks modulo 2^61 - 1 and 2^63 - 25, negative base, negative exponent, inverses of negative numbers, a signed extended-gcd identity check, exponent 2^63 - 1).

## API

- `long long modPow(long long base, long long exponent, long long modulus)`: result in `[0, modulus)`; a negative exponent gives the inverse power, or `-1` if `base` has no inverse.
- `long long modInverse(long long a, long long m)`: inverse in `[0, m)`, or `-1`.
- `ExtendedGCD extendedGcd(long long a, long long b)`: `{gcd, x, y}` with `a*x + b*y == gcd`, for any signs.

## C++-Specific Notes

- Products use `__int128` (GCC and Clang), so any modulus up to `LLONG_MAX` is safe. The old code overflowed above about 3.04e9.
- A negative base is reduced into `[0, modulus)` first, because `%` keeps the sign of the dividend.
- `LLONG_MIN` as an argument is not supported. There is no `mod_pow_recursive` in C++.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD modular_exponentiation_test.cpp -o me_test && ./me_test
```

## Key Takeaways

- A 128-bit intermediate product is the whole fix for large moduli.
- Normalize a negative base before the loop.
