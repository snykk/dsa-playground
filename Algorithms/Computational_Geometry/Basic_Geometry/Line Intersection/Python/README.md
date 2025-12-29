# Line Intersection - Python

This folder contains a Python implementation of algorithms for finding intersections between lines and line segments.

---

## Concept

This module provides efficient algorithms to determine if and where lines or line segments intersect. These operations are fundamental for many computational geometry problems.

**Key Features:**
- Line intersection (infinite lines)
- Segment intersection (line segments)
- Point on segment checking
- Clean, readable Python implementation

---

## Functions

| Function | Description | Time Complexity |
|----------|-------------|----------------|
| `line_intersection(l1, l2)` | Find intersection of two infinite lines | O(1) |
| `segment_intersection(l1, l2)` | Find intersection of two line segments | O(1) |
| `segments_intersect(l1, l2)` | Check if segments intersect | O(1) |
| `point_on_segment(p, line)` | Check if point lies on segment | O(1) |

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

```python
from line_intersection import Point, Line, line_intersection, segment_intersection

# Line intersection
l1 = Line(Point(0, 0), Point(4, 4))
l2 = Line(Point(0, 4), Point(4, 0))
intersection = line_intersection(l1, l2)  # Point(2, 2)

# Segment intersection
seg1 = Line(Point(0, 0), Point(4, 4))
seg2 = Line(Point(0, 4), Point(4, 0))
seg_intersection = segment_intersection(seg1, seg2)  # Point(2, 2)

# Check if segments intersect
if segments_intersect(seg1, seg2):
    print("Segments intersect!")

# Check if point is on segment
line = Line(Point(0, 0), Point(4, 4))
p = Point(2, 2)
if point_on_segment(p, line):
    print("Point is on segment")
```

---

## Run Test

```bash
python -m unittest line_intersection_test.py
```

Or:

```bash
python line_intersection_test.py
```

---

## Important Notes

1. **Parallel Lines**: Returns `None` if lines are parallel
2. **Floating-Point Precision**: Uses epsilon tolerance (1e-9) for comparisons
3. **Segment Bounds**: Segment intersection checks if intersection is within [0,1] parameter range

---

## Related Files

- Main README: `../README.md`
- C++ Implementation: `../../C++/`
- Go Implementation: `../../Go/`

---

_Last Updated: December 2025_
