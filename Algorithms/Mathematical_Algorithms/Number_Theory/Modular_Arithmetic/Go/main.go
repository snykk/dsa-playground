package main

import (
	"fmt"
	"math/bits"
)

// Conventions: the modulus m must be positive, every result is in [0, m)
// (also for negative operands), and no function overflows for any m up to
// math.MaxInt64: sums use a subtract-first comparison and products use
// math/bits. ModInverse and ModDivide return -1 when the inverse does not
// exist.

// floorMod returns the residue of a in [0, m), whatever the sign of a.
func floorMod(a, m int64) int64 {
	r := a % m
	if r < 0 {
		r += m
	}
	return r
}

// ModAdd computes (a + b) mod m, in [0, m)
// Time Complexity: O(1)
func ModAdd(a, b, m int64) int64 {
	x, y := floorMod(a, m), floorMod(b, m)
	// x + y can exceed MaxInt64 when m > 2^62, so compare against m - y.
	if x >= m-y {
		return x - (m - y)
	}
	return x + y
}

// ModSubtract computes (a - b) mod m, in [0, m)
// Time Complexity: O(1)
func ModSubtract(a, b, m int64) int64 {
	x, y := floorMod(a, m), floorMod(b, m)
	if x >= y {
		return x - y
	}
	return x + (m - y)
}

// ModMultiply computes (a * b) mod m, in [0, m). The 128-bit product comes
// from bits.Mul64 and the remainder from bits.Rem64.
// Time Complexity: O(1)
func ModMultiply(a, b, m int64) int64 {
	hi, lo := bits.Mul64(uint64(floorMod(a, m)), uint64(floorMod(b, m)))
	return int64(bits.Rem64(hi, lo, uint64(m)))
}

// ExtendedGCDResult holds the result of Extended Euclidean Algorithm
type ExtendedGCDResult struct {
	GCD int64
	X   int64
	Y   int64
}

// extendedGcdNonNeg is extended Euclid for a, b >= 0.
func extendedGcdNonNeg(a, b int64) ExtendedGCDResult {
	if b == 0 {
		return ExtendedGCDResult{a, 1, 0}
	}

	result := extendedGcdNonNeg(b, a%b)
	return ExtendedGCDResult{result.GCD, result.Y, result.X - (a/b)*result.Y}
}

// extendedGcd returns g, x, y with a*x + b*y = g = gcd(a, b) >= 0, for inputs
// of any sign: it runs on |a| and |b|, then negates x when a < 0 and y when
// b < 0. (math.MinInt64 is not supported.)
func extendedGcd(a, b int64) ExtendedGCDResult {
	absA, absB := a, b
	if absA < 0 {
		absA = -absA
	}
	if absB < 0 {
		absB = -absB
	}
	result := extendedGcdNonNeg(absA, absB)
	if a < 0 {
		result.X = -result.X
	}
	if b < 0 {
		result.Y = -result.Y
	}
	return result
}

// ModInverse computes modular multiplicative inverse, in [0, m)
// Returns -1 if inverse doesn't exist
// Time Complexity: O(log min(a, m))
func ModInverse(a, m int64) int64 {
	result := extendedGcd(a, m)

	if result.GCD != 1 {
		return -1 // Inverse doesn't exist
	}

	return floorMod(result.X, m)
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

// ModPower computes (base^exponent) mod m using binary exponentiation, in
// [0, m). A negative exponent means the inverse power,
// base^(-e) = (base^-1)^e; it returns -1 if base has no inverse modulo m.
// (math.MinInt64 as exponent is not supported.)
// Time Complexity: O(log |exponent|)
func ModPower(base, exponent, m int64) int64 {
	if exponent < 0 {
		inv := ModInverse(base, m)
		if inv == -1 {
			return -1
		}
		return ModPower(inv, -exponent, m)
	}
	if m == 1 {
		return 0
	}

	result := int64(1)
	base = floorMod(base, m)

	for exponent > 0 {
		if exponent%2 == 1 {
			result = ModMultiply(result, base, m)
		}
		exponent = exponent >> 1
		base = ModMultiply(base, base, m)
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
	fmt.Printf("Inverse of -3 mod 11 = %d\n", ModInverse(-3, m))
}
