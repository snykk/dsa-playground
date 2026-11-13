package main

import (
	"math"
	"math/rand"
	"testing"
)

const eps = 1e-9

func seg(x1, y1, x2, y2 float64) Line {
	return Line{Point{x1, y1}, Point{x2, y2}}
}

type ip struct{ x, y int }

func onSeg(p, e, f ip) bool {
	if e == f {
		return p == e
	}
	cr := (f.x-e.x)*(p.y-e.y) - (f.y-e.y)*(p.x-e.x)
	dot := (p.x-e.x)*(f.x-e.x) + (p.y-e.y)*(f.y-e.y)
	return cr == 0 && 0 <= dot && dot <= (f.x-e.x)*(f.x-e.x)+(f.y-e.y)*(f.y-e.y)
}

// refIntersect is an independent integer reference: parametric solution, or endpoint-on-segment
// when the segments are parallel.
func refIntersect(a, b, c, d ip) bool {
	r := ip{b.x - a.x, b.y - a.y}
	s := ip{d.x - c.x, d.y - c.y}
	rxs := r.x*s.y - r.y*s.x
	if rxs != 0 {
		qp := ip{c.x - a.x, c.y - a.y}
		t := qp.x*s.y - qp.y*s.x
		u := qp.x*r.y - qp.y*r.x
		if rxs < 0 {
			rxs, t, u = -rxs, -t, -u
		}
		return 0 <= t && t <= rxs && 0 <= u && u <= rxs
	}
	return onSeg(a, c, d) || onSeg(b, c, d) || onSeg(c, a, b) || onSeg(d, a, b)
}

func distToSegment(p Point, a, b ip) float64 {
	dx, dy := float64(b.x-a.x), float64(b.y-a.y)
	len2 := dx*dx + dy*dy
	t := 0.0
	if len2 != 0 {
		t = math.Max(0, math.Min(1, ((p.X-float64(a.x))*dx+(p.Y-float64(a.y))*dy)/len2))
	}
	return math.Hypot(p.X-(float64(a.x)+t*dx), p.Y-(float64(a.y)+t*dy))
}

func TestLineIntersection(t *testing.T) {
	l1 := Line{Point{0, 0}, Point{4, 4}}
	l2 := Line{Point{0, 4}, Point{4, 0}}
	intersection := lineIntersection(l1, l2)
	if intersection == nil {
		t.Fatalf("Lines should intersect")
	}
	if math.Abs(intersection.X-2.0) > eps || math.Abs(intersection.Y-2.0) > eps {
		t.Errorf("Intersection point incorrect")
	}
}

func TestParallelLines(t *testing.T) {
	l1 := Line{Point{0, 0}, Point{1, 1}}
	l2 := Line{Point{0, 1}, Point{1, 2}}
	intersection := lineIntersection(l1, l2)
	if intersection != nil {
		t.Errorf("Parallel lines should not intersect")
	}
}

func TestSegmentIntersection(t *testing.T) {
	seg1 := Line{Point{0, 0}, Point{4, 4}}
	seg2 := Line{Point{0, 4}, Point{4, 0}}
	intersection := segmentIntersection(seg1, seg2)
	if intersection == nil {
		t.Fatalf("Segments should intersect")
	}
	if math.Abs(intersection.X-2.0) > eps || math.Abs(intersection.Y-2.0) > eps {
		t.Errorf("Intersection point incorrect")
	}
}

func TestSegmentsNoIntersection(t *testing.T) {
	seg1 := Line{Point{0, 0}, Point{1, 1}}
	seg2 := Line{Point{2, 2}, Point{3, 3}}
	if segmentIntersection(seg1, seg2) != nil || segmentsIntersect(seg1, seg2) {
		t.Errorf("Segments should not intersect")
	}
}

func TestSegmentsIntersect(t *testing.T) {
	if !segmentsIntersect(seg(0, 0, 4, 4), seg(0, 4, 4, 0)) {
		t.Errorf("Segments should intersect")
	}
}

func TestPointOnSegment(t *testing.T) {
	line := Line{Point{0, 0}, Point{4, 4}}
	p := Point{2, 2}
	if !pointOnSegment(p, line) {
		t.Errorf("Point should be on segment")
	}
}

func TestPointNotOnSegment(t *testing.T) {
	line := Line{Point{0, 0}, Point{4, 4}}
	if pointOnSegment(Point{5, 5}, line) || pointOnSegment(Point{2, 3}, line) {
		t.Errorf("Point should not be on segment")
	}
}

func TestCollinearOverlappingSegmentsIntersect(t *testing.T) {
	if !segmentsIntersect(seg(0, 0, 2, 0), seg(1, 0, 3, 0)) || !segmentsIntersect(seg(1, 0, 3, 0), seg(0, 0, 2, 0)) {
		t.Errorf("collinear overlapping segments intersect")
	}
	if p := segmentIntersection(seg(0, 0, 2, 0), seg(1, 0, 3, 0)); p == nil || p.X != 1 || p.Y != 0 {
		t.Errorf("expected the first shared point (1, 0), got %v", p)
	}
	if v := segmentIntersection(seg(0, 0, 0, 2), seg(0, 3, 0, 1)); v == nil || v.X != 0 || v.Y != 1 {
		t.Errorf("expected the first shared point (0, 1), got %v", v)
	}
}

func TestCollinearTouchingAtAnEndpoint(t *testing.T) {
	if !segmentsIntersect(seg(0, 0, 1, 0), seg(1, 0, 2, 0)) {
		t.Errorf("segments touching at (1, 0) intersect")
	}
	if p := segmentIntersection(seg(0, 0, 1, 0), seg(1, 0, 2, 0)); p == nil || p.X != 1 || p.Y != 0 {
		t.Errorf("expected (1, 0), got %v", p)
	}
}

func TestCollinearDisjointAndParallel(t *testing.T) {
	if segmentsIntersect(seg(0, 0, 1, 0), seg(2, 0, 3, 0)) || segmentsIntersect(seg(0, 0, 2, 0), seg(0, 1, 2, 1)) {
		t.Errorf("disjoint segments must not intersect")
	}
	if segmentIntersection(seg(0, 0, 1, 0), seg(2, 0, 3, 0)) != nil {
		t.Errorf("expected nil")
	}
}

func TestZeroLengthSegments(t *testing.T) {
	if !segmentsIntersect(seg(0, 0, 2, 0), seg(1, 0, 1, 0)) || segmentsIntersect(seg(0, 0, 2, 0), seg(1, 1, 1, 1)) ||
		!segmentsIntersect(seg(1, 1, 1, 1), seg(1, 1, 1, 1)) {
		t.Errorf("zero-length segment handling is wrong")
	}
	if p := segmentIntersection(seg(0, 0, 2, 0), seg(1, 0, 1, 0)); p == nil || p.X != 1 || p.Y != 0 {
		t.Errorf("expected (1, 0), got %v", p)
	}
}

func TestTJunctionAndSharedEndpoint(t *testing.T) {
	if !segmentsIntersect(seg(0, 0, 4, 0), seg(2, 0, 2, 3)) {
		t.Errorf("T-junction intersects")
	}
	if p := segmentIntersection(seg(0, 0, 4, 0), seg(2, 0, 2, 3)); p == nil || p.X != 2 || p.Y != 0 {
		t.Errorf("expected (2, 0), got %v", p)
	}
	// float endpoints shared: found whatever the order of the endpoints
	a, b := seg(0.6, 0.8, 1.0, 0.1), seg(0.2, 1.0, 1.0, 0.1)
	if !segmentsIntersect(a, b) || !segmentsIntersect(a, seg(1.0, 0.1, 0.2, 1.0)) {
		t.Errorf("segments sharing the endpoint (1.0, 0.1) intersect")
	}
	if p := segmentIntersection(a, b); p == nil || p.X != 1.0 || p.Y != 0.1 {
		t.Errorf("expected (1.0, 0.1), got %v", p)
	}
}

func TestTinyScale(t *testing.T) {
	p := lineIntersection(seg(0, 0, 1e-5, 1e-5), seg(0, 1e-5, 1e-5, 0))
	if p == nil || math.Abs(p.X-5e-6) > 1e-15 || math.Abs(p.Y-5e-6) > 1e-15 {
		t.Errorf("expected (5e-6, 5e-6), got %v", p)
	}
	if !segmentsIntersect(seg(0, 0, 1e-5, 1e-5), seg(0, 1e-5, 1e-5, 0)) {
		t.Errorf("tiny crossing segments intersect")
	}
	if !pointOnSegment(Point{5e-6, 5e-6}, seg(0, 0, 1e-5, 1e-5)) {
		t.Errorf("the midpoint is on the segment")
	}
	if pointOnSegment(Point{1e-5, 0}, seg(0, 0, 1e-5, 1e-5)) || pointOnSegment(Point{1, 0}, seg(0, 0, 1, 1)) {
		t.Errorf("a point off the segment is rejected at every scale")
	}
}

func TestCoincidentAndDegenerateLines(t *testing.T) {
	if lineIntersection(seg(0, 0, 1, 1), seg(2, 2, 3, 3)) != nil || lineIntersection(seg(0, 0, 0, 0), seg(0, 0, 1, 1)) != nil {
		t.Errorf("no single intersection point")
	}
}

func TestPointOnSegmentEndpointsAndZeroLength(t *testing.T) {
	line := seg(0, 0, 4, 4)
	if !pointOnSegment(Point{0, 0}, line) || !pointOnSegment(Point{4, 4}, line) {
		t.Errorf("endpoints are on the segment")
	}
	if !pointOnSegment(Point{1, 1}, seg(1, 1, 1, 1)) || pointOnSegment(Point{1, 2}, seg(1, 1, 1, 1)) {
		t.Errorf("a zero-length segment is a single point")
	}
}

func TestRandomIntegerSegmentsMatchReference(t *testing.T) {
	rng := rand.New(rand.NewSource(3))
	spans := []int{1, 2, 3, 5}
	for iter := 0; iter < 4000; iter++ {
		span := spans[rng.Intn(len(spans))]
		var pts [4]ip
		for i := range pts {
			pts[i] = ip{rng.Intn(span + 1), rng.Intn(span + 1)}
		}
		l1 := seg(float64(pts[0].x), float64(pts[0].y), float64(pts[1].x), float64(pts[1].y))
		l2 := seg(float64(pts[2].x), float64(pts[2].y), float64(pts[3].x), float64(pts[3].y))
		expected := refIntersect(pts[0], pts[1], pts[2], pts[3])
		if segmentsIntersect(l1, l2) != expected || segmentsIntersect(l2, l1) != expected {
			t.Fatalf("segmentsIntersect wrong for %v: want %v", pts, expected)
		}
		p := segmentIntersection(l1, l2)
		if (p != nil) != expected {
			t.Fatalf("segmentIntersection wrong for %v: want %v", pts, expected)
		}
		if p != nil && (distToSegment(*p, pts[0], pts[1]) > eps || distToSegment(*p, pts[2], pts[3]) > eps) {
			t.Fatalf("point %v is not on both segments %v", *p, pts)
		}
	}
}
