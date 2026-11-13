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

	tests := []struct {
		n        int
		expected int64
	}{
		{0, 0},
		{1, 1},
		{2, 1},
		{50, 12586269025},
		{90, 2880067194370816120},
		{92, 7540113804746346429}, // largest Fibonacci number that fits in int64
	}
	for _, tt := range tests {
		if got := FibonacciOptimized(tt.n); got != tt.expected {
			t.Errorf("FibonacciOptimized(%d) = %d, expected %d", tt.n, got, tt.expected)
		}
	}
}

func TestFibonacciApproachesAgree(t *testing.T) {
	for n := 0; n <= 92; n++ {
		tab, opt := FibonacciTabulation(n), FibonacciOptimized(n)
		if tab != opt {
			t.Fatalf("n=%d: FibonacciTabulation = %d, FibonacciOptimized = %d", n, tab, opt)
		}
		if n >= 2 && tab != FibonacciTabulation(n-1)+FibonacciTabulation(n-2) {
			t.Fatalf("n=%d: F(n) != F(n-1) + F(n-2)", n)
		}
	}
}

// Regression: negative n used to be returned unchanged (F(-5) gave -5).
func TestFibonacciNegativePanics(t *testing.T) {
	funcs := map[string]func(int) int64{
		"FibonacciTabulation": FibonacciTabulation,
		"FibonacciOptimized":  FibonacciOptimized,
	}
	for name, f := range funcs {
		for _, n := range []int{-1, -5} {
			func() {
				defer func() {
					if recover() == nil {
						t.Errorf("%s(%d) did not panic", name, n)
					}
				}()
				f(n)
			}()
		}
	}
}
