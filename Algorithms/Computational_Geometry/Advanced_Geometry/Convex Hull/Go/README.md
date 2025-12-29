# Convex Hull - Go

This folder contains a Go implementation of **Graham's Scan** and **Jarvis March** algorithms for computing convex hull.

---

## Concept

The convex hull of a set of points is the smallest convex polygon that contains all the points. This module provides two efficient algorithms for computing convex hulls.

**Key Features:**
- Graham's Scan: O(n log n) time complexity
- Jarvis March: O(nh) time complexity where h is number of hull points
- Slice-based implementation
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

```go
package main

import "fmt"

func main() {
    points := []Point{
        {0, 0}, {1, 1}, {2, 0}, {1, 0.5},
    }

    // Graham's Scan (recommended for general case)
    hull := grahamScan(points)  // O(n log n)

    // Jarvis March (efficient when few hull points)
    hull2 := jarvisMarch(points)  // O(nh)
}
```

---

## Run Test

```bash
go test -v
```

---

## Important Notes

1. **Minimum Points**: Need at least 3 points for a valid convex hull
2. **Output Order**: Points are returned in counterclockwise order
3. **Slice Sorting**: Uses `sort.Slice` with custom comparator for polar angle sorting
4. **Slice Operations**: Uses Go slices for dynamic arrays

---

## When to Use

- **Graham's Scan**: Use when you have many points or need guaranteed O(n log n) performance
- **Jarvis March**: Use when the number of hull points is small (h << n)

---

## Related Files

- Main README: `../README.md`
- Python Implementation: `../../Python/`
- C++ Implementation: `../../C++/`

---

_Last Updated: December 2025_
