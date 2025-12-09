package main

import "testing"

func TestKnapsack01(t *testing.T) {
	weights := []int{1, 3, 4, 5}
	values := []int{1, 4, 5, 7}
	if Knapsack01(weights, values, 7) != 9 {
		t.Error("Expected 9")
	}
}

