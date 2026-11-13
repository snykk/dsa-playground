// Modular Arithmetic Tricks for Competitive Programming (Go)

package main

import (
	"fmt"
	"math/bits"
)

const MOD = 1_000_000_007

// Basic Operations

func mod(x, m int64) int64 {
	return ((x % m) + m) % m
}

func add(a, b, m int64) int64 {
	return mod(mod(a, m)+mod(b, m), m)
}

func sub(a, b, m int64) int64 {
	return mod(mod(a, m)-mod(b, m)+m, m)
}

// mul returns a*b mod m through a 128-bit product (math/bits), so it is exact
// for any modulus below 2^62 (a plain int64 product overflows once m exceeds
// about 3e9; mod itself needs 2*m to fit in an int64).
func mul(a, b, m int64) int64 {
	hi, lo := bits.Mul64(uint64(mod(a, m)), uint64(mod(b, m)))
	return int64(bits.Rem64(hi, lo, uint64(m)))
}

// Fast Exponentiation

// power returns base^exp mod m. It returns 1 % m, so power(x, 0, 1) is 0.
func power(base, exp, m int64) int64 {
	result := 1 % m
	base = mod(base, m)
	for exp > 0 {
		if exp&1 == 1 {
			result = mul(result, base, m)
		}
		base = mul(base, base, m)
		exp >>= 1
	}
	return result
}

// Modular Inverse

// modInverse uses Fermat's little theorem: m must be prime and a must not be a
// multiple of m. Use modInverseExtGCD for composite moduli.
func modInverse(a, m int64) int64 {
	return power(a, m-2, m)
}

// divMod returns a / b mod m (m prime, b not a multiple of m).
func divMod(a, b, m int64) int64 {
	return mul(a, modInverse(b, m), m)
}

func extGCD(a, b int64) (int64, int64, int64) {
	if b == 0 {
		return a, 1, 0
	}
	g, x1, y1 := extGCD(b, a%b)
	x := y1
	y := x1 - (a/b)*y1
	return g, x, y
}

func modInverseExtGCD(a, m int64) int64 {
	g, x, _ := extGCD(a, m)
	if g != 1 {
		return -1
	}
	return mod(x, m)
}

// Factorials

type Factorials struct {
	fact    []int64
	invFact []int64
	mod     int64
}

func NewFactorials(n int, m int64) *Factorials {
	f := &Factorials{
		fact:    make([]int64, n+1),
		invFact: make([]int64, n+1),
		mod:     m,
	}
	f.fact[0] = 1
	for i := 1; i <= n; i++ {
		f.fact[i] = mul(f.fact[i-1], int64(i), m)
	}
	f.invFact[n] = power(f.fact[n], m-2, m)
	for i := n - 1; i >= 0; i-- {
		f.invFact[i] = mul(f.invFact[i+1], int64(i+1), m)
	}
	return f
}

func (f *Factorials) NCr(n, r int) int64 {
	if r < 0 || r > n {
		return 0
	}
	return mul(mul(f.fact[n], f.invFact[r], f.mod), f.invFact[n-r], f.mod)
}

func (f *Factorials) NPr(n, r int) int64 {
	if r < 0 || r > n {
		return 0
	}
	return mul(f.fact[n], f.invFact[n-r], f.mod)
}

// lucasNCr returns C(n, r) mod p for a prime p and large n (Lucas' theorem).
// The small binomials C(n % p, r % p) are computed modulo p directly, so the
// factorial tables (built for another modulus) are not involved. The cost is
// O(p) per base-p digit of n, so it suits p up to about 1e6.
func lucasNCr(n, r, p int64) int64 {
	if r < 0 || r > n {
		return 0
	}
	if r == 0 {
		return 1
	}
	return mul(lucasNCr(n/p, r/p, p), smallNCrModP(n%p, r%p, p), p)
}

func smallNCrModP(n, r, p int64) int64 {
	if r < 0 || r > n {
		return 0
	}
	if r > n-r {
		r = n - r
	}
	num, den := int64(1)%p, int64(1)%p
	for i := int64(1); i <= r; i++ {
		num = mul(num, n-r+i, p)
		den = mul(den, i, p)
	}
	return mul(num, power(den, p-2, p), p)
}

func main() {
	fact := NewFactorials(1000, MOD)
	fmt.Printf("5! mod MOD = %d\n", fact.fact[5])
	fmt.Printf("C(10, 3) = %d\n", fact.NCr(10, 3))
	fmt.Printf("P(10, 3) = %d\n", fact.NPr(10, 3))
	fmt.Printf("2^10 mod MOD = %d\n", power(2, 10, MOD))
	fmt.Printf("Inverse of 3 = %d\n", modInverse(3, MOD))
}
