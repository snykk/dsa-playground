package main

import (
	"math"
	"testing"
)

const eps = 1e-9

func complexEqual(a, b complex128) bool {
	return math.Abs(real(a)-real(b)) < eps && math.Abs(imag(a)-imag(b)) < eps
}

func TestFFTBasic(t *testing.T) {
	signal := []complex128{1, 2, 3, 4}
	result := FFT(signal, false)

	if len(result) != 4 {
		t.Errorf("FFT result length = %d, expected 4", len(result))
	}
}

func TestIFFT(t *testing.T) {
	// Use power of 2 length for accurate roundtrip
	signal := []complex128{1, 2, 3, 4, 5, 6, 7, 8}
	fftResult := FFT(signal, false)
	ifftResult := IFFT(fftResult)

	// IFFT should recover original signal (within floating point error)
	for i := range signal {
		if !complexEqual(ifftResult[i], signal[i]) {
			t.Errorf("IFFT[%d] = %v, expected %v", i, ifftResult[i], signal[i])
		}
	}
}

func TestMultiplyPolynomials(t *testing.T) {
	p := []int{1, 2} // 1 + 2x
	q := []int{3, 4} // 3 + 4x
	product := MultiplyPolynomials(p, q)

	// (1 + 2x) * (3 + 4x) = 3 + 10x + 8x^2
	if len(product) != 3 {
		t.Errorf("MultiplyPolynomials length = %d, expected 3", len(product))
	}
	if product[0] != 3 || product[1] != 10 || product[2] != 8 {
		t.Errorf("MultiplyPolynomials = %v, expected [3, 10, 8]", product)
	}
}

func TestMultiplyPolynomialsLarger(t *testing.T) {
	p := []int{1, 2, 3} // 1 + 2x + 3x^2
	q := []int{4, 5}    // 4 + 5x
	product := MultiplyPolynomials(p, q)

	// (1 + 2x + 3x^2) * (4 + 5x) = 4 + 13x + 22x^2 + 15x^3
	expected := []int{4, 13, 22, 15}
	if len(product) != len(expected) {
		t.Errorf("MultiplyPolynomials length = %d, expected %d", len(product), len(expected))
	}
	for i := range expected {
		if product[i] != expected[i] {
			t.Errorf("MultiplyPolynomials[%d] = %d, expected %d", i, product[i], expected[i])
		}
	}
}

func TestConvolve(t *testing.T) {
	a := []int{1, 2, 3}
	b := []int{4, 5}
	result := Convolve(a, b)

	// Convolution should be same as polynomial multiplication
	product := MultiplyPolynomials(a, b)
	if len(result) != len(product) {
		t.Errorf("Convolve length = %d, expected %d", len(result), len(product))
	}
	for i := range result {
		if result[i] != product[i] {
			t.Errorf("Convolve[%d] = %d, expected %d", i, result[i], product[i])
		}
	}
}

func TestFFTIdentity(t *testing.T) {
	signal := []complex128{1, 0, 0, 0}
	result := FFT(signal, false)

	// FFT of [1,0,0,0] should be [1,1,1,1]
	for i, x := range result {
		if math.Abs(real(x)-1.0) > eps || math.Abs(imag(x)) > eps {
			t.Errorf("FFT[%d] = %v, expected 1+0j", i, x)
		}
	}
}

func TestFFTKnownValues(t *testing.T) {
	// Textbook convention: X[k] = sum a[j] e^(-2 pi i j k / n)
	result := FFT([]complex128{1, 2, 3, 4}, false)
	expected := []complex128{10, complex(-2, 2), -2, complex(-2, -2)}
	for i := range expected {
		if !complexEqual(result[i], expected[i]) {
			t.Errorf("FFT[%d] = %v, expected %v", i, result[i], expected[i])
		}
	}
}

func TestFFTMatchesDirectDFT(t *testing.T) {
	signal := []complex128{1, 2, 3, 4, 5, 6, 7, 8}
	n := len(signal)
	result := FFT(signal, false)
	for k := 0; k < n; k++ {
		var sum complex128
		for j := 0; j < n; j++ {
			angle := -2 * math.Pi * float64(j*k) / float64(n)
			sum += signal[j] * complex(math.Cos(angle), math.Sin(angle))
		}
		if !complexEqual(result[k], sum) {
			t.Errorf("FFT[%d] = %v, direct DFT = %v", k, result[k], sum)
		}
	}
}

func TestIFFTNonPowerOfTwoPanics(t *testing.T) {
	defer func() {
		if recover() == nil {
			t.Error("expected a panic for a non-power-of-two inverse")
		}
	}()
	IFFT([]complex128{1, 2, 3})
}

func TestFFTEmpty(t *testing.T) {
	if len(FFT(nil, false)) != 0 || len(IFFT(nil)) != 0 {
		t.Error("expected empty output for empty input")
	}
}

func TestMultiplyPolynomialsLargeCoefficients(t *testing.T) {
	p := []int{100000, 100000}
	product := MultiplyPolynomials(p, p)
	expected := []int{10000000000, 20000000000, 10000000000}
	for i := range expected {
		if product[i] != expected[i] {
			t.Errorf("product[%d] = %d, expected %d", i, product[i], expected[i])
		}
	}
}
