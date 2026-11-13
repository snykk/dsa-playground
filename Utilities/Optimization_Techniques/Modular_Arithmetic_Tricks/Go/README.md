# Modular Arithmetic Tricks -- Go Implementation

Modular operations on `int64`, fast exponentiation, inverses, a factorial table and Lucas' theorem.

For the concept, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `main.go` | the functions below and a small demo `main` |
| `main_test.go` | 11 tests: basics, power (including modulus 1), large-modulus products against `math/big`, inverses, factorials, Lucas against `math/big` binomials |
| `go.mod` | module definition |

## API

All helpers are unexported (package `main`) except the `Factorials` type.

- `MOD = 1_000_000_007`; `mod(x, m)`, `add`, `sub`, `mul(a, b, m)` (128-bit product via `math/bits`).
- `power(base, exp, m)`: returns `1 % m`.
- `modInverse(a, m)` (Fermat), `modInverseExtGCD(a, m)` (-1 when none), `extGCD(a, b)`, `divMod(a, b, m)`.
- `NewFactorials(n, m)`, `(*Factorials).NCr(n, r)`, `NPr(n, r)`.
- `lucasNCr(n, r, p)`: prime `p`, small binomials computed directly modulo `p`.

## Go-Specific Notes

- `mul` and `power` use `math/bits` (`Mul64`, `Rem64`), so they are exact for moduli below 2^62.
- Go's `%` keeps the sign of the dividend, which is why `mod` adds `m` before the last `%`.
- There is no CRT, matrix power or Fibonacci in the Go version.
- `lucasNCr` costs O(p) per base-p digit of `n`.

## How to Run

```bash
go test ./...
go run .
```

## Key Takeaways

1. `math/bits` gives exact 128-bit products without `math/big`.
2. Normalise negative remainders explicitly.
3. Test against `math/big` for the cases where 64-bit arithmetic is not enough.
