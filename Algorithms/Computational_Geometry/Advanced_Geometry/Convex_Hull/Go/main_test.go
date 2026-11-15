package main

import (
	"math/rand"
	"sort"
	"testing"
)

func cross3(o, a, b Point) float64 {
	return (a.X-o.X)*(b.Y-o.Y) - (a.Y-o.Y)*(b.X-o.X)
}

func lessXY(a, b Point) bool {
	return a.X < b.X || (a.X == b.X && a.Y < b.Y)
}

// bruteForceHull returns the strict hull vertices of integer points by supporting lines: O(n^3).
func bruteForceHull(raw []Point) map[Point]bool {
	uniq := map[Point]bool{}
	for _, p := range raw {
		uniq[p] = true
	}
	if len(uniq) < 3 {
		return uniq
	}
	pts := make([]Point, 0, len(uniq))
	for p := range uniq {
		pts = append(pts, p)
	}
	sort.Slice(pts, func(i, j int) bool { return lessXY(pts[i], pts[j]) })
	result := map[Point]bool{}
	for _, a := range pts {
		for _, b := range pts {
			if a == b {
				continue
			}
			ok := true
			for _, c := range pts {
				if cross3(a, b, c) < 0 {
					ok = false
					break
				}
			}
			if !ok {
				continue
			}
			lo, hi := a, a
			for _, c := range pts {
				if cross3(a, b, c) == 0 {
					if lessXY(c, lo) {
						lo = c
					}
					if lessXY(hi, c) {
						hi = c
					}
				}
			}
			result[lo] = true
			result[hi] = true
		}
	}
	return result
}

func isCcwStrictlyConvex(h []Point) bool {
	n := len(h)
	if n < 3 {
		return true
	}
	for i := 0; i < n; i++ {
		if cross3(h[i], h[(i+1)%n], h[(i+2)%n]) <= 0 {
			return false
		}
	}
	return true
}

func hullSet(h []Point) map[Point]bool {
	m := map[Point]bool{}
	for _, p := range h {
		m[p] = true
	}
	return m
}

func sameSet(a, b map[Point]bool) bool {
	if len(a) != len(b) {
		return false
	}
	for p := range a {
		if !b[p] {
			return false
		}
	}
	return true
}

var hullAlgos = map[string]func([]Point) []Point{"graham": grahamScan, "jarvis": jarvisMarch}

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

func TestDuplicatesAndFewPoints(t *testing.T) {
	for name, algo := range hullAlgos {
		if len(algo(nil)) != 0 {
			t.Errorf("%s: no points, no hull", name)
		}
		if len(algo([]Point{{1, 1}})) != 1 || len(algo([]Point{{1, 1}, {1, 1}})) != 1 {
			t.Errorf("%s: duplicates must be removed", name)
		}
		if len(algo([]Point{{1, 1}, {2, 2}, {1, 1}})) != 2 {
			t.Errorf("%s: two distinct points", name)
		}
	}
}

// Fewer than three distinct points come back sorted: by (Y, X) in grahamScan, by (X, Y) in
// jarvisMarch, as documented.
func TestFewerThanThreePointsComeBackSorted(t *testing.T) {
	two := []Point{{0, 2}, {1, 0}, {0, 2}}
	if got := grahamScan(two); len(got) != 2 || got[0] != (Point{1, 0}) || got[1] != (Point{0, 2}) {
		t.Errorf("grahamScan = %v, want [{1 0} {0 2}]", got)
	}
	if got := jarvisMarch(two); len(got) != 2 || got[0] != (Point{0, 2}) || got[1] != (Point{1, 0}) {
		t.Errorf("jarvisMarch = %v, want [{0 2} {1 0}]", got)
	}
}

func TestInputSliceIsNotReordered(t *testing.T) {
	points := []Point{{0, 3}, {2, 2}, {1, 1}, {2, 1}, {3, 0}, {0, 0}, {3, 3}}
	before := append([]Point(nil), points...)
	for name, algo := range hullAlgos {
		algo(points)
		for i := range points {
			if points[i] != before[i] {
				t.Fatalf("%s reordered the caller's slice", name)
			}
		}
	}
}

func TestAllCollinearReturnsTheTwoEnds(t *testing.T) {
	var points []Point
	for _, i := range []float64{3, 0, 1, 2, 5, 4} {
		points = append(points, Point{i, 2 * i})
	}
	for name, algo := range hullAlgos {
		got := hullSet(algo(points))
		if !sameSet(got, map[Point]bool{{0, 0}: true, {5, 10}: true}) {
			t.Errorf("%s: expected the two end points, got %v", name, got)
		}
	}
}

func TestCollinearBoundaryPointsAreExcluded(t *testing.T) {
	points := []Point{{0, 0}, {1, 0}, {2, 0}, {2, 1}, {2, 2}, {1, 2}, {0, 2}, {0, 1}, {1, 1}}
	want := map[Point]bool{{0, 0}: true, {2, 0}: true, {2, 2}: true, {0, 2}: true}
	for name, algo := range hullAlgos {
		hull := algo(points)
		if len(hull) != 4 || !sameSet(hullSet(hull), want) {
			t.Errorf("%s: expected the 4 corners, got %v", name, hull)
		}
	}
}

func TestCounterclockwiseAndStartPoint(t *testing.T) {
	points := []Point{{0, 3}, {2, 2}, {1, 1}, {2, 1}, {3, 0}, {0, 0}, {3, 3}}
	want := []Point{{0, 0}, {3, 0}, {3, 3}, {0, 3}}
	for name, algo := range hullAlgos {
		hull := algo(points)
		if len(hull) != 4 {
			t.Fatalf("%s: expected 4 points, got %v", name, hull)
		}
		for i := range want {
			if hull[i] != want[i] {
				t.Errorf("%s: expected %v, got %v", name, want, hull)
				break
			}
		}
	}
}

func TestJarvisMarchTerminatesAtTinyScale(t *testing.T) {
	points := []Point{{0, 0}, {1e-5, 0}, {1e-5, 1e-5}, {0, 1e-5}}
	if len(jarvisMarch(points)) != 4 || len(grahamScan(points)) != 4 {
		t.Errorf("expected the 4 corners")
	}
}

func TestGrahamScanNearlyCollinearWedge(t *testing.T) {
	points := []Point{{0, 0}, {0, 1000}, {466.370713928512, 466.3706574269199},
		{704.4545702063141, 704.4544815105265}, {495.26698782658025, 495.2669272784684}}
	for name, algo := range hullAlgos {
		if len(algo(points)) != 3 {
			t.Errorf("%s: expected a triangle", name)
		}
	}
}

func TestRandomIntegerPointsMatchBruteForce(t *testing.T) {
	rng := rand.New(rand.NewSource(2024))
	spans := []int{1, 2, 3, 5, 10, 50}
	for iter := 0; iter < 400; iter++ {
		span := spans[rng.Intn(len(spans))]
		n := rng.Intn(26)
		points := make([]Point, n)
		for i := range points {
			points[i] = Point{float64(rng.Intn(2*span+1) - span), float64(rng.Intn(2*span+1) - span)}
		}
		expected := bruteForceHull(points)
		for name, algo := range hullAlgos {
			hull := algo(points)
			got := hullSet(hull)
			if !sameSet(got, expected) || len(got) != len(hull) || !isCcwStrictlyConvex(hull) {
				t.Fatalf("%s: wrong hull for %v: %v", name, points, hull)
			}
		}
	}
}
