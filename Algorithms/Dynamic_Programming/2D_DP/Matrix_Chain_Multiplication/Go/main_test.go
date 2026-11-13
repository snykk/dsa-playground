package main

import "testing"

func TestMatrixChainMultiplication(t *testing.T) {
	dims := []int{10, 20, 30}
	if MatrixChainMultiplication(dims) != 6000 {
		t.Error("Expected 6000")
	}

	tests := []struct {
		name     string
		dims     []int
		expected int
	}{
		{"CLRS 15.2", []int{30, 35, 15, 5, 10, 20, 25}, 15125},
		{"four matrices", []int{40, 20, 30, 10, 30}, 26000},
		{"four matrices, left to right", []int{10, 20, 30, 40, 30}, 30000},
		{"small", []int{1, 2, 3, 4, 3}, 30},
		{"three matrices", []int{1, 2, 3, 4}, 18},
		// Regression: costs above 1<<31 - 1 used to be capped at 2147483647.
		{"cost above int32", []int{2000, 2000, 2000}, 8000000000},
		{"long chain above int32", []int{1000, 1000, 1000, 1000, 1000}, 3000000000},
		// Regression: fewer than two matrices used to panic with index out of range.
		{"no dims", []int{}, 0},
		{"one dim", []int{5}, 0},
		{"single matrix", []int{5, 10}, 0},
	}
	for _, tt := range tests {
		if got := MatrixChainMultiplication(tt.dims); got != tt.expected {
			t.Errorf("%s: MatrixChainMultiplication(%v) = %d, expected %d", tt.name, tt.dims, got, tt.expected)
		}
	}
}
