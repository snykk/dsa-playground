package main

import "testing"

func TestFibonacciTabulation(t *testing.T) {
	tests := []struct {
		n        int
		expected int64
	}{
		{0, 0},
		{1, 1},
		{5, 5},
		{10, 55},
		{20, 6765},
	}

	for _, tt := range tests {
		result := FibonacciTabulation(tt.n)
		if result != tt.expected {
			t.Errorf("FibonacciTabulation(%d) = %d, expected %d", tt.n, result, tt.expected)
		}
	}
}

func TestFibonacciOptimized(t *testing.T) {
	result := FibonacciOptimized(10)
	if result != 55 {
		t.Errorf("Expected 55, got %d", result)
	}
}

