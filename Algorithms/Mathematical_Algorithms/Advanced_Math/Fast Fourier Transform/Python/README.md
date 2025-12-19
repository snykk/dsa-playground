# Fast Fourier Transform (FFT) (Python)

**Fast Fourier Transform (FFT)** is an efficient algorithm for computing the Discrete Fourier Transform (DFT) and its inverse.

---

## Overview

The FFT is one of the most important algorithms in signal processing and numerical analysis. It reduces the time complexity of computing the DFT from O(n²) to O(n log n) using the divide-and-conquer approach.

**Key Characteristics:**
- Efficient: O(n log n) time complexity
- Divide and conquer: Cooley-Tukey algorithm
- Essential for signal processing, polynomial multiplication
- Inverse FFT: Reconstructs original signal

---

## Algorithm

### Cooley-Tukey FFT Algorithm

The algorithm uses divide-and-conquer:
1. Divide: Split signal into even and odd indices
2. Conquer: Recursively compute FFT of halves
3. Combine: Merge results using twiddle factors

**Key Insight:**
- FFT of even indices + FFT of odd indices with phase shifts
- Uses symmetry properties of complex exponentials

---

## Complexity Analysis

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| **fft** | O(n log n) | O(n) |
| **ifft** | O(n log n) | O(n) |
| **multiply_polynomials** | O(n log n) | O(n) |
| **convolve** | O(n log n) | O(n) |

Where n is the length of the input (padded to power of 2).

---

## Implementation Details

### Functions

1. **`fft(a, inverse=False)`**
   - Compute Fast Fourier Transform
   - Returns list of complex numbers
   - Time: O(n log n), Space: O(n)

2. **`ifft(a)`**
   - Compute Inverse Fast Fourier Transform
   - Returns original signal
   - Time: O(n log n), Space: O(n)

3. **`multiply_polynomials(p, q)`**
   - Multiply two polynomials using FFT
   - Returns coefficients of product polynomial
   - Time: O(n log n), Space: O(n)

4. **`convolve(a, b)`**
   - Compute convolution of two sequences
   - Returns convolution result
   - Time: O(n log n), Space: O(n)

---

## Usage

```python
from fast_fourier_transform import fft, ifft, multiply_polynomials

# Compute FFT
signal = [1, 2, 3, 4]
signal_complex = [complex(x, 0) for x in signal]
fft_result = fft(signal_complex)

# Inverse FFT
recovered = ifft(fft_result)

# Polynomial multiplication
p = [1, 2, 3]  # 1 + 2x + 3x^2
q = [4, 5]     # 4 + 5x
product = multiply_polynomials(p, q)
```

---

## Applications

1. **Signal Processing**: Audio, image processing, filtering
2. **Polynomial Multiplication**: Fast polynomial operations
3. **Convolution**: Efficient convolution computation
4. **Data Compression**: JPEG, MP3 algorithms
5. **Numerical Analysis**: Solving differential equations

---

## Important Notes

- **Power of 2**: Input is padded to next power of 2 if needed
- **Complex Numbers**: FFT operates on complex numbers
- **Floating Point**: Results may have small floating point errors
- **Inverse**: IFFT recovers original signal (within numerical precision)

---

## Testing

Run tests with:

```bash
python -m unittest fast_fourier_transform_test.py
```

Or:

```bash
python fast_fourier_transform_test.py
```

---

## References

- "Introduction to Algorithms" by CLRS (Chapter 30)
- "Algorithm Design Manual" by Steven Skiena
- Cooley, J. W., & Tukey, J. W. (1965). "An algorithm for the machine calculation of complex Fourier series"

---

_Last Updated: December 2025_

