# Point, Line, and Circle Operations - Go

This folder contains a Go implementation of basic geometric operations for **Point**, **Line**, and **Circle** structures.

---

## Concept

This module provides fundamental geometric primitives and operations that form the foundation of computational geometry algorithms. The implementation uses Go structs with methods.

**Key Features:**
- Struct-based design with methods
- Floating-point tolerance for accurate comparisons
- Comprehensive geometric utility functions
- Foundation for advanced geometry algorithms

---

## Data Structures

### Point Struct
Represents a 2D point with X and Y coordinates.

**Methods:**
- `DistanceTo(other)`: Calculate Euclidean distance
- `DistanceSquared(other)`: Calculate squared distance (faster)
- `Equals(other)`: Equality comparison

### Line Struct
Represents a line segment defined by two points.

**Methods:**
- `Length()`: Calculate line segment length
- `Slope()`: Calculate slope (returns Inf for vertical lines)
- `IsVertical()`: Check if line is vertical
- `IsHorizontal()`: Check if line is horizontal

### Circle Struct
Represents a circle with center point and radius.

**Methods:**
- `Area()`: Calculate circle area
- `Circumference()`: Calculate circle circumference
- `ContainsPoint(point)`: Check if point is inside circle
- `PointOnCircle(point)`: Check if point is on circle boundary

---

## Functions

| Function | Description | Time Complexity |
|----------|-------------|----------------|
| `CrossProduct(o, a, b)` | Calculate cross product of vectors | O(1) |
| `DotProduct(o, a, b)` | Calculate dot product of vectors | O(1) |
| `Orientation(p, q, r)` | Determine orientation (0=collinear, 1=clockwise, 2=counterclockwise) | O(1) |
| `AngleBetweenPoints(o, a, b)` | Calculate angle AOB in radians | O(1) |
| `PointInTriangle(p, a, b, c)` | Check if point is inside triangle | O(1) |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| Point Distance | O(1) | O(1) |
| Line Length | O(1) | O(1) |
| Circle Area | O(1) | O(1) |
| Cross Product | O(1) | O(1) |
| Orientation | O(1) | O(1) |

---

## Usage

```go
package main

import "fmt"

func main() {
    // Point operations
    p1 := NewPoint(0, 0)
    p2 := NewPoint(3, 4)
    distance := p1.DistanceTo(p2)  // 5.0

    // Line operations
    line := NewLine(NewPoint(0, 0), NewPoint(3, 4))
    length := line.Length()  // 5.0
    slope := line.Slope()  // 1.333...

    // Circle operations
    circle := NewCircle(NewPoint(0, 0), 5.0)
    area := circle.Area()  // ~78.54
    isInside := circle.ContainsPoint(NewPoint(3, 4))  // true

    // Geometric functions
    p := NewPoint(0, 0)
    q := NewPoint(4, 4)
    r := NewPoint(1, 2)
    orient := Orientation(p, q, r)  // 2 (counterclockwise)
}
```

---

## Run Test

```bash
go test -v
```

---

## Important Notes

1. **Floating-Point Precision**: All comparisons use epsilon tolerance (1e-9)
2. **Vertical Lines**: Slope returns `math.Inf(1)` for vertical lines
3. **Distance Squared**: Use `DistanceSquared` when comparing distances (avoids sqrt)

---

## Related Files

- Main README: `../README.md`
- Python Implementation: `../../Python/`
- C++ Implementation: `../../C++/`

---

_Last Updated: December 2025_
