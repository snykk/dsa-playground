# Chinese Remainder Theorem -- C++ Implementation

## Files

- `chinese_remainder_theorem.cpp`: all functions (the test file includes it directly).
- `chinese_remainder_theorem_test.cpp`: assert-based tests (basic, pairwise, verify, larger moduli, negative remainders, residues near 2^31.5, an overflowing lcm, non-coprime systems and a signed extended-gcd identity check on 20,000 pseudo-random pairs).

## API

- `ExtendedGCD extendedGcd(long long a, long long b)`: `{gcd, x, y}` with `a*x + b*y == gcd`, for any signs.
- `long long modInverse(long long a, long long m)`: inverse in `[0, m)`, or `-1` if none exists.
- `long long modPow(long long base, long long exponent, long long modulus)`: `base^exponent mod modulus`.
- `long long chineseRemainderTheorem(const std::vector<long long>& remainders, const std::vector<long long>& moduli)`: smallest non-negative solution, or `-1` (length mismatch, non-positive modulus, no solution, or an lcm above `LLONG_MAX`). Empty input returns 0.
- `long long chineseRemainderTheoremPairwise(a1, m1, a2, m2)`: coprime moduli only; `-1` otherwise.
- `bool verifyCrtSolution(x, remainders, moduli)`: checks all congruences after reducing the remainders.

## C++-Specific Notes

- Products of two residues use `__int128` (`mulMod`), a GCC and Clang extension, so moduli up to `LLONG_MAX` are safe. The combined modulus must still fit in `long long`.
- `-1` is the error value, so a valid answer is never negative; remainders may be negative and are normalized.
- `extendedGcd` does not support `LLONG_MIN` (it has no positive counterpart).

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD chinese_remainder_theorem_test.cpp -o crt_test && ./crt_test
```

## Key Takeaways

- Use a 128-bit product for every `(a * b) % m` once `m` can exceed about 3.04e9.
- Merge incrementally so no intermediate value exceeds the lcm.
- The sentinel `-1` is safe only because answers are non-negative.
