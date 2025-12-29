# Point, Line, and Circle Operations - C++

This folder contains a C++ implementation of basic geometric operations for **Point**, **Line**, and **Circle** structures.

---

## Concept

This module provides fundamental geometric primitives and operations that form the foundation of computational geometry algorithms. The implementation uses C++ structs for efficient memory layout.

**Key Features:**
- Struct-based design for efficiency
- Floating-point tolerance for accurate comparisons
- Comprehensive geometric utility functions
- Foundation for advanced geometry algorithms

---

## Data Structures

### Point Struct
Represents a 2D point with x and y coordinates.

**Methods:**
- `distanceTo(other)`: Calculate Euclidean distance
- `distanceSquared(other)`: Calculate squared distance (faster)
- `operator==`: Equality comparison

### Line Struct
Represents a line segment defined by two points.

**Methods:**
- `length()`: Calculate line segment length
- `slope()`: Calculate slope (returns inf for vertical lines)
- `isVertical()`: Check if line is vertical
- `isHorizontal()`: Check if line is horizontal

### Circle Struct
Represents a circle with center point and radius.

**Methods:**
- `area()`: Calculate circle area
- `circumference()`: Calculate circle circumference
- `containsPoint(point)`: Check if point is inside circle
- `pointOnCircle(point)`: Check if point is on circle boundary

---

## Functions

| Function | Description | Time Complexity |
|----------|-------------|----------------|
| `crossProduct(o, a, b)` | Calculate cross product of vectors | O(1) |
| `dotProduct(o, a, b)` | Calculate dot product of vectors | O(1) |
| `orientation(p, q, r)` | Determine orientation (0=collinear, 1=clockwise, 2=counterclockwise) | O(1) |
| `angleBetweenPoints(o, a, b)` | Calculate angle AOB in radians | O(1) |
| `pointInTriangle(p, a, b, c)` | Check if point is inside triangle | O(1) |

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

```cpp
#include "point_line_circle.cpp"

// Point operations
Point p1(0, 0);
Point p2(3, 4);
double distance = p1.distanceTo(p2);  // 5.0

// Line operations
Line line(Point(0, 0), Point(3, 4));
double length = line.length();  // 5.0
double slope = line.slope();  // 1.333...

// Circle operations
Circle circle(Point(0, 0), 5.0);
double area = circle.area();  // ~78.54
bool is_inside = circle.containsPoint(Point(3, 4));  // true

// Geometric functions
Point p(0, 0);
Point q(4, 4);
Point r(1, 2);
int orient = orientation(p, q, r);  // 2 (counterclockwise)
```

---

## Compilation

```bash
g++ -std=c++11 point_line_circle.cpp -o point_line_circle
./point_line_circle
```

---

## Run Test

```bash
g++ -std=c++11 point_line_circle_test.cpp -o test && ./test
```

---

## Important Notes

1. **Floating-Point Precision**: All comparisons use epsilon tolerance (1e-9)
2. **Vertical Lines**: Slope returns `std::numeric_limits<double>::infinity()` for vertical lines
3. **Distance Squared**: Use `distanceSquared` when comparing distances (avoids sqrt)

---

## Related Files

- Main README: `../README.md`
- Python Implementation: `../../Python/`
- Go Implementation: `../../Go/`

---

_Last Updated: December 2025_
