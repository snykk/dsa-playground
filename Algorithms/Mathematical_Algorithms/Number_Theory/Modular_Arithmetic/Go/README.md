# Modular Arithmetic -- Go Implementation

## Files

- `main.go`: all functions plus a demo in `main`.
- `main_test.go`: tests (basics, ring properties, negative operands, a signed extended-gcd identity check on 20,000 pairs, inverses of negative numbers and of 2^53 + 1, negative exponents, moduli of 10^18 + 3 and 2^63 - 25).
- `go.mod`: module file (Go 1.21).

## API

- `ModAdd(a, b, m int64) int64`, `ModSubtract`, `ModMultiply`: results in `[0, m)`.
- `ModInverse(a, m int64) int64`: inverse in `[0, m)`, or `-1`.
- `ModDivide(a, b, m int64) int64`: `a * b^-1 mod m`, or `-1` if `b` has no inverse.
- `ModPower(base, exponent, m int64) int64`: binary exponentiation; a negative exponent gives the inverse power, or `-1`.
- `ExtendedGCDResult`: `{GCD, X, Y}`, returned by the unexported `extendedGcd` with `a*X + b*Y == GCD` for any signs.

## Go-Specific Notes

- `%` keeps the sign of the dividend in Go, so every function normalizes with `floorMod`. Results are always non-negative, which makes the `-1` sentinel unambiguous.
- Products use `bits.Mul64` and `bits.Rem64`; sums compare against `m - y`. Any modulus up to `math.MaxInt64` is safe. Integer absolute values are used instead of `math.Abs` (which rounds above 2^53).
- `math.MinInt64` as an argument is not supported.

## How to Run

```bash
go test ./...
go run .
```

## Key Takeaways

- Normalize negative operands before anything else.
- `bits.Mul64` plus `bits.Rem64` is an overflow-free `a * b % m`.
