# Fast Fourier Transform -- Go Implementation

Recursive radix-2 FFT on `complex128`, inverse FFT, polynomial multiplication and convolution.

For the concept, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `main.go` | `FFT`, `IFFT`, `MultiplyPolynomials`, `Convolve` and a demo `main` |
| `main_test.go` | 11 tests: lengths, round trip, identity, known values, comparison with a direct DFT, empty input, panic on a bad inverse length, large coefficients |
| `go.mod` | module definition |

## API

- `FFT(a []complex128, inverse bool) []complex128`: forward uses `e^(-2*pi*i*j*k/n)`; a non-power-of-two input is zero-padded; with `inverse = true` the result is divided by `n` and a non-power-of-two length panics. Empty input returns an empty slice.
- `IFFT(a []complex128) []complex128`.
- `MultiplyPolynomials(p, q []int) []int` and `Convolve(a, b []int) []int`.

## Go-Specific Notes

- `int` is 64 bits on 64-bit platforms, so products up to about 9e18 fit; the FFT itself is exact only while outputs stay well below 2^53.
- `FFT` normalises once at the top; the internal `fftCore` has no scaling.
- The bad-length inverse panics because the function returns no error; callers that cannot guarantee a power of two should check first.

## How to Run

```bash
go test ./...
go run .
```

## Key Takeaways

1. A single scaling step at the top is simpler than threading lengths through the recursion.
2. `complex128` and `math/cmplx` make the butterflies short.
3. Test against the definition of the DFT, not only against a round trip.
