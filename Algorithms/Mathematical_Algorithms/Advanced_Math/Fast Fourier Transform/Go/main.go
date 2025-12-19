package main

import (
	"fmt"
	"math"
	"math/cmplx"
)

// FFT computes Fast Fourier Transform using Cooley-Tukey algorithm
// Time Complexity: O(n log n)
func FFT(a []complex128, inverse bool) []complex128 {
	n := len(a)
	originalN := n

	// Ensure n is power of 2 (pad with zeros if needed)
	if n&(n-1) != 0 {
		// Find next power of 2
		nextPower := 1
		for nextPower < n {
			nextPower <<= 1
		}
		padded := make([]complex128, nextPower)
		copy(padded, a)
		for i := n; i < nextPower; i++ {
			padded[i] = 0
		}
		result := fftCore(padded, inverse, originalN)
		if inverse {
			// Adjust normalization: fftCore normalized by padded length, but we need original length
			nextPower := len(padded)
			for i := 0; i < originalN; i++ {
				result[i] = result[i] * complex(float64(nextPower)/float64(originalN), 0)
			}
			return result[:originalN]
		}
		return result
	}

	return fftCore(a, inverse, originalN)
}

// Core FFT implementation (assumes n is power of 2)
// originalLen is the original input length before padding
func fftCore(a []complex128, inverse bool, originalLen int) []complex128 {
	n := len(a)

	// Base case
	if n == 1 {
		return a
	}

	// Divide: split into even and odd indices
	even := make([]complex128, 0, n/2)
	odd := make([]complex128, 0, n/2)
	for i := 0; i < n; i += 2 {
		even = append(even, a[i])
	}
	for i := 1; i < n; i += 2 {
		odd = append(odd, a[i])
	}

	evenFFT := fftCore(even, inverse, originalLen)
	oddFFT := fftCore(odd, inverse, originalLen)

	// Combine
	result := make([]complex128, n)
	sign := 1.0
	if inverse {
		sign = -1.0
	}

	for k := 0; k < n/2; k++ {
		angle := sign * 2.0 * math.Pi * float64(k) / float64(n)
		t := cmplx.Exp(complex(0, angle)) * oddFFT[k]
		result[k] = evenFFT[k] + t
		result[k+n/2] = evenFFT[k] - t
	}

	// Only normalize at the top level (when n == originalLen or n is the padded size)
	if inverse && n == originalLen {
		// Normalize by dividing by n (which equals originalLen)
		for i := range result {
			result[i] /= complex(float64(n), 0)
		}
	} else if inverse && n > originalLen {
		// This is the padded level, normalize by n but we'll adjust at the top level
		for i := range result {
			result[i] /= complex(float64(n), 0)
		}
	}

	return result
}

// IFFT computes Inverse Fast Fourier Transform
// Time Complexity: O(n log n)
func IFFT(a []complex128) []complex128 {
	return FFT(a, true)
}

// MultiplyPolynomials multiplies two polynomials using FFT
// Time Complexity: O(n log n)
func MultiplyPolynomials(p, q []int) []int {
	// Pad polynomials to same length (power of 2)
	n := 1
	for n < len(p)+len(q)-1 {
		n <<= 1
	}

	pPadded := make([]int, n)
	qPadded := make([]int, n)
	copy(pPadded, p)
	copy(qPadded, q)

	// Convert to complex
	pComplex := make([]complex128, n)
	qComplex := make([]complex128, n)
	for i := 0; i < n; i++ {
		pComplex[i] = complex(float64(pPadded[i]), 0)
		qComplex[i] = complex(float64(qPadded[i]), 0)
	}

	// Compute FFT
	pFFT := FFT(pComplex, false)
	qFFT := FFT(qComplex, false)

	// Multiply pointwise
	productFFT := make([]complex128, n)
	for i := 0; i < n; i++ {
		productFFT[i] = pFFT[i] * qFFT[i]
	}

	// Compute inverse FFT
	product := IFFT(productFFT)

	// Round to integers (for integer coefficients)
	resultSize := len(p) + len(q) - 1
	result := make([]int, resultSize)
	for i := 0; i < resultSize; i++ {
		result[i] = int(math.Round(real(product[i])))
	}

	return result
}

// Convolve computes convolution of two sequences using FFT
// Time Complexity: O(n log n)
func Convolve(a, b []int) []int {
	return MultiplyPolynomials(a, b)
}

func main() {
	// Example usage
	fmt.Println("Fast Fourier Transform Examples:")

	// Example 1: Simple FFT
	signal := []complex128{1, 2, 3, 4}
	fftResult := FFT(signal, false)
	fmt.Printf("Signal: [1, 2, 3, 4]\n")
	fmt.Printf("FFT: ")
	for _, x := range fftResult {
		fmt.Printf("%.2f+%.2fj ", real(x), imag(x))
	}
	fmt.Println()

	// Example 2: Inverse FFT
	ifftResult := IFFT(fftResult)
	fmt.Printf("IFFT (recovered): ")
	for _, x := range ifftResult {
		fmt.Printf("%.0f ", real(x))
	}
	fmt.Println()

	// Example 3: Polynomial multiplication
	fmt.Println("\nPolynomial Multiplication:")
	p := []int{1, 2, 3} // 1 + 2x + 3x^2
	q := []int{4, 5}    // 4 + 5x
	product := MultiplyPolynomials(p, q)
	fmt.Printf("(%v) * (%v) = %v\n", p, q, product)
	// Should be [4, 13, 22, 15] = 4 + 13x + 22x^2 + 15x^3
}
