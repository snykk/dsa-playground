package main

import (
	"fmt"
	"math"
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

func distance(p1, p2 Point) float64 {
	return math.Sqrt(distanceSquared(p1, p2))
}

type DiameterResult struct {
	Dist   float64
	P1, P2 Point
}

// cleanPolygon returns the strictly convex vertex list of a convex polygon given in order:
// consecutive repeated vertices and vertices lying on an edge are removed. If every point is
// collinear the result is the two end points (or one point). Comparisons are exact.
func cleanPolygon(hull []Point) []Point {
	lexLess := func(a, b Point) bool { return a.X < b.X || (a.X == b.X && a.Y < b.Y) }

	var pts []Point
	for _, p := range hull {
		if len(pts) == 0 || p != pts[len(pts)-1] {
			pts = append(pts, p)
		}
	}
	for len(pts) > 1 && pts[0] == pts[len(pts)-1] {
		pts = pts[:len(pts)-1]
	}
	if len(pts) < 3 {
		return pts
	}

	// All points on one line: keep the two end points
	allCollinear := true
	for _, p := range pts {
		if crossProduct(pts[0], pts[1], p) != 0 {
			allCollinear = false
			break
		}
	}
	if allCollinear {
		lo, hi := pts[0], pts[0]
		for _, p := range pts {
			if lexLess(p, lo) {
				lo = p
			}
			if lexLess(hi, p) {
				hi = p
			}
		}
		return []Point{lo, hi}
	}

	// Drop vertices that lie on an edge (zero turn), including across the wrap-around
	var out []Point
	for _, p := range pts {
		for len(out) >= 2 && crossProduct(out[len(out)-2], out[len(out)-1], p) == 0 {
			out = out[:len(out)-1]
		}
		out = append(out, p)
	}
	for len(out) >= 3 && crossProduct(out[len(out)-2], out[len(out)-1], out[0]) == 0 {
		out = out[:len(out)-1]
	}
	for len(out) >= 3 && crossProduct(out[len(out)-1], out[0], out[1]) == 0 {
		out = out[1:]
	}
	return out
}

// rotatingCalipersDiameter returns the diameter of a convex polygon given in order (either
// orientation). For the edge (i, i+1) the pointer j moves to the vertex farthest from that
// edge, measured by triangle area; the farthest pair is always one of the antipodal pairs
// this produces.
func rotatingCalipersDiameter(hull []Point) DiameterResult {
	pts := cleanPolygon(hull)
	if len(pts) == 0 {
		return DiameterResult{0, Point{0, 0}, Point{0, 0}}
	}
	if len(pts) == 1 {
		return DiameterResult{0, pts[0], pts[0]}
	}
	if len(pts) == 2 {
		return DiameterResult{distance(pts[0], pts[1]), pts[0], pts[1]}
	}

	n := len(pts)
	maxDist := -1.0
	p1, p2 := pts[0], pts[1]

	j := 1
	for i := 0; i < n; i++ {
		nextI := (i + 1) % n

		// Advance j to the vertex farthest from the edge (i, i+1)
		for {
			nextJ := (j + 1) % n
			if math.Abs(crossProduct(pts[i], pts[nextI], pts[nextJ])) > math.Abs(crossProduct(pts[i], pts[nextI], pts[j])) {
				j = nextJ
			} else {
				break
			}
		}

		// An edge parallel to (i, i+1) has two antipodal endpoints: j and j + 1
		candidates := []int{j}
		nextJ := (j + 1) % n
		if math.Abs(crossProduct(pts[i], pts[nextI], pts[nextJ])) == math.Abs(crossProduct(pts[i], pts[nextI], pts[j])) {
			candidates = append(candidates, nextJ)
		}

		for _, k := range candidates {
			for _, m := range []int{i, nextI} {
				dist := distanceSquared(pts[m], pts[k])
				if dist > maxDist {
					maxDist = dist
					p1, p2 = pts[m], pts[k]
				}
			}
		}
	}

	return DiameterResult{math.Sqrt(maxDist), p1, p2}
}

// rotatingCalipersWidth returns the width of a convex polygon given in order (either
// orientation); 0 for fewer than three distinct corners (a point, a segment or collinear points).
func rotatingCalipersWidth(hull []Point) float64 {
	pts := cleanPolygon(hull)
	if len(pts) < 3 {
		return 0.0
	}

	n := len(pts)
	minWidth := math.Inf(1)

	j := 1
	for i := 0; i < n; i++ {
		nextI := (i + 1) % n

		// Advance j to the vertex farthest from the edge (i, i+1)
		for {
			nextJ := (j + 1) % n
			if math.Abs(crossProduct(pts[i], pts[nextI], pts[nextJ])) > math.Abs(crossProduct(pts[i], pts[nextI], pts[j])) {
				j = nextJ
			} else {
				break
			}
		}

		// Distance from vertex j to the line through i and i+1
		lineLength := distance(pts[i], pts[nextI])
		width := math.Abs(crossProduct(pts[i], pts[nextI], pts[j])) / lineLength
		if width < minWidth {
			minWidth = width
		}
	}

	return minWidth
}

func rotatingCalipersPerimeter(hull []Point) float64 {
	if len(hull) < 2 {
		return 0.0
	}

	perimeter := 0.0
	n := len(hull)

	for i := 0; i < n; i++ {
		nextI := (i + 1) % n
		dx := hull[nextI].X - hull[i].X
		dy := hull[nextI].Y - hull[i].Y
		perimeter += math.Sqrt(dx*dx + dy*dy)
	}

	return perimeter
}

func rotatingCalipersArea(hull []Point) float64 {
	if len(hull) < 3 {
		return 0.0
	}

	area := 0.0
	n := len(hull)

	for i := 0; i < n; i++ {
		j := (i + 1) % n
		area += hull[i].X * hull[j].Y
		area -= hull[j].X * hull[i].Y
	}

	return math.Abs(area) / 2.0
}

func main() {
	fmt.Println("Rotating Calipers Examples:")
	fmt.Println()

	hull := []Point{
		{0, 0}, {4, 0}, {4, 3}, {0, 3},
	}

	fmt.Print("Convex hull: ")
	for _, p := range hull {
		fmt.Printf("(%.0f,%.0f) ", p.X, p.Y)
	}
	fmt.Println()
	fmt.Println()

	diameterResult := rotatingCalipersDiameter(hull)
	fmt.Printf("Diameter: %.2f\n", diameterResult.Dist)
	fmt.Printf("Between points: (%.0f,%.0f) and (%.0f,%.0f)\n",
		diameterResult.P1.X, diameterResult.P1.Y, diameterResult.P2.X, diameterResult.P2.Y)
	fmt.Println()

	width := rotatingCalipersWidth(hull)
	fmt.Printf("Width: %.2f\n", width)
	fmt.Println()

	perimeter := rotatingCalipersPerimeter(hull)
	fmt.Printf("Perimeter: %.2f\n", perimeter)
	fmt.Println()

	area := rotatingCalipersArea(hull)
	fmt.Printf("Area: %.2f\n", area)
}
