# Euler's Totient -- C++ Implementation

`phi(n)` by trial division for any `n` up to 2^64 - 1, the linear sieve, and the modular inverse from Euler's theorem with 128-bit products. See the [topic README](../README.md) for the idea, a trace and the 64-bit limits.

## Files

| File | Contents |
|------|----------|
| `eulers_totient.cpp` | `primeFactors`, `phi`, `TotientSieve`, `linearSieve`, `mulMod`, `powMod`, `modInverseEuler` and a demo `main()` (compiled out with `-DIS_TEST_BUILD`) |
| `eulers_totient_test.cpp` | assert-based tests: the values the Python code computes (31 values of `phi`, 8 factorizations, 11 inverses, the tables of `linearSieve(30)`); `phi` against a count of gcds up to 3000; primes, prime powers up to 2^64, 1 and 0; multiplicativity and the divisor sum, also at 64 bits; the sieve against `phi` and one crossing per composite; Euler's theorem; the inverse against an extended Euclid on `__int128`; the errors |

## API

| Function | Description |
|----------|-------------|
| `std::vector<Factor> primeFactors(uint64_t n)` | `Factor` is `std::pair<uint64_t, int>`, the prime and its exponent, primes increasing; empty for 1; throws `std::invalid_argument` for 0; O(sqrt n) |
| `uint64_t phi(uint64_t n)` | Euler's totient; throws `std::invalid_argument` for 0; O(sqrt n) |
| `TotientSieve linearSieve(int n)` | `phi`, `spf`, `primes` (`std::vector<int>`) and `crossings` (`long long`) for `0..n`; throws `std::invalid_argument` for `n < 0`; O(n) |
| `uint64_t mulMod(uint64_t a, uint64_t b, uint64_t m)` | `a * b mod m` for `m >= 1`, the product in `unsigned __int128` |
| `uint64_t powMod(uint64_t base, uint64_t exp, uint64_t m)` | `base^exp mod m` for `m >= 1` by square and multiply; `1 % m` for `exp = 0` |
| `uint64_t modInverseEuler(uint64_t a, uint64_t n)` | `a^(phi(n) - 1) mod n`, 0 for `n = 1`; throws `std::invalid_argument` for `n = 0` or `gcd(a, n) != 1` |

## C++-Specific Notes

- **The largest n is 2^64 - 1.** The trial-division loop tests `p <= n / p`: `p * p` in `uint64_t` wraps to 0 at `p = 2^32` and would keep the loop going. A prime near 2^64 still needs about 2^32 candidates, about 8 s at `-O2` on the machine the timings were taken on.
- **128-bit products.** `mulMod` casts to `unsigned __int128`, a GCC and Clang extension, so residues up to 2^64 - 2 multiply exactly. The tests check `(2^64 - 2)^2 mod (2^64 - 1) = 1` and the inverse of 2 modulo 2^64 - 1, which is 2^63.
- **The sieve in `int`.** `phi[i] <= i <= n`, so the tables fit in `int`; the bound is tested as `p > n / i` because `i * p` reaches `2n`, past `INT_MAX` once `n` is above about 2^30.
- **Unsigned input.** A negative argument cannot be expressed; a negative `int` passed to `phi` would be converted to a huge unsigned value, so check the sign before calling.
- `std::gcd` (C++17, `<numeric>`) checks that an inverse exists. The sanitizer build in CI (`-fsanitize=address,undefined`) runs the same tests.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD eulers_totient_test.cpp -o test && ./test
g++ -std=c++17 -O2 eulers_totient.cpp -o demo && ./demo
```

## Key Takeaways

- Write `p * p <= n` as `p <= n / p` at 64 bits.
- `phi(n) <= n`, so `result -= result / p` never overflows.
- Multiply residues in 128 bits when the modulus can exceed 2^32.
