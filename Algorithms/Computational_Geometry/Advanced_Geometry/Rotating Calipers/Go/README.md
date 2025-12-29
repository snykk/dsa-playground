# Rotating Calipers - Go

This folder contains a Go implementation of the **rotating calipers** technique for solving various geometric problems.

---

## Concept

Rotating calipers is a technique used to solve several geometric problems efficiently after computing the convex hull. It uses two parallel lines that "rotate" around the convex polygon to find optimal solutions.

**Key Features:**
- Efficient: O(n) time complexity after convex hull computation
- Versatile: Solves multiple geometric problems
- Requires convex hull as input
- Slice-based implementation

---

## Functions

| Function | Description | Time Complexity |
|----------|-------------|----------------|
| `rotatingCalipersDiameter(hull)` | Find maximum distance between any two points | O(n) |
| `rotatingCalipersWidth(hull)` | Find minimum distance between parallel lines | O(n) |
| `rotatingCalipersPerimeter(hull)` | Calculate perimeter of convex hull | O(n) |
| `rotatingCalipersArea(hull)` | Calculate area using shoelace formula | O(n) |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| Diameter | O(n) | O(1) |
| Width | O(n) | O(1) |
| Perimeter | O(n) | O(1) |
| Area | O(n) | O(1) |

**Note:** These complexities assume convex hull is already computed. Total complexity including convex hull is O(n log n).

---

## Usage

```go
package main

import "fmt"

func main() {
    hull := []Point{
        {0, 0}, {4, 0}, {4, 3}, {0, 3},
    }

    // Find diameter
    diameterResult := rotatingCalipersDiameter(hull)

    // Find width
    width := rotatingCalipersWidth(hull)

    // Calculate perimeter
    perimeter := rotatingCalipersPerimeter(hull)

    // Calculate area
    area := rotatingCalipersArea(hull)
}
```

---

## Run Test

```bash
go test -v
```

---

## Important Notes

1. **Convex Hull Required**: Input must be a convex hull (use Graham's Scan or Jarvis March)
2. **Counterclockwise Order**: Points should be in counterclockwise order
3. **Struct Return**: Diameter function returns `DiameterResult` struct
4. **Slice Input**: Uses `[]Point` for hull input

---

## When to Use

- **Diameter**: Finding maximum distance in point set
- **Width**: Finding minimum width of shape
- **Perimeter/Area**: Calculating geometric properties
- **After Convex Hull**: When you need additional properties of convex hull

---

## Related Files

- Main README: `../README.md`
- Python Implementation: `../../Python/`
- C++ Implementation: `../../C++/`

---

_Last Updated: December 2025_
