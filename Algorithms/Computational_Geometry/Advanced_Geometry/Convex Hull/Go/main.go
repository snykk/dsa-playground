package main

import (
	"fmt"
	"sort"
)

type Point struct {
	X, Y float64
}

func crossProduct(o, a, b Point) float64 {
	// float64(...) stops the compiler from fusing the products into one FMA instruction,
	// which would change the rounding of the result on some CPUs.
	left := float64((a.X - o.X) * (b.Y - o.Y))
	right := float64((a.Y - o.Y) * (b.X - o.X))
	return left - right
}

func distanceSquared(p1, p2 Point) float64 {
	dx := p1.X - p2.X
	dy := p1.Y - p2.Y
	return dx*dx + dy*dy
}

// distinctPoints returns the distinct points (exact comparison) sorted by (X, Y).
// It works on a copy, so the caller's slice is never reordered.
func distinctPoints(points []Point) []Point {
	pts := make([]Point, len(points))
	copy(pts, points)
	sort.Slice(pts, func(i, j int) bool {
		return pts[i].X < pts[j].X || (pts[i].X == pts[j].X && pts[i].Y < pts[j].Y)
	})
	out := pts[:0]
	for i, p := range pts {
		if i == 0 || p != out[len(out)-1] {
			out = append(out, p)
		}
	}
	return out
}

// grahamScan returns the hull counterclockwise, starting at the bottom-most point (leftmost
// on a tie). Points on a hull edge are excluded. Duplicates are removed; fewer than three
// distinct points are returned as they are. Comparisons are exact, so integer input never
// goes wrong. The input slice is not modified.
func grahamScan(points []Point) []Point {
	pts := distinctPoints(points)
	if len(pts) < 3 {
		sort.Slice(pts, func(i, j int) bool {
			return pts[i].Y < pts[j].Y || (pts[i].Y == pts[j].Y && pts[i].X < pts[j].X)
		})
		return pts
	}

	// Find bottom-most point (or leftmost in case of tie)
	bottomIdx := 0
	for i, p := range pts {
		if p.Y < pts[bottomIdx].Y || (p.Y == pts[bottomIdx].Y && p.X < pts[bottomIdx].X) {
			bottomIdx = i
		}
	}
	pts[0], pts[bottomIdx] = pts[bottomIdx], pts[0]
	bottom := pts[0]

	// Sort by polar angle around bottom: a comes first if b is counterclockwise of it.
	// All points lie in the upper half-plane of bottom, so this is a strict weak ordering.
	// Points on the same ray are ordered nearest first.
	rest := pts[1:]
	sort.Slice(rest, func(i, j int) bool {
		cross := crossProduct(bottom, rest[i], rest[j])
		if cross != 0 {
			return cross > 0
		}
		return distanceSquared(bottom, rest[i]) < distanceSquared(bottom, rest[j])
	})

	// Build convex hull using stack; drop right turns and collinear points
	hull := []Point{}
	for _, p := range pts {
		for len(hull) > 1 && crossProduct(hull[len(hull)-2], hull[len(hull)-1], p) <= 0 {
			hull = hull[:len(hull)-1]
		}
		hull = append(hull, p)
	}

	return hull
}

// jarvisMarch returns the hull counterclockwise, starting at the leftmost point (lowest on a
// tie). Points on a hull edge are excluded. Duplicates are removed; fewer than three
// distinct points are returned as they are. Comparisons are exact, so integer input never
// goes wrong. The input slice is not modified.
func jarvisMarch(points []Point) []Point {
	pts := distinctPoints(points) // sorted by (X, Y)
	if len(pts) < 3 {
		return pts
	}

	// Leftmost point is the first one after sorting by (X, Y)
	leftmost := pts[0]
	hull := []Point{leftmost}

	// A hull never has more vertices than points; the bound only guards rounding trouble
	// with non-integer coordinates.
	for len(hull) <= len(pts) {
		current := hull[len(hull)-1]
		var nextPoint Point
		found := false

		// Find the point such that every other point is on its left (or on the line)
		for _, point := range pts {
			if point == current {
				continue
			}
			if !found {
				nextPoint = point
				found = true
				continue
			}

			cross := crossProduct(current, nextPoint, point)

			// If point is more clockwise, or on the same ray but farther
			if cross < 0 || (cross == 0 && distanceSquared(current, point) > distanceSquared(current, nextPoint)) {
				nextPoint = point
			}
		}

		// If we've completed the hull
		if nextPoint == leftmost {
			break
		}

		hull = append(hull, nextPoint)
	}

	return hull
}

func main() {
	fmt.Println("Convex Hull Examples:")
	fmt.Println()

	points := []Point{
		{0, 3}, {2, 2}, {1, 1}, {2, 1}, {3, 0}, {0, 0}, {3, 3},
	}

	fmt.Print("Points: ")
	for _, p := range points {
		fmt.Printf("(%.0f,%.0f) ", p.X, p.Y)
	}
	fmt.Println()
	fmt.Println()

	// Graham's Scan
	grahamHull := grahamScan(points)
	fmt.Print("Graham's Scan hull: ")
	for _, p := range grahamHull {
		fmt.Printf("(%.0f,%.0f) ", p.X, p.Y)
	}
	fmt.Println()
	fmt.Println()

	// Jarvis March
	jarvisHull := jarvisMarch(points)
	fmt.Print("Jarvis March hull: ")
	for _, p := range jarvisHull {
		fmt.Printf("(%.0f,%.0f) ", p.X, p.Y)
	}
	fmt.Println()
}
