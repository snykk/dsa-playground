package main

import "testing"

func TestClimbingStairs(t *testing.T) {
	if ClimbingStairs(3) != 3 {
		t.Error("Expected 3")
	}
	if ClimbingStairs(5) != 8 {
		t.Error("Expected 8")
	}

	tests := []struct {
		n        int
		expected int64
	}{
		{0, 1}, // regression: used to return 0
		{1, 1},
		{2, 2},
		{4, 5},
		{10, 89},
		{45, 1836311903},
		{90, 4660046610375530309}, // ways(n) = F(n + 1)
	}
	for _, tt := range tests {
		if got := ClimbingStairs(tt.n); got != tt.expected {
			t.Errorf("ClimbingStairs(%d) = %d, expected %d", tt.n, got, tt.expected)
		}
	}
}

// Regression: negative n used to be returned unchanged (ways(-3) gave -3).
func TestClimbingStairsNegativePanics(t *testing.T) {
	defer func() {
		if recover() == nil {
			t.Error("ClimbingStairs(-3) did not panic")
		}
	}()
	ClimbingStairs(-3)
}
