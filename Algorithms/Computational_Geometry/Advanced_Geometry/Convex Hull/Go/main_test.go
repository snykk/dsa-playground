package main

import (
	"testing"
)

func TestGrahamScan(t *testing.T) {
	points := []Point{
		{0, 0}, {1, 1}, {2, 0}, {1, 0.5},
	}
	hull := grahamScan(points)
	if len(hull) < 3 {
		t.Errorf("Graham scan should return at least 3 points")
	}
}

func TestJarvisMarch(t *testing.T) {
	points := []Point{
		{0, 0}, {1, 1}, {2, 0}, {1, 0.5},
	}
	hull := jarvisMarch(points)
	if len(hull) < 3 {
		t.Errorf("Jarvis march should return at least 3 points")
	}
}

func TestSquare(t *testing.T) {
	points := []Point{
		{0, 0}, {1, 0}, {1, 1}, {0, 1}, {0.5, 0.5},
	}
	grahamHull := grahamScan(points)
	jarvisHull := jarvisMarch(points)
	if len(grahamHull) != 4 {
		t.Errorf("Graham scan should return 4 points for square")
	}
	if len(jarvisHull) != 4 {
		t.Errorf("Jarvis march should return 4 points for square")
	}
}
