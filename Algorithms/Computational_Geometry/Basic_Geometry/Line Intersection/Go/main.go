package main

import (
	"fmt"
	"math"
)

type Point struct {
	X, Y float64
}

type Line struct {
	P1, P2 Point
}

func crossProduct(o, a, b Point) float64 {
	// float64(...) stops the compiler from fusing the products into one FMA instruction,
	// which would change the rounding of the result on some CPUs.
	left := float64((a.X - o.X) * (b.Y - o.Y))
	right := float64((a.Y - o.Y) * (b.X - o.X))
	return left - right
}

// lineIntersection returns the intersection point of the two infinite lines through the
// endpoints of l1 and l2, or nil if they are parallel. That includes coincident lines (no
// single intersection point) and a Line whose two endpoints are equal (no direction).
func lineIntersection(l1, l2 Line) *Point {
	x1, y1 := l1.P1.X, l1.P1.Y
	x2, y2 := l1.P2.X, l1.P2.Y
	x3, y3 := l2.P1.X, l2.P1.Y
	x4, y4 := l2.P2.X, l2.P2.Y

	denom := float64((x1-x2)*(y3-y4)) - float64((y1-y2)*(x3-x4))
	if denom == 0 {
		return nil // parallel (exact test, so it does not depend on the scale)
	}

	t := (float64((x1-x3)*(y3-y4)) - float64((y1-y3)*(x3-x4))) / denom
	x := x1 + t*(x2-x1)
	y := y1 + t*(y2-y1)

	return &Point{X: x, Y: y}
}

func signOf(v float64) int {
	if v > 0 {
		return 1
	}
	if v < 0 {
		return -1
	}
	return 0
}

// withinBox reports whether p lies in the bounding box of a and b (used for collinear points).
func withinBox(a, b, p Point) bool {
	return math.Min(a.X, b.X) <= p.X && p.X <= math.Max(a.X, b.X) &&
		math.Min(a.Y, b.Y) <= p.Y && p.Y <= math.Max(a.Y, b.Y)
}

func lexLess(a, b Point) bool {
	return a.X < b.X || (a.X == b.X && a.Y < b.Y)
}

// segmentsIntersect reports whether the segments share at least one point. Exact orientation
// tests: crossing, touching at an endpoint, T-junctions, collinear overlap and zero-length
// segments all count.
func segmentsIntersect(l1, l2 Line) bool {
	p1, p2, p3, p4 := l1.P1, l1.P2, l2.P1, l2.P2
	o1 := crossProduct(p1, p2, p3)
	o2 := crossProduct(p1, p2, p4)
	o3 := crossProduct(p3, p4, p1)
	o4 := crossProduct(p3, p4, p2)

	// Proper crossing: each segment's endpoints are strictly on opposite sides of the other
	if signOf(o1)*signOf(o2) < 0 && signOf(o3)*signOf(o4) < 0 {
		return true
	}

	// An endpoint lying on the other segment (collinear with it and inside its box)
	return (o1 == 0 && withinBox(p1, p2, p3)) ||
		(o2 == 0 && withinBox(p1, p2, p4)) ||
		(o3 == 0 && withinBox(p3, p4, p1)) ||
		(o4 == 0 && withinBox(p3, p4, p2))
}

// segmentIntersection returns a common point of the two segments, or nil. Segments that cross
// or touch in a single point give that point (an endpoint is returned exactly). Collinear
// segments that overlap share many points; the first of them in (X, Y) order is returned. A
// zero-length segment gives its own point if it lies on the other segment.
func segmentIntersection(l1, l2 Line) *Point {
	if !segmentsIntersect(l1, l2) {
		return nil
	}

	p1, p2, p3, p4 := l1.P1, l1.P2, l2.P1, l2.P2
	denom := float64((p1.X-p2.X)*(p3.Y-p4.Y)) - float64((p1.Y-p2.Y)*(p3.X-p4.X))

	if denom == 0 {
		// Collinear overlap, touching ends or a point segment: the overlap starts at the
		// larger of the two lower ends (points on one line are ordered by (X, Y))
		lo1, lo2 := p1, p3
		if lexLess(p2, lo1) {
			lo1 = p2
		}
		if lexLess(p4, lo2) {
			lo2 = p4
		}
		if lexLess(lo1, lo2) {
			return &Point{X: lo2.X, Y: lo2.Y}
		}
		return &Point{X: lo1.X, Y: lo1.Y}
	}

	// One endpoint lies on the other segment's line: it is the intersection point
	if crossProduct(p1, p2, p3) == 0 {
		return &Point{X: p3.X, Y: p3.Y}
	}
	if crossProduct(p1, p2, p4) == 0 {
		return &Point{X: p4.X, Y: p4.Y}
	}
	if crossProduct(p3, p4, p1) == 0 {
		return &Point{X: p1.X, Y: p1.Y}
	}
	if crossProduct(p3, p4, p2) == 0 {
		return &Point{X: p2.X, Y: p2.Y}
	}

	return lineIntersection(l1, l2)
}

// pointOnSegment is an exact test; a zero-length segment is a single point.
func pointOnSegment(p Point, line Line) bool {
	if crossProduct(line.P1, line.P2, p) != 0 {
		return false
	}
	return withinBox(line.P1, line.P2, p)
}

func main() {
	fmt.Println("Line Intersection Examples:")
	fmt.Println()

	l1 := Line{Point{0, 0}, Point{4, 4}}
	l2 := Line{Point{0, 4}, Point{4, 0}}
	intersection := lineIntersection(l1, l2)
	if intersection != nil {
		fmt.Printf("Line intersection: (%.2f, %.2f)\n", intersection.X, intersection.Y)
	}

	segIntersection := segmentIntersection(l1, l2)
	if segIntersection != nil {
		fmt.Printf("Segment intersection: (%.2f, %.2f)\n", segIntersection.X, segIntersection.Y)
	}
	fmt.Printf("Segments intersect: %v\n", segmentsIntersect(l1, l2))
}
