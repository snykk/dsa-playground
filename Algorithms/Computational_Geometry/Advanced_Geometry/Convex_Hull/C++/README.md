# Convex Hull -- C++ Implementation

## Files

- `convex_hull.cpp`: `Point`, `crossProduct`, `distanceSquared`, `grahamScan`, `jarvisMarch`; `main` is compiled out with `-DIS_TEST_BUILD`.
- `convex_hull_test.cpp`: assert-based tests (square, simple cases, duplicates and fewer than three points, all collinear, collinear boundary points, counterclockwise order and start point, tiny scale, the nearly collinear wedge, and 400 random integer sets checked against a brute-force reference).

## API

- `grahamScan(std::vector<Point>)` and `jarvisMarch(std::vector<Point>)`: take the points by value and return the hull vertices in counterclockwise order (Graham from the bottom-most point, Jarvis from the leftmost). Collinear boundary points are excluded, duplicates removed.
- `crossProduct(o, a, b)`: positive for a left turn, negative for a right turn, zero if collinear.
- `distanceSquared(p, q)`.

## C++-Specific Notes

- Coordinates are `double`; integer coordinates are exact while cross products stay below 2^53 (differences below about 6.7e7).
- `crossProduct` stores each product in a `volatile double` so that a compiler cannot fuse them into an FMA (two plain statements are not enough: with `-ffp-contract=fast` a compiler still fuses them).
- `Point::operator==` uses a tolerance of 1e-9, but the algorithms compare exactly.
- The code is plain C++11; the commands below use C++17 like the rest of the repository.

## How to Run

```bash
g++ -std=c++17 -O2 -Wall -DIS_TEST_BUILD convex_hull_test.cpp -o convex_hull_test && ./convex_hull_test
```

## Key Takeaways

- The sign of the cross product decides every step.
- Exact comparisons avoid hangs and non-convex output; integer input is exact.
- Graham is O(n log n); Jarvis is O(nh).
