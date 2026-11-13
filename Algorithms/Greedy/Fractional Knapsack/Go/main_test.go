package main

import "testing"

func TestFractionalKnapsack(t *testing.T) {
	items := []Item{
		{60, 10},
		{100, 20},
		{120, 30},
	}
	capacity := 50.0
	result := FractionalKnapsack(items, capacity)
	expected := 240.0
	if result != expected {
		t.Errorf("Expected %f, got %f", expected, result)
	}
}

// Regression: a zero-weight item made the total NaN (0 * (0/0)).
// It uses no capacity, so it is always taken whole.
func TestFractionalKnapsackZeroWeight(t *testing.T) {
	if got := FractionalKnapsack([]Item{{10, 0}, {60, 10}}, 5); got != 40 {
		t.Errorf("Expected 40, got %f", got)
	}
	if got := FractionalKnapsack([]Item{{0, 0}, {60, 10}}, 5); got != 30 {
		t.Errorf("Expected 30, got %f", got)
	}
}
