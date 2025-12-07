package main

import "testing"

func TestClosestPair(t *testing.T) {
	// Test two points
	points := []Point{{0, 0}, {1, 1}}
	result := ClosestPair(points)
	expected := distance(Point{0, 0}, Point{1, 1})
	if result.Dist != expected {
		t.Errorf("Expected %f, got %f", expected, result.Dist)
	}

	// Test square
	points = []Point{{0, 0}, {1, 0}, {0, 1}, {1, 1}}
	result = ClosestPair(points)
	if result.Dist != 1.0 {
		t.Errorf("Expected 1.0, got %f", result.Dist)
	}

	// Test horizontal line
	points = []Point{{0, 0}, {1, 0}, {2, 0}, {3, 0}}
	result = ClosestPair(points)
	if result.Dist != 1.0 {
		t.Errorf("Expected 1.0, got %f", result.Dist)
	}
}

