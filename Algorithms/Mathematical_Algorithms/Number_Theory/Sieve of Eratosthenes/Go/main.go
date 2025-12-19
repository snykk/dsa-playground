package main

import (
	"fmt"
)

// SieveOfEratosthenes finds all prime numbers up to n
// Time Complexity: O(n log log n)
// Space Complexity: O(n)
func SieveOfEratosthenes(n int) []int {
	if n < 2 {
		return []int{}
	}

	// Create boolean array, initially all true
	isPrime := make([]bool, n+1)
	for i := range isPrime {
		isPrime[i] = true
	}
	isPrime[0] = false
	isPrime[1] = false

	// Sieve process
	for i := 2; i*i <= n; i++ {
		if isPrime[i] {
			// Mark multiples of i as composite
			for j := i * i; j <= n; j += i {
				isPrime[j] = false
			}
		}
	}

	// Collect all primes
	var primes []int
	for i := 2; i <= n; i++ {
		if isPrime[i] {
			primes = append(primes, i)
		}
	}

	return primes
}

// SieveBoolean returns boolean array indicating primes up to n
// Time Complexity: O(n log log n)
// Space Complexity: O(n)
func SieveBoolean(n int) []bool {
	if n < 2 {
		return make([]bool, n+1)
	}

	isPrime := make([]bool, n+1)
	for i := range isPrime {
		isPrime[i] = true
	}
	isPrime[0] = false
	isPrime[1] = false

	for i := 2; i*i <= n; i++ {
		if isPrime[i] {
			for j := i * i; j <= n; j += i {
				isPrime[j] = false
			}
		}
	}

	return isPrime
}

// IsPrimeSieve checks if n is prime using precomputed sieve
// Time Complexity: O(1)
func IsPrimeSieve(n int, sieve []bool) bool {
	if n < len(sieve) {
		return sieve[n]
	}
	return false
}

func main() {
	// Example usage
	fmt.Println("Sieve of Eratosthenes Examples:")
	primes := SieveOfEratosthenes(30)
	fmt.Printf("Primes up to 30: %v\n", primes)

	fmt.Printf("\nNumber of primes up to 100: %d\n", len(SieveOfEratosthenes(100)))

	// Using boolean array
	sieve := SieveBoolean(100)
	fmt.Printf("\nIs 17 prime? %t\n", sieve[17])
	fmt.Printf("Is 20 prime? %t\n", sieve[20])
}
