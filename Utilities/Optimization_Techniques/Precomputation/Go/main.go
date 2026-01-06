// Precomputation Techniques for Competitive Programming (Go)

package main

import "fmt"

const MOD = 1_000_000_007
const MAXN = 200005

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

func power(base, exp, mod int64) int64 {
	result := int64(1)
	for exp > 0 {
		if exp&1 == 1 {
			result = result * base % mod
		}
		base = base * base % mod
		exp >>= 1
	}
	return result
}

func (f *Factorials) NCr(n, r int) int64 {
	if r < 0 || r > n {
		return 0
	}
	return f.fact[n] * f.invFact[r] % f.mod * f.invFact[n-r] % f.mod
}

// Prime Sieve

func Sieve(n int) ([]int, []bool) {
	isPrime := make([]bool, n+1)
	for i := range isPrime {
		isPrime[i] = true
	}
	isPrime[0], isPrime[1] = false, false

	for i := 2; i*i <= n; i++ {
		if isPrime[i] {
			for j := i * i; j <= n; j += i {
				isPrime[j] = false
			}
		}
	}

	var primes []int
	for i := 2; i <= n; i++ {
		if isPrime[i] {
			primes = append(primes, i)
		}
	}
	return primes, isPrime
}

// Smallest Prime Factor

func ComputeSPF(n int) []int {
	spf := make([]int, n+1)
	for i := range spf {
		spf[i] = i
	}

	for i := 2; i*i <= n; i++ {
		if spf[i] == i {
			for j := i * i; j <= n; j += i {
				if spf[j] == j {
					spf[j] = i
				}
			}
		}
	}
	return spf
}

// Prefix Sum

type PrefixSum struct {
	prefix []int
}

func NewPrefixSum(arr []int) *PrefixSum {
	n := len(arr)
	prefix := make([]int, n+1)
	for i := 0; i < n; i++ {
		prefix[i+1] = prefix[i] + arr[i]
	}
	return &PrefixSum{prefix: prefix}
}

func (ps *PrefixSum) Query(l, r int) int {
	return ps.prefix[r+1] - ps.prefix[l]
}

func main() {
	fact := NewFactorials(10, MOD)
	fmt.Printf("C(10, 3) = %d\n", fact.NCr(10, 3))

	primes, _ := Sieve(100)
	fmt.Printf("Primes up to 100: %d\n", len(primes))
}
