package main

import (
	"math"
	"testing"
)

const eps = 1e-9

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

func TestOrientationDoesNotDependOnScale(t *testing.T) {
	for _, k := range []float64{1e-10, 1e-5, 1.0, 1e5} {
		p, q := NewPoint(0, 0), NewPoint(4*k, 4*k)
		if Orientation(p, q, NewPoint(1*k, 2*k)) != 2 || Orientation(p, q, NewPoint(2*k, 1*k)) != 1 ||
			Orientation(p, q, NewPoint(2*k, 2*k)) != 0 {
			t.Errorf("orientation wrong at scale %v", k)
		}
	}
}

func TestDotProduct(t *testing.T) {
	if DotProduct(NewPoint(0, 0), NewPoint(3, 4), NewPoint(2, 1)) != 10 ||
		DotProduct(NewPoint(1, 1), NewPoint(2, 1), NewPoint(1, 2)) != 0 {
		t.Errorf("dot product wrong")
	}
}

func TestAngleBetweenPoints(t *testing.T) {
	o := NewPoint(0, 0)
	if math.Abs(AngleBetweenPoints(o, NewPoint(1, 0), NewPoint(0, 1))-math.Pi/2) > 1e-12 ||
		math.Abs(AngleBetweenPoints(o, NewPoint(1, 0), NewPoint(1, 1))-math.Pi/4) > 1e-12 ||
		math.Abs(AngleBetweenPoints(o, NewPoint(1, 0), NewPoint(-1, 0))-math.Pi) > 1e-12 {
		t.Errorf("angle wrong")
	}
	if AngleBetweenPoints(o, NewPoint(1, 0), NewPoint(2, 0)) != 0 || AngleBetweenPoints(o, o, NewPoint(1, 1)) != 0 {
		t.Errorf("parallel and undefined angles are 0")
	}
}

func TestAngleIsAccurateForTinyAnglesAndTinyVectors(t *testing.T) {
	o := NewPoint(0, 0)
	// acos of a clamped cosine returns 0 here
	if math.Abs(AngleBetweenPoints(o, NewPoint(1, 0), NewPoint(1, 1e-8))-1e-8) > 1e-20 {
		t.Errorf("tiny angle lost")
	}
	if math.Abs(AngleBetweenPoints(o, NewPoint(1e-10, 0), NewPoint(0, 1e-10))-math.Pi/2) > 1e-12 {
		t.Errorf("tiny vectors should still give pi/2")
	}
}

func TestPointInTriangleBoundaryAndOrientation(t *testing.T) {
	a, b, c := NewPoint(0, 0), NewPoint(4, 0), NewPoint(2, 4)
	if !PointInTriangle(NewPoint(2, 0), a, b, c) || !PointInTriangle(a, a, b, c) ||
		!PointInTriangle(NewPoint(2, 1), a, c, b) || PointInTriangle(NewPoint(2, -1), a, b, c) {
		t.Errorf("boundary or orientation handling is wrong")
	}
}

func TestPointInDegenerateTriangleIsFalse(t *testing.T) {
	o := NewPoint(0, 0)
	if PointInTriangle(NewPoint(100, 100), o, o, o) ||
		PointInTriangle(NewPoint(10, 10), NewPoint(0, 0), NewPoint(1, 1), NewPoint(2, 2)) ||
		PointInTriangle(NewPoint(1, 1), NewPoint(0, 0), NewPoint(1, 1), NewPoint(2, 2)) {
		t.Errorf("a degenerate triangle contains no point")
	}
}

func TestCircleTestsDoNotDependOnScale(t *testing.T) {
	small := NewCircle(NewPoint(0, 0), 1e-5)
	if small.ContainsPoint(NewPoint(3e-5, 0)) || !small.ContainsPoint(NewPoint(5e-6, 0)) || small.PointOnCircle(NewPoint(5e-6, 0)) {
		t.Errorf("small circle tests wrong")
	}
	zero := NewCircle(NewPoint(0, 0), 0)
	if zero.PointOnCircle(NewPoint(3e-5, 0)) || !zero.PointOnCircle(NewPoint(0, 0)) {
		t.Errorf("zero-radius circle tests wrong")
	}
	five := NewCircle(NewPoint(0, 0), 5)
	if !five.PointOnCircle(NewPoint(3, 4)) || !five.ContainsPoint(NewPoint(3, 4)) {
		t.Errorf("(3, 4) is on the circle of radius 5")
	}
}

func TestNegativeRadiusPanics(t *testing.T) {
	defer func() {
		if recover() == nil {
			t.Errorf("a negative radius must be rejected")
		}
	}()
	NewCircle(NewPoint(0, 0), -5)
}

func TestSlopeAndDirectionDoNotDependOnScale(t *testing.T) {
	tiny := NewLine(NewPoint(0, 0), NewPoint(1e-10, 1e-10))
	if math.Abs(tiny.Slope()-1.0) > 1e-12 || tiny.IsVertical() || tiny.IsHorizontal() {
		t.Errorf("tiny diagonal line misjudged")
	}
}

func TestZeroLengthLineHasNoDirection(t *testing.T) {
	dot := NewLine(NewPoint(1, 1), NewPoint(1, 1))
	if !math.IsNaN(dot.Slope()) || dot.IsVertical() || dot.IsHorizontal() || dot.LengthSquared() != 0 {
		t.Errorf("a zero-length line has no direction")
	}
	if NewLine(NewPoint(0, 0), NewPoint(3, 4)).LengthSquared() != 25 {
		t.Errorf("length squared wrong")
	}
}

func TestPointEqualityIsExact(t *testing.T) {
	if NewPoint(0, 0).Equals(NewPoint(5e-10, 0)) || !NewPoint(1.5, 2.5).Equals(NewPoint(1.5, 2.5)) {
		t.Errorf("equality must be exact")
	}
}
