# Rotating Calipers -- Go Implementation

## Files

- `main.go`: `Point`, `DiameterResult`, `crossProduct`, `cleanPolygon`, `rotatingCalipersDiameter`, `rotatingCalipersWidth`, `rotatingCalipersPerimeter`, `rotatingCalipersArea` and a demo `main`.
- `main_test.go`: tests (rectangle, perimeter and area, the fan hull that defeats a distance hill climb, collinear and repeated vertices, degenerate inputs, a triangle, orientation independence, and 500 random polygons against brute force).

## API

- `rotatingCalipersDiameter(hull []Point) DiameterResult`: `Dist`, `P1`, `P2`.
- `rotatingCalipersWidth(hull []Point) float64`: width; 0 for fewer than three distinct corners.
- `rotatingCalipersPerimeter(hull)` and `rotatingCalipersArea(hull)`.
- `cleanPolygon(hull)`: drops repeated and edge-collinear vertices.

`hull` is a convex polygon in order, clockwise or counterclockwise.

## Go-Specific Notes

- `Point` is a comparable struct, so exact equality is `p == q`.
- `crossProduct` wraps each product in `float64(...)`, which forbids fused multiply-add.
- Everything is in `package main` and unexported.

## How to Run

```bash
go test ./...
```

## Key Takeaways

- Drive the far pointer with triangle area, not with distance.
- Clean repeated and collinear vertices first.
- One sweep is O(n); the hull itself costs O(n log n).
