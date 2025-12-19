package main

import (
	"fmt"
	"math"
)

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
func ModInverse(a, m int64) int64 {
	result := extendedGcd(a, m)

	if result.GCD != 1 {
		return -1
	}

	return (result.X%m + m) % m
}

// ModPow computes (base^exponent) mod modulus
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

// ChineseRemainderTheorem solves system of congruences
// Time Complexity: O(n log max(moduli))
func ChineseRemainderTheorem(remainders, moduli []int64) int64 {
	n := len(remainders)
	if n != len(moduli) {
		return -1
	}

	// Check if moduli are pairwise coprime
	for i := 0; i < n; i++ {
		for j := i + 1; j < n; j++ {
			result := extendedGcd(moduli[i], moduli[j])
			if result.GCD != 1 {
				return -1 // Not pairwise coprime
			}
		}
	}

	// Compute product of all moduli
	M := int64(1)
	for _, m := range moduli {
		M *= m
	}

	// Compute solution
	x := int64(0)
	for i := 0; i < n; i++ {
		Mi := M / moduli[i]
		MiInv := ModInverse(Mi, moduli[i])
		if MiInv == -1 {
			return -1
		}
		x = (x + remainders[i]*Mi%M*MiInv%M) % M
	}

	return x
}

// ChineseRemainderTheoremPairwise solves system of two congruences
func ChineseRemainderTheoremPairwise(a1, m1, a2, m2 int64) int64 {
	result := extendedGcd(m1, m2)
	if result.GCD != 1 {
		return -1 // Not coprime
	}

	M := m1 * m2
	m2Inv := ModInverse(m2, m1)
	m1Inv := ModInverse(m1, m2)

	if m2Inv == -1 || m1Inv == -1 {
		return -1
	}

	x := (a1*m2%M*m2Inv%M + a2*m1%M*m1Inv%M) % M
	return x
}

// VerifyCrtSolution verifies that x satisfies all congruences
func VerifyCrtSolution(x int64, remainders, moduli []int64) bool {
	for i := 0; i < len(remainders); i++ {
		if x%moduli[i] != remainders[i] {
			return false
		}
	}
	return true
}

func main() {
	// Example usage
	fmt.Println("Chinese Remainder Theorem Examples:")

	// Example 1: x ≡ 2 (mod 3), x ≡ 3 (mod 5), x ≡ 2 (mod 7)
	remainders := []int64{2, 3, 2}
	moduli := []int64{3, 5, 7}
	solution := ChineseRemainderTheorem(remainders, moduli)
	fmt.Printf("x ≡ %v (mod %v)\n", remainders, moduli)
	fmt.Printf("Solution: x = %d\n", solution)
	fmt.Printf("Verification: %t\n", VerifyCrtSolution(solution, remainders, moduli))

	// Example 2: x ≡ 1 (mod 3), x ≡ 2 (mod 5)
	fmt.Println("\nPairwise CRT:")
	x := ChineseRemainderTheoremPairwise(1, 3, 2, 5)
	fmt.Printf("x ≡ 1 (mod 3), x ≡ 2 (mod 5)\n")
	fmt.Printf("Solution: x = %d\n", x)
}
