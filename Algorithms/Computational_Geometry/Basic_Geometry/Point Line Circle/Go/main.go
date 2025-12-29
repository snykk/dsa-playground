package main

import (
	"fmt"
	"math"
)

const eps = 1e-9

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

func (p Point) Equals(other Point) bool {
	return math.Abs(p.X-other.X) < eps && math.Abs(p.Y-other.Y) < eps
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

func (l Line) Slope() float64 {
	if math.Abs(l.P2.X-l.P1.X) < eps {
		return math.Inf(1)
	}
	return (l.P2.Y - l.P1.Y) / (l.P2.X - l.P1.X)
}

func (l Line) IsVertical() bool {
	return math.Abs(l.P2.X-l.P1.X) < eps
}

func (l Line) IsHorizontal() bool {
	return math.Abs(l.P2.Y-l.P1.Y) < eps
}

type Circle struct {
	Center Point
	Radius float64
}

func NewCircle(center Point, radius float64) Circle {
	return Circle{Center: center, Radius: radius}
}

func (c Circle) Area() float64 {
	return math.Pi * c.Radius * c.Radius
}

func (c Circle) Circumference() float64 {
	return 2 * math.Pi * c.Radius
}

func (c Circle) ContainsPoint(point Point) bool {
	return c.Center.DistanceSquared(point) <= c.Radius*c.Radius+eps
}

func (c Circle) PointOnCircle(point Point) bool {
	distSq := c.Center.DistanceSquared(point)
	return math.Abs(distSq-c.Radius*c.Radius) < eps
}

// Geometric utility functions

func CrossProduct(o, a, b Point) float64 {
	return (a.X-o.X)*(b.Y-o.Y) - (a.Y-o.Y)*(b.X-o.X)
}

func DotProduct(o, a, b Point) float64 {
	return (a.X-o.X)*(b.X-o.X) + (a.Y-o.Y)*(b.Y-o.Y)
}

func Orientation(p, q, r Point) int {
	val := CrossProduct(p, q, r)
	if math.Abs(val) < eps {
		return 0 // Collinear
	}
	if val > 0 {
		return 2 // Counterclockwise
	}
	return 1 // Clockwise
}

func AngleBetweenPoints(o, a, b Point) float64 {
	oaX := a.X - o.X
	oaY := a.Y - o.Y
	obX := b.X - o.X
	obY := b.Y - o.Y

	dot := oaX*obX + oaY*obY
	magOA := math.Sqrt(oaX*oaX + oaY*oaY)
	magOB := math.Sqrt(obX*obX + obY*obY)

	if magOA < eps || magOB < eps {
		return 0.0
	}

	cosAngle := dot / (magOA * magOB)
	cosAngle = math.Max(-1.0, math.Min(1.0, cosAngle))
	return math.Acos(cosAngle)
}

func PointInTriangle(p, a, b, c Point) bool {
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
