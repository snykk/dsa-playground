// Number Theoretic Transform (NTT) (Go)
//
// The Fast Fourier Transform's butterflies over the integers modulo the prime
// p = 998244353 = 119 * 2^23 + 1 instead of complex numbers. 3 is a primitive root modulo p, so
// for every power of two n up to 2^23, w = 3^((p - 1) / n) is a primitive n-th root of unity:
// w^n = 1 and w^(n/2) = -1, the properties the FFT uses of e^(-2*pi*i/n). Every step is an exact
// integer operation, so a product comes out exact modulo p, with no rounding.
//
//   - NTTInPlace: the iterative transform, in place: the bit-reversal permutation, then the
//     stages of length 2, 4, ..., n, which are the combining loops of the FFT's recursion run
//     bottom-up. It returns the number of butterflies, (n / 2) * log2(n).
//   - NTT / INTT: a copy, reduced modulo p (negative values allowed) and, for a forward
//     transform, padded with zeros to a power of two. The inverse needs a power-of-two length.
//   - MultiplyPolynomials / Convolve: the product modulo p, len(p) + len(q) - 1 coefficients.
//
// Residues are below p < 2^30, so MulMod multiplies them as uint64 (the product is below 2^60)
// and stays exact even where int is 32 bits.
//
// Invalid input returns an error wrapping ErrNotPowerOfTwo (an inverse of another length) or
// ErrTooLong (more than 2^23 values or product coefficients, the longest transform modulo p).
package main

import (
	"errors"
	"fmt"
)

const (
	// Mod is the prime 998244353 = 119 * 2^23 + 1.
	Mod = 998244353
	// PrimitiveRoot generates every nonzero residue modulo Mod.
	PrimitiveRoot = 3
	// MaxLength is 2^23, the largest power of two that divides Mod - 1.
	MaxLength = 1 << 23
)

var (
	// ErrNotPowerOfTwo is returned for an inverse transform, or a root of unity, whose length is
	// not a power of two.
	ErrNotPowerOfTwo = errors.New("the length must be a power of two")
	// ErrTooLong is returned for more than 2^23 values or product coefficients.
	ErrTooLong = errors.New("longer than 2^23, the longest transform modulo 998244353")
)

// MulMod returns a*b mod Mod for residues a, b in 0..Mod-1. The product is below 2^60, so it is
// taken in uint64.
func MulMod(a, b int) int {
	return int(uint64(a) * uint64(b) % Mod)
}

// PowMod returns base^exp mod Mod by square and multiply, for exp >= 0.
func PowMod(base, exp int) int {
	result := 1
	base = reduce(base)
	for exp > 0 {
		if exp&1 == 1 {
			result = MulMod(result, base)
		}
		base = MulMod(base, base)
		exp >>= 1
	}
	return result
}

func reduce(x int) int {
	r := x % Mod
	if r < 0 {
		r += Mod
	}
	return r
}

func isPowerOfTwo(n int) bool {
	return n > 0 && n&(n-1) == 0
}

func checkLength(n int) error {
	if !isPowerOfTwo(n) {
		return fmt.Errorf("%w: got %d", ErrNotPowerOfTwo, n)
	}
	if n > MaxLength {
		return fmt.Errorf("%w: got %d", ErrTooLong, n)
	}
	return nil
}

// RootOfUnity returns a primitive n-th root of unity modulo Mod, 3^((Mod - 1) / n), or its
// inverse (w^(Mod - 2) by Fermat). n must be a power of two from 1 to 2^23.
func RootOfUnity(n int, inverse bool) (int, error) {
	if err := checkLength(n); err != nil {
		return 0, err
	}
	w := PowMod(PrimitiveRoot, (Mod-1)/n)
	if inverse {
		return PowMod(w, Mod-2), nil
	}
	return w, nil
}

// BitReversePermute swaps a[i] and a[rev(i)], rev(i) being i with its log2(n) bits reversed;
// len(a) must be a power of two (or 0).
func BitReversePermute(a []int) {
	n := len(a)
	for i, j := 1, 0; i < n; i++ {
		bit := n >> 1
		for ; j&bit != 0; bit >>= 1 {
			j ^= bit
		}
		j |= bit
		if i < j {
			a[i], a[j] = a[j], a[i]
		}
	}
}

// NTTInPlace transforms a in place and returns the number of butterflies, (n / 2) * log2(n).
// len(a) must be a power of two from 1 to 2^23 and the entries residues 0..Mod-1. The inverse
// uses the inverse roots, then multiplies by n^-1.
func NTTInPlace(a []int, inverse bool) (int, error) {
	n := len(a)
	if err := checkLength(n); err != nil {
		return 0, err
	}
	BitReversePermute(a)
	butterflies := 0
	for length := 2; length <= n; length <<= 1 {
		wLength, _ := RootOfUnity(length, inverse) // length is a power of two up to n
		half := length / 2
		for start := 0; start < n; start += length { // one block = one recursive FFT call
			w := 1 // wLength^k
			for k := 0; k < half; k++ {
				u := a[start+k]
				t := MulMod(a[start+k+half], w)
				a[start+k] = (u + t) % Mod
				a[start+k+half] = (u + Mod - t) % Mod
				butterflies++
				w = MulMod(w, wLength)
			}
		}
	}
	if inverse {
		nInverse := PowMod(n, Mod-2)
		for i := range a {
			a[i] = MulMod(a[i], nInverse)
		}
	}
	return butterflies, nil
}

// NTT returns the transform of a as a new slice of residues 0..Mod-1:
// X[k] = sum_j a[j] w^(jk) mod Mod. The entries are reduced modulo Mod first. An empty input
// returns an empty slice; a forward transform pads with zeros to the next power of two; the
// inverse needs a power-of-two length (ErrNotPowerOfTwo). More than 2^23 values: ErrTooLong.
func NTT(a []int, inverse bool) ([]int, error) {
	n := len(a)
	if n == 0 {
		return []int{}, nil
	}
	if n > MaxLength {
		return nil, fmt.Errorf("%w: got %d values", ErrTooLong, n)
	}
	if inverse && !isPowerOfTwo(n) {
		return nil, fmt.Errorf("inverse NTT: %w, got %d", ErrNotPowerOfTwo, n)
	}
	size := 1
	for size < n {
		size <<= 1
	}
	values := make([]int, size)
	for i, x := range a {
		values[i] = reduce(x)
	}
	if _, err := NTTInPlace(values, inverse); err != nil {
		return nil, err
	}
	return values, nil
}

// INTT returns the inverse transform: NTT(a, true).
func INTT(a []int) ([]int, error) {
	return NTT(a, true)
}

// MultiplyPolynomials returns the coefficients of p * q modulo Mod, len(p) + len(q) - 1 of
// them (none when that is below 1); an empty slice is the zero polynomial. No rounding: each
// coefficient is exact modulo Mod. More than 2^23 product coefficients: ErrTooLong.
func MultiplyPolynomials(p, q []int) ([]int, error) {
	need := len(p) + len(q) - 1
	if need > MaxLength {
		return nil, fmt.Errorf("%w: the product has %d coefficients", ErrTooLong, need)
	}
	if len(p) == 0 || len(q) == 0 {
		return make([]int, max(0, need)), nil
	}
	n := 1
	for n < need {
		n <<= 1
	}
	fp := make([]int, n)
	fq := make([]int, n)
	for i, x := range p {
		fp[i] = reduce(x)
	}
	for i, x := range q {
		fq[i] = reduce(x)
	}
	// n is a power of two up to MaxLength, so the transforms cannot fail.
	NTTInPlace(fp, false)
	NTTInPlace(fq, false)
	for i := range fp {
		fp[i] = MulMod(fp[i], fq[i])
	}
	NTTInPlace(fp, true)
	return fp[:need], nil
}

// Convolve returns the convolution of two sequences modulo Mod: MultiplyPolynomials.
func Convolve(a, b []int) ([]int, error) {
	return MultiplyPolynomials(a, b)
}

func main() {
	fmt.Printf("Mod = %d = 119 * 2^23 + 1, primitive root %d\n", Mod, PrimitiveRoot)
	w, _ := RootOfUnity(4, false)
	fmt.Printf("RootOfUnity(4) = %d, and w^2 = %d = Mod - 1\n", w, MulMod(w, w))
	spectrum, _ := NTT([]int{1, 2, 3, 4}, false)
	fmt.Println("NTT([1 2 3 4]) =", spectrum)
	back, _ := INTT(spectrum)
	fmt.Println("INTT of that =", back)
	product, _ := MultiplyPolynomials([]int{1, 2, 3}, []int{4, 5})
	fmt.Println("MultiplyPolynomials([1 2 3], [4 5]) =", product)
	signed, _ := MultiplyPolynomials([]int{1, -1}, []int{1, 1})
	fmt.Println("(1 - x)(1 + x) =", signed)
	_, err := INTT([]int{1, 2, 3})
	fmt.Println("INTT([1 2 3]):", err)
}
