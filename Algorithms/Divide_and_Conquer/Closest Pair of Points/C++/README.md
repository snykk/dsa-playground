# Closest Pair of Points (C++)

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

```cpp
#include "closest_pair.cpp"

std::vector<Point> points = {{0, 0}, {1, 1}, {2, 2}, {3, 3}};
Result result = closestPair(points);
std::cout << "Distance: " << result.dist << std::endl;
std::cout << "Points: (" << result.p1.x << "," << result.p1.y 
          << ") and (" << result.p2.x << "," << result.p2.y << ")" << std::endl;
```

---

## Implementation Details

### Structures

- **`Point`**: Represents a 2D point with x, y coordinates
- **`Result`**: Contains distance and the two closest points

### Functions

- **`closestPair(points)`**: Main function
- **`closestPairRecursive(...)`**: Recursive divide and conquer
- **`bruteForceClosestPair(...)`**: O(n²) for small sets
- **`distance(p1, p2)`**: Euclidean distance

---

## Compilation

```bash
g++ -std=c++11 closest_pair.cpp closest_pair_test.cpp -o test
./test
```

---

## Testing

Run the test suite:

```bash
g++ -std=c++11 closest_pair.cpp closest_pair_test.cpp -o test && ./test
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
