# Euclidean Algorithm -- Go Implementation

## Files

- `main.go`: the functions below plus a demo in `main`.
- `main_test.go`: tests (gcd table, commutativity, lcm, the gcd-lcm identity, extended gcd with negative inputs and 20,000 random signed pairs, lcm that overflows a plain product, gcd above 2^53).
- `go.mod`: module file (Go 1.21).

## API

- `GCD(a, b int64) int64`: recursive Euclid on absolute values.
- `GCDIterative(a, b int64) int64`: loop version.
- `LCM(a, b int64) int64`: `|a| / gcd * |b|`; 0 if either is 0.
- `ExtendedGCD(a, b int64) ExtendedGCDResult`: `{GCD, X, Y}` with `a*X + b*Y == GCD`, for any signs.

## Go-Specific Notes

- The absolute value is integer arithmetic (`abs`). Do not use `math.Abs`: converting to `float64` rounds values above 2^53 (the old code returned `GCD(2^53 + 1, 3) == 1`).
- `LCM` divides before it multiplies; the result must still fit in `int64`.
- `math.MinInt64` is not supported.

## How to Run

```bash
go test ./...
go run .
```

## Key Takeaways

- Stay in integer arithmetic for number theory; floats silently lose bits.
- Divide by the gcd before multiplying in an lcm.
