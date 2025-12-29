# Line Intersection - C++

This folder contains a C++ implementation of algorithms for finding intersections between lines and line segments.

---

## Concept

This module provides efficient algorithms to determine if and where lines or line segments intersect. These operations are fundamental for many computational geometry problems.

**Key Features:**
- Line intersection (infinite lines)
- Segment intersection (line segments)
- Point on segment checking
- Efficient struct-based implementation

---

## Functions

| Function | Description | Time Complexity |
|----------|-------------|----------------|
| `lineIntersection(l1, l2)` | Find intersection of two infinite lines | O(1) |
| `segmentIntersection(l1, l2)` | Find intersection of two line segments | O(1) |
| `segmentsIntersect(l1, l2)` | Check if segments intersect | O(1) |
| `pointOnSegment(p, line)` | Check if point lies on segment | O(1) |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| Line Intersection | O(1) | O(1) |
| Segment Intersection | O(1) | O(1) |
| Segments Intersect | O(1) | O(1) |
| Point on Segment | O(1) | O(1) |

---

## Usage

```cpp
#include "line_intersection.cpp"

// Line intersection
Line l1(Point(0, 0), Point(4, 4));
Line l2(Point(0, 4), Point(4, 0));
auto intersection = lineIntersection(l1, l2);  // Point(2, 2)

// Segment intersection
Line seg1(Point(0, 0), Point(4, 4));
Line seg2(Point(0, 4), Point(4, 0));
auto seg_intersection = segmentIntersection(seg1, seg2);  // Point(2, 2)

// Check if segments intersect
if (segmentsIntersect(seg1, seg2)) {
    std::cout << "Segments intersect!" << std::endl;
}
```

---

## Compilation

```bash
g++ -std=c++11 line_intersection.cpp -o line_intersection
./line_intersection
```

---

## Run Test

```bash
g++ -std=c++11 line_intersection_test.cpp -o test && ./test
```

---

## Important Notes

1. **Parallel Lines**: Returns `std::nullopt` if lines are parallel
2. **Floating-Point Precision**: Uses epsilon tolerance (1e-9) for comparisons
3. **Optional Return**: Uses `std::optional<Point>` for nullable return values

---

## Related Files

- Main README: `../README.md`
- Python Implementation: `../../Python/`
- Go Implementation: `../../Go/`

---

_Last Updated: December 2025_
