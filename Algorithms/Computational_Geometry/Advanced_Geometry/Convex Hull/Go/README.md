# Convex Hull -- Go Implementation

## Files

- `main.go`: `Point`, `crossProduct`, `distanceSquared`, `distinctPoints`, `grahamScan`, `jarvisMarch` and a demo `main`.
- `main_test.go`: tests (square, simple cases, duplicates and fewer than three points, input not modified or returned, all collinear, collinear boundary points, counterclockwise order and start point, tiny scale, the nearly collinear wedge, and 400 random integer sets checked against a brute-force reference).

## API

- `grahamScan(points []Point) []Point` and `jarvisMarch(points []Point) []Point`: return the hull vertices in counterclockwise order (Graham from the bottom-most point, Jarvis from the leftmost). Collinear boundary points are excluded, duplicates removed. The input slice is not modified.
- `crossProduct(o, a, b)`: positive for a left turn, negative for a right turn, zero if collinear.
- `distinctPoints(points)`: distinct points sorted by `(X, Y)`, on a copy.

## Go-Specific Notes

- `Point` is a comparable struct, so exact equality is just `p == q`.
- `crossProduct` wraps each product in `float64(...)`, which forbids fused multiply-add on CPUs that have it.
- Integer coordinates are exact while cross products stay below 2^53.

## How to Run

```bash
go test ./...
```

## Key Takeaways

- The sign of the cross product decides every step.
- Exact comparisons avoid hangs and non-convex output; integer input is exact.
- Graham is O(n log n); Jarvis is O(nh).
