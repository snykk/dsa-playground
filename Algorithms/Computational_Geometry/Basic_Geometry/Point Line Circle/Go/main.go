package main

import (
	"fmt"
	"math"
)

type Point struct {
	X, Y float64
}

func NewPoint(x, y float64) Point {
	return Point{X: x, Y: y}
}

func (p Point) DistanceTo(other Point) float64 {
	dx := p.X - other.X
	dy := p.Y - other.Y
	return math.Sqrt(dx*dx + dy*dy)
}

func (p Point) DistanceSquared(other Point) float64 {
	dx := p.X - other.X
	dy := p.Y - other.Y
	return dx*dx + dy*dy
}

// Equals is exact coordinate equality (no tolerance), the same as p == other.
func (p Point) Equals(other Point) bool {
	return p.X == other.X && p.Y == other.Y
}

type Line struct {
	P1, P2 Point
}

func NewLine(p1, p2 Point) Line {
	return Line{P1: p1, P2: p2}
}

func (l Line) Length() float64 {
	return l.P1.DistanceTo(l.P2)
}

func (l Line) LengthSquared() float64 {
	return l.P1.DistanceSquared(l.P2)
}

// Slope is +Inf for a vertical line and NaN for a zero-length line (it has no direction).
// The test is exact, so it does not depend on the scale.
func (l Line) Slope() float64 {
	if l.P1 == l.P2 {
		return math.NaN()
	}
	if l.P2.X == l.P1.X {
		return math.Inf(1)
	}
	return (l.P2.Y - l.P1.Y) / (l.P2.X - l.P1.X)
}

// IsVertical: exactly equal X, and not a zero-length line.
func (l Line) IsVertical() bool {
	return l.P2.X == l.P1.X && l.P2.Y != l.P1.Y
}

// IsHorizontal: exactly equal Y, and not a zero-length line.
func (l Line) IsHorizontal() bool {
	return l.P2.Y == l.P1.Y && l.P2.X != l.P1.X
}

type Circle struct {
	Center Point
	Radius float64
}

// NewCircle panics for a negative (or NaN) radius.
func NewCircle(center Point, radius float64) Circle {
	if !(radius >= 0) {
		panic("radius must be non-negative")
	}
	return Circle{Center: center, Radius: radius}
}

func (c Circle) Area() float64 {
	return math.Pi * c.Radius * c.Radius
}

func (c Circle) Circumference() float64 {
	return 2 * math.Pi * c.Radius
}

// ContainsPoint: inside or on the circle (exact comparison of squared distances).
func (c Circle) ContainsPoint(point Point) bool {
	return c.Center.DistanceSquared(point) <= c.Radius*c.Radius
}

// PointOnCircle: exactly on the boundary (exact comparison).
func (c Circle) PointOnCircle(point Point) bool {
	return c.Center.DistanceSquared(point) == c.Radius*c.Radius
}

// Geometric utility functions

func CrossProduct(o, a, b Point) float64 {
	// float64(...) stops the compiler from fusing the products into one FMA instruction,
	// which would change the rounding of the result on some CPUs.
	left := float64((a.X - o.X) * (b.Y - o.Y))
	right := float64((a.Y - o.Y) * (b.X - o.X))
	return left - right
}

func DotProduct(o, a, b Point) float64 {
	return (a.X-o.X)*(b.X-o.X) + (a.Y-o.Y)*(b.Y-o.Y)
}

// Orientation returns 0 for collinear, 1 for clockwise and 2 for counterclockwise. It is
// exact: the sign of the cross product.
func Orientation(p, q, r Point) int {
	val := CrossProduct(p, q, r)
	if val == 0 {
		return 0 // Collinear
	}
	if val > 0 {
		return 2 // Counterclockwise
	}
	return 1 // Clockwise
}

// AngleBetweenPoints returns the angle AOB in radians, in [0, pi]. It uses atan2(|cross|, dot),
// which stays accurate for angles near 0 and pi. It returns 0 if A or B coincides with O.
func AngleBetweenPoints(o, a, b Point) float64 {
	oaX := a.X - o.X
	oaY := a.Y - o.Y
	obX := b.X - o.X
	obY := b.Y - o.Y

	if (oaX == 0 && oaY == 0) || (obX == 0 && obY == 0) {
		return 0.0
	}

	cross := float64(oaX*obY) - float64(oaY*obX)
	dot := oaX*obX + oaY*obY
	return math.Atan2(math.Abs(cross), dot)
}

// PointInTriangle reports whether p is inside triangle ABC or on its boundary (either
// orientation). A degenerate triangle (collinear or repeated vertices) contains no point.
func PointInTriangle(p, a, b, c Point) bool {
	if CrossProduct(a, b, c) == 0 {
		return false
	}

	d1 := CrossProduct(p, a, b)
	d2 := CrossProduct(p, b, c)
	d3 := CrossProduct(p, c, a)

	hasNeg := d1 < 0 || d2 < 0 || d3 < 0
	hasPos := d1 > 0 || d2 > 0 || d3 > 0

	return !(hasNeg && hasPos)
}

func main() {
	fmt.Println("Point, Line, and Circle Operations Examples:")
	fmt.Println()

	// Point operations
	p1 := NewPoint(0, 0)
	p2 := NewPoint(3, 4)
	fmt.Printf("Distance between (%.0f, %.0f) and (%.0f, %.0f): %.2f\n",
		p1.X, p1.Y, p2.X, p2.Y, p1.DistanceTo(p2))
	fmt.Println()

	// Line operations
	line := NewLine(NewPoint(0, 0), NewPoint(3, 4))
	fmt.Printf("Line length: %.2f\n", line.Length())
	fmt.Printf("Line slope: %.2f\n", line.Slope())
	fmt.Println()

	// Circle operations
	circle := NewCircle(NewPoint(0, 0), 5.0)
	fmt.Printf("Circle area: %.2f\n", circle.Area())
	fmt.Printf("Circle circumference: %.2f\n", circle.Circumference())
	fmt.Printf("Point (3, 4) in circle: %v\n", circle.ContainsPoint(NewPoint(3, 4)))
	fmt.Printf("Point (5, 0) on circle: %v\n", circle.PointOnCircle(NewPoint(5, 0)))
	fmt.Println()

	// Orientation
	p := NewPoint(0, 0)
	q := NewPoint(4, 4)
	r := NewPoint(1, 2)
	orient := Orientation(p, q, r)
	fmt.Printf("Orientation of ((%.0f, %.0f), (%.0f, %.0f), (%.0f, %.0f)): %d (0=collinear, 1=clockwise, 2=counterclockwise)\n",
		p.X, p.Y, q.X, q.Y, r.X, r.Y, orient)
}
