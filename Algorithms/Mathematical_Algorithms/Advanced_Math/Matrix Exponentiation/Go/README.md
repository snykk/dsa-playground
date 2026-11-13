# Matrix Exponentiation -- Go Implementation

Matrix multiplication, identity, recursive and iterative matrix power, and Fibonacci by matrix power on `int64` entries.

For the concept, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `main.go` | the functions below and a demo `main` |
| `main_test.go` | 14 tests: exact small powers, modulus, negative entries, a modulus above 2^32, negative exponents, modulus 0 and 1, the Fibonacci overflow guard |
| `go.mod` | module definition |

## API

- `MatrixMultiply(A, B [][]int64, mod int64) [][]int64`.
- `MatrixIdentity(n int) [][]int64`.
- `MatrixPower(A [][]int64, k, mod int64) [][]int64`: recursive; panics if `k < 0`.
- `MatrixPowerIterative(A [][]int64, k, mod int64) [][]int64`: iterative; panics if `k < 0`.
- `FibonacciMatrix(n, mod int64) int64`: panics for `n < 0` and for `n > 92` without a modulus.

Pass `-1` (or any value `<= 0`) as `mod` for no modulus.

## Go-Specific Notes

- A modulus is applied when `mod > 0`. Entries are normalised into `[0, mod)` and each product uses `bits.Mul64` and `bits.Rem64`, so any modulus up to 2^63 - 1 is exact.
- Without a modulus the arithmetic is plain `int64`; overflow in `MatrixPower` is not detected.
- The functions return no error, so invalid arguments panic.
- Internal helpers (`normalizeMod`, `mulMod`, `identityMod`) are unexported.

## How to Run

```bash
go test ./...
go run .
```

## Key Takeaways

1. `math/bits` gives an exact 128-bit product without `math/big` allocations.
2. Go's `%` keeps the sign of the dividend: normalise negative entries.
3. For a function without an error return, a clear panic is better than silent wrong output.
