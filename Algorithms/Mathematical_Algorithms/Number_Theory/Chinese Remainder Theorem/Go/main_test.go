package main

import (
	"math"
	"math/rand"
	"testing"
)

func TestBasicCRT(t *testing.T) {
	remainders := []int64{2, 3, 2}
	moduli := []int64{3, 5, 7}
	solution := ChineseRemainderTheorem(remainders, moduli)
	if solution != 23 {
		t.Errorf("ChineseRemainderTheorem(%v, %v) = %d, expected 23", remainders, moduli, solution)
	}
	if !VerifyCrtSolution(solution, remainders, moduli) {
		t.Error("VerifyCrtSolution failed for solution 23")
	}
}

func TestPairwiseCRT(t *testing.T) {
	solution := ChineseRemainderTheoremPairwise(1, 3, 2, 5)
	if solution != 7 {
		t.Errorf("ChineseRemainderTheoremPairwise(1, 3, 2, 5) = %d, expected 7", solution)
	}
	if solution%3 != 1 {
		t.Error("Pairwise CRT solution should satisfy x = 1 (mod 3)")
	}
	if solution%5 != 2 {
		t.Error("Pairwise CRT solution should satisfy x = 2 (mod 5)")
	}
}

func TestPairwiseCRTNotCoprime(t *testing.T) {
	solution := ChineseRemainderTheoremPairwise(1, 4, 2, 6)
	if solution != -1 {
		t.Errorf("ChineseRemainderTheoremPairwise(1, 4, 2, 6) = %d, expected -1", solution)
	}
}

func TestVerifySolution(t *testing.T) {
	remainders := []int64{2, 3, 2}
	moduli := []int64{3, 5, 7}
	solution := int64(23)
	if !VerifyCrtSolution(solution, remainders, moduli) {
		t.Error("VerifyCrtSolution(23, remainders, moduli) should be true")
	}
	if VerifyCrtSolution(22, remainders, moduli) {
		t.Error("VerifyCrtSolution(22, remainders, moduli) should be false")
	}
}

func TestLargerModuli(t *testing.T) {
	remainders := []int64{1, 2, 3, 4}
	moduli := []int64{5, 7, 11, 13}
	solution := ChineseRemainderTheorem(remainders, moduli)
	if solution == -1 {
		t.Error("ChineseRemainderTheorem should find solution for larger moduli")
	}
	if !VerifyCrtSolution(solution, remainders, moduli) {
		t.Error("VerifyCrtSolution failed for larger moduli")
	}
}

func TestSingleCongruence(t *testing.T) {
	remainders := []int64{5}
	moduli := []int64{7}
	solution := ChineseRemainderTheorem(remainders, moduli)
	if solution != 5 {
		t.Errorf("ChineseRemainderTheorem([5], [7]) = %d, expected 5", solution)
	}
	if !VerifyCrtSolution(solution, remainders, moduli) {
		t.Error("VerifyCrtSolution failed for single congruence")
	}
}

func gcd64(a, b int64) int64 {
	if a < 0 {
		a = -a
	}
	if b < 0 {
		b = -b
	}
	for b != 0 {
		a, b = b, a%b
	}
	return a
}

func TestExtendedGcdSignedIdentity(t *testing.T) {
	rng := rand.New(rand.NewSource(12345))
	for i := 0; i < 20000; i++ {
		a := rng.Int63n(2001) - 1000
		b := rng.Int63n(2001) - 1000
		r := extendedGcd(a, b)
		g := gcd64(a, b)
		if r.GCD != g || a*r.X+b*r.Y != g {
			t.Fatalf("extendedGcd(%d, %d) = %+v: a*x + b*y must equal gcd %d", a, b, r, g)
		}
	}
	if got := ModInverse(-3, 11); got != 7 {
		t.Errorf("ModInverse(-3, 11) = %d, expected 7", got)
	}
}

func TestNegativeRemainder(t *testing.T) {
	if got := ChineseRemainderTheorem([]int64{-1}, []int64{7}); got != 6 {
		t.Errorf("CRT([-1], [7]) = %d, expected 6", got)
	}
	if got := ChineseRemainderTheorem([]int64{-1, 2}, []int64{3, 5}); got != 2 {
		t.Errorf("CRT([-1, 2], [3, 5]) = %d, expected 2", got)
	}
}

func TestVerifyNormalizesRemainder(t *testing.T) {
	if got := ChineseRemainderTheorem([]int64{8}, []int64{3}); got != 2 {
		t.Errorf("CRT([8], [3]) = %d, expected 2", got)
	}
	if !VerifyCrtSolution(2, []int64{8}, []int64{3}) {
		t.Error("VerifyCrtSolution(2, [8], [3]) should be true")
	}
	if !VerifyCrtSolution(6, []int64{-1}, []int64{7}) {
		t.Error("VerifyCrtSolution(6, [-1], [7]) should be true")
	}
}

func TestLargeModuliNoOverflow(t *testing.T) {
	remainders := []int64{1000000006, 998244352}
	moduli := []int64{1000000007, 998244353}
	x := ChineseRemainderTheorem(remainders, moduli)
	if x != 998244359987710470 || !VerifyCrtSolution(x, remainders, moduli) {
		t.Errorf("CRT = %d, expected 998244359987710470", x)
	}
	// Moduli just above sqrt(2^63): residue products need 128 bits.
	m1, m2 := int64(3037000493), int64(3037000497)
	y := ChineseRemainderTheoremPairwise(m1-1, m1, 12345, m2)
	if y != 4611676629613100865 || y%m1 != m1-1 || y%m2 != 12345 {
		t.Errorf("pairwise CRT = %d, expected 4611676629613100865", y)
	}
	// lcm too large for int64: reported as failure, not garbage.
	if got := ChineseRemainderTheorem([]int64{1, 2}, []int64{math.MaxInt64, math.MaxInt64 - 1}); got != -1 {
		t.Errorf("overflowing lcm should return -1, got %d", got)
	}
}

func TestNonCoprimeSolvable(t *testing.T) {
	if got := ChineseRemainderTheorem([]int64{1, 3}, []int64{4, 6}); got != 9 {
		t.Errorf("CRT([1, 3], [4, 6]) = %d, expected 9", got)
	}
	if got := ChineseRemainderTheorem([]int64{1, 2}, []int64{4, 6}); got != -1 {
		t.Errorf("contradictory system should return -1, got %d", got)
	}
	if got := ChineseRemainderTheorem([]int64{5, 3, 8}, []int64{6, 10, 15}); got != 23 {
		t.Errorf("CRT([5, 3, 8], [6, 10, 15]) = %d, expected 23", got)
	}
}
