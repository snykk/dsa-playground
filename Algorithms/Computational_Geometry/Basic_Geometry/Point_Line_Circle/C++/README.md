# Point Line Circle -- C++ Implementation

## Files

- `point_line_circle.cpp`: `Point`, `Line`, `Circle`, `crossProduct`, `dotProduct`, `orientation`, `angleBetweenPoints`, `pointInTriangle`; `main` is compiled out with `-DIS_TEST_BUILD`.
- `point_line_circle_test.cpp`: assert-based tests (point, line and circle basics, cross and dot product, orientation codes at several scales, angles including tiny angles and vectors, point in triangle with boundary and degenerate triangles, circle tests at small scale, negative radius, zero-length lines, exact equality).

## API

- `Point`: `distanceTo`, `distanceSquared`, exact `operator==`.
- `Line`: `length`, `lengthSquared`, `slope` (infinity if vertical, NaN if zero length), `isVertical`, `isHorizontal`.
- `Circle(center, radius)`: `area`, `circumference`, `containsPoint`, `pointOnCircle`; throws `std::invalid_argument` for a negative radius.
- `crossProduct`, `dotProduct`, `orientation` (0, 1 clockwise, 2 counterclockwise), `angleBetweenPoints`, `pointInTriangle`.

## C++-Specific Notes

- Needs `<limits>` (included) for infinity and NaN; no EPS constant is used any more.
- `crossProduct` stores each product in a `volatile double` so a compiler cannot fuse them into an FMA (two plain statements are not enough: with `-ffp-contract=fast` a compiler still fuses them).
- Integer coordinates are exact while the products stay below 2^53.
- The test file includes the `.cpp` directly; define `IS_TEST_BUILD` to drop the demo `main`.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD point_line_circle_test.cpp -o point_line_circle_test && ./point_line_circle_test
```

## Key Takeaways

- The sign of the cross product answers left, right or straight.
- Use atan2(abs(cross), dot) for angles, not acos.
- Exact comparisons make results independent of the coordinate scale.
