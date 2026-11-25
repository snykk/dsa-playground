# Gaussian Elimination -- Go Implementation

`A x = b` by elimination to row echelon form and back substitution: in `float64` with partial pivoting, and exactly modulo a prime up to 2^64 - 1 with `math/bits` products. See the [topic README](../README.md) for the idea, a trace and the example that shows why pivoting matters.

## Files

| File | Contents |
|------|----------|
| `main.go` | `Eps`, `Kind`, `Solution`, `ModSolution`, `Solve`, `SolveWithoutPivoting`, `Determinant`, `MulMod`, `PowMod`, `ReduceMod`, `InverseMod`, `SolveMod`, `DeterminantMod`, the errors `ErrShape`, `ErrModulus` and `ErrNoInverse`, and a demo in `main` |
| `main_test.go` | the results the Python code computes (33 of `SolveMod` and 10 of `DeterminantMod` exactly, 12 of `Solve` and 5 of `Determinant` within `Eps`); random systems with a known solution; singular and inconsistent systems built on purpose; rank and determinant against cofactor expansion in `math/big`; non-square systems; the pivoting example; the tolerance, ties and edge cases; the errors; the count of updates; the input left unchanged |
| `go.mod` | module file (Go 1.21) |

## API

| Function | Description |
|----------|-------------|
| `Solve(A [][]float64, b []float64, eps float64) (Solution, error)` | partial pivoting; pass `Eps` (1e-9) for the default tolerance; an error wrapping `ErrShape` for an empty or ragged `A` or a `b` of the wrong length; O(min(n, m) * n * m) |
| `SolveWithoutPivoting(A, b, eps)` | the first entry above `eps` as the pivot |
| `Determinant(A [][]float64, eps float64) (float64, error)` | for a square `A`; 0 when a column has no pivot; `ErrShape` if `A` is not square |
| `SolveMod(A [][]int64, b []int64, p uint64) (ModSolution, error)` | modulo the prime `p`, `X` in `[0, p)`; `ErrModulus` for `p < 2`, `ErrShape`, or `ErrNoInverse` for a pivot with no inverse |
| `DeterminantMod(A [][]int64, p uint64) (uint64, error)` | `det(A) mod p` |
| `MulMod`, `PowMod`, `ReduceMod(v int64, p uint64)`, `InverseMod(a, p uint64) (uint64, error)` | the modular helpers: `bits.Mul64` with `bits.Rem64`, square and multiply, Python's `%` for any `int64`, and Fermat's inverse with its check |

`Solution` and `ModSolution` hold `Kind` (`NoSolution`, `Unique`, `Infinite`; `String()` gives `"no solution"`, `"unique"`, `"infinite"`), `X` (`nil` when there is no solution; free unknowns 0), `Rank`, `PivotCols`, `Swaps` and `Updates`.

## Go-Specific Notes

- **The same float64 values as Python.** The Go specification lets the compiler fuse `x*y + z` into one FMA, and on arm64 it does: without care, the example without pivoting returns `x1 = 4.5461632680599`. The code writes `M[t][c] -= float64(factor * M[row][c])`; the explicit conversion rounds the product on its own, as the specification promises, so the result is Python's `4.470348358154297`.
- **No default argument.** Go has none, so `Solve` takes `eps` explicitly; `Eps` is the value Python and C++ use by default.
- **Errors, not panics.** Invalid input returns an error that wraps one of the three exported sentinels, so callers test it with `errors.Is`; the message names the numbers, for example `row 1 of A has 1 entries, but row 0 has 2`.
- **64-bit moduli.** `MulMod` takes the 128-bit product from `bits.Mul64` and its remainder from `bits.Rem64`. `ReduceMod` computes `|v|` as `-(v + 1) + 1`, so `math.MinInt64` does not overflow.
- Rows are swapped as slice headers, in O(1); `Solve` and `Determinant` copy `A` first, so the caller's matrix is never changed.

## How to Run

```bash
go test ./...
go run .
```

## Key Takeaways

- `float64(a * b)` keeps a product from being fused, which keeps results reproducible.
- Wrap sentinel errors with `%w` so a caller can tell a bad shape from a composite modulus.
- `bits.Mul64` plus `bits.Rem64` is an overflow-free `a * b % m`.
