package main

import (
	"math"
	"testing"
)

const eps = 1e-5

func TestRotatingCalipersDiameter(t *testing.T) {
	hull := []Point{
		{0, 0}, {4, 0}, {4, 3}, {0, 3},
	}
	result := rotatingCalipersDiameter(hull)
	if result.Dist <= 0 {
		t.Errorf("Diameter should be positive")
	}
	if math.Abs(result.Dist-5.0) > 1.0 {
		t.Errorf("Diameter should be approximately 5.0 for rectangle")
	}
}

func TestRotatingCalipersWidth(t *testing.T) {
	hull := []Point{
		{0, 0}, {4, 0}, {4, 3}, {0, 3},
	}
	width := rotatingCalipersWidth(hull)
	if width <= 0 {
		t.Errorf("Width should be positive")
	}
	if width >= 4 {
		t.Errorf("Width should be less than 4 for rectangle")
	}
}

func TestRotatingCalipersPerimeter(t *testing.T) {
	hull := []Point{
		{0, 0}, {4, 0}, {4, 3}, {0, 3},
	}
	perimeter := rotatingCalipersPerimeter(hull)
	if math.Abs(perimeter-14.0) > 1.0 {
		t.Errorf("Perimeter should be approximately 14.0")
	}
}

func TestRotatingCalipersArea(t *testing.T) {
	hull := []Point{
		{0, 0}, {4, 0}, {4, 3}, {0, 3},
	}
	area := rotatingCalipersArea(hull)
	if math.Abs(area-12.0) > 1.0 {
		t.Errorf("Area should be approximately 12.0")
	}
}
