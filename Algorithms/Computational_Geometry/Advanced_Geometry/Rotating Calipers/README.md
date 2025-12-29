# Rotating Calipers

Algorithm for solving various geometric problems using the **rotating calipers** technique. Requires a convex hull as input.

---

## Overview

Rotating calipers is a technique used to solve several geometric problems efficiently after computing the convex hull. It uses two parallel lines that "rotate" around the convex polygon to find optimal solutions.

**Key Characteristics:**
- Efficient: O(n) time complexity after convex hull computation
- Versatile: Solves multiple geometric problems
- Optimal: Linear time for diameter, width, and other properties
- Foundation: Builds upon convex hull algorithms

---

## Algorithms

### Diameter (Maximum Distance)
Finds the maximum distance between any two points on the convex hull.

**Time Complexity:** O(n)  
**Space Complexity:** O(1)

### Width (Minimum Distance Between Parallel Lines)
Finds the minimum distance between two parallel supporting lines of the convex hull.

**Time Complexity:** O(n)  
**Space Complexity:** O(1)

### Perimeter
Calculates the perimeter of the convex hull.

**Time Complexity:** O(n)  
**Space Complexity:** O(1)

### Area
Calculates the area of the convex hull using the shoelace formula.

**Time Complexity:** O(n)  
**Space Complexity:** O(1)

---

## Complexity Analysis

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| **Diameter** | O(n) | O(1) |
| **Width** | O(n) | O(1) |
| **Perimeter** | O(n) | O(1) |
| **Area** | O(n) | O(1) |

Note: These complexities assume convex hull is already computed. Total complexity including convex hull is O(n log n).

---

## Implementations

This folder contains implementations in three languages:

- **Python** (`Python/`) - Clean, readable implementation
- **C++** (`C++/`) - Efficient implementation
- **Go** (`Go/`) - Slice-based implementation

Each implementation includes:
- Complete source code
- Comprehensive test suite
- Detailed README with usage examples

---

## Applications

1. **Shape Analysis**: Find maximum extent of shape
2. **Collision Detection**: Determine minimum separation
3. **Path Planning**: Calculate safe navigation corridors
4. **Computer Graphics**: Bounding box calculations
5. **Robotics**: Workspace analysis

---

## Usage Examples

### Python
```python
from rotating_calipers import Point, graham_scan, rotating_calipers_diameter

points = [Point(0, 0), Point(4, 0), Point(4, 3), Point(0, 3)]
hull = graham_scan(points)
diameter, p1, p2 = rotating_calipers_diameter(hull)
```

### C++
```cpp
std::vector<Point> hull = {{0, 0}, {4, 0}, {4, 3}, {0, 3}};
auto result = rotatingCalipersDiameter(hull);
```

### Go
```go
hull := []Point{{0, 0}, {4, 0}, {4, 3}, {0, 3}}
result := rotatingCalipersDiameter(hull)
```

---

## Important Notes

1. **Convex Hull Required**: Input must be a convex hull (use Graham's Scan or Jarvis March)
2. **Counterclockwise Order**: Points should be in counterclockwise order
3. **Antipodal Pairs**: Algorithm finds antipodal pairs efficiently
4. **Shoelace Formula**: Area calculation uses shoelace formula

---

## When to Use

- **Diameter**: Finding maximum distance in point set
- **Width**: Finding minimum width of shape
- **Perimeter/Area**: Calculating geometric properties
- **After Convex Hull**: When you need additional properties of convex hull

---

## Related Algorithms

- **Convex Hull**: Required preprocessing step
- **Closest Pair**: Related geometric problem
- **Line Intersection**: Used in geometric queries

---

## Testing

Run tests with:

```bash
# Python
python -m unittest rotating_calipers_test.py

# C++
g++ -o test rotating_calipers_test.cpp && ./test

# Go
go test -v
```

---

## References

- "Introduction to Algorithms" by CLRS (Chapter 33)
- "Computational Geometry in C" by Joseph O'Rourke
- Shamos, M. I. (1978). "Computational geometry"

---

_Last Updated: December 2025_
