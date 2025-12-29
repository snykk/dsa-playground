package main

import (
	"math"
	"testing"
)

const eps = 1e-5

func TestPoint(t *testing.T) {
	p := NewPoint(1, 2)
	if math.Abs(p.X-1) > eps || math.Abs(p.Y-2) > eps {
		t.Errorf("Point creation failed")
	}

	p1 := NewPoint(0, 0)
	p2 := NewPoint(3, 4)
	if math.Abs(p1.DistanceTo(p2)-5.0) > eps {
		t.Errorf("Distance calculation failed")
	}
	if math.Abs(p1.DistanceSquared(p2)-25.0) > eps {
		t.Errorf("Distance squared calculation failed")
	}

	p3 := NewPoint(1.0, 2.0)
	p4 := NewPoint(1.0, 2.0)
	if !p3.Equals(p4) {
		t.Errorf("Point equality failed")
	}
}

func TestLine(t *testing.T) {
	line := NewLine(NewPoint(0, 0), NewPoint(3, 4))
	if math.Abs(line.Length()-5.0) > eps {
		t.Errorf("Line length calculation failed")
	}

	line2 := NewLine(NewPoint(0, 0), NewPoint(2, 4))
	if math.Abs(line2.Slope()-2.0) > eps {
		t.Errorf("Line slope calculation failed")
	}

	vertical := NewLine(NewPoint(0, 0), NewPoint(0, 5))
	if !vertical.IsVertical() {
		t.Errorf("Vertical line detection failed")
	}
	if !math.IsInf(vertical.Slope(), 1) {
		t.Errorf("Vertical line slope should be infinity")
	}

	horizontal := NewLine(NewPoint(0, 0), NewPoint(5, 0))
	if !horizontal.IsHorizontal() {
		t.Errorf("Horizontal line detection failed")
	}
}

func TestCircle(t *testing.T) {
	circle := NewCircle(NewPoint(0, 0), 5.0)
	if math.Abs(circle.Area()-math.Pi*25) > eps {
		t.Errorf("Circle area calculation failed")
	}
	if math.Abs(circle.Circumference()-2*math.Pi*5) > eps {
		t.Errorf("Circle circumference calculation failed")
	}

	if !circle.ContainsPoint(NewPoint(3, 4)) {
		t.Errorf("Point should be inside circle")
	}
	if !circle.ContainsPoint(NewPoint(0, 0)) {
		t.Errorf("Center point should be inside circle")
	}
	if circle.ContainsPoint(NewPoint(10, 10)) {
		t.Errorf("Point should be outside circle")
	}

	if !circle.PointOnCircle(NewPoint(5, 0)) {
		t.Errorf("Point should be on circle")
	}
	if !circle.PointOnCircle(NewPoint(0, 5)) {
		t.Errorf("Point should be on circle")
	}
}

func TestGeometricFunctions(t *testing.T) {
	o := NewPoint(0, 0)
	a := NewPoint(1, 0)
	b := NewPoint(0, 1)
	if math.Abs(CrossProduct(o, a, b)-1.0) > eps {
		t.Errorf("Cross product calculation failed")
	}

	p := NewPoint(0, 0)
	q := NewPoint(4, 4)
	r := NewPoint(1, 2)
	if Orientation(p, q, r) != 2 {
		t.Errorf("Orientation should be counterclockwise")
	}

	r2 := NewPoint(2, 1)
	if Orientation(p, q, r2) != 1 {
		t.Errorf("Orientation should be clockwise")
	}

	r3 := NewPoint(2, 2)
	if Orientation(p, q, r3) != 0 {
		t.Errorf("Orientation should be collinear")
	}

	aTri := NewPoint(0, 0)
	bTri := NewPoint(4, 0)
	cTri := NewPoint(2, 4)
	pIn := NewPoint(2, 1)
	if !PointInTriangle(pIn, aTri, bTri, cTri) {
		t.Errorf("Point should be inside triangle")
	}

	pOut := NewPoint(10, 10)
	if PointInTriangle(pOut, aTri, bTri, cTri) {
		t.Errorf("Point should be outside triangle")
	}
}
