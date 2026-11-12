package main

import (
	"math"
	"math/rand"
	"testing"
)

func bruteDistance(pts []Point) float64 {
	best := math.MaxFloat64
	for i := 0; i < len(pts); i++ {
		for j := i + 1; j < len(pts); j++ {
			best = math.Min(best, distance(pts[i], pts[j]))
		}
	}
	return best
}

func contains(pts []Point, p Point) bool {
	for _, q := range pts {
		if q == p {
			return true
		}
	}
	return false
}

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

func TestDuplicatePoints(t *testing.T) {
	if r := ClosestPair([]Point{{5, 5}, {1, 1}, {9, 2}, {5, 5}, {7, 7}}); r.Dist != 0 {
		t.Errorf("duplicate points are at distance 0, got %f", r.Dist)
	}
	same := make([]Point, 6)
	for i := range same {
		same[i] = Point{3, 3}
	}
	if r := ClosestPair(same); r.Dist != 0 {
		t.Errorf("identical points are at distance 0, got %f", r.Dist)
	}
}

func TestNegativeCoordinatesAndSharedX(t *testing.T) {
	points := []Point{{-3, -4}, {-3, 10}, {-3, 4}, {-3, 5}, {2, -9}, {-7, 0}}
	r := ClosestPair(points)
	if math.Abs(r.Dist-1.0) > 1e-9 || math.Abs(distance(r.P1, r.P2)-r.Dist) > 1e-9 {
		t.Errorf("expected distance 1, got %f", r.Dist)
	}
}

func TestTooFewPointsPanics(t *testing.T) {
	defer func() {
		if recover() == nil {
			t.Errorf("one point must panic")
		}
	}()
	ClosestPair([]Point{{1, 1}})
}

func TestInputIsNotReordered(t *testing.T) {
	points := []Point{{3, 3}, {0, 0}, {1, 9}, {1, 1}}
	before := append([]Point(nil), points...)
	ClosestPair(points)
	for i := range points {
		if points[i] != before[i] {
			t.Fatalf("ClosestPair reordered the caller's slice")
		}
	}
}

func TestRandomPointsMatchBruteForce(t *testing.T) {
	rng := rand.New(rand.NewSource(42))
	spans := []int{1, 2, 3, 5, 10, 100}
	for iter := 0; iter < 1500; iter++ {
		span := spans[rng.Intn(len(spans))]
		points := make([]Point, 2+rng.Intn(39))
		for i := range points {
			points[i] = Point{float64(rng.Intn(2*span+1) - span), float64(rng.Intn(2*span+1) - span)}
		}
		r := ClosestPair(points)
		if math.Abs(r.Dist-bruteDistance(points)) > 1e-12 || math.Abs(distance(r.P1, r.P2)-r.Dist) > 1e-12 ||
			!contains(points, r.P1) || !contains(points, r.P2) {
			t.Fatalf("wrong result for %v: %+v", points, r)
		}
	}
}
