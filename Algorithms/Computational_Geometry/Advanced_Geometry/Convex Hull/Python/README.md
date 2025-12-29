# Convex Hull - Python

This folder contains a Python implementation of **Graham's Scan** and **Jarvis March** algorithms for computing convex hull.

---

## Concept

The convex hull of a set of points is the smallest convex polygon that contains all the points. This module provides two efficient algorithms for computing convex hulls.

**Key Features:**
- Graham's Scan: O(n log n) time complexity
- Jarvis March: O(nh) time complexity where h is number of hull points
- Clean, readable Python implementation
- Both algorithms return points in counterclockwise order

---

## Functions

| Function | Description | Time Complexity |
|----------|-------------|----------------|
| `graham_scan(points)` | Compute convex hull using Graham's Scan | O(n log n) |
| `jarvis_march(points)` | Compute convex hull using Jarvis March | O(nh) |

---

## Complexity

| Algorithm | Time Complexity | Space Complexity | Best For |
|-----------|----------------|------------------|----------|
| Graham's Scan | O(n log n) | O(n) | General case, many points |
| Jarvis March | O(nh) | O(n) | Few hull points (h << n) |

---

## Usage

```python
from convex_hull import Point, graham_scan, jarvis_march

points = [
    Point(0, 0), Point(1, 1), Point(2, 0), Point(1, 0.5)
]

# Graham's Scan (recommended for general case)
hull = graham_scan(points)  # O(n log n)

# Jarvis March (efficient when few hull points)
hull2 = jarvis_march(points)  # O(nh)
```

---

## Run Test

```bash
python -m unittest convex_hull_test.py
```

Or:

```bash
python convex_hull_test.py
```

---

## Important Notes

1. **Minimum Points**: Need at least 3 points for a valid convex hull
2. **Output Order**: Points are returned in counterclockwise order
3. **Polar Angle Sorting**: Graham's Scan requires sorting by polar angle
4. **Collinear Points**: Both algorithms handle collinear points

---

## When to Use

- **Graham's Scan**: Use when you have many points or need guaranteed O(n log n) performance
- **Jarvis March**: Use when the number of hull points is small (h << n)

---

## Related Files

- Main README: `../README.md`
- C++ Implementation: `../../C++/`
- Go Implementation: `../../Go/`

---

_Last Updated: December 2025_
