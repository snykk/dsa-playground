// Euler's Totient (Go)
//
// phi(n) counts the integers k with 1 <= k <= n and gcd(k, n) = 1. With the prime
// factorization n = p1^k1 * ... * pr^kr it is n * (1 - 1/p1) * ... * (1 - 1/pr).
//
//   - PrimeFactors and Phi: trial division in O(sqrt n), for any n from 1 to 2^64 - 1. The
//     loop test is p <= n/p, not p*p <= n: p*p wraps around once p reaches 2^32.
//   - LinearSieve: phi, the smallest prime factor and the primes for every number up to n, in
//     O(n). Each composite is crossed out exactly once, by its smallest prime factor, and
//     Crossings counts it.
//   - ModInverseEuler: a^(phi(n) - 1) mod n, the inverse that Euler's theorem gives. Products
//     of two residues go through MulMod (bits.Mul64 and bits.Rem64), so every modulus up to
//     2^64 - 1 is safe.
//
// Invalid input returns an error wrapping ErrZero (n = 0: phi(0) is undefined),
// ErrNegativeLimit or ErrNotCoprime.
package main

import (
	"errors"
	"fmt"
	"math"
	"math/bits"
)

var (
	// ErrZero is returned for n = 0: phi(0) is undefined.
	ErrZero = errors.New("phi(0) is undefined: n must be at least 1")
	// ErrNegativeLimit is returned by LinearSieve for a negative limit.
	ErrNegativeLimit = errors.New("the sieve limit must not be negative")
	// ErrNotCoprime is returned by ModInverseEuler when gcd(a, n) != 1: no inverse exists.
	ErrNotCoprime = errors.New("a and n are not coprime")
)

// Factor is one prime factor and its exponent.
type Factor struct {
	Prime uint64
	Exp   int
}

// PrimeFactors returns the prime factorization of n >= 1 by trial division, primes
// increasing; PrimeFactors(1) is empty. Time: O(sqrt n).
func PrimeFactors(n uint64) ([]Factor, error) {
	if n == 0 {
		return nil, ErrZero
	}
	factors := []Factor{}
	// p <= n/p means p*p <= n, but cannot overflow: p*p wraps once p reaches 2^32.
	for p := uint64(2); p <= n/p; p++ {
		k := 0
		for n%p == 0 {
			n /= p
			k++
		}
		if k > 0 {
			factors = append(factors, Factor{p, k})
		}
	}
	if n > 1 {
		factors = append(factors, Factor{n, 1}) // one prime above the square root is left
	}
	return factors, nil
}

// Phi returns Euler's totient of n >= 1: the product formula over the prime factors.
// Time: O(sqrt n).
func Phi(n uint64) (uint64, error) {
	factors, err := PrimeFactors(n)
	if err != nil {
		return 0, err
	}
	result := n
	for _, f := range factors {
		result -= result / f.Prime // result * (1 - 1/p), exact: p still divides result
	}
	return result, nil
}

// TotientSieve holds the tables of LinearSieve(n).
type TotientSieve struct {
	Phi       []int // Phi[i] for i >= 1; Phi[0] = 0 stands for "undefined"
	SPF       []int // smallest prime factor of i >= 2; SPF[0] = SPF[1] = 0
	Primes    []int // the primes up to n, increasing
	Crossings int   // numbers crossed out: once per composite
}

// LinearSieve returns phi, spf and the primes for 0..n in O(n). i crosses out i*p for the
// primes p up to SPF[i], so every composite m is crossed out once, by i = m/spf(m) and
// p = spf(m).
func LinearSieve(n int) (TotientSieve, error) {
	if n < 0 {
		return TotientSieve{}, fmt.Errorf("%w: got %d", ErrNegativeLimit, n)
	}
	t := TotientSieve{Phi: make([]int, n+1), SPF: make([]int, n+1), Primes: []int{}}
	if n >= 1 {
		t.Phi[1] = 1
	}
	for i := 2; i <= n; i++ {
		if t.SPF[i] == 0 { // nothing crossed i out: i is prime
			t.SPF[i] = i
			t.Phi[i] = i - 1
			t.Primes = append(t.Primes, i)
		}
		for _, p := range t.Primes {
			// p > n/i is i*p > n, written the same way as in C++, where i*p can overflow.
			if p > t.SPF[i] || p > n/i {
				break
			}
			m := i * p
			t.SPF[m] = p
			if p == t.SPF[i] { // p divides i: phi(p^(k+1) r) = p phi(p^k r)
				t.Phi[m] = t.Phi[i] * p
			} else { // gcd(i, p) = 1: phi is multiplicative and phi(p) = p - 1
				t.Phi[m] = t.Phi[i] * (p - 1)
			}
			t.Crossings++
		}
	}
	return t, nil
}

// MulMod returns a*b mod m for any 64-bit values, m >= 1: the 128-bit product comes from
// bits.Mul64 and its remainder from bits.Rem64.
func MulMod(a, b, m uint64) uint64 {
	hi, lo := bits.Mul64(a, b)
	return bits.Rem64(hi, lo, m)
}

// PowMod returns base^exp mod m for m >= 1 by square and multiply: O(log exp).
func PowMod(base, exp, m uint64) uint64 {
	result := 1 % m
	base %= m
	for exp > 0 {
		if exp&1 == 1 {
			result = MulMod(result, base, m)
		}
		base = MulMod(base, base, m)
		exp >>= 1
	}
	return result
}

func gcd(a, b uint64) uint64 {
	for b != 0 {
		a, b = b, a%b
	}
	return a
}

// ModInverseEuler returns the inverse of a modulo n by Euler's theorem, a^(phi(n) - 1) mod n,
// in 0..n-1 (0 for n = 1). It fails with ErrZero for n = 0 and ErrNotCoprime when
// gcd(a, n) != 1.
func ModInverseEuler(a, n uint64) (uint64, error) {
	if n == 0 {
		return 0, ErrZero
	}
	r := a % n
	if g := gcd(r, n); g != 1 {
		return 0, fmt.Errorf("%d has no inverse modulo %d: gcd(%d, %d) = %d: %w", a, n, a, n, g, ErrNotCoprime)
	}
	f, _ := Phi(n) // n >= 1 here, so no error
	return PowMod(r, f-1, n), nil
}

func main() {
	fmt.Print("Phi(n) for n = 1..12:")
	for n := uint64(1); n <= 12; n++ {
		f, _ := Phi(n)
		fmt.Print(" ", f)
	}
	factors, _ := PrimeFactors(360)
	f360, _ := Phi(360)
	fmt.Printf("\nPrimeFactors(360) = %v  Phi(360) = %d\n", factors, f360)
	big, _ := Phi(math.MaxUint64)
	fmt.Printf("Phi(2^64 - 1) = %d\n", big)
	t, _ := LinearSieve(30)
	fmt.Printf("LinearSieve(30).Phi = %v\n", t.Phi)
	fmt.Printf("%d primes, %d crossings (one per composite)\n", len(t.Primes), t.Crossings)
	inv, _ := ModInverseEuler(7, 360)
	fmt.Printf("ModInverseEuler(7, 360) = %d\n", inv)
	_, err := ModInverseEuler(6, 9)
	fmt.Println("ModInverseEuler(6, 9):", err)
}
