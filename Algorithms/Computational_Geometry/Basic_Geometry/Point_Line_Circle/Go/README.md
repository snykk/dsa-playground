# Point Line Circle -- Go Implementation

## Files

- `main.go`: `Point`, `Line`, `Circle`, `CrossProduct`, `DotProduct`, `Orientation`, `AngleBetweenPoints`, `PointInTriangle` and a demo `main`.
- `main_test.go`: tests (point, line and circle basics, cross and dot product, orientation codes at several scales, angles including tiny angles and vectors, point in triangle with boundary and degenerate triangles, circle tests at small scale, negative radius, zero-length lines, exact equality).

## API

- `NewPoint(x, y)`: `DistanceTo`, `DistanceSquared`, `Equals` (exact, same as `==`).
- `NewLine(p1, p2)`: `Length`, `LengthSquared`, `Slope` (+Inf if vertical, NaN if zero length), `IsVertical`, `IsHorizontal`.
- `NewCircle(center, radius)`: `Area`, `Circumference`, `ContainsPoint`, `PointOnCircle`; panics for a negative radius.
- `CrossProduct`, `DotProduct`, `Orientation` (0, 1 clockwise, 2 counterclockwise), `AngleBetweenPoints`, `PointInTriangle`.

## Go-Specific Notes

- The names are exported although the code is in `package main`.
- `CrossProduct` wraps each product in `float64(...)`, which forbids fused multiply-add.
- `Point` is a comparable struct, so `p == q` is exact equality.

## How to Run

```bash
go test ./...
```

## Key Takeaways

- The sign of the cross product answers left, right or straight.
- Use atan2(abs(cross), dot) for angles, not acos.
- Exact comparisons make results independent of the coordinate scale.
