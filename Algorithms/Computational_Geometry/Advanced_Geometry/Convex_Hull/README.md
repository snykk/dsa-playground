# Convex Hull

The convex hull of a set of points is the smallest convex polygon that contains all of them, like a rubber band stretched around nails. This folder implements Graham's scan (O(n log n)) and Jarvis march (O(nh)). Both use exact cross-product comparisons and return the hull vertices in counterclockwise order, without points that merely lie on an edge.

## Intuition

The cross product `cross(o, a, b) = (a.x - o.x)(b.y - o.y) - (a.y - o.y)(b.x - o.x)` tells how you turn when you walk `o -> a -> b`: positive for a left turn, negative for a right turn, zero for a straight line. Walking counterclockwise around a convex polygon you only ever turn left. So if three consecutive candidates make a right turn or a straight line, the middle one is inside the polygon or on an edge and is not a corner.

Invariant: in Graham's scan the stack always holds a strictly convex chain from the pivot through the points seen so far. In Jarvis march every point added is a hull vertex, because all other points lie on its left.

## Visual

```text
y
3  G . . . F        points: A(0,0) B(3,0) C(2,1) D(1,1) E(2,2) F(3,3) G(0,3)
2  . . E . .        hull (counterclockwise from the pivot A): A B F G
1  . D C . .        C, D, E are inside (D, E, F share the ray from A)
0  A . . B .
   0 1 2 3
```

## How It Works

Graham's scan:

1. Remove duplicate points (exact comparison). With fewer than three distinct points, return them sorted by (y, x) (Jarvis march: by (x, y)).
2. Pick the pivot: the bottom-most point, leftmost on a tie.
3. Sort the others by angle around the pivot: `a` before `b` if `cross(pivot, a, b) > 0`; on the same ray, nearer first.
4. Scan: while the last two stack points and the new point do not make a strict left turn (`cross <= 0`), pop; then push the new point.

Jarvis march:

1. Remove duplicates; start at the leftmost point (lowest on a tie).
2. From the current vertex, scan all points and keep the most clockwise one (on a tie, the farthest).
3. Repeat from it until the best point is the start again. The loop is bounded by the number of points.

## Step-by-Step Trace

Graham's scan on `A (0,0)`, `B (3,0)`, `C (2,1)`, `D (1,1)`, `E (2,2)`, `F (3,3)`, `G (0,3)` (already in sorted order around `A`):

| Point | Turn test | Stack afterwards |
|-------|-----------|------------------|
| A | first point | A |
| B | only one point on the stack | A B |
| C | cross(A, B, C) = 3, left turn | A B C |
| D | cross(B, C, D) = 1, left turn | A B C D |
| E | cross(C, D, E) = -1: pop D; cross(B, C, E) = -1: pop C; cross(A, B, E) = 6: stop | A B E |
| F | cross(B, E, F) = -3: pop E; cross(A, B, F) = 9: stop | A B F |
| G | cross(B, F, G) = 9, left turn | A B F G |

The hull is `[(0,0), (3,0), (3,3), (0,3)]`. Jarvis march finds the same polygon: A to B, B to F, F to G, G back to A.

## Complexity

| Algorithm | Time | Space |
|-----------|------|-------|
| Graham's scan | O(n log n) | O(n) |
| Jarvis march | O(n h), O(n^2) when every point is on the hull | O(n) |

Sorting costs O(n log n) and the scan is O(n), since each point is pushed once and popped at most once. Jarvis does one pass over n points for each of the h hull vertices. Space counts the deduplicated copy of the input plus the output.

## When to Use

- Graham's scan is the default choice for general input.
- Jarvis march is simpler and faster when the hull is tiny compared with n.
- For integer coordinates both are exact (see the notes below). For decimals that may be nearly collinear, scale to integers first.
- Needed for diameter and width ([Rotating Calipers](../Rotating_Calipers/README.md)), collision tests and enclosure problems.

## Graham's Scan vs. Alternatives

| Algorithm | Time | In this folder |
|-----------|------|----------------|
| Graham's scan | O(n log n) | yes |
| Jarvis march | O(nh) | yes |
| Andrew's monotone chain | O(n log n) | no |
| QuickHull | O(n log n) average, O(n^2) worst | no |
| Chan's algorithm | O(n log h) | no |

## Common Pitfalls

- An epsilon in the angle sort breaks the ordering and can leave interior points in the hull; compare with the cross product.
- An absolute epsilon in the gift-wrapping loop makes tiny-scale input look collinear and the loop never ends.
- Popping only on right turns keeps collinear boundary points; this code pops on `cross <= 0` and excludes them.
- Duplicates give zero cross products; they are removed first.
- Exactness holds for integer coordinates (Python: any size; C++ and Go: cross products below 2^53, so coordinate differences below about 6.7e7). Decimal data can still be misjudged near collinear configurations, and platform rounding (FMA) can change the answer; the code avoids fused multiply-add in the cross product.
- All points collinear returns the two end points; fewer than three distinct points are returned in a new list, sorted by (y, x) in Graham's scan and by (x, y) in Jarvis march.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python](Python/) | `convex_hull.py` | `Point`, `graham_scan`, `jarvis_march`, `cross_product` |
| C++ | [C++](C++/) | `convex_hull.cpp` | `Point`, `grahamScan`, `jarvisMarch`, `crossProduct` |
| Go | [Go](Go/) | `main.go` | `Point`, `grahamScan`, `jarvisMarch`, `crossProduct` |

Each version returns a new list: counterclockwise, Graham starting at the bottom-most point and Jarvis at the leftmost.

## Practice Problems

- [Erect the Fence (LeetCode 587)](https://leetcode.com/problems/erect-the-fence/)
- [Convex Hull (CSES)](https://cses.fi/problemset/task/2195)

## Related

- [Rotating Calipers](../Rotating_Calipers/README.md)
- [Line Intersection](../../Basic_Geometry/Line_Intersection/README.md)
- [Point Line Circle](../../Basic_Geometry/Point_Line_Circle/README.md)
- [Closest Pair of Points](../Closest_Pair_of_Points/README.md)
