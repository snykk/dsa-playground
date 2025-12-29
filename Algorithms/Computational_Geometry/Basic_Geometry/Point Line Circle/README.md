# Point, Line, and Circle Operations

A comprehensive implementation of basic geometric operations for **Point**, **Line**, and **Circle** structures, essential building blocks for computational geometry problems.

---

## Overview

This module provides fundamental geometric primitives and operations that form the foundation of computational geometry algorithms. These operations are used extensively in problems involving geometric shapes, intersections, and spatial relationships.

**Key Characteristics:**
- Efficient: O(1) operations for most basic queries
- Accurate: Uses floating-point tolerance for comparisons
- Versatile: Supports various geometric computations
- Foundation: Essential for advanced geometry algorithms

---

## Data Structures

### Point
Represents a 2D point with x and y coordinates.

**Operations:**
- Distance calculation (Euclidean and squared)
- Point equality comparison

### Line
Represents a line segment or infinite line defined by two points.

**Operations:**
- Length calculation
- Slope computation
- Vertical/horizontal detection

### Circle
Represents a circle with center point and radius.

**Operations:**
- Area and circumference calculation
- Point containment checking
- Boundary point detection

---

## Geometric Functions

### Cross Product
Calculates the cross product of two vectors, useful for:
- Determining orientation (clockwise/counterclockwise)
- Computing signed area
- Checking collinearity

### Dot Product
Calculates the dot product of two vectors, useful for:
- Computing angles
- Projection calculations
- Perpendicularity checks

### Orientation
Determines the orientation of three points:
- **0**: Collinear
- **1**: Clockwise
- **2**: Counterclockwise

### Point in Triangle
Checks if a point lies inside a triangle using cross product tests.

---

## Complexity Analysis

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| **Point Distance** | O(1) | O(1) |
| **Line Length** | O(1) | O(1) |
| **Circle Area** | O(1) | O(1) |
| **Cross Product** | O(1) | O(1) |
| **Orientation** | O(1) | O(1) |
| **Point in Triangle** | O(1) | O(1) |

---

## Implementations

This folder contains implementations in three languages:

- **Python** (`Python/`) - Object-oriented implementation with classes
- **C++** (`C++/`) - Struct-based implementation
- **Go** (`Go/`) - Struct-based implementation with methods

Each implementation includes:
- Complete source code
- Comprehensive test suite
- Detailed README with usage examples

---

## Applications

1. **Convex Hull**: Uses orientation and cross product
2. **Line Intersection**: Uses point and line operations
3. **Closest Pair**: Uses distance calculations
4. **Polygon Operations**: Uses point containment and orientation
5. **Spatial Queries**: Uses geometric relationships

---

## Usage Examples

### Python
```python
from point_line_circle import Point, Line, Circle

# Point operations
p1 = Point(0, 0)
p2 = Point(3, 4)
distance = p1.distance_to(p2)  # 5.0

# Line operations
line = Line(Point(0, 0), Point(3, 4))
length = line.length()  # 5.0

# Circle operations
circle = Circle(Point(0, 0), 5.0)
area = circle.area()  # ~78.54
```

### C++
```cpp
Point p1(0, 0);
Point p2(3, 4);
double distance = p1.distanceTo(p2);  // 5.0

Line line(Point(0, 0), Point(3, 4));
double length = line.length();  // 5.0

Circle circle(Point(0, 0), 5.0);
double area = circle.area();  // ~78.54
```

### Go
```go
p1 := NewPoint(0, 0)
p2 := NewPoint(3, 4)
distance := p1.DistanceTo(p2)  // 5.0

line := NewLine(NewPoint(0, 0), NewPoint(3, 4))
length := line.Length()  // 5.0

circle := NewCircle(NewPoint(0, 0), 5.0)
area := circle.Area()  // ~78.54
```

---

## Important Notes

1. **Floating-Point Precision**: All comparisons use epsilon tolerance (1e-9) to handle floating-point errors
2. **Vertical Lines**: Slope returns infinity for vertical lines
3. **Distance Squared**: Use `distance_squared` when comparing distances (avoids sqrt)
4. **Orientation**: Cross product sign determines orientation

---

## Related Algorithms

- **Line Intersection**: Uses point and line operations
- **Convex Hull**: Uses orientation and cross product
- **Closest Pair**: Uses distance calculations
- **Rotating Calipers**: Uses geometric primitives

---

## Testing

Run tests with:

```bash
# Python
python -m unittest point_line_circle_test.py

# C++
g++ -o test point_line_circle_test.cpp && ./test

# Go
go test -v
```

---

## References

- "Introduction to Algorithms" by CLRS (Chapter 33)
- "Computational Geometry in C" by Joseph O'Rourke
- "Algorithm Design Manual" by Steven Skiena

---

_Last Updated: December 2025_
