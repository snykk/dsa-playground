# Rotating Calipers -- Python Implementation

## Files

- `rotating_calipers.py`: `Point`, `cross_product`, `distance_squared`, `clean_polygon`, `rotating_calipers_diameter`, `rotating_calipers_width`, `rotating_calipers_perimeter`, `rotating_calipers_area`.
- `rotating_calipers_test.py`: unit tests (rectangle, perimeter and area, the fan hull that defeats a distance hill climb, collinear and repeated vertices, degenerate inputs, a triangle, orientation independence, and 500 random polygons against brute force).

## API

- `rotating_calipers_diameter(hull)`: returns `(distance, p1, p2)`; `(0.0, p, p)` for one distinct point.
- `rotating_calipers_width(hull)`: smallest distance between two parallel supporting lines; 0.0 for fewer than three distinct corners.
- `rotating_calipers_perimeter(hull)` and `rotating_calipers_area(hull)`: edge sum and shoelace area.
- `clean_polygon(hull)`: drops repeated and edge-collinear vertices.

`hull` is a list of `Point(x, y)` forming a convex polygon in order, clockwise or counterclockwise. To start from raw points, build the hull with the Convex Hull topic first.

```python
from rotating_calipers import Point, rotating_calipers_diameter, rotating_calipers_width

hull = [Point(0, 0), Point(4, 0), Point(5, 2), Point(2, 5), Point(-1, 3)]
print(rotating_calipers_diameter(hull))  # (6.0827..., (5, 2), (-1, 3))
print(rotating_calipers_width(hull))     # 4.9497...
```

## Python-Specific Notes

- With `int` coordinates the cross products are exact.
- This module does not import the Convex Hull module; pass it a ready hull.
- Python 3.9 and later.

## How to Run

```bash
python3 -m unittest rotating_calipers_test
```

## Key Takeaways

- Drive the far pointer with triangle area, not with distance.
- Clean repeated and collinear vertices first.
- One sweep is O(n); the hull itself costs O(n log n).
