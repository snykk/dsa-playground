# Line Intersection

Two lines meet in one point unless they are parallel. Two segments may cross, touch at an endpoint, form a T, overlap along a line, or miss each other. This folder finds the intersection point of two lines, decides whether two segments intersect, returns a common point, and tests whether a point lies on a segment. All tests are exact (no epsilon).

## Intuition

The cross product `cross(o, a, b) = (a.x - o.x)(b.y - o.y) - (a.y - o.y)(b.x - o.x)` tells on which side of the line through `o` and `a` the point `b` lies: positive on the left, negative on the right, zero on the line. Two segments cross when each one has the endpoints of the other on strictly opposite sides. When an orientation is zero, an endpoint lies on the other segment's line, and a bounding-box check decides whether it is actually on the segment.

Invariant: `segments_intersect` is true exactly when the segments share at least one point. It uses only signs and zero tests of cross products, so it is exact for integer input.

## Visual

```text
proper        T-junction     shared end      collinear overlap
 \  /            |            |                 ------
  \/        ------+------     +------           --------
  /\             |           (touching)
 /  \
```

## How It Works

Infinite lines: `denom = (x1 - x2)(y3 - y4) - (y1 - y2)(x3 - x4)`. If `denom == 0` the lines are parallel or coincide and `line_intersection` returns `None`. Otherwise `t = ((x1 - x3)(y3 - y4) - (y1 - y3)(x3 - x4)) / denom` and the point is `p1 + t (p2 - p1)`.

Segments:

1. Compute `o1 = cross(p1, p2, p3)`, `o2 = cross(p1, p2, p4)`, `o3 = cross(p3, p4, p1)`, `o4 = cross(p3, p4, p2)`.
2. If `o1, o2` have strictly opposite signs and `o3, o4` as well, the segments cross.
3. Otherwise an orientation of 0 plus an in-bounding-box test means an endpoint lies on the other segment (T-junction, shared endpoint, collinear overlap, zero-length segment).
4. If nothing applies, they do not meet.
5. `segment_intersection` then returns the point: an endpoint exactly when one lies on the other segment, the line intersection for a proper crossing, and for collinear overlap the first shared point in (x, y) order.

## Step-by-Step Trace

| Case | Segments | o1, o2, o3, o4 | `segments_intersect` | `segment_intersection` |
|------|----------|----------------|----------------------|------------------------|
| Crossing | (0,0)-(4,4) and (0,4)-(4,0) | 16, -16, -16, 16 | True | (2, 2) |
| T-junction | (0,0)-(4,0) and (2,0)-(2,3) | 0, 12, 6, -6 | True | (2, 0) |
| Shared endpoint | (0,0)-(1,0) and (1,0)-(1,1) | 0, 1, 1, 0 | True | (1, 0) |
| Collinear overlap | (0,0)-(2,0) and (1,0)-(3,0) | 0, 0, 0, 0 | True | (1, 0) |
| Collinear, disjoint | (0,0)-(1,0) and (2,0)-(3,0) | 0, 0, 0, 0 | False | None |
| Parallel | (0,0)-(2,0) and (0,1)-(2,1) | 2, 2, -2, -2 | False | None |
| Point on segment | (0,0)-(2,0) and (1,0)-(1,0) | 0, 0, 0, 0 | True | (1, 0) |
| Miss | (0,0)-(2,0) and (1,1)-(1,3) | 2, 6, 2, -2 | False | None |

For the crossing, `denom = -32`, the numerator of `t` is `-16`, so `t = 0.5` and the point is (2, 2).

## Complexity

| Operation | Time | Space |
|-----------|------|-------|
| One pair of lines or segments | O(1) | O(1) |
| n segments checked pairwise | O(n^2) | O(1) |

A sweep-line algorithm (Bentley-Ottmann) reports all intersections in O((n + k) log n) for k intersections; it is not implemented here.

## When to Use

- Checking whether two segments meet, including degenerate cases.
- Getting the crossing point of two lines.
- As a building block for polygon tests and clipping.
- Integer coordinates are exact. For decimals, borderline cases depend on floating-point rounding; scale to integers if they matter.

## Line Intersection vs. Alternatives

| Approach | Handles | Weakness |
|----------|---------|----------|
| Orientation tests (this folder) | all cases including collinear | a second step to get the point |
| Parametric `t, u` in `[0, 1]` | crossings and the point directly | rejects parallel and collinear cases; rounding at endpoints |
| Absolute epsilon | hides rounding noise | scale dependent: at 1e-5 every pair looks parallel |

## Common Pitfalls

- Testing `0 <= t <= 1` and `0 <= u <= 1` after dividing loses every collinear case.
- `abs(denom) < 1e-9` is a threshold on length squared; it breaks at small scales.
- Zero orientations are not enough in the collinear case; check the bounding box too.
- A `Line` with equal endpoints is a point: `line_intersection` returns `None`, the segment functions treat it as a point.
- `line_intersection` works on infinite lines; its point may lie outside both segments. Coincident lines return `None`.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python](Python/) | `line_intersection.py` | `Point`, `Line`, four functions |
| C++ | [C++](C++/) | `line_intersection.cpp` | returns `std::optional<Point>` |
| Go | [Go](Go/) | `main.go` | returns `*Point`, `nil` for none |

## Practice Problems

- [Line Segment Intersection (CSES)](https://cses.fi/problemset/task/2190)

## Related

- [Point Line Circle](../Point%20Line%20Circle/README.md)
- [Convex Hull](../../Advanced_Geometry/Convex%20Hull/README.md)
- [Rotating Calipers](../../Advanced_Geometry/Rotating%20Calipers/README.md)
