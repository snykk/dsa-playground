package main

import "fmt"

// abs returns |x| in integer arithmetic. (math.MinInt64 has no positive
// counterpart and is not supported.)
func abs(x int64) int64 {
	if x < 0 {
		return -x
	}
	return x
}

// GCD computes Greatest Common Divisor using recursive Euclidean Algorithm
// Time Complexity: O(log min(a, b))
// Space Complexity: O(log min(a, b))
func GCD(a, b int64) int64 {
	a = abs(a)
	b = abs(b)

	if b == 0 {
		return a
	}

	return GCD(b, a%b)
}

// GCDIterative computes GCD using iterative Euclidean Algorithm
// Time Complexity: O(log min(a, b))
// Space Complexity: O(1)
func GCDIterative(a, b int64) int64 {
	a = abs(a)
	b = abs(b)

	for b != 0 {
		a, b = b, a%b
	}

	return a
}

// LCM computes Least Common Multiple using GCD
// LCM(a, b) = |a| / GCD(a, b) * |b|
// Dividing before multiplying keeps the intermediate value as small as the
// result. The result itself must still fit in an int64.
// Time Complexity: O(log min(a, b))
// Space Complexity: O(1)
func LCM(a, b int64) int64 {
	if a == 0 || b == 0 {
		return 0
	}

	return abs(a) / GCD(a, b) * abs(b)
}

// ExtendedGCDResult holds the result of Extended Euclidean Algorithm
type ExtendedGCDResult struct {
	GCD int64
	X   int64
	Y   int64
}

// extendedGCDNonNeg is extended Euclid for a, b >= 0.
func extendedGCDNonNeg(a, b int64) ExtendedGCDResult {
	if b == 0 {
		return ExtendedGCDResult{a, 1, 0}
	}

	result := extendedGCDNonNeg(b, a%b)
	return ExtendedGCDResult{result.GCD, result.Y, result.X - (a/b)*result.Y}
}

// ExtendedGCD computes Extended Euclidean Algorithm
// Finds integers x and y such that: a*x + b*y = GCD(a, b), for inputs of any
// sign. It runs on |a| and |b|, then negates x when a is negative and y when
// b is negative.
// Time Complexity: O(log min(a, b))
// Space Complexity: O(log min(a, b))
func ExtendedGCD(a, b int64) ExtendedGCDResult {
	result := extendedGCDNonNeg(abs(a), abs(b))
	if a < 0 {
		result.X = -result.X
	}
	if b < 0 {
		result.Y = -result.Y
	}
	return result
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

	fmt.Println("\nExtended GCD(-48, 18):")
	result = ExtendedGCD(-48, 18)
	fmt.Printf("GCD = %d, x = %d, y = %d\n", result.GCD, result.X, result.Y)
	fmt.Printf("Verification: -48*%d + 18*%d = %d\n", result.X, result.Y, -48*result.X+18*result.Y)
}
