package main

import (
	"math"
	"sort"
)

type Point struct {
	X, Y float64
}

type Result struct {
	Dist   float64
	P1, P2 Point
}

func distance(p1, p2 Point) float64 {
	dx := p1.X - p2.X
	dy := p1.Y - p2.Y
	return math.Sqrt(dx*dx + dy*dy)
}

func bruteForceClosestPair(points []Point) Result {
	minDist := math.MaxFloat64
	var p1, p2 Point

	for i := 0; i < len(points); i++ {
		for j := i + 1; j < len(points); j++ {
			dist := distance(points[i], points[j])
			if dist < minDist {
				minDist = dist
				p1 = points[i]
				p2 = points[j]
			}
		}
	}

	return Result{minDist, p1, p2}
}

// ranked is a point together with its position in the x-sorted order. The rank decides which
// half a point belongs to, so repeated x values and duplicate points are split exactly like
// pointsX.
type ranked struct {
	p    Point
	rank int
}

func closestPairRecursive(pointsX []Point, pointsY []ranked, start, end int) Result {
	n := end - start

	// Base case: use brute force for small sets
	if n <= 3 {
		return bruteForceClosestPair(pointsX[start:end])
	}

	// Divide: split points into left and right halves
	mid := start + n/2
	midPoint := pointsX[mid]

	// Split pointsY maintaining y-sort. Split by rank, not by X <= midPoint.X: with repeated
	// X values the two lists would no longer match the two halves.
	var leftY, rightY []ranked
	for _, r := range pointsY {
		if r.rank < mid {
			leftY = append(leftY, r)
		} else {
			rightY = append(rightY, r)
		}
	}

	// Conquer: find closest pair in each half
	leftResult := closestPairRecursive(pointsX, leftY, start, mid)
	rightResult := closestPairRecursive(pointsX, rightY, mid, end)

	// Find minimum distance from both halves
	minResult := leftResult
	if rightResult.Dist < leftResult.Dist {
		minResult = rightResult
	}
	minDist := minResult.Dist

	// Combine: check for closer pairs across the dividing line
	var strip []Point
	for _, r := range pointsY {
		if math.Abs(r.p.X-midPoint.X) < minDist {
			strip = append(strip, r.p)
		}
	}

	// Check points in strip (at most 6 points need to be checked per point)
	for i := 0; i < len(strip); i++ {
		for j := i + 1; j < len(strip) && (strip[j].Y-strip[i].Y) < minDist; j++ {
			dist := distance(strip[i], strip[j])
			if dist < minDist {
				minDist = dist
				minResult = Result{dist, strip[i], strip[j]}
			}
		}
	}

	return minResult
}

// ClosestPair finds the closest pair of points in 2D plane
// Time Complexity: O(n log n)
func ClosestPair(points []Point) Result {
	if len(points) < 2 {
		panic("Need at least 2 points")
	}

	// Sort points by x-coordinate
	pointsX := make([]Point, len(points))
	copy(pointsX, points)
	sort.Slice(pointsX, func(i, j int) bool {
		return pointsX[i].X < pointsX[j].X || (pointsX[i].X == pointsX[j].X && pointsX[i].Y < pointsX[j].Y)
	})

	// Rank every point by its position in the x order, then sort the ranked points by y
	pointsY := make([]ranked, len(pointsX))
	for i, p := range pointsX {
		pointsY[i] = ranked{p, i}
	}
	sort.Slice(pointsY, func(i, j int) bool {
		a, b := pointsY[i], pointsY[j]
		if a.p.Y != b.p.Y {
			return a.p.Y < b.p.Y
		}
		if a.p.X != b.p.X {
			return a.p.X < b.p.X
		}
		return a.rank < b.rank
	})

	return closestPairRecursive(pointsX, pointsY, 0, len(pointsX))
}
