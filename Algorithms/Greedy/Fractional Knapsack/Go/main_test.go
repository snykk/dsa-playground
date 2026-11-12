package main

import (
	"math"
	"testing"
)

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

func TestFractionalKnapsackNoItemFitsWhole(t *testing.T) {
	got := FractionalKnapsack([]Item{{10, 20}, {20, 30}}, 5)
	if want := 20.0 * 5 / 30; math.Abs(got-want) > 1e-9 {
		t.Errorf("Expected %f, got %f", want, got)
	}
}

func TestFractionalKnapsackEmptyAndZeroCapacity(t *testing.T) {
	if got := FractionalKnapsack(nil, 10); got != 0 {
		t.Errorf("Expected 0, got %f", got)
	}
	if got := FractionalKnapsack([]Item{{10, 5}}, 0); got != 0 {
		t.Errorf("Expected 0, got %f", got)
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
