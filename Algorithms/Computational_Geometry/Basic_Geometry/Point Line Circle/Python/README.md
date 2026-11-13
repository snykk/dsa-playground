# Point Line Circle -- Python Implementation

## Files

- `point_line_circle.py`: `Point`, `Line`, `Circle`, `cross_product`, `dot_product`, `orientation`, `angle_between_points`, `point_in_triangle`.
- `point_line_circle_test.py`: unit tests (point, line and circle basics, cross and dot product, orientation codes at several scales, angles including tiny angles and vectors, point in triangle with boundary and degenerate triangles, circle tests at small scale, negative radius, zero-length lines, exact equality).

## API

- `Point(x, y)`: `distance_to`, `distance_squared`; exact `==` and `hash`.
- `Line(p1, p2)`: `length`, `length_squared`, `slope` (inf if vertical, nan if zero length), `is_vertical`, `is_horizontal`.
- `Circle(center, radius)`: `area`, `circumference`, `contains_point`, `point_on_circle`; raises `ValueError` for a negative radius.
- `cross_product(o, a, b)`, `dot_product(o, a, b)`.
- `orientation(p, q, r)`: 0 collinear, 1 clockwise, 2 counterclockwise.
- `angle_between_points(o, a, b)`: radians in `[0, pi]`.
- `point_in_triangle(p, a, b, c)`: inside or on the boundary; false for a degenerate triangle.

```python
from point_line_circle import Point, orientation

print(orientation(Point(0, 0), Point(4, 4), Point(1, 2)))  # 2, counterclockwise
```

## Python-Specific Notes

- All comparisons are exact; with `int` coordinates the results are exact at any size.
- `Point` is hashable, so it can be used in sets and as a dict key.
- Python 3.9 and later.

## How to Run

```bash
python3 -m unittest point_line_circle_test
```

## Key Takeaways

- The sign of the cross product answers left, right or straight.
- Use atan2(abs(cross), dot) for angles, not acos.
- Exact comparisons make results independent of the coordinate scale.
