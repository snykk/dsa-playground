package main

import (
	"fmt"
	"math"
	"math/bits"
)

// Chinese Remainder Theorem: solves x = r_i (mod m_i) for all i. With pairwise
// coprime moduli the solution is unique modulo their product. Moduli that are
// not coprime are accepted too: the congruences are merged one at a time and
// -1 is returned only when two of them contradict each other.
//
// Every product of two residues goes through mulMod (math/bits), so moduli up
// to math.MaxInt64 are safe. The combined modulus lcm(m_1..m_n) must itself
// fit in an int64, otherwise the functions return -1.

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
// of any sign: it runs on |a| and |b|, then flips x (or y) when a (or b) is
// negative. (math.MinInt64 has no positive counterpart and is not supported.)
func extendedGcd(a, b int64) ExtendedGCDResult {
	absA, absB := a, b
	if absA < 0 {
		absA = -absA
	}
	if absB < 0 {
		absB = -absB
	}
	r := extendedGcdNonNeg(absA, absB)
	if a < 0 {
		r.X = -r.X
	}
	if b < 0 {
		r.Y = -r.Y
	}
	return r
}

// floorMod returns the residue of a in [0, m) for m > 0.
func floorMod(a, m int64) int64 {
	r := a % m
	if r < 0 {
		r += m
	}
	return r
}

// mulMod returns (a * b) mod m without overflow, for a, b >= 0 and m > 0.
func mulMod(a, b, m int64) int64 {
	hi, lo := bits.Mul64(uint64(a), uint64(b))
	return int64(bits.Rem64(hi, lo, uint64(m)))
}

// ModInverse computes the modular multiplicative inverse in [0, m), or -1 if
// none exists.
func ModInverse(a, m int64) int64 {
	result := extendedGcd(a, m)

	if result.GCD != 1 {
		return -1
	}

	return floorMod(result.X, m)
}

// ModPow computes (base^exponent) mod modulus, for modulus > 0 and
// exponent >= 0.
func ModPow(base, exponent, modulus int64) int64 {
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

// mergeCongruences merges x = r1 (mod m1) and x = r2 (mod m2), with
// 0 <= r1 < m1 and 0 <= r2 < m2. On success it returns the solution in
// [0, lcm) and lcm(m1, m2). It fails when the congruences contradict or the
// lcm does not fit in an int64.
func mergeCongruences(r1, m1, r2, m2 int64) (r, lcm int64, ok bool) {
	e := extendedGcd(m1, m2) // m1*X + m2*Y = g
	g := e.GCD
	diff := r2 - r1
	if diff%g != 0 {
		return 0, 0, false
	}
	m2g := m2 / g
	hi, lo := bits.Mul64(uint64(m1/g), uint64(m2))
	if hi != 0 || lo > math.MaxInt64 {
		return 0, 0, false
	}
	t := mulMod(floorMod(diff/g, m2g), floorMod(e.X, m2g), m2g)
	return r1 + m1*t, int64(lo), true // r1 < m1 and t < m2/g, so r < lcm
}

// ChineseRemainderTheorem solves x = remainders[i] (mod moduli[i]) for all i.
// It returns the smallest non-negative solution (unique modulo the lcm of the
// moduli; the product when they are pairwise coprime), or -1 when the slices
// differ in length, a modulus is not positive, the system has no solution, or
// the combined modulus overflows int64. An empty system returns 0. Remainders
// may be negative.
// Time Complexity: O(n log max(moduli))
func ChineseRemainderTheorem(remainders, moduli []int64) int64 {
	n := len(remainders)
	if n != len(moduli) {
		return -1
	}
	for _, m := range moduli {
		if m <= 0 {
			return -1
		}
	}

	x, lcm := int64(0), int64(1)
	for i := 0; i < n; i++ {
		nx, nlcm, ok := mergeCongruences(x, lcm, floorMod(remainders[i], moduli[i]), moduli[i])
		if !ok {
			return -1
		}
		x, lcm = nx, nlcm
	}
	return x
}

// ChineseRemainderTheoremPairwise solves two congruences with coprime moduli.
// It returns x mod (m1 * m2), or -1 if the moduli are not positive, not
// coprime, or their product overflows int64.
func ChineseRemainderTheoremPairwise(a1, m1, a2, m2 int64) int64 {
	if m1 <= 0 || m2 <= 0 || extendedGcd(m1, m2).GCD != 1 {
		return -1
	}
	x, _, ok := mergeCongruences(floorMod(a1, m1), m1, floorMod(a2, m2), m2)
	if !ok {
		return -1
	}
	return x
}

// VerifyCrtSolution verifies that x satisfies all congruences. Remainders are
// reduced modulo each modulus first, so 8 (mod 3) means 2 and -1 (mod 7)
// means 6.
func VerifyCrtSolution(x int64, remainders, moduli []int64) bool {
	for i := 0; i < len(remainders); i++ {
		if floorMod(x, moduli[i]) != floorMod(remainders[i], moduli[i]) {
			return false
		}
	}
	return true
}

func main() {
	fmt.Println("Chinese Remainder Theorem Examples:")

	// x = 2 (mod 3), x = 3 (mod 5), x = 2 (mod 7)
	remainders := []int64{2, 3, 2}
	moduli := []int64{3, 5, 7}
	solution := ChineseRemainderTheorem(remainders, moduli)
	fmt.Printf("x = %v (mod %v)\n", remainders, moduli)
	fmt.Printf("Solution: x = %d\n", solution)
	fmt.Printf("Verification: %t\n", VerifyCrtSolution(solution, remainders, moduli))

	fmt.Println("\nPairwise CRT:")
	fmt.Printf("x = 1 (mod 3), x = 2 (mod 5): %d\n", ChineseRemainderTheoremPairwise(1, 3, 2, 5))

	fmt.Println("\nNon-coprime moduli:")
	fmt.Printf("x = 1 (mod 4), x = 3 (mod 6): %d\n", ChineseRemainderTheorem([]int64{1, 3}, []int64{4, 6}))
}
