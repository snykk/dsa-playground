# Fast Fourier Transform -- Python Implementation

Recursive radix-2 Cooley-Tukey FFT, inverse FFT, polynomial multiplication and convolution.

For the concept, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `fast_fourier_transform.py` | `fft`, `ifft`, `multiply_polynomials`, `convolve` |
| `fast_fourier_transform_test.py` | 13 tests: lengths, round trip, identity, known values, comparison with a direct DFT, empty input, rejected inverse length, large coefficients |

## API

- `fft(a, inverse=False)`: list of complex numbers in, list out. Forward uses `e^(-2*pi*i*j*k/n)`; a non-power-of-two input is zero-padded; `inverse=True` divides by `n` and raises `ValueError` for a non-power-of-two length. An empty list returns `[]`.
- `ifft(a)`: `fft(a, inverse=True)`.
- `multiply_polynomials(p, q)`: coefficient lists (lowest degree first), returns the product as a list of ints (rounded).
- `convolve(a, b)`: same as `multiply_polynomials`.

## Python-Specific Notes

- The twiddle factors come from `cmath.exp`, so each butterfly is accurate without accumulating error.
- Results are exact for integer products only while the largest output coefficient stays well below 2^53; Python's own integers are unbounded, but the FFT is not.
- The recursion builds new lists at every level; the depth is only `log2(n)`.
- `fft([1, 2, 3, 4])` is `[10, -2+2j, -2, -2-2j]`, the same as `numpy.fft.fft`.

## How to Run

```bash
python3 -m unittest fast_fourier_transform_test
python3 fast_fourier_transform.py        # demo
```

## Key Takeaways

1. Even/odd splitting turns one size-`n` transform into two of size `n/2`.
2. The same code gives the inverse with the opposite sign and a division by `n`.
3. Floating point limits exactness; check the size of the result.
