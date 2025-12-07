package main

import "testing"

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

