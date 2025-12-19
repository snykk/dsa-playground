package main

import (
	"fmt"
	"math"
)

// GCD computes Greatest Common Divisor using recursive Euclidean Algorithm
// Time Complexity: O(log min(a, b))
// Space Complexity: O(log min(a, b))
func GCD(a, b int64) int64 {
	a = int64(math.Abs(float64(a)))
	b = int64(math.Abs(float64(b)))

	if b == 0 {
		return a
	}

	return GCD(b, a%b)
}

// GCDIterative computes GCD using iterative Euclidean Algorithm
// Time Complexity: O(log min(a, b))
// Space Complexity: O(1)
func GCDIterative(a, b int64) int64 {
	a = int64(math.Abs(float64(a)))
	b = int64(math.Abs(float64(b)))

	for b != 0 {
		a, b = b, a%b
	}

	return a
}

// LCM computes Least Common Multiple using GCD
// LCM(a, b) = |a * b| / GCD(a, b)
// Time Complexity: O(log min(a, b))
// Space Complexity: O(1)
func LCM(a, b int64) int64 {
	if a == 0 || b == 0 {
		return 0
	}

	return int64(math.Abs(float64(a*b))) / GCD(a, b)
}

// ExtendedGCDResult holds the result of Extended Euclidean Algorithm
type ExtendedGCDResult struct {
	GCD int64
	X   int64
	Y   int64
}

// ExtendedGCD computes Extended Euclidean Algorithm
// Finds integers x and y such that: ax + by = GCD(a, b)
// Time Complexity: O(log min(a, b))
// Space Complexity: O(log min(a, b))
func ExtendedGCD(a, b int64) ExtendedGCDResult {
	a = int64(math.Abs(float64(a)))
	b = int64(math.Abs(float64(b)))

	if b == 0 {
		return ExtendedGCDResult{a, 1, 0}
	}

	result := ExtendedGCD(b, a%b)
	x := result.Y
	y := result.X - (a/b)*result.Y

	return ExtendedGCDResult{result.GCD, x, y}
}

func main() {
	// Example usage
	fmt.Println("Euclidean Algorithm Examples:")
	fmt.Printf("GCD(48, 18) = %d\n", GCD(48, 18))
	fmt.Printf("GCD(100, 25) = %d\n", GCD(100, 25))
	fmt.Printf("GCD(17, 13) = %d\n", GCD(17, 13))

	fmt.Printf("\nLCM(12, 18) = %d\n", LCM(12, 18))
	fmt.Printf("LCM(7, 5) = %d\n", LCM(7, 5))

	fmt.Println("\nExtended GCD(48, 18):")
	result := ExtendedGCD(48, 18)
	fmt.Printf("GCD = %d, x = %d, y = %d\n", result.GCD, result.X, result.Y)
	fmt.Printf("Verification: 48*%d + 18*%d = %d\n", result.X, result.Y, 48*result.X+18*result.Y)
}
