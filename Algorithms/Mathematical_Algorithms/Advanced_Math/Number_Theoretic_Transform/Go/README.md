# Number Theoretic Transform -- Go Implementation

The iterative, in-place NTT modulo 998244353 on `[]int`, its inverse, and polynomial multiplication and convolution exact modulo that prime. See the [topic README](../README.md) for the idea, a trace and the comparison with the FFT.

## Files

| File | Contents |
|------|----------|
| `main.go` | `Mod`, `PrimitiveRoot`, `MaxLength`, the errors `ErrNotPowerOfTwo` and `ErrTooLong`, `MulMod`, `PowMod`, `RootOfUnity`, `BitReversePermute`, `NTTInPlace`, `NTT`, `INTT`, `MultiplyPolynomials`, `Convolve` and a demo in `main` |
| `main_test.go` | 14 tests: the values the Python code computes (the 24 roots of unity and their inverses, 12 transforms, 40 products) and 12 products of the Fast Fourier Transform topic's Python code; the prime and its primitive root; the bit-reversal order; every transform up to length 64 against the direct sum; round trips; the products against schoolbook multiplication modulo p on 720 random pairs; the edge cases and the errors; the butterfly count up to 2^16; the length limit; the largest product, two lists of 2^22 ones |
| `go.mod` | module file (Go 1.21) |

## API

| Function | Description |
|----------|-------------|
| `Mod`, `PrimitiveRoot`, `MaxLength` | constants: 998244353, 3 and 2^23 |
| `MulMod(a, b int) int` | `a * b % Mod` for residues, multiplied as `uint64` |
| `PowMod(base, exp int) int` | `base^exp % Mod` by square and multiply |
| `RootOfUnity(n int, inverse bool) (int, error)` | `3^((Mod - 1) / n)` or its inverse; `ErrNotPowerOfTwo` unless n is a power of two, `ErrTooLong` above 2^23 |
| `BitReversePermute(a []int)` | the bit-reversal permutation, in place |
| `NTTInPlace(a []int, inverse bool) (int, error)` | the transform of a slice of residues, in place; returns the number of butterflies; `ErrNotPowerOfTwo` or `ErrTooLong` for a bad length |
| `NTT(a []int, inverse bool) ([]int, error)` | a new slice of residues 0..Mod-1: reduced (negative values allowed), padded for a forward transform; empty for empty; an error wrapping `ErrNotPowerOfTwo` for an inverse of another length, `ErrTooLong` for more than 2^23 values |
| `INTT(a []int) ([]int, error)` | `NTT(a, true)` |
| `MultiplyPolynomials(p, q []int) ([]int, error)` | the product modulo Mod, `len(p) + len(q) - 1` coefficients (an empty, non-nil slice when that is below 1); `ErrTooLong` above 2^23 coefficients |
| `Convolve(a, b []int) ([]int, error)` | the same as `MultiplyPolynomials` |

## Go-Specific Notes

- **Errors, not panics.** The FFT topic's Go code panics on an inverse of the wrong length; here every function that can fail returns an error wrapping `ErrNotPowerOfTwo` or `ErrTooLong`, so callers test it with `errors.Is`. `INTT([]int{1, 2, 3})` gives `inverse NTT: the length must be a power of two, got 3`.
- **`uint64` products.** `MulMod` converts to `uint64` before multiplying: two residues give less than 2^60, which fits even where `int` is 32 bits. Every other intermediate value stays below `2 * Mod`, under 2^31.
- `%` in Go keeps the sign of the dividend, so the reduction adds `Mod` to a negative remainder.
- **Speed.** The largest product, two slices of 2^22 values (n = 2^23), takes about 1.8 s; `go test` takes about 2 s.

## How to Run

```bash
go test ./...
go run .
```

## Key Takeaways

- Return errors for lengths the prime cannot handle, and wrap sentinels so callers can tell them apart.
- `uint64` products keep a modulus below 2^32 exact on every platform.
- The in-place core returns its butterfly count, `(n / 2) * log2(n)`.
