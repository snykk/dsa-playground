# Fast Fourier Transform (Go)

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
| **FFT** | O(n log n) | O(n) |
| **IFFT** | O(n log n) | O(n) |
| **MultiplyPolynomials** | O(n log n) | O(n) |
| **Convolve** | O(n log n) | O(n) |

---

## Implementation Details

### Functions

1. **`FFT(a, inverse)`**
   - Compute Fast Fourier Transform using Cooley-Tukey algorithm
   - Returns FFT result as slice of complex numbers
   - Time: O(n log n), Space: O(n)

2. **`IFFT(a)`**
   - Compute Inverse Fast Fourier Transform
   - Returns original signal
   - Time: O(n log n), Space: O(n)

3. **`MultiplyPolynomials(p, q)`**
   - Multiply two polynomials using FFT
   - Returns coefficients of product polynomial
   - Time: O(n log n), Space: O(n)

4. **`Convolve(a, b)`**
   - Compute convolution of two sequences using FFT
   - Returns convolution result
   - Time: O(n log n), Space: O(n)

---

## Usage

```go
package main

import "fmt"

func main() {
    // FFT example
    signal := []complex128{1, 2, 3, 4}
    result := FFT(signal, false)
    
    // Polynomial multiplication
    p := []int{1, 2, 3}
    q := []int{4, 5}
    product := MultiplyPolynomials(p, q)
    fmt.Println(product)  // [4, 13, 22, 15]
}
```

---

## Testing

Run tests with:

```bash
# Run tests
go test -v

# Or run the main file to see example usage
go run main.go
```

---

## References

- "Introduction to Algorithms" by CLRS
- "Numerical Recipes" by Press et al.
- "The Fast Fourier Transform" by Brigham

---

_Last Updated: December 2025_

