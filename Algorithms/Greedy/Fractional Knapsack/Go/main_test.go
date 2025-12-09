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

