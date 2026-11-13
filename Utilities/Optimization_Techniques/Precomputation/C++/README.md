# Precomputation -- C++ Implementation

Global tables and builder functions for factorials, a prime sieve, smallest prime factors, prefix sums (1D and 2D), a sparse table, LCA with binary lifting and powers of two.

For the concept, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `precomputation.cpp` | the functions below and a demo `main` (disabled when `IS_TEST_BUILD` is defined) |
| `precomputation_test.cpp` | 8 tests: factorials, sieve (pi(10000) = 1229), SPF and factorization, prefix sums 1D and 2D, sparse table against brute force, LCA, `pow2` up to 2^63 |

## API

- `precomputeFactorials()`, `fact[]`, `invFact[]`, `nCr(n, r)`; `power(base, exp, mod)`.
- `sieve()`: fills `primes` and `isPrime[]` up to `MAXN`.
- `computeSPF()`, `spf[]`, `factorize(n)`: returns `(prime, count)` pairs.
- `buildPrefixSum(arr)`, `rangeSum(l, r)`; `buildPrefix2D(grid)`, `rectSum(r1, c1, r2, c2)`.
- `buildSparseTable(arr)`, `rangeMin(l, r)`.
- `adj[]`, `dfs(root, -1, 0)`, `lca(u, v)`.
- `precomputePow2()`, `pow2[]` (unsigned 64-bit).

## C++-Specific Notes

- Everything is global state sized by `MAXN = 2e5 + 5`; call each builder once before use.
- The sparse table is for `min` only and uses `int sparse[MAXN][20]` (about 16 MB).
- `dfs` is recursive, so a path-shaped tree of 2e5 nodes can exhaust the stack on some systems.
- `pow2` is `unsigned long long`: 2^63 does not fit in a signed `long long`.
- The file uses explicit standard headers, so it builds with GCC and Clang.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD precomputation_test.cpp -o precomputation_test
./precomputation_test
```

## Key Takeaways

1. Global tables are fast and simple but must be built exactly once and sized for the input.
2. Use unsigned types when the value can reach 2^63.
3. Keep `main` out of test builds with a macro guard.
