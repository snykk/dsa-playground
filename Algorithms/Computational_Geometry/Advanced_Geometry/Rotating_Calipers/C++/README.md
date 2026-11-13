# Rotating Calipers -- C++ Implementation

## Files

- `rotating_calipers.cpp`: `Point`, `crossProduct`, `cleanPolygon`, `rotatingCalipersDiameter`, `rotatingCalipersWidth`, `rotatingCalipersPerimeter`, `rotatingCalipersArea`; `main` is compiled out with `-DIS_TEST_BUILD`.
- `rotating_calipers_test.cpp`: assert-based tests (rectangle, perimeter and area, the fan hull that defeats a distance hill climb, collinear and repeated vertices, degenerate inputs, a triangle, orientation independence, and 500 random polygons against brute force).

## API

- `rotatingCalipersDiameter(hull)`: returns `DiameterResult {dist, p1, p2}`.
- `rotatingCalipersWidth(hull)`: width; 0 for fewer than three distinct corners.
- `rotatingCalipersPerimeter(hull)` and `rotatingCalipersArea(hull)`.
- `cleanPolygon(hull)`: drops repeated and edge-collinear vertices.

`hull` is a `std::vector<Point>` forming a convex polygon in order, clockwise or counterclockwise.

## C++-Specific Notes

- Coordinates are `double`; integer coordinates are exact while cross products stay below 2^53.
- `crossProduct` computes its two products in separate statements so a compiler cannot fuse them into an FMA.
- The test file includes the `.cpp` directly; define `IS_TEST_BUILD` to drop the demo `main`.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD rotating_calipers_test.cpp -o rotating_calipers_test && ./rotating_calipers_test
```

## Key Takeaways

- Drive the far pointer with triangle area, not with distance.
- Clean repeated and collinear vertices first.
- One sweep is O(n); the hull itself costs O(n log n).
