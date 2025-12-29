# Convex Hull

Algorithms for computing the convex hull of a set of points in 2D space, including **Graham's Scan** and **Jarvis March** (Gift Wrapping).

---

## Overview

The convex hull of a set of points is the smallest convex polygon that contains all the points. This module provides two efficient algorithms for computing convex hulls.

**Key Characteristics:**
- **Graham's Scan**: O(n log n) time complexity, optimal for general cases
- **Jarvis March**: O(nh) time complexity where h is number of hull points, efficient when h is small
- Versatile: Used in many computational geometry problems
- Foundation: Essential for advanced geometric algorithms

---

## Algorithms

### Graham's Scan
A stack-based algorithm that sorts points by polar angle and builds the hull incrementally.

**Time Complexity:** O(n log n)  
**Space Complexity:** O(n)

**Steps:**
1. Find bottom-most point (or leftmost in case of tie)
2. Sort points by polar angle with respect to bottom point
3. Build hull using stack, removing points that create clockwise turns

### Jarvis March (Gift Wrapping)
A simple algorithm that "wraps" around the points like a gift.

**Time Complexity:** O(nh) where h is number of hull points  
**Space Complexity:** O(n)

**Steps:**
1. Start with leftmost point
2. For each point, find the next point with smallest polar angle
3. Continue until returning to starting point

---

## Complexity Analysis

| Algorithm | Time Complexity | Space Complexity | Best For |
|-----------|----------------|------------------|----------|
| **Graham's Scan** | O(n log n) | O(n) | General case, many points |
| **Jarvis March** | O(nh) | O(n) | Few hull points (h << n) |

---

## Implementations

This folder contains implementations in three languages:

- **Python** (`Python/`) - Clean, readable implementation
- **C++** (`C++/`) - Efficient STL-based implementation
- **Go** (`Go/`) - Slice-based implementation

Each implementation includes:
- Complete source code
- Comprehensive test suite
- Detailed README with usage examples

---

## Applications

1. **Shape Analysis**: Find bounding shape of point set
2. **Path Planning**: Determine safe navigation regions
3. **Collision Detection**: Check if objects overlap
4. **Computer Graphics**: Rendering and clipping
5. **Robotics**: Workspace analysis

---

## Usage Examples

### Python
```python
from convex_hull import Point, graham_scan, jarvis_march

points = [Point(0, 0), Point(1, 1), Point(2, 0), Point(1, 0.5)]
hull = graham_scan(points)  # O(n log n)
hull2 = jarvis_march(points)  # O(nh)
```

### C++
```cpp
std::vector<Point> points = {{0, 0}, {1, 1}, {2, 0}, {1, 0.5}};
auto hull = grahamScan(points);
auto hull2 = jarvisMarch(points);
```

### Go
```go
points := []Point{{0, 0}, {1, 1}, {2, 0}, {1, 0.5}}
hull := grahamScan(points)
hull2 := jarvisMarch(points)
```

---

## Important Notes

1. **Polar Angle Sorting**: Graham's Scan requires sorting by polar angle
2. **Collinear Points**: Both algorithms handle collinear points
3. **Minimum Points**: Need at least 3 points for a valid convex hull
4. **Output Order**: Points are returned in counterclockwise order

---

## When to Use

- **Graham's Scan**: Use when you have many points or need guaranteed O(n log n) performance
- **Jarvis March**: Use when the number of hull points is small (h << n)

---

## Related Algorithms

- **Rotating Calipers**: Uses convex hull for diameter and width
- **Closest Pair**: Related geometric problem
- **Line Intersection**: Used in polygon operations

---

## Testing

Run tests with:

```bash
# Python
python -m unittest convex_hull_test.py

# C++
g++ -o test convex_hull_test.cpp && ./test

# Go
go test -v
```

---

## References

- "Introduction to Algorithms" by CLRS (Chapter 33)
- "Computational Geometry in C" by Joseph O'Rourke
- Graham, R. L. (1972). "An efficient algorithm for determining the convex hull of a finite planar set"

---

_Last Updated: December 2025_
