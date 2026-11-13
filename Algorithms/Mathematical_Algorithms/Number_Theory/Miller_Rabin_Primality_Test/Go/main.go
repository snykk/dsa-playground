package main

import (
	"fmt"
	"math/bits"
	"math/rand"
)

// Miller-Rabin primality test.
//
// Every product of two residues goes through mulMod (math/bits), so the test
// is correct for the whole 64-bit range. The int64 functions accept n up to
// 2^63 - 1 (negative n is not prime); MillerRabinDeterministicU64 takes the
// full unsigned range up to 2^64 - 1.

// mulMod returns (a * b) mod m without overflow, for m > 0.
func mulMod(a, b, m uint64) uint64 {
	hi, lo := bits.Mul64(a, b)
	return bits.Rem64(hi, lo, m)
}

func powModU64(base, exponent, modulus uint64) uint64 {
	if modulus == 1 {
		return 0
	}

	result := uint64(1)
	base %= modulus

	for exponent > 0 {
		if exponent&1 == 1 {
			result = mulMod(result, base, modulus)
		}
		exponent >>= 1
		base = mulMod(base, base, modulus)
	}

	return result
}

// ModPow computes (base^exponent) mod modulus using binary exponentiation,
// for modulus > 0 and exponent >= 0. A negative base is reduced into
// [0, modulus) first; a negative exponent is treated as 0.
func ModPow(base, exponent, modulus int64) int64 {
	if modulus == 1 {
		return 0
	}
	b := base % modulus
	if b < 0 {
		b += modulus
	}
	var e uint64
	if exponent > 0 {
		e = uint64(exponent)
	}
	return int64(powModU64(uint64(b), e, uint64(modulus)))
}

// isWitness runs one Miller-Rabin round for an odd n > 2 with
// n - 1 = d * 2^r and 2 <= a <= n - 2. It returns true when a proves n composite.
func isWitness(a, n, d uint64, r int) bool {
	x := powModU64(a, d, n)
	if x == 1 || x == n-1 {
		return false
	}
	for i := 0; i < r-1; i++ {
		x = mulMod(x, x, n)
		if x == n-1 {
			return false
		}
	}
	return true
}

// decompose writes n - 1 as d * 2^r with d odd.
func decompose(n uint64) (d uint64, r int) {
	d = n - 1
	for d%2 == 0 {
		d /= 2
		r++
	}
	return d, r
}

// MillerRabin performs the Miller-Rabin primality test with k random
// witnesses drawn uniformly from [2, n-2] (math/rand, which Go seeds
// randomly at start-up). A composite n passes with probability at most 4^-k.
// Time Complexity: O(k log^3 n)
func MillerRabin(n int64, k int) bool {
	if n < 2 {
		return false
	}
	if n == 2 || n == 3 {
		return true
	}
	if n%2 == 0 {
		return false
	}

	d, r := decompose(uint64(n))

	for i := 0; i < k; i++ {
		a := uint64(rand.Int63n(n-3) + 2)
		if isWitness(a, uint64(n), d, r) {
			return false // Composite
		}
	}

	return true // Probably prime
}

// IsPrimeMillerRabin checks if n is prime using Miller-Rabin test
func IsPrimeMillerRabin(n int64, k int) bool {
	if n < 2 {
		return false
	}
	if n == 2 {
		return true
	}
	if n%2 == 0 {
		return false
	}

	return MillerRabin(n, k)
}

// MillerRabinDeterministicU64 is deterministic Miller-Rabin for every n in
// [0, 2^64 - 1]. The first twelve primes (2..37) as witnesses are exact for
// all n < 318,665,857,834,031,151,167,461, which covers the whole 64-bit range.
func MillerRabinDeterministicU64(n uint64) bool {
	if n < 2 {
		return false
	}
	if n == 2 || n == 3 {
		return true
	}
	if n%2 == 0 {
		return false
	}

	bases := []uint64{2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37}

	d, r := decompose(n)

	for _, a := range bases {
		if a >= n {
			continue
		}
		if isWitness(a, n, d, r) {
			return false
		}
	}

	return true
}

// MillerRabinDeterministic is deterministic Miller-Rabin for every int64 n
// (negative n is not prime).
func MillerRabinDeterministic(n int64) bool {
	return n >= 0 && MillerRabinDeterministicU64(uint64(n))
}

func main() {
	// Example usage
	fmt.Println("Miller-Rabin Primality Test Examples:")

	testNumbers := []int64{2, 3, 17, 97, 100, 101, 561, 1105}

	for _, n := range testNumbers {
		result := IsPrimeMillerRabin(n, 10)
		status := "probably prime"
		if !result {
			status = "composite"
		}
		fmt.Printf("%d is %s\n", n, status)
	}

	fmt.Println("\nDeterministic Miller-Rabin (exact for n < 2^64):")
	for _, n := range testNumbers {
		result := MillerRabinDeterministic(n)
		status := "prime"
		if !result {
			status = "composite"
		}
		fmt.Printf("%d is %s\n", n, status)
	}
}
