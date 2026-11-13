# Line Intersection -- Python Implementation

## Files

- `line_intersection.py`: `Point`, `Line`, `cross_product`, `line_intersection`, `segments_intersect`, `segment_intersection`, `point_on_segment`.
- `line_intersection_test.py`: unit tests (crossing, parallel, no intersection, point on and off a segment, collinear overlap and touching, collinear disjoint, zero-length segments, T-junction, shared float endpoints, tiny scale, coincident lines, and 4,000 random integer segment pairs against an independent reference).

## API

- `line_intersection(l1, l2)`: `Point` or `None`.
- `segment_intersection(l1, l2)`: a common `Point` or `None`.
- `segments_intersect(l1, l2)`: `bool`; exact, with collinear, touching and zero-length cases.
- `point_on_segment(p, line)`: `bool`; exact.
- Collinear overlap: `segment_intersection` returns the first shared point in (x, y) order.
- `line_intersection` works on the infinite lines through the endpoints and returns nothing for parallel, coincident or zero-length lines.

```python
from line_intersection import Point, Line, segments_intersect, segment_intersection

a = Line(Point(0, 0), Point(2, 0))
b = Line(Point(1, 0), Point(3, 0))
print(segments_intersect(a, b))   # True
print(segment_intersection(a, b)) # Point(1, 0)
```

## Python-Specific Notes

- `Line` is used both as a segment and as the infinite line through its endpoints.
- With `int` coordinates all arithmetic is exact.
- Python 3.9 and later.

## How to Run

```bash
python3 -m unittest line_intersection_test
```

## Key Takeaways

- Decide with orientations (signs of cross products), then compute the point.
- Exact zero tests avoid the scale problems of an epsilon.
- Collinear, touching and zero-length cases are all handled.
