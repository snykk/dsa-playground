# Basic Geometry

The two building blocks of 2D geometry code. Point, Line and Circle gives distances, orientation, angles and containment tests. Line Intersection builds on its cross product to decide whether segments meet. Both are exact on integer input and use no epsilon.

## Topics

Read them in this order.

| # | Topic | What it adds | Level |
|---|-------|--------------|-------|
| 1 | [Point, Line and Circle](Point_Line_Circle/) | Distance, cross and dot products, orientation, angle, point in triangle and circle. The toolkit everything else uses. | Beginner |
| 2 | [Line Intersection](Line_Intersection/) | The meeting point of two lines, and an exact test for segments that handles touching, T-shapes and collinear overlap. | Intermediate |

Both rest on one function, `cross(o, a, b) = (a.x - o.x)(b.y - o.y) - (a.y - o.y)(b.x - o.x)`. Its sign says on which side of the line from `o` to `a` the point `b` lies: positive on the left, negative on the right, zero on the line. Orientation codes are 0 for collinear, 1 for clockwise and 2 for counterclockwise.

## How They Compare

| Topic | Idea | Key functions | Time | Space |
|-------|------|---------------|------|-------|
| Point, Line and Circle | signed area and dot product as the basic tests | `cross_product`, `dot_product`, `orientation`, `angle_between_points`, `point_in_triangle`, `Circle.contains_point` | O(1) | O(1) |
| Line Intersection | orientation signs decide first, then the point is computed | `line_intersection`, `segments_intersect`, `segment_intersection`, `point_on_segment` | O(1) per pair | O(1) |

Every test is an exact comparison (the sign of a cross product, or squared distances and coordinates compared directly), so a result does not depend on the scale of the coordinates. In C++ and Go the tests are exact while the products stay below 2^53. Checking all pairs of n segments takes O(n^2); a sweep line such as Bentley-Ottmann is not in this repository.

## Choosing One

| Situation | Use | Why |
|-----------|-----|-----|
| Left turn or right turn, collinear check, area of a triangle | Point, Line and Circle | `orientation` and `cross_product` answer it with one expression |
| Is a point inside a triangle or a circle | Point, Line and Circle | `point_in_triangle` and `Circle.contains_point` need no square root |
| The angle between two directions | Point, Line and Circle | `atan2(|cross|, dot)` stays accurate near 0 and pi |
| Do two segments touch or cross | Line Intersection | orientation tests cover every degenerate case without dividing |
| Where do two lines meet | Line Intersection | `line_intersection` returns the point, or None if they are parallel |

## Common Pitfalls

- An absolute epsilon on the cross product treats tiny shapes as degenerate, because the cross product is a length squared. These topics compare with exact zero.
- `acos` loses precision near 0 and pi. The code uses `atan2(|cross|, dot)`.
- Dividing before deciding loses touching and collinear cases. Test orientations first, then compute the point.
- A zero orientation says only that a point is on the line, not that it is between the endpoints. Add a bounding-box check.
- `line_intersection` works on infinite lines. It can return a point outside both segments, so it is not a segment test.

## Related

- [Big O Notation](../../../Complexity_Analysis/Time_Complexity/Big_O_Notation/): read first.
- [Computational Geometry](../): the parent overview of both sub-areas.
- [Advanced Geometry](../Advanced_Geometry/): the algorithms that build on these primitives.
- [Convex Hull](../Advanced_Geometry/Convex_Hull/): uses the cross product to find turns.
