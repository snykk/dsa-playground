// Modular Arithmetic Tricks for Competitive Programming (Go)

package main

import "fmt"

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

func mul(a, b, m int64) int64 {
	return mod(mod(a, m)*mod(b, m), m)
}

// Fast Exponentiation

func power(base, exp, m int64) int64 {
	result := int64(1)
	base = base % m
	for exp > 0 {
		if exp&1 == 1 {
			result = result * base % m
		}
		base = base * base % m
		exp >>= 1
	}
	return result
}

// Modular Inverse

func modInverse(a, m int64) int64 {
	return power(a, m-2, m)
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
		f.fact[i] = f.fact[i-1] * int64(i) % m
	}
	f.invFact[n] = power(f.fact[n], m-2, m)
	for i := n - 1; i >= 0; i-- {
		f.invFact[i] = f.invFact[i+1] * int64(i+1) % m
	}
	return f
}

func (f *Factorials) NCr(n, r int) int64 {
	if r < 0 || r > n {
		return 0
	}
	return f.fact[n] * f.invFact[r] % f.mod * f.invFact[n-r] % f.mod
}

func (f *Factorials) NPr(n, r int) int64 {
	if r < 0 || r > n {
		return 0
	}
	return f.fact[n] * f.invFact[n-r] % f.mod
}

func main() {
	fact := NewFactorials(1000, MOD)
	fmt.Printf("5! mod MOD = %d\n", fact.fact[5])
	fmt.Printf("C(10, 3) = %d\n", fact.NCr(10, 3))
	fmt.Printf("P(10, 3) = %d\n", fact.NPr(10, 3))
	fmt.Printf("2^10 mod MOD = %d\n", power(2, 10, MOD))
	fmt.Printf("Inverse of 3 = %d\n", modInverse(3, MOD))
}
