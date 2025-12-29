# Line Intersection - Go

This folder contains a Go implementation of algorithms for finding intersections between lines and line segments.

---

## Concept

This module provides efficient algorithms to determine if and where lines or line segments intersect. These operations are fundamental for many computational geometry problems.

**Key Features:**
- Line intersection (infinite lines)
- Segment intersection (line segments)
- Point on segment checking
- Struct-based implementation with methods

---

## Functions

| Function | Description | Time Complexity |
|----------|-------------|----------------|
| `lineIntersection(l1, l2)` | Find intersection of two infinite lines | O(1) |
| `segmentIntersection(l1, l2)` | Find intersection of two line segments | O(1) |
| `segmentsIntersect(l1, l2)` | Check if segments intersect | O(1) |
| `pointOnSegment(p, line)` | Check if point lies on segment | O(1) |

---

## Complexity

| Operation | Time Complexity | Space Complexity |
|-----------|----------------|------------------|
| Line Intersection | O(1) | O(1) |
| Segment Intersection | O(1) | O(1) |
| Segments Intersect | O(1) | O(1) |
| Point on Segment | O(1) | O(1) |

---

## Usage

```go
package main

import "fmt"

func main() {
    // Line intersection
    l1 := Line{Point{0, 0}, Point{4, 4}}
    l2 := Line{Point{0, 4}, Point{4, 0}}
    intersection := lineIntersection(l1, l2)  // *Point(2, 2)

    // Segment intersection
    seg1 := Line{Point{0, 0}, Point{4, 4}}
    seg2 := Line{Point{0, 4}, Point{4, 0}}
    segIntersection := segmentIntersection(seg1, seg2)  // *Point(2, 2)

    // Check if segments intersect
    if segmentsIntersect(seg1, seg2) {
        fmt.Println("Segments intersect!")
    }
}
```

---

## Run Test

```bash
go test -v
```

---

## Important Notes

1. **Parallel Lines**: Returns `nil` if lines are parallel
2. **Floating-Point Precision**: Uses epsilon tolerance (1e-9) for comparisons
3. **Pointer Return**: Functions return `*Point` (nil for no intersection)

---

## Related Files

- Main README: `../README.md`
- Python Implementation: `../../Python/`
- C++ Implementation: `../../C++/`

---

_Last Updated: December 2025_
