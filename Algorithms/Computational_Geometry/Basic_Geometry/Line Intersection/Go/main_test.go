package main

import (
	"math"
	"testing"
)

const eps = 1e-5

func TestLineIntersection(t *testing.T) {
	l1 := Line{Point{0, 0}, Point{4, 4}}
	l2 := Line{Point{0, 4}, Point{4, 0}}
	intersection := lineIntersection(l1, l2)
	if intersection == nil {
		t.Errorf("Lines should intersect")
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
		t.Errorf("Segments should intersect")
	}
	if math.Abs(intersection.X-2.0) > eps || math.Abs(intersection.Y-2.0) > eps {
		t.Errorf("Intersection point incorrect")
	}
}

func TestPointOnSegment(t *testing.T) {
	line := Line{Point{0, 0}, Point{4, 4}}
	p := Point{2, 2}
	if !pointOnSegment(p, line) {
		t.Errorf("Point should be on segment")
	}
}
