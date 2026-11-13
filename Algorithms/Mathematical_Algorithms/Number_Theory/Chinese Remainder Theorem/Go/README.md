# Chinese Remainder Theorem -- Go Implementation

## Files

- `main.go`: all functions plus a small demo in `main`.
- `main_test.go`: tests (basic, pairwise, verify, larger moduli, negative remainders, residues near 2^31.5, an overflowing lcm, non-coprime systems and a signed extended-gcd identity check on 20,000 random pairs).
- `go.mod`: module file (Go 1.21).

## API

- `ModInverse(a, m int64) int64`: inverse in `[0, m)`, or `-1` if none exists.
- `ModPow(base, exponent, modulus int64) int64`: `base^exponent mod modulus`.
- `ChineseRemainderTheorem(remainders, moduli []int64) int64`: smallest non-negative solution, or `-1` (length mismatch, non-positive modulus, no solution, or an lcm above `math.MaxInt64`). Empty input returns 0.
- `ChineseRemainderTheoremPairwise(a1, m1, a2, m2 int64) int64`: coprime moduli only; `-1` otherwise.
- `VerifyCrtSolution(x int64, remainders, moduli []int64) bool`: checks all congruences after reducing the remainders.
- `ExtendedGCDResult`: the `{GCD, X, Y}` result type of the unexported `extendedGcd`, where `a*X + b*Y == GCD` for any signs.

## Go-Specific Notes

- Products of two residues use `bits.Mul64` and `bits.Rem64` (`mulMod`), so there is no overflow for moduli up to `math.MaxInt64`. No floating point is involved anywhere (an older version took `|x|` through `float64`, which loses precision above 2^53).
- `-1` is the error value; remainders may be negative and are normalized with `floorMod`.
- `extendedGcd` does not support `math.MinInt64`.

## How to Run

```bash
go test ./...
go run .
```

## Key Takeaways

- `bits.Mul64` plus `bits.Rem64` is the idiomatic overflow-free `a * b % m`.
- Never use `math.Abs` on integers; it converts to `float64`.
- Merge congruences one at a time and keep the running modulus as the lcm.
