# Modular Exponentiation -- Go Implementation

## Files

- `main.go`: the functions below plus a demo in `main`.
- `main_test.go`: tests (basics, exponent 0, base 0, modulus 1, a 60-bit modulus, Fermat checks modulo 2^61 - 1 and 2^63 - 25, negative base, negative exponent, inverses of negative numbers and of 2^53 + 1, a signed extended-gcd identity check, exponent 2^63 - 1).
- `go.mod`: module file (Go 1.21).

## API

- `ModPow(base, exponent, modulus int64) int64`: result in `[0, modulus)`; a negative exponent gives the inverse power, or `-1` if `base` has no inverse.
- `ModInverse(a, m int64) int64`: inverse in `[0, m)`, or `-1`.
- `ExtendedGCDResult`: `{GCD, X, Y}`, returned by the unexported `extendedGcd` with `a*X + b*Y == GCD` for any signs.

## Go-Specific Notes

- Products use `bits.Mul64` and `bits.Rem64`, so any modulus up to `math.MaxInt64` is safe. Absolute values are integer arithmetic (the old `math.Abs` went through `float64` and broke above 2^53).
- A negative base is reduced into `[0, modulus)` first, because `%` keeps the sign of the dividend.
- `math.MinInt64` as an argument is not supported. There is no recursive version in Go.

## How to Run

```bash
go test ./...
go run .
```

## Key Takeaways

- `bits.Mul64` plus `bits.Rem64` is an overflow-free `a * b % m`.
- Normalize a negative base before the loop.
