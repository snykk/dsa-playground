package main

import (
	"fmt"
	"math"
)

// ModAdd computes (a + b) mod m
// Time Complexity: O(1)
func ModAdd(a, b, m int64) int64 {
	return ((a % m) + (b % m)) % m
}

// ModSubtract computes (a - b) mod m (always non-negative)
// Time Complexity: O(1)
func ModSubtract(a, b, m int64) int64 {
	result := ((a % m) - (b % m)) % m
	return (result + m) % m
}

// ModMultiply computes (a * b) mod m
// Time Complexity: O(1)
func ModMultiply(a, b, m int64) int64 {
	return ((a % m) * (b % m)) % m
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
		return -1 // Inverse doesn't exist
	}

	return (result.X%m + m) % m
}

// ModDivide computes (a / b) mod m using modular inverse
// Returns -1 if inverse doesn't exist
// Time Complexity: O(log min(b, m))
func ModDivide(a, b, m int64) int64 {
	inv := ModInverse(b, m)
	if inv == -1 {
		return -1 // Inverse doesn't exist
	}

	return ModMultiply(a, inv, m)
}

// ModPower computes (base^exponent) mod m using binary exponentiation
// Time Complexity: O(log exponent)
func ModPower(base, exponent, m int64) int64 {
	if m == 1 {
		return 0
	}

	result := int64(1)
	base = base % m

	for exponent > 0 {
		if exponent%2 == 1 {
			result = (result * base) % m
		}
		exponent = exponent >> 1
		base = (base * base) % m
	}

	return result
}

func main() {
	// Example usage
	m := int64(11)

	fmt.Println("Modular Arithmetic Examples (mod 11):")
	fmt.Printf("(7 + 5) mod 11 = %d\n", ModAdd(7, 5, m))
	fmt.Printf("(7 - 5) mod 11 = %d\n", ModSubtract(7, 5, m))
	fmt.Printf("(7 * 5) mod 11 = %d\n", ModMultiply(7, 5, m))
	fmt.Printf("(7 / 5) mod 11 = %d\n", ModDivide(7, 5, m))
	fmt.Printf("(2^5) mod 11 = %d\n", ModPower(2, 5, m))

	fmt.Println("\nModular Inverse:")
	inv := ModInverse(3, m)
	fmt.Printf("Inverse of 3 mod 11 = %d\n", inv)
	fmt.Printf("Verification: (3 * %d) mod 11 = %d\n", inv, (3*inv)%m)
}
