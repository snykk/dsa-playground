# Line Intersection -- Go Implementation

## Files

- `main.go`: `Point`, `Line`, `crossProduct`, `lineIntersection`, `segmentsIntersect`, `segmentIntersection`, `pointOnSegment` and a demo `main`.
- `main_test.go`: tests (crossing, parallel, no intersection, point on and off a segment, collinear overlap and touching, collinear disjoint, zero-length segments, T-junction, shared float endpoints, tiny scale, coincident lines, and 4,000 random integer segment pairs against an independent reference).

## API

- `lineIntersection(l1, l2 Line) *Point`: `nil` if parallel.
- `segmentIntersection(l1, l2 Line) *Point`: a common point, or `nil`.
- `segmentsIntersect(l1, l2 Line) bool`: exact.
- `pointOnSegment(p Point, line Line) bool`: exact.
- Collinear overlap: `segment_intersection` returns the first shared point in (x, y) order.
- `line_intersection` works on the infinite lines through the endpoints and returns nothing for parallel, coincident or zero-length lines.

## Go-Specific Notes

- Pointer results: always check for `nil` before reading `X` and `Y` (the tests use `t.Fatalf` so a failure cannot dereference `nil`).
- `crossProduct` wraps each product in `float64(...)`, which forbids fused multiply-add.
- Everything is in `package main` and unexported.

## How to Run

```bash
go test ./...
```

## Key Takeaways

- Decide with orientations (signs of cross products), then compute the point.
- Exact zero tests avoid the scale problems of an epsilon.
- Collinear, touching and zero-length cases are all handled.
