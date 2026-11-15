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

func sameMatrix(a, b [][]int) bool {
	if len(a) != len(b) {
		return false
	}
	for i := range a {
		if len(a[i]) != len(b[i]) {
			return false
		}
		for j := range a[i] {
			if a[i][j] != b[i][j] {
				return false
			}
		}
	}
	return true
}

// A small cutoff runs the seven-product recursion (and the odd-size padding)
// on small matrices.
func TestStrassenSmallCutoff(t *testing.T) {
	rng := rand.New(rand.NewSource(2))
	for _, cutoff := range []int{1, 2} {
		for _, n := range []int{4, 3} {
			A, B := randomMatrix(n, rng), randomMatrix(n, rng)
			if got := StrassenMultiplyWithCutoff(A, B, cutoff); !sameMatrix(got, naiveMultiply(A, B)) {
				t.Fatalf("cutoff=%d n=%d: got %v, want %v", cutoff, n, got, naiveMultiply(A, B))
			}
		}
	}
}

// StrassenMultiply keeps its behaviour: it is the default cutoff of 64.
func TestStrassenDefaultCutoffUnchanged(t *testing.T) {
	if DefaultCutoff != 64 {
		t.Fatalf("DefaultCutoff = %d, want 64", DefaultCutoff)
	}
	rng := rand.New(rand.NewSource(3))
	for _, n := range []int{4, 65} {
		A, B := randomMatrix(n, rng), randomMatrix(n, rng)
		got := StrassenMultiply(A, B)
		if !sameMatrix(got, StrassenMultiplyWithCutoff(A, B, 64)) || !sameMatrix(got, naiveMultiply(A, B)) {
			t.Fatalf("n=%d: default cutoff changed the result", n)
		}
	}
}

func TestStrassenBadCutoffPanics(t *testing.T) {
	for _, cutoff := range []int{0, -3} {
		func() {
			defer func() {
				if recover() == nil {
					t.Errorf("cutoff=%d: expected a panic", cutoff)
				}
			}()
			StrassenMultiplyWithCutoff([][]int{{1, 2}, {3, 4}}, [][]int{{5, 6}, {7, 8}}, cutoff)
		}()
	}
}
