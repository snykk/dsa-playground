package main

import (
	"fmt"
	"math"
)

const eps = 1e-9

type Point struct {
	X, Y float64
}

type Line struct {
	P1, P2 Point
}

func crossProduct(o, a, b Point) float64 {
	return (a.X-o.X)*(b.Y-o.Y) - (a.Y-o.Y)*(b.X-o.X)
}

func lineIntersection(l1, l2 Line) *Point {
	x1, y1 := l1.P1.X, l1.P1.Y
	x2, y2 := l1.P2.X, l1.P2.Y
	x3, y3 := l2.P1.X, l2.P1.Y
	x4, y4 := l2.P2.X, l2.P2.Y

	denom := (x1-x2)*(y3-y4) - (y1-y2)*(x3-x4)
	if math.Abs(denom) < eps {
		return nil
	}

	t := ((x1-x3)*(y3-y4) - (y1-y3)*(x3-x4)) / denom
	x := x1 + t*(x2-x1)
	y := y1 + t*(y2-y1)

	return &Point{X: x, Y: y}
}

func segmentIntersection(l1, l2 Line) *Point {
	x1, y1 := l1.P1.X, l1.P1.Y
	x2, y2 := l1.P2.X, l1.P2.Y
	x3, y3 := l2.P1.X, l2.P1.Y
	x4, y4 := l2.P2.X, l2.P2.Y

	denom := (x1-x2)*(y3-y4) - (y1-y2)*(x3-x4)
	if math.Abs(denom) < eps {
		return nil
	}

	t := ((x1-x3)*(y3-y4) - (y1-y3)*(x3-x4)) / denom
	u := -((x1-x2)*(y1-y3) - (y1-y2)*(x1-x3)) / denom

	if 0 <= t && t <= 1 && 0 <= u && u <= 1 {
		x := x1 + t*(x2-x1)
		y := y1 + t*(y2-y1)
		return &Point{X: x, Y: y}
	}

	return nil
}

func segmentsIntersect(l1, l2 Line) bool {
	return segmentIntersection(l1, l2) != nil
}

func pointOnSegment(p Point, line Line) bool {
	if math.Abs(crossProduct(line.P1, line.P2, p)) > eps {
		return false
	}

	minX := math.Min(line.P1.X, line.P2.X)
	maxX := math.Max(line.P1.X, line.P2.X)
	minY := math.Min(line.P1.Y, line.P2.Y)
	maxY := math.Max(line.P1.Y, line.P2.Y)

	return minX-eps <= p.X && p.X <= maxX+eps &&
		minY-eps <= p.Y && p.Y <= maxY+eps
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
