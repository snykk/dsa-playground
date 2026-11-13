package main

import (
	"fmt"
	"math/bits"
)

// Conventions: the modulus must be positive and every result is in
// [0, modulus), also for a negative base. Products use math/bits, so any
// modulus up to math.MaxInt64 is safe.

// floorMod returns the residue of a in [0, m), whatever the sign of a.
func floorMod(a, m int64) int64 {
	r := a % m
	if r < 0 {
		r += m
	}
	return r
}

// mulMod returns (a * b) mod m without overflow, for a, b in [0, m).
func mulMod(a, b, m int64) int64 {
	hi, lo := bits.Mul64(uint64(a), uint64(b))
	return int64(bits.Rem64(hi, lo, uint64(m)))
}

// ModPow computes (base^exponent) mod modulus using binary exponentiation, in
// [0, modulus). A negative exponent means the inverse power,
// base^(-e) = (base^-1)^e; it returns -1 if base has no inverse modulo
// modulus. (math.MinInt64 as exponent is not supported.)
// Time Complexity: O(log |exponent|)
func ModPow(base, exponent, modulus int64) int64 {
	if exponent < 0 {
		inv := ModInverse(base, modulus)
		if inv == -1 {
			return -1
		}
		return ModPow(inv, -exponent, modulus)
	}
	if modulus == 1 {
		return 0
	}

	result := int64(1)
	base = floorMod(base, modulus)

	for exponent > 0 {
		if exponent%2 == 1 {
			result = mulMod(result, base, modulus)
		}
		exponent = exponent >> 1
		base = mulMod(base, base, modulus)
	}

	return result
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
		return -1
	}

	return floorMod(result.X, m)
}

func main() {
	// Example usage
	fmt.Println("Modular Exponentiation Examples:")
	fmt.Printf("2^10 mod 1000 = %d\n", ModPow(2, 10, 1000))
	fmt.Printf("3^5 mod 7 = %d\n", ModPow(3, 5, 7))
	fmt.Printf("5^13 mod 11 = %d\n", ModPow(5, 13, 11))
	fmt.Printf("2^-1 mod 11 = %d\n", ModPow(2, -1, 11))

	fmt.Println("\nModular Inverse:")
	inv := ModInverse(3, 11)
	fmt.Printf("Inverse of 3 mod 11 = %d\n", inv)
	fmt.Printf("Verification: (3 * %d) mod 11 = %d\n", inv, (3*inv)%11)
}
