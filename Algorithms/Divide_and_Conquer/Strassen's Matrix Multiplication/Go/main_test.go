package main

import (
	"math/rand"
	"testing"
)

func TestStrassenMultiply(t *testing.T) {
	// Test 1x1
	A := [][]int{{2}}
	B := [][]int{{3}}
	result := StrassenMultiply(A, B)
	if result[0][0] != 6 {
		t.Errorf("Expected 6, got %d", result[0][0])
	}

	// Test 2x2
	A = [][]int{{1, 2}, {3, 4}}
	B = [][]int{{5, 6}, {7, 8}}
	result = StrassenMultiply(A, B)
	expected := [][]int{{19, 22}, {43, 50}}

	for i := range result {
		for j := range result[i] {
			if result[i][j] != expected[i][j] {
				t.Errorf("Expected %d at [%d][%d], got %d", expected[i][j], i, j, result[i][j])
			}
		}
	}
}

func randomMatrix(n int, rng *rand.Rand) [][]int {
	M := make([][]int, n)
	for i := range M {
		M[i] = make([]int, n)
		for j := range M[i] {
			M[i][j] = rng.Intn(19) - 9
		}
	}
	return M
}

// 128 reaches the 7-product recursion; 65 and 130 are the odd sizes that used to
// come back truncated to (n-1) x (n-1).
func TestStrassenAboveCutoff(t *testing.T) {
	rng := rand.New(rand.NewSource(1))
	for _, n := range []int{128, 65, 130} {
		A, B := randomMatrix(n, rng), randomMatrix(n, rng)
		got := StrassenMultiply(A, B)
		want := naiveMultiply(A, B)
		if len(got) != n {
			t.Fatalf("n=%d: got a %d-row result", n, len(got))
		}
		for i := range want {
			for j := range want[i] {
				if got[i][j] != want[i][j] {
					t.Fatalf("n=%d: mismatch at [%d][%d]: %d vs %d", n, i, j, got[i][j], want[i][j])
				}
			}
		}
	}
}
