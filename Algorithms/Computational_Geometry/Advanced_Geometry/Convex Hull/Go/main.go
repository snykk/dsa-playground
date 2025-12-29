package main

import (
	"fmt"
	"math"
	"sort"
)

const eps = 1e-9

type Point struct {
	X, Y float64
}

func crossProduct(o, a, b Point) float64 {
	return (a.X-o.X)*(b.Y-o.Y) - (a.Y-o.Y)*(b.X-o.X)
}

func distanceSquared(p1, p2 Point) float64 {
	dx := p1.X - p2.X
	dy := p1.Y - p2.Y
	return dx*dx + dy*dy
}

func grahamScan(points []Point) []Point {
	if len(points) < 3 {
		return points
	}

	// Find bottom-most point
	bottom := points[0]
	for _, p := range points {
		if p.Y < bottom.Y || (math.Abs(p.Y-bottom.Y) < eps && p.X < bottom.X) {
			bottom = p
		}
	}

	// Sort points by polar angle
	sort.Slice(points, func(i, j int) bool {
		dx1 := points[i].X - bottom.X
		dy1 := points[i].Y - bottom.Y
		dx2 := points[j].X - bottom.X
		dy2 := points[j].Y - bottom.Y

		angle1 := math.Atan2(dy1, dx1)
		angle2 := math.Atan2(dy2, dx2)

		if math.Abs(angle1-angle2) < eps {
			return distanceSquared(bottom, points[i]) < distanceSquared(bottom, points[j])
		}
		return angle1 < angle2
	})

	// Remove duplicates
	uniquePoints := []Point{points[0]}
	for i := 1; i < len(points); i++ {
		if !pointsEqual(points[i], uniquePoints[len(uniquePoints)-1]) {
			uniquePoints = append(uniquePoints, points[i])
		}
	}

	if len(uniquePoints) < 3 {
		return uniquePoints
	}

	// Build convex hull using stack
	hull := []Point{uniquePoints[0], uniquePoints[1]}

	for i := 2; i < len(uniquePoints); i++ {
		for len(hull) > 1 && crossProduct(hull[len(hull)-2], hull[len(hull)-1], uniquePoints[i]) <= 0 {
			hull = hull[:len(hull)-1]
		}
		hull = append(hull, uniquePoints[i])
	}

	return hull
}

func jarvisMarch(points []Point) []Point {
	if len(points) < 3 {
		return points
	}

	// Find leftmost point
	leftmost := points[0]
	for _, p := range points {
		if p.X < leftmost.X || (math.Abs(p.X-leftmost.X) < eps && p.Y < leftmost.Y) {
			leftmost = p
		}
	}

	hull := []Point{leftmost}

	for {
		current := hull[len(hull)-1]
		nextPoint := points[0]

		// Find point with smallest polar angle from current
		for _, point := range points {
			if pointsEqual(point, current) {
				continue
			}

			cross := crossProduct(current, nextPoint, point)
			distNext := distanceSquared(current, nextPoint)
			distPoint := distanceSquared(current, point)

			// If point is more counterclockwise, or same angle but farther
			if cross < 0 || (math.Abs(cross) < eps && distPoint > distNext) {
				nextPoint = point
			}
		}

		// If we've completed the hull
		if pointsEqual(nextPoint, leftmost) {
			break
		}

		hull = append(hull, nextPoint)
	}

	return hull
}

func pointsEqual(p1, p2 Point) bool {
	return math.Abs(p1.X-p2.X) < eps && math.Abs(p1.Y-p2.Y) < eps
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
