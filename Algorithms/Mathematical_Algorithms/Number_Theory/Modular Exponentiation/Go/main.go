package main

import (
	"fmt"
	"math"
)

// ModPow computes (base^exponent) mod modulus using binary exponentiation
// Time Complexity: O(log exponent)
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

// ExtendedGCDResult holds the result of Extended Euclidean Algorithm
type ExtendedGCDResult struct {
	GCD int64
	X   int64
	Y   int64
}

func extendedGcd(a, b int64) ExtendedGCDResult {
	a = int64(math.Abs(float64(a)))
	b = int64(math.Abs(float64(b)))

	if b == 0 {
		return ExtendedGCDResult{a, 1, 0}
	}

	result := extendedGcd(b, a%b)
	x := result.Y
	y := result.X - (a/b)*result.Y

	return ExtendedGCDResult{result.GCD, x, y}
}

// ModInverse computes modular multiplicative inverse
// Returns -1 if inverse doesn't exist
// Time Complexity: O(log min(a, m))
func ModInverse(a, m int64) int64 {
	result := extendedGcd(a, m)

	if result.GCD != 1 {
		return -1
	}

	return (result.X%m + m) % m
}

func main() {
	// Example usage
	fmt.Println("Modular Exponentiation Examples:")
	fmt.Printf("2^10 mod 1000 = %d\n", ModPow(2, 10, 1000))
	fmt.Printf("3^5 mod 7 = %d\n", ModPow(3, 5, 7))
	fmt.Printf("5^13 mod 11 = %d\n", ModPow(5, 13, 11))

	fmt.Println("\nModular Inverse:")
	inv := ModInverse(3, 11)
	fmt.Printf("Inverse of 3 mod 11 = %d\n", inv)
	fmt.Printf("Verification: (3 * %d) mod 11 = %d\n", inv, (3*inv)%11)
}
