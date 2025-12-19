package main

import "testing"

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
		t.Error("Pairwise CRT solution should satisfy x ≡ 1 (mod 3)")
	}
	if solution%5 != 2 {
		t.Error("Pairwise CRT solution should satisfy x ≡ 2 (mod 5)")
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
