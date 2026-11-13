# Point, Line and Circle

The basic 2D toolkit behind computational geometry: distance between points, the cross product as a signed area that tells left from right, the dot product, the angle between two directions, point-in-triangle and point-in-circle tests. Every test is exact (no epsilon), so the answers do not depend on the coordinate scale.

## Intuition

Walk from `o` to `a`, then look at `b`. The cross product `(a.x - o.x)(b.y - o.y) - (a.y - o.y)(b.x - o.x)` is positive if `b` is to your left, negative if it is to your right, and zero if the three points are on one line. Its absolute value is the area of the parallelogram spanned by `oa` and `ob`. The dot product is the matching "how aligned" number: `|u||v|cos(theta)`. Together they give orientation, angles, projections and containment tests with a handful of multiplications.

Invariant: every predicate is the sign (or zero test) of a product expression, evaluated exactly. There is no threshold to tune, and the same code gives the same answer at scale 1e-5 and at scale 1e5.

## Visual

```text
       C (2,4)                    P (2,1):  cross(P,A,B) =  4
      /  \                                  cross(P,B,C) =  6   all positive
     /  P \                                 cross(P,C,A) =  6   -> inside
    /      \
   A--------B
 (0,0)     (4,0)       orientation (0,0)->(4,4)->(1,2) = +4: counterclockwise (2)
```

## Operations

| Piece | What it does | Time |
|-------|--------------|------|
| `Point` | `distance_to`, `distance_squared`, exact equality | O(1) |
| `Line` | `length`, `length_squared`, `slope`, `is_vertical`, `is_horizontal` | O(1) |
| `Circle` | `area`, `circumference`, `contains_point`, `point_on_circle` | O(1) |
| `cross_product(o, a, b)` | signed parallelogram area | O(1) |
| `dot_product(o, a, b)` | projection / cosine measure | O(1) |
| `orientation(p, q, r)` | 0 collinear, 1 clockwise, 2 counterclockwise | O(1) |
| `angle_between_points(o, a, b)` | angle AOB in `[0, pi]`, via `atan2(abs(cross), dot)` | O(1) |
| `point_in_triangle(p, a, b, c)` | inside or on the boundary | O(1) |

Behaviors to know: point equality is exact; a zero-length line has no direction (`slope` is NaN, it is neither vertical nor horizontal); a negative radius is rejected (`ValueError`, `std::invalid_argument`, a panic in Go); a degenerate triangle contains no point; `angle_between_points` returns 0 when A or B coincides with O. Line-point distance, projection and line-circle intersection are not implemented.

## Step-by-Step Trace

Triangle `A (0,0)`, `B (4,0)`, `C (2,4)`:

| Point | cross(p, a, b) | cross(p, b, c) | cross(p, c, a) | Result |
|-------|----------------|----------------|----------------|--------|
| (2,1) | 4 | 6 | 6 | inside: all positive |
| (10,10) | 40 | -44 | 20 | outside: mixed signs |
| (2,0) | 0 | 8 | 8 | inside: on the edge AB |

Angle between `(3,4)` and `(2,1)` from the origin: `cross = -5`, `dot = 10`, angle `atan2(5, 10)` is about 26.57 degrees, and the negative cross says the second vector is clockwise from the first.

## Complexity

| Operation | Time | Space |
|-----------|------|-------|
| Any single operation | O(1) | O(1) |
| k points against one triangle or circle | O(k) | O(1) |

Circle tests compare squared distances, so no square root is needed. Results are exact when the products are exactly representable: integer coordinates in Python, and in C++ and Go while the products stay below 2^53.

## When to Use

- Orientation and angle tests inside hull, intersection and polygon algorithms.
- Hit tests against triangles and circles.
- Not for line-point distance or line-circle intersection (not implemented). Decimal data that must be judged collinear should be scaled to integers first.

## Cross Product vs. Dot Product

| | Cross product | Dot product |
|--|---------------|-------------|
| Formula | `u.x * v.y - u.y * v.x` | `u.x * v.x + u.y * v.y` |
| Magnitude | `abs(u) abs(v) sin(theta)` | `abs(u) abs(v) cos(theta)` |
| Meaning | signed area, left or right | projection, alignment |
| Zero means | collinear | perpendicular |

## Common Pitfalls

- A fixed epsilon on the cross product is wrong: it has units of length squared, so it breaks at small and large scales.
- `acos` of a clamped cosine loses all precision near 0 and pi; use `atan2(abs(cross), dot)`.
- Orientation codes are 1 for clockwise and 2 for counterclockwise in all three languages; test them with exact values.
- With a zero-area triangle all three signs are 0 and a naive test says "inside" for every point.
- Collinear decimals (0.1, 0.2, 0.3) may not give a zero cross product because of rounding.
- Exact equality on computed points rarely holds; use a tolerance of your own for results of arithmetic.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python](Python/) | `point_line_circle.py` | classes `Point`, `Line`, `Circle` and free functions |
| C++ | [C++](C++/) | `point_line_circle.cpp` | structs with the same methods, camelCase names |
| Go | [Go](Go/) | `main.go` | exported names: `NewPoint`, `NewCircle`, `CrossProduct`, `Orientation`, `PointInTriangle` |

## Practice Problems

- [Point Location Test (CSES)](https://cses.fi/problemset/task/2189)
- [Check If It Is a Straight Line (LeetCode 1232)](https://leetcode.com/problems/check-if-it-is-a-straight-line/)
- [Valid Boomerang (LeetCode 1037)](https://leetcode.com/problems/valid-boomerang/)
- [Valid Square (LeetCode 593)](https://leetcode.com/problems/valid-square/)

## Related

- [Line Intersection](../Line_Intersection/README.md)
- [Convex Hull](../../Advanced_Geometry/Convex_Hull/README.md)
- [Rotating Calipers](../../Advanced_Geometry/Rotating_Calipers/README.md)
