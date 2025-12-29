package main

import (
	"fmt"
	"math"
)

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

func distance(p1, p2 Point) float64 {
	return math.Sqrt(distanceSquared(p1, p2))
}

type DiameterResult struct {
	Dist   float64
	P1, P2 Point
}

func rotatingCalipersDiameter(hull []Point) DiameterResult {
	if len(hull) < 2 {
		if len(hull) == 0 {
			return DiameterResult{0, Point{0, 0}, Point{0, 0}}
		}
		return DiameterResult{0, hull[0], hull[0]}
	}

	n := len(hull)
	maxDist := 0.0
	p1, p2 := hull[0], hull[1]

	j := 1
	for i := 0; i < n; i++ {
		for {
			nextJ := (j + 1) % n
			distCurrent := distanceSquared(hull[i], hull[j])
			distNext := distanceSquared(hull[i], hull[nextJ])

			if distNext > distCurrent {
				j = nextJ
			} else {
				break
			}
		}

		dist := distanceSquared(hull[i], hull[j])
		if dist > maxDist {
			maxDist = dist
			p1 = hull[i]
			p2 = hull[j]
		}
	}

	return DiameterResult{math.Sqrt(maxDist), p1, p2}
}

func rotatingCalipersWidth(hull []Point) float64 {
	if len(hull) < 3 {
		return 0.0
	}

	n := len(hull)
	minWidth := math.MaxFloat64

	j := 1
	for i := 0; i < n; i++ {
		nextI := (i + 1) % n

		for {
			nextJ := (j + 1) % n
			areaNext := math.Abs(crossProduct(hull[i], hull[nextI], hull[nextJ]))
			areaCurrent := math.Abs(crossProduct(hull[i], hull[nextI], hull[j]))

			if areaNext > areaCurrent {
				j = nextJ
			} else {
				break
			}
		}

		dx := hull[nextI].X - hull[i].X
		dy := hull[nextI].Y - hull[i].Y
		lineLength := math.Sqrt(dx*dx + dy*dy)

		if lineLength > 1e-9 {
			area := math.Abs(crossProduct(hull[i], hull[nextI], hull[j]))
			width := area / lineLength
			if width < minWidth {
				minWidth = width
			}
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
