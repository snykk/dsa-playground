package main

import "testing"

func TestKadaneAlgorithm(t *testing.T) {
	arr := []int{-2, 1, -3, 4, -1, 2, 1, -5, 4}
	if KadaneAlgorithm(arr) != 6 {
		t.Error("Expected 6")
	}
}

