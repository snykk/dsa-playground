package main

import "testing"

func TestKadaneAlgorithm(t *testing.T) {
	arr := []int{-2, 1, -3, 4, -1, 2, 1, -5, 4}
	if KadaneAlgorithm(arr) != 6 {
		t.Error("Expected 6")
	}

	tests := []struct {
		name     string
		arr      []int
		expected int
	}{
		{"middle run", []int{5, -9, 6, -2, 3}, 7},
		{"whole array", []int{2, -1, 2, -1, 2}, 4},
		{"all positive", []int{1, 2, 3, 4}, 10},
		{"all negative", []int{-3, -1, -2}, -1},
		{"single negative", []int{-7}, -7},
		{"zero beats negatives", []int{-1, 0, -2}, 0},
		{"all zeros", []int{0, 0, 0}, 0},
		{"single element", []int{5}, 5},
		{"empty returns 0", []int{}, 0},
	}
	for _, tt := range tests {
		if got := KadaneAlgorithm(tt.arr); got != tt.expected {
			t.Errorf("%s: KadaneAlgorithm(%v) = %d, expected %d", tt.name, tt.arr, got, tt.expected)
		}
	}
}
