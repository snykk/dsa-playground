# Combinatorics -- Go Implementation

Binomial coefficients by Pascal's triangle, by the multiplicative formula and modulo a prime from factorial tables, then Catalan numbers, stars and bars and derangements, as `uint64` counts that return an error instead of overflowing. See the [topic README](../README.md) for the idea, the traces and the table of 64-bit limits.

## Files

| File | Contents |
|------|----------|
| `main.go` | `PascalTriangle`, `BinomialPascal`, `Binomial`, `MulMod`, `PowMod`, `ModBinomial` with `NewModBinomial` and `Binomial`, `CatalanNumbers`, `Catalan`, `StarsAndBars`, `StarsAndBarsPositive`, `DerangementNumbers`, the errors `ErrNegative`, `ErrOverflow`, `ErrNotPrime`, `ErrNotBelowP` and `ErrPastTable`, and a demo in `main` |
| `main_test.go` | the values the Python code computes (30 binomials, 6 overflows, rows 10 and 67, 9 modular tables with 26 queries and their product counts, the tables of `NewModBinomial(6, 13)`, `C_0` to `C_36`, `D(0)` to `D(20)`, 11 stars-and-bars pairs); binomials against a count of subsets and `math/big`'s `Binomial`, Catalan numbers against balanced parentheses, derangements and stars and bars against enumeration; the three methods against each other up to row 67; the tables against Pascal's triangle modulo every prime below 200 and three 64-bit primes; every modulus up to 159; the work counter; the 64-bit limits; the edge cases and errors |
| `go.mod` | module file (Go 1.21) |

## API

| Function | Description |
|----------|-------------|
| `PascalTriangle(n int) ([][]uint64, error)` | rows 0..n; `ErrNegative` for `n < 0`, `ErrOverflow` from `n = 68` |
| `BinomialPascal(n, k int64) (uint64, error)` | `C(n, k)` on one row of `min(k, n-k) + 1` cells; 0 for `k < 0` or `k > n`; `ErrOverflow` if the answer does not fit |
| `Binomial(n, k int64) (uint64, error)` | `C(n, k)` by the multiplicative formula; 0 for `k < 0` or `k > n`; `ErrOverflow` if the answer does not fit |
| `MulMod(a, b, m uint64) uint64` | `a * b mod m` from `bits.Mul64` and `bits.Rem64` |
| `PowMod(base, exp, m uint64) (uint64, int)` | `base^exp mod m` by square and multiply, and the `MulMod` calls it made |
| `NewModBinomial(nMax int, p uint64) (*ModBinomial, error)` | the tables `Fact` and `InvFact`, with `NMax`, `P` and `Multiplications`; `ErrNegative`, `ErrNotPrime` (`p < 2`, or a `p` the power `p - 2` does not invert) or `ErrNotBelowP` (`nMax >= p`) |
| `(b *ModBinomial) Binomial(n, k int64) (uint64, error)` | `C(n, k) mod P`; 0 for `k < 0` or `k > n`; `ErrPastTable` for `n > NMax` |
| `CatalanNumbers(n int) ([]uint64, error)` | `C_0..C_n` by the recurrence; `ErrOverflow` from `n = 37` |
| `Catalan(n int64) (uint64, error)` | `C(2n, n) / (n + 1)`; `ErrOverflow` from `n = 34` |
| `StarsAndBars(n, k int64)`, `StarsAndBarsPositive(n, k int64)` | `C(n + k - 1, k - 1)` and `C(n - 1, k - 1)`, each `(uint64, error)`; 1 for `n = k = 0`; `ErrNegative` for a negative argument |
| `DerangementNumbers(n int) ([]uint64, error)` | `D(0)..D(n)`; `ErrOverflow` from `n = 21` |

## Go-Specific Notes

- **Errors, not panics.** Every failure returns an error wrapping one of the five exported sentinels, so callers test it with `errors.Is`. The message names the value: `C(68, 34) does not fit in 64 bits`, `n = 6 is past the table: it was built for n <= 5`.
- **Checked arithmetic** with `math/bits`: `bits.Add64` reports the carry of a sum and `bits.Mul64` the high word of a product, so an overflow is seen before a wrapped value is kept.
- **Divide first.** `Binomial` divides `gcd(result, i)` out before it multiplies, so the product is the next value exactly; `result*(n-k+i)/i` would overflow a step early.
- **No huge allocations.** `CatalanNumbers` and `DerangementNumbers` append one value at a time, so a large `n` fails at the first overflow; `BinomialPascal` fails at once when `min(k, n-k) >= 34`, before making its row.
- **128-bit products.** `MulMod` takes the high and low words from `bits.Mul64` and the remainder from `bits.Rem64`, so the modulus can be any 64-bit prime; the tests use `2^61 - 1` and `2^64 - 59`. The code uses the built-in `min` and the tests the `slices` package, both from Go 1.21.

## How to Run

```bash
go test ./...
go run .
```

## Key Takeaways

- `bits.Add64` and `bits.Mul64` turn every count into a checked one.
- Divide the gcd out before multiplying, and the multiplicative formula overflows only with its answer.
- One `PowMod` per table: `InvFact` fills backwards with one `MulMod` per entry.
