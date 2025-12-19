package main

import (
	"fmt"
	"math/rand"
	"time"
)

// ModPow computes (base^exponent) mod modulus using binary exponentiation
func ModPow(base, exponent, modulus int64) int64 {
	if modulus == 1 {
		return 0
	}

	result := int64(1)
	base = base % modulus

	for exponent > 0 {
		if exponent%2 == 1 {
			result = (result * base) % modulus
		}
		exponent = exponent >> 1
		base = (base * base) % modulus
	}

	return result
}

// MillerRabin performs Miller-Rabin primality test
// Time Complexity: O(k log³ n)
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

	// Write n-1 as d * 2^r
	d := n - 1
	r := 0
	for d%2 == 0 {
		d /= 2
		r++
	}

	// Witness loop
	rand.Seed(time.Now().UnixNano())
	for i := 0; i < k; i++ {
		a := int64(2 + rand.Intn(int(n-3)))
		x := ModPow(a, d, n)

		if x == 1 || x == n-1 {
			continue
		}

		composite := true
		for j := 0; j < r-1; j++ {
			x = ModPow(x, 2, n)
			if x == n-1 {
				composite = false
				break
			}
		}

		if composite {
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

// MillerRabinDeterministic performs deterministic Miller-Rabin for n < 2^64
// Uses specific bases that are known to work for all numbers < 2^64
func MillerRabinDeterministic(n int64) bool {
	if n < 2 {
		return false
	}
	if n == 2 || n == 3 {
		return true
	}
	if n%2 == 0 {
		return false
	}

	// Bases for deterministic test (for n < 2^64)
	bases := []int64{2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37}

	// Write n-1 as d * 2^r
	d := n - 1
	r := 0
	for d%2 == 0 {
		d /= 2
		r++
	}

	for _, a := range bases {
		if a >= n {
			continue
		}

		x := ModPow(a, d, n)
		if x == 1 || x == n-1 {
			continue
		}

		composite := true
		for i := 0; i < r-1; i++ {
			x = ModPow(x, 2, n)
			if x == n-1 {
				composite = false
				break
			}
		}

		if composite {
			return false
		}
	}

	return true
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

	fmt.Println("\nDeterministic Miller-Rabin (for n < 2^64):")
	for _, n := range testNumbers {
		result := MillerRabinDeterministic(n)
		status := "prime"
		if !result {
			status = "composite"
		}
		fmt.Printf("%d is %s\n", n, status)
	}
}
