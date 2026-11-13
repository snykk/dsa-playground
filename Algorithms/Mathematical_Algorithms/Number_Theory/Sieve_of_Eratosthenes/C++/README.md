# Sieve of Eratosthenes -- C++ Implementation

## Files

- `sieve_of_eratosthenes.cpp`: the three functions below (no `main`; the test file includes it).
- `sieve_of_eratosthenes_test.cpp`: assert-based tests (small and medium limits, counts, empty cases, the boolean sieve, lookups, negative and out-of-range lookups, negative limits, agreement with trial division up to 20,000, prime counts, and a sieve up to `INT_MAX`).

## API

- `std::vector<int> sieveOfEratosthenes(int n)`: the primes up to and including `n`; empty for `n < 2`.
- `std::vector<bool> sieveBoolean(int n)`: `n + 1` flags, true at the primes; empty for `n < 0`.
- `bool isPrimeSieve(int n, const std::vector<bool>& sieve)`: `sieve[n]` for `0 <= n < sieve.size()`, otherwise false.

## C++-Specific Notes

- `std::vector<bool>` stores one bit per number, so a sieve up to `INT_MAX` needs 256 MB.
- The loop counters `i` and `j` are `long long`: with `int`, `i * i` and `j += i` overflow near `INT_MAX`.
- The `INT_MAX` test takes about 17 seconds at `-O2` and about 256 MB. Compile with `-DSKIP_SLOW_TESTS` to leave it out, for example under sanitizers.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD sieve_of_eratosthenes_test.cpp -o sieve_test && ./sieve_test
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD -DSKIP_SLOW_TESTS sieve_of_eratosthenes_test.cpp -o sieve_test_fast && ./sieve_test_fast
```

## Key Takeaways

- Use 64-bit counters for `i * i` and `j += i`.
- Check negative indexes before reading the vector.
