package main

import "testing"

func TestMatrixChainMultiplication(t *testing.T) {
	dims := []int{10, 20, 30}
	if MatrixChainMultiplication(dims) != 6000 {
		t.Error("Expected 6000")
	}
}

