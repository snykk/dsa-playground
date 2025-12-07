# Closest Pair of Points (Go)

**Closest Pair of Points** finds the closest pair of points in a 2D plane using divide and conquer.

---

## Overview

Given n points in a 2D plane, find the pair of points with the smallest Euclidean distance. The divide and conquer approach achieves O(n log n) time complexity.

---

## Complexity Analysis

| Complexity | Time | Space |
|------------|------|-------|
| **All Cases** | O(n log n) | O(n) |

---

## Usage

```go
package main

import "fmt"

func main() {
    points := []Point{{0, 0}, {1, 1}, {2, 2}, {3, 3}}
    result := ClosestPair(points)
    fmt.Printf("Distance: %f\n", result.Dist)
    fmt.Printf("Points: (%.1f,%.1f) and (%.1f,%.1f)\n", 
               result.P1.X, result.P1.Y, result.P2.X, result.P2.Y)
}
```

---

## Implementation Details

### Types

- **`Point`**: Represents a 2D point with X, Y coordinates
- **`Result`**: Contains distance and the two closest points

### Functions

- **`ClosestPair(points)`**: Main function
- **`closestPairRecursive(...)`**: Recursive divide and conquer
- **`bruteForceClosestPair(points)`**: O(n²) for small sets
- **`distance(p1, p2)`**: Euclidean distance

---

## Testing

Run the test suite:

```bash
go test
```

Run with verbose output:

```bash
go test -v
```

---

## When to Use

- ✅ Finding closest points in 2D
- ✅ Computational geometry problems
- ✅ Large point sets (> 100 points)
- ❌ Small sets (use brute force)

---

## Related Algorithms

- **Convex Hull**: Another computational geometry problem
- **Line Segment Intersection**: Related geometric algorithm

---

## References

- "Introduction to Algorithms" by CLRS (Chapter 33)
- "Computational Geometry" by de Berg et al.

---

_Last Updated: December 2025_
