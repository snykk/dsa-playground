# Modular Arithmetic Tricks -- C++ Implementation

Modular operations on `long long`, fast exponentiation, inverses, factorial tables, Lucas' theorem and 128-bit multiplication helpers.

For the concept, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `modular_tricks.cpp` | the functions below and a demo `main` (disabled when `IS_TEST_BUILD` is defined) |
| `modular_tricks_test.cpp` | 9 tests: basics, power (including modulus 1), large-modulus products, inverses, factorials, Lucas against Pascal's triangle |

## API

- `MOD = 1e9 + 7`; `mod`, `add`, `sub`, `mul` (default modulus `MOD`); `mul` uses a 128-bit product.
- `power(base, exp, m)`: returns `1 % m`.
- `modInverse(a, m)` (Fermat, prime `m`), `modInverseExtGCD(a, m)` (-1 when none), `extGCD(a, b, x, y)`, `div_mod(a, b, m)`.
- `precompute()`, `fact[]`, `invFact[]`, `nCr(n, r)`, `nPr(n, r)`: tables for `MOD`, size `MAXN = 2e5 + 5`.
- `lucasNCr(n, r, p)` and `smallNCrModP(n, r, p)`: prime `p`, no tables needed.
- `safeMod`, `mulmod` (128-bit), `mulmodSlow` (shift-and-add).

## C++-Specific Notes

- `__int128` (GCC and Clang) makes `mul` exact for moduli below 2^62; `mod` needs `2 * m` to fit in `long long`.
- Call `precompute()` once before `nCr` or `nPr`; the global tables are zeros until then and are built for `MOD` only.
- `lucasNCr` computes each small binomial in O(p), so it suits primes up to about 10^6. It previously used the `MOD` tables and gave wrong answers.
- There is no CRT or matrix power in the C++ version.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD modular_tricks_test.cpp -o modular_tricks_test
./modular_tricks_test
```

## Key Takeaways

1. A 64-bit modular product needs a 128-bit intermediate once the modulus passes about 3e9.
2. Tables built for one modulus are wrong for another.
3. Guard `main` so the file can be included in tests.
