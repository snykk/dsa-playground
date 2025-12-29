# Convex Hull - C++

This folder contains a C++ implementation of **Graham's Scan** and **Jarvis March** algorithms for computing convex hull.

---

## Concept

The convex hull of a set of points is the smallest convex polygon that contains all the points. This module provides two efficient algorithms for computing convex hulls.

**Key Features:**
- Graham's Scan: O(n log n) time complexity
- Jarvis March: O(nh) time complexity where h is number of hull points
- Efficient STL-based implementation
- Both algorithms return points in counterclockwise order

---

## Functions

| Function | Description | Time Complexity |
|----------|-------------|----------------|
| `grahamScan(points)` | Compute convex hull using Graham's Scan | O(n log n) |
| `jarvisMarch(points)` | Compute convex hull using Jarvis March | O(nh) |

---

## Complexity

| Algorithm | Time Complexity | Space Complexity | Best For |
|-----------|----------------|------------------|----------|
| Graham's Scan | O(n log n) | O(n) | General case, many points |
| Jarvis March | O(nh) | O(n) | Few hull points (h << n) |

---

## Usage

```cpp
#include "convex_hull.cpp"
#include <vector>

std::vector<Point> points = {
    {0, 0}, {1, 1}, {2, 0}, {1, 0.5}
};

// Graham's Scan (recommended for general case)
auto hull = grahamScan(points);  // O(n log n)

// Jarvis March (efficient when few hull points)
auto hull2 = jarvisMarch(points);  // O(nh)
```

---

## Compilation

```bash
g++ -std=c++11 convex_hull.cpp -o convex_hull
./convex_hull
```

---

## Run Test

```bash
g++ -std=c++11 convex_hull_test.cpp -o test && ./test
```

---

## Important Notes

1. **Minimum Points**: Need at least 3 points for a valid convex hull
2. **Output Order**: Points are returned in counterclockwise order
3. **STL Sorting**: Uses `std::sort` with custom comparator for polar angle sorting
4. **Vector Operations**: Uses `std::vector` for dynamic arrays

---

## When to Use

- **Graham's Scan**: Use when you have many points or need guaranteed O(n log n) performance
- **Jarvis March**: Use when the number of hull points is small (h << n)

---

## Related Files

- Main README: `../README.md`
- Python Implementation: `../../Python/`
- Go Implementation: `../../Go/`

---

_Last Updated: December 2025_
