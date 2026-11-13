package main

import "testing"

func TestLISDP(t *testing.T) {
	arr := []int{10, 9, 2, 5, 3, 7, 101, 18}
	if LISDP(arr) != 4 {
		t.Error("Expected 4")
	}

	tests := []struct {
		name     string
		arr      []int
		expected int
	}{
		{"classic", []int{0, 1, 0, 3, 2, 3}, 4},
		{"jump back", []int{3, 10, 2, 1, 20}, 3},
		{"two candidates", []int{50, 3, 10, 7, 40, 80}, 4},
		{"negative values", []int{-5, -3, -4, 0, -1, 2}, 4},
		{"empty", []int{}, 0},
		{"single element", []int{42}, 1},
		{"sorted", []int{1, 2, 3, 4, 5}, 5},
		{"strictly decreasing", []int{5, 4, 3, 2, 1}, 1},
		// Strictly increasing: equal values cannot both be in the subsequence.
		{"all equal", []int{7, 7, 7, 7}, 1},
		{"duplicate inside", []int{1, 3, 3, 5}, 3},
		{"duplicate pairs", []int{2, 2, 3, 3, 4}, 3},
	}
	for _, tt := range tests {
		if got := LISDP(tt.arr); got != tt.expected {
			t.Errorf("%s: LISDP(%v) = %d, expected %d", tt.name, tt.arr, got, tt.expected)
		}
	}
}
