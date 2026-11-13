# Miller-Rabin Primality Test -- C++ Implementation

## Files

- `miller_rabin.cpp`: all functions (no `main`; the test file includes it).
- `miller_rabin_test.cpp`: assert-based tests (small primes and composites, edge cases, primes and composites near 2^32, 2^61 and 2^63, 2^64 - 59, strong pseudoprimes, Carmichael numbers, negative input, `modPow` with a 60-bit modulus, agreement with trial division for 0..5000).

## API

- `bool millerRabin(long long n, int k = 5)`: `k` random witnesses from `[2, n - 2]`; true means "probably prime".
- `bool isPrimeMillerRabin(long long n, int k = 5)`: handles `n < 2` and even `n`, then calls `millerRabin`.
- `bool millerRabinDeterministic(long long n)`: twelve fixed witnesses; exact for every `long long` (negative `n` is not prime).
- `bool millerRabinDeterministicU64(unsigned long long n)`: the same for the full range up to 2^64 - 1.
- `long long modPow(long long base, long long exponent, long long modulus)`: `base^exponent mod modulus` with 128-bit products.

## C++-Specific Notes

- Products use `unsigned __int128` (a GCC and Clang extension), so every 64-bit modulus is safe. The old code multiplied in `long long` and returned false for primes above about 3.04e9.
- Witnesses come from `std::mt19937_64` seeded with `std::random_device`, once per thread. The old code used unseeded `rand()`.
- The `long long` functions accept `n` up to 2^63 - 1; use the `U64` variant above that.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD miller_rabin_test.cpp -o mr_test && ./mr_test
```

## Key Takeaways

- Overflow-free modular multiplication is the whole difference between a correct and an incorrect Miller-Rabin above 2^32.
- Twelve fixed bases make the test deterministic for 64-bit inputs.
