# Combinatorics -- C++ Implementation

Binomial coefficients by Pascal's triangle, by the multiplicative formula and modulo a prime from factorial tables, then Catalan numbers, stars and bars and derangements, as `uint64_t` counts that throw instead of overflowing. See the [topic README](../README.md) for the idea, the traces and the table of 64-bit limits.

## Files

| File | Contents |
|------|----------|
| `combinatorics.cpp` | `pascalTriangle`, `binomialPascal`, `binomial`, `mulMod`, `powMod`, class `ModBinomial`, `catalanNumbers`, `catalan`, `starsAndBars`, `starsAndBarsPositive`, `derangementNumbers` and a demo `main()` (compiled out with `-DIS_TEST_BUILD`) |
| `combinatorics_test.cpp` | assert-based tests: the values the Python code computes (30 binomials, 6 overflows, rows 10 and 67, 9 modular tables with 26 queries and their product counts, the tables of `ModBinomial(6, 13)`, `C_0` to `C_36`, `D(0)` to `D(20)`, 11 stars-and-bars pairs); binomials against a count of subsets, Catalan numbers against balanced parentheses, derangements against `std::next_permutation`, stars and bars against enumeration; the three methods against each other up to row 67; the tables against Pascal's triangle modulo every prime below 200 and three 64-bit primes; every modulus up to 159; the work counter; the 64-bit limits; the edge cases and errors |

## API

| Function | Description |
|----------|-------------|
| `std::vector<std::vector<uint64_t>> pascalTriangle(int n)` | rows 0..n; `std::invalid_argument` for `n < 0`, `std::overflow_error` from `n = 68` |
| `uint64_t binomialPascal(int64_t n, int64_t k)` | `C(n, k)` on one row of `min(k, n - k) + 1` cells; 0 for `k < 0` or `k > n`; `std::overflow_error` if the answer does not fit |
| `uint64_t binomial(int64_t n, int64_t k)` | `C(n, k)` by the multiplicative formula; 0 for `k < 0` or `k > n`; `std::overflow_error` if the answer does not fit |
| `uint64_t mulMod(uint64_t a, uint64_t b, uint64_t m)` | `a * b mod m`, the product in `unsigned __int128` |
| `uint64_t powMod(uint64_t base, uint64_t exp, uint64_t m, long long* count = nullptr)` | `base^exp mod m` by square and multiply; adds its `mulMod` calls to `*count` |
| `ModBinomial(int nMax, uint64_t p)` | builds `fact()` and `invFact()`; `std::invalid_argument` for `nMax < 0`, `p < 2`, `nMax >= p` or a `p` the power `p - 2` does not invert |
| `uint64_t ModBinomial::binomial(int64_t n, int64_t k) const` | `C(n, k) mod p`; 0 for `k < 0` or `k > n`; `std::out_of_range` for `n > nMax()` |
| `nMax()`, `modulus()`, `fact()`, `invFact()`, `multiplications()` | the size, `p`, the two tables and the products the build made |
| `std::vector<uint64_t> catalanNumbers(int n)` | `C_0..C_n` by the recurrence; `std::overflow_error` from `n = 37` |
| `uint64_t catalan(int64_t n)` | `C(2n, n) / (n + 1)`; `std::overflow_error` from `n = 34` |
| `uint64_t starsAndBars(int64_t n, int64_t k)`, `starsAndBarsPositive(...)` | `C(n + k - 1, k - 1)` and `C(n - 1, k - 1)`; 1 for `n = k = 0`; `std::invalid_argument` for a negative argument |
| `std::vector<uint64_t> derangementNumbers(int n)` | `D(0)..D(n)`; `std::overflow_error` from `n = 21` |

## C++-Specific Notes

- **Checked arithmetic.** Every sum and product of a count is checked before it is made (`a > UINT64_MAX - b`, `a > UINT64_MAX / b`), so a count that does not fit throws `std::overflow_error`, whose message names it: `C(68, 34) does not fit in 64 bits`. The tests check the last value that fits and the first that throws, for each function.
- **Signed arguments.** `n` and `k` are `int64_t`, so `k < 0` gives 0 as in Python. The results are `uint64_t`: rows up to 67 of Pascal's triangle fit, against 66 in `int64_t`.
- **Divide first.** `binomial` takes `g = std::gcd(result, i)` (C++17, `<numeric>`) and computes `(result / g) * ((n - k + i) / (i / g))`, which is the next value exactly; `result * (n - k + i) / i` would overflow a step early.
- **No huge allocations.** `catalanNumbers` and `derangementNumbers` grow their vectors one value at a time, so a large `n` throws at the first overflow instead of allocating; `binomialPascal` throws at once when `min(k, n - k) >= 34`, before allocating its row.
- **128-bit products.** `mulMod` casts to `unsigned __int128`, a GCC and Clang extension, so the modulus can be any 64-bit prime; the tests use `2^61 - 1` and `2^64 - 59`. The sanitizer build in CI (`-fsanitize=address,undefined`) runs the same tests.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD combinatorics_test.cpp -o test && ./test
g++ -std=c++17 -O2 combinatorics.cpp -o demo && ./demo
```

## Key Takeaways

- Check a sum or a product before making it; never return a wrapped count.
- Divide the gcd out before multiplying, and the multiplicative formula overflows only with its answer.
- One `powMod` per table: `invFact` fills backwards with one `mulMod` per entry.
