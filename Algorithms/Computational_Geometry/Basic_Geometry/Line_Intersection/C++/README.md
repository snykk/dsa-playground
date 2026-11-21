# Line Intersection -- C++ Implementation

## Files

- `line_intersection.cpp`: `Point`, `Line`, `crossProduct`, `lineIntersection`, `segmentsIntersect`, `segmentIntersection`, `pointOnSegment`; `main` is compiled out with `-DIS_TEST_BUILD`.
- `line_intersection_test.cpp`: assert-based tests (crossing, parallel, no intersection, point on and off a segment, collinear overlap and touching, collinear disjoint, zero-length segments, T-junction, shared float endpoints, tiny scale, coincident lines, and 4,000 random integer segment pairs against an independent reference).

## API

- `lineIntersection(l1, l2)`: `std::optional<Point>`.
- `segmentIntersection(l1, l2)`: `std::optional<Point>`, a common point.
- `segmentsIntersect(l1, l2)`: `bool`; exact.
- `pointOnSegment(p, line)`: `bool`; exact.
- Collinear overlap: `segmentIntersection` returns the first shared point in (x, y) order.
- `lineIntersection` works on the infinite lines through the endpoints and returns nothing for parallel, coincident or zero-length lines.

## C++-Specific Notes

- Needs C++17 for `std::optional`; the commands below use C++17.
- `crossProduct` stores each product in a `volatile double` so a compiler cannot fuse them into an FMA (two plain statements are not enough: with `-ffp-contract=fast` a compiler still fuses them).
- Integer coordinates are exact while cross products stay below 2^53.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD line_intersection_test.cpp -o line_intersection_test && ./line_intersection_test
```

## Key Takeaways

- Decide with orientations (signs of cross products), then compute the point.
- Exact zero tests avoid the scale problems of an epsilon.
- Collinear, touching and zero-length cases are all handled.
