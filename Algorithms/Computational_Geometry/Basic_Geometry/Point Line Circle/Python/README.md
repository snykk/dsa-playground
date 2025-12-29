# Point, Line, and Circle Operations - Python

This folder contains a Python implementation of basic geometric operations for **Point**, **Line**, and **Circle** structures.

---

## Concept

This module provides fundamental geometric primitives and operations that form the foundation of computational geometry algorithms. The implementation uses Python classes for object-oriented design.

**Key Features:**
- Object-oriented design with classes
- Floating-point tolerance for accurate comparisons
- Comprehensive geometric utility functions
- Foundation for advanced geometry algorithms

---

## Data Structures

### Point Class
Represents a 2D point with x and y coordinates.

**Methods:**
- `distance_to(other)`: Calculate Euclidean distance
- `distance_squared(other)`: Calculate squared distance (faster)

### Line Class
Represents a line segment defined by two points.

**Methods:**
- `length()`: Calculate line segment length
- `slope()`: Calculate slope (returns inf for vertical lines)
- `is_vertical()`: Check if line is vertical
- `is_horizontal()`: Check if line is horizontal

### Circle Class
Represents a circle with center point and radius.

**Methods:**
- `area()`: Calculate circle area
- `circumference()`: Calculate circle circumference
- `contains_point(point)`: Check if point is inside circle
- `point_on_circle(point)`: Check if point is on circle boundary

---

## Functions

| Function | Description | Time Complexity |
|----------|-------------|----------------|
| `cross_product(o, a, b)` | Calculate cross product of vectors | O(1) |
| `dot_product(o, a, b)` | Calculate dot product of vectors | O(1) |
| `orientation(p, q, r)` | Determine orientation (0=collinear, 1=clockwise, 2=counterclockwise) | O(1) |
| `angle_between_points(o, a, b)` | Calculate angle AOB in radians | O(1) |
| `point_in_triangle(p, a, b, c)` | Check if point is inside triangle | O(1) |

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

```python
from point_line_circle import Point, Line, Circle, orientation

# Point operations
p1 = Point(0, 0)
p2 = Point(3, 4)
distance = p1.distance_to(p2)  # 5.0

# Line operations
line = Line(Point(0, 0), Point(3, 4))
length = line.length()  # 5.0
slope = line.slope()  # 1.333...

# Circle operations
circle = Circle(Point(0, 0), 5.0)
area = circle.area()  # ~78.54
is_inside = circle.contains_point(Point(3, 4))  # True

# Geometric functions
p = Point(0, 0)
q = Point(4, 4)
r = Point(1, 2)
orient = orientation(p, q, r)  # 2 (counterclockwise)
```

---

## Run Test

```bash
python -m unittest point_line_circle_test.py
```

Or:

```bash
python point_line_circle_test.py
```

---

## Important Notes

1. **Floating-Point Precision**: All comparisons use epsilon tolerance (1e-9)
2. **Vertical Lines**: Slope returns `float('inf')` for vertical lines
3. **Distance Squared**: Use `distance_squared` when comparing distances (avoids sqrt)

---

## Related Files

- Main README: `../README.md`
- C++ Implementation: `../../C++/`
- Go Implementation: `../../Go/`

---

_Last Updated: December 2025_
