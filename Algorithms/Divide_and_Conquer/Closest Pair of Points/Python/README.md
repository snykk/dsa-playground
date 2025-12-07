# Closest Pair of Points (Python)

**Closest Pair of Points** is a divide and conquer algorithm that finds the closest pair of points in a 2D plane.

---

## Overview

Given n points in a 2D plane, find the pair of points with the smallest Euclidean distance between them. The naive approach takes O(n²), but divide and conquer reduces it to O(n log² n) or O(n log n) with optimization.

---

## Algorithm

1. **Divide**: Sort points by x-coordinate, split into left and right halves
2. **Conquer**: Recursively find closest pair in each half
3. **Combine**: Check for closer pairs across the dividing line (strip)

---

## Complexity Analysis

| Complexity | Time | Space |
|------------|------|-------|
| **Basic Version** | O(n log² n) | O(n log n) |
| **Optimized Version** | O(n log n) | O(n) |

---

## Key Insight: Strip Property

After finding the minimum distance δ from both halves, we only need to check points within distance δ of the dividing line. Moreover, for each point in the strip, we only need to check at most 6 points (geometric property).

---

## Implementation Details

### Functions

1. **`closest_pair(points)`**
   - Main function
   - O(n log² n) time complexity
   - Returns (min_distance, point1, point2)

2. **`closest_pair_optimized(points)`**
   - Optimized version
   - O(n log n) time complexity
   - Better space efficiency

3. **`brute_force_closest_pair(points)`**
   - O(n²) brute force
   - Used for base case (small sets)

---

## Usage

```python
from closest_pair import closest_pair

points = [(0, 0), (1, 1), (2, 2), (3, 3)]
dist, p1, p2 = closest_pair(points)
print(f"Closest pair: {p1} and {p2}, distance: {dist}")
```

---

## Advantages

1. ✅ **Efficient**: O(n log n) vs O(n²) naive
2. ✅ **Divide and Conquer**: Classic example
3. ✅ **Geometric insight**: Strip property reduces comparisons

---

## Disadvantages

1. ❌ **Complex**: More complex than brute force
2. ❌ **Precision**: Floating point precision issues
3. ❌ **Memory**: Requires O(n log n) space in basic version

---

## When to Use

- ✅ Finding closest points in 2D
- ✅ Computational geometry problems
- ✅ When n is large (> 100 points)
- ❌ Small sets (use brute force)

---

## Testing

Run the test suite:

```bash
python closest_pair_test.py
```

---

## Related Algorithms

- **Convex Hull**: Another computational geometry problem
- **Line Segment Intersection**: Related geometric algorithm
- **Voronoi Diagram**: Related geometric structure

---

## References

- "Introduction to Algorithms" by CLRS (Chapter 33)
- "Computational Geometry" by de Berg et al.

---

_Last Updated: December 2025_

