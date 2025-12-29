# Line Intersection

Algorithms for finding intersections between lines and line segments in 2D space.

---

## Overview

This module provides efficient algorithms to determine if and where lines or line segments intersect. These operations are fundamental for many computational geometry problems.

**Key Characteristics:**
- Efficient: O(1) time complexity for intersection checks
- Accurate: Handles floating-point precision issues
- Versatile: Supports both infinite lines and line segments
- Foundation: Essential for polygon operations and geometric queries

---

## Algorithms

### Line Intersection (Infinite Lines)
Finds the intersection point of two infinite lines using parametric equations.

**Time Complexity:** O(1)  
**Space Complexity:** O(1)

### Segment Intersection
Finds the intersection point of two line segments if they intersect.

**Time Complexity:** O(1)  
**Space Complexity:** O(1)

### Point on Segment
Checks if a point lies on a line segment.

**Time Complexity:** O(1)  
**Space Complexity:** O(1)

---

## Complexity Analysis

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| **Line Intersection** | O(1) | O(1) |
| **Segment Intersection** | O(1) | O(1) |
| **Segments Intersect** | O(1) | O(1) |
| **Point on Segment** | O(1) | O(1) |

---

## Implementations

This folder contains implementations in three languages:

- **Python** (`Python/`) - Clean, readable implementation
- **C++** (`C++/`) - Efficient struct-based implementation
- **Go** (`Go/`) - Struct-based implementation with methods

Each implementation includes:
- Complete source code
- Comprehensive test suite
- Detailed README with usage examples

---

## Applications

1. **Polygon Operations**: Check if edges intersect
2. **Collision Detection**: Detect if objects collide
3. **Geometric Queries**: Find intersection points
4. **Path Planning**: Avoid obstacles
5. **Computer Graphics**: Line clipping and rendering

---

## Usage Examples

### Python
```python
from line_intersection import Point, Line, line_intersection, segment_intersection

l1 = Line(Point(0, 0), Point(4, 4))
l2 = Line(Point(0, 4), Point(4, 0))
intersection = line_intersection(l1, l2)  # Point(2, 2)
```

### C++
```cpp
Line l1(Point(0, 0), Point(4, 4));
Line l2(Point(0, 4), Point(4, 0));
auto intersection = lineIntersection(l1, l2);
```

### Go
```go
l1 := Line{Point{0, 0}, Point{4, 4}}
l2 := Line{Point{0, 4}, Point{4, 0}}
intersection := lineIntersection(l1, l2)
```

---

## Important Notes

1. **Parallel Lines**: Returns None/null if lines are parallel
2. **Floating-Point Precision**: Uses epsilon tolerance (1e-9) for comparisons
3. **Segment Bounds**: Segment intersection checks if intersection is within [0,1] parameter range
4. **Collinearity**: Point on segment checks collinearity first, then bounds

---

## Related Algorithms

- **Point, Line, Circle Operations**: Uses geometric primitives
- **Convex Hull**: Uses intersection checks
- **Polygon Operations**: Uses segment intersection

---

## Testing

Run tests with:

```bash
# Python
python -m unittest line_intersection_test.py

# C++
g++ -o test line_intersection_test.cpp && ./test

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
