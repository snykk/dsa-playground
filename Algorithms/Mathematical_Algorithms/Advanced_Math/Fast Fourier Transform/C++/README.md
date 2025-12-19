# Fast Fourier Transform (C++)

**Fast Fourier Transform (FFT)** is an efficient algorithm for computing the Discrete Fourier Transform (DFT) and its inverse.

---

## Overview

The FFT is one of the most important algorithms in signal processing and numerical analysis. It reduces the time complexity of computing the DFT from O(n²) to O(n log n).

**Key Characteristics:**
- Efficient: O(n log n) time complexity
- Applications: Signal processing, polynomial multiplication, convolution
- Uses divide-and-conquer approach

---

## Complexity Analysis

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| **fft** | O(n log n) | O(n) |
| **ifft** | O(n log n) | O(n) |
| **multiplyPolynomials** | O(n log n) | O(n) |
| **convolve** | O(n log n) | O(n) |

---

## Implementation Details

### Functions

1. **`fft(a, inverse)`**
   - Compute Fast Fourier Transform using Cooley-Tukey algorithm
   - Returns FFT result as vector of complex numbers
   - Time: O(n log n), Space: O(n)

2. **`ifft(a)`**
   - Compute Inverse Fast Fourier Transform
   - Returns original signal
   - Time: O(n log n), Space: O(n)

3. **`multiplyPolynomials(p, q)`**
   - Multiply two polynomials using FFT
   - Returns coefficients of product polynomial
   - Time: O(n log n), Space: O(n)

4. **`convolve(a, b)`**
   - Compute convolution of two sequences using FFT
   - Returns convolution result
   - Time: O(n log n), Space: O(n)

---

## Usage

```cpp
#include "fast_fourier_transform.cpp"
#include <vector>
#include <complex>

int main() {
    // FFT example
    ComplexVector signal = {Complex(1, 0), Complex(2, 0), Complex(3, 0)};
    ComplexVector result = fft(signal);
    
    // Polynomial multiplication
    std::vector<int> p = {1, 2, 3};
    std::vector<int> q = {4, 5};
    std::vector<int> product = multiplyPolynomials(p, q);
    
    return 0;
}
```

---

## Testing

Run tests with:

```bash
# Compile
g++ -o fast_fourier_transform_test fast_fourier_transform_test.cpp

# Run
./fast_fourier_transform_test
```

Or compile and run in one command:

```bash
g++ fast_fourier_transform_test.cpp -o fast_fourier_transform_test && ./fast_fourier_transform_test
```

---

## References

- "Introduction to Algorithms" by CLRS
- "Numerical Recipes" by Press et al.
- "The Fast Fourier Transform" by Brigham

---

_Last Updated: December 2025_

