# Fast Fourier Transform (FFT)

An efficient algorithm for computing the Discrete Fourier Transform.

## Algorithm

Divide and conquer approach:
1. Split coefficients into even and odd indices
2. Recursively compute FFT on each half
3. Combine using butterfly operations

## Complexity

| Operation | Time | Space |
|-----------|------|-------|
| FFT | O(n log n) | O(n) |
| Polynomial Multiplication | O(n log n) | O(n) |

## Variants

- **Cooley-Tukey**: Radix-2 FFT
- **NTT**: Number Theoretic Transform (modular)
- **Inverse FFT**: Recover coefficients from values

## Applications

- Polynomial multiplication
- Large integer multiplication
- Convolution
- Signal processing

