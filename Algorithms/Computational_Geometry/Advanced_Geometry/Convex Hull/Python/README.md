# Convex Hull -- Python Implementation

## Files

- `convex_hull.py`: `Point`, `cross_product`, `distance_squared`, `unique_points`, `graham_scan`, `jarvis_march`.
- `convex_hull_test.py`: unit tests (square, simple cases, duplicates and fewer than three points, input not modified or returned, all collinear, collinear boundary points, counterclockwise order and start point, tiny scale, the nearly collinear wedge, and 400 random integer sets checked against a brute-force reference).

## API

- `graham_scan(points)` and `jarvis_march(points)`: take a list of `Point(x, y)`, return a new list with the hull vertices in counterclockwise order (Graham from the bottom-most point, Jarvis from the leftmost). Collinear boundary points are excluded, duplicates removed.
- `cross_product(o, a, b)`: positive for a left turn, negative for a right turn, zero if collinear.
- `unique_points(points)`: distinct points by exact comparison.

```python
from convex_hull import Point, graham_scan

pts = [Point(0, 3), Point(2, 2), Point(1, 1), Point(3, 0), Point(0, 0), Point(3, 3)]
print(graham_scan(pts))  # [(0, 0), (3, 0), (3, 3), (0, 3)]
```

## Python-Specific Notes

- With `int` coordinates all arithmetic is exact, whatever their size.
- `Point.__eq__` uses a tolerance of 1e-9, but the algorithms compare coordinates exactly and do not use it. `Point` is not hashable.
- Python 3.9 and later.

## How to Run

```bash
python3 -m unittest convex_hull_test
```

## Key Takeaways

- The sign of the cross product decides every step.
- Exact comparisons avoid hangs and non-convex output; integer input is exact.
- Graham is O(n log n); Jarvis is O(nh).
