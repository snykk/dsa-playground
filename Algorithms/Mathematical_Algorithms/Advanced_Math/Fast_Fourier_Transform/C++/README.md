# Fast Fourier Transform -- C++ Implementation

Recursive radix-2 FFT on `std::complex<double>`, inverse FFT, polynomial multiplication and convolution.

For the concept, see the topic README: [../README.md](../README.md).

## Files

| File | Purpose |
|------|---------|
| `fast_fourier_transform.cpp` | `fft`, `ifft`, `multiplyPolynomials`, `convolve` (implementation in the `.cpp`, included by the test) |
| `fast_fourier_transform_test.cpp` | 11 tests: lengths, round trip, identity, known values, comparison with a direct DFT, empty input, rejected inverse length, product overflow |

## API

- `ComplexVector fft(const ComplexVector& a, bool inverse = false)`: forward uses `e^(-2*pi*i*j*k/n)`; a non-power-of-two input is zero-padded; the inverse throws `std::invalid_argument` for a non-power-of-two length. Empty input returns empty output.
- `ComplexVector ifft(const ComplexVector& a)`.
- `std::vector<long long> multiplyPolynomials(const std::vector<int>& p, const std::vector<int>& q)`.
- `std::vector<long long> convolve(const std::vector<int>& a, const std::vector<int>& b)`.
- `Complex` and `ComplexVector` are typedefs for `std::complex<double>` and a vector of it.

## C++-Specific Notes

- The result type is `long long`: with `int`, a product such as `1e5 * 1e5` overflows.
- Exactness holds only while the largest output coefficient is well below 2^53 (double precision).
- The inverse divides by 2 at every level of the recursion, which adds up to a division by `n`.
- There is no `main` in the source file: the file is meant to be included, as the tests do.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD fast_fourier_transform_test.cpp -o fft_test
./fft_test
```

## Key Takeaways

1. Choose the output type so that the products cannot overflow.
2. Throw on inputs whose result would be meaningless, such as an inverse of the wrong length.
3. Compare against a direct O(n^2) DFT in tests; it catches sign and scaling mistakes.
