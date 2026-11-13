package main

import (
	"math"
	"math/rand"
	"sort"
	"testing"
)

type ip struct{ x, y int }

func crossIP(o, a, b ip) int {
	return (a.x-o.x)*(b.y-o.y) - (a.y-o.y)*(b.x-o.x)
}

// monotoneChain returns the strict counterclockwise hull of integer points (exact reference).
func monotoneChain(in []ip) []ip {
	seen := map[ip]bool{}
	var pts []ip
	for _, p := range in {
		if !seen[p] {
			seen[p] = true
			pts = append(pts, p)
		}
	}
	sort.Slice(pts, func(i, j int) bool { return pts[i].x < pts[j].x || (pts[i].x == pts[j].x && pts[i].y < pts[j].y) })
	if len(pts) < 3 {
		return pts
	}
	var lower, upper []ip
	for _, p := range pts {
		for len(lower) > 1 && crossIP(lower[len(lower)-2], lower[len(lower)-1], p) <= 0 {
			lower = lower[:len(lower)-1]
		}
		lower = append(lower, p)
	}
	for i := len(pts) - 1; i >= 0; i-- {
		p := pts[i]
		for len(upper) > 1 && crossIP(upper[len(upper)-2], upper[len(upper)-1], p) <= 0 {
			upper = upper[:len(upper)-1]
		}
		upper = append(upper, p)
	}
	return append(lower[:len(lower)-1], upper[:len(upper)-1]...)
}

func bruteDiameter(pts []ip) float64 {
	best := 0.0
	for _, a := range pts {
		for _, b := range pts {
			best = math.Max(best, math.Hypot(float64(a.x-b.x), float64(a.y-b.y)))
		}
	}
	return best
}

func bruteWidth(h []ip) float64 {
	if len(h) < 3 {
		return 0
	}
	best := math.Inf(1)
	for i := range h {
		a, b := h[i], h[(i+1)%len(h)]
		length := math.Hypot(float64(b.x-a.x), float64(b.y-a.y))
		far := 0.0
		for _, p := range h {
			far = math.Max(far, math.Abs(float64(crossIP(a, b, p))))
		}
		best = math.Min(best, far/length)
	}
	return best
}

func toPoints(v []ip) []Point {
	out := make([]Point, len(v))
	for i, p := range v {
		out[i] = Point{float64(p.x), float64(p.y)}
	}
	return out
}

func near(a, b float64) bool { return math.Abs(a-b) < 1e-9 }

func square() []Point { return []Point{{0, 0}, {4, 0}, {4, 3}, {0, 3}} }

func TestRotatingCalipersDiameter(t *testing.T) {
	result := rotatingCalipersDiameter(square())
	if !near(result.Dist, 5.0) {
		t.Errorf("Diameter should be 5.0 for the 4x3 rectangle, got %v", result.Dist)
	}
}

func TestRotatingCalipersWidth(t *testing.T) {
	if width := rotatingCalipersWidth(square()); !near(width, 3.0) {
		t.Errorf("Width should be 3.0 for the 4x3 rectangle, got %v", width)
	}
}

func TestRotatingCalipersPerimeter(t *testing.T) {
	if perimeter := rotatingCalipersPerimeter(square()); !near(perimeter, 14.0) {
		t.Errorf("Perimeter should be 14.0, got %v", perimeter)
	}
}

func TestRotatingCalipersArea(t *testing.T) {
	if area := rotatingCalipersArea(square()); !near(area, 12.0) {
		t.Errorf("Area should be 12.0, got %v", area)
	}
}

func TestDiameterFanHullIsNotALocalMaximum(t *testing.T) {
	// A vertex-to-vertex hill climb stops at 104.96 (pair 0-1); the true diameter is 104.98
	hull := []Point{{0, 0}, {104.8, 5.8}, {103.3, 18.1}, {102.9, 20.8}, {89.7, 52.4}, {88.8, 52.0}}
	result := rotatingCalipersDiameter(hull)
	if !near(result.Dist, 104.98118879113534) {
		t.Errorf("expected 104.98118879113534, got %v", result.Dist)
	}
}

func TestWidthWithCollinearOrRepeatedVertices(t *testing.T) {
	collinear := []Point{{0, 0}, {2, 0}, {4, 0}, {4, 3}, {0, 3}}
	repeated := []Point{{0, 0}, {4, 0}, {4, 0}, {4, 3}, {0, 3}}
	if !near(rotatingCalipersWidth(collinear), 3.0) || !near(rotatingCalipersWidth(repeated), 3.0) {
		t.Errorf("width should be 3.0, got %v and %v", rotatingCalipersWidth(collinear), rotatingCalipersWidth(repeated))
	}
	if !near(rotatingCalipersDiameter(collinear).Dist, 5.0) {
		t.Errorf("diameter should be 5.0")
	}
}

func TestDegenerateInputs(t *testing.T) {
	same := []Point{{1, 1}, {1, 1}, {1, 1}}
	if rotatingCalipersWidth(same) != 0 || rotatingCalipersDiameter(same).Dist != 0 || rotatingCalipersDiameter(nil).Dist != 0 {
		t.Errorf("identical points: width and diameter are 0")
	}
	segment := []Point{{0, 0}, {1, 1}, {3, 3}}
	if rotatingCalipersWidth(segment) != 0 || !near(rotatingCalipersDiameter(segment).Dist, 3*math.Sqrt2) {
		t.Errorf("collinear points: width 0, diameter 3*sqrt(2)")
	}
}

func TestTriangle(t *testing.T) {
	hull := []Point{{0, 0}, {4, 0}, {0, 3}}
	if !near(rotatingCalipersWidth(hull), 2.4) || !near(rotatingCalipersDiameter(hull).Dist, 5.0) {
		t.Errorf("3-4-5 triangle: width 2.4, diameter 5")
	}
}

func TestClockwiseAndCounterclockwiseAgree(t *testing.T) {
	hull := []Point{{0, 0}, {4, 0}, {5, 2}, {2, 5}, {-1, 3}}
	rev := make([]Point, len(hull))
	for i, p := range hull {
		rev[len(hull)-1-i] = p
	}
	if !near(rotatingCalipersDiameter(hull).Dist, rotatingCalipersDiameter(rev).Dist) ||
		!near(rotatingCalipersWidth(hull), rotatingCalipersWidth(rev)) {
		t.Errorf("orientation must not change the result")
	}
}

func TestRandomPolygonsMatchBruteForce(t *testing.T) {
	rng := rand.New(rand.NewSource(7))
	spans := []int{2, 3, 5, 10, 100}
	for iter := 0; iter < 500; iter++ {
		span := spans[rng.Intn(len(spans))]
		raw := make([]ip, 1+rng.Intn(14))
		for i := range raw {
			raw[i] = ip{rng.Intn(2*span+1) - span, rng.Intn(2*span+1) - span}
		}
		hull := monotoneChain(raw)
		if rng.Intn(2) == 0 {
			for i, j := 0, len(hull)-1; i < j; i, j = i+1, j-1 {
				hull[i], hull[j] = hull[j], hull[i]
			}
		}
		var noisy []ip
		for i, p := range hull {
			noisy = append(noisy, p)
			q := hull[(i+1)%len(hull)]
			if len(hull) >= 3 && (p.x+q.x)%2 == 0 && (p.y+q.y)%2 == 0 && rng.Intn(10) < 3 {
				noisy = append(noisy, ip{(p.x + q.x) / 2, (p.y + q.y) / 2})
			}
			if rng.Intn(10) < 2 {
				noisy = append(noisy, p)
			}
		}
		seen := map[ip]bool{}
		var uniq []ip
		for _, p := range raw {
			if !seen[p] {
				seen[p] = true
				uniq = append(uniq, p)
			}
		}
		result := rotatingCalipersDiameter(toPoints(noisy))
		if !near(result.Dist, bruteDiameter(uniq)) || !near(distance(result.P1, result.P2), result.Dist) {
			t.Fatalf("diameter mismatch for %v: got %v, want %v", raw, result.Dist, bruteDiameter(uniq))
		}
		if w, want := rotatingCalipersWidth(toPoints(noisy)), bruteWidth(monotoneChain(raw)); !near(w, want) {
			t.Fatalf("width mismatch for %v: got %v, want %v", raw, w, want)
		}
	}
}
