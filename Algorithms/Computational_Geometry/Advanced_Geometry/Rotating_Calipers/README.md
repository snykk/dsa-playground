# Rotating Calipers

Rotating calipers sweeps two parallel supporting lines once around a convex polygon. In linear time it finds the **diameter** (the farthest pair of vertices) and the **width** (the narrowest strip that contains the polygon). The input is the polygon's vertices in order, for example the output of the [Convex Hull](../Convex_Hull/README.md) topic.

## Intuition

Clamp a pair of calipers onto a convex shape. Each jaw touches the shape and has all of it on one side. Turn the calipers around the shape while keeping the jaws parallel. The vertices that touch the two jaws at the same moment are **antipodal**, and the farthest pair of points is always one of them. There are only O(n) antipodal pairs, against n^2 pairs in total.

The code walks the edges in order and keeps a pointer `j` on the vertex farthest from the current edge. The distance of a vertex from an edge is proportional to the triangle area `|cross(i, i+1, k)|`, and on a convex polygon that area rises and then falls, so `j` only needs to move forward while the next vertex has a strictly larger area.

Invariant: for every edge `(i, i+1)`, `j` is a vertex of maximum distance from the line through that edge; `j` never moves backwards.

## Visual

```text
        D (2,5)
       / \
 E (-1,3) \          diameter: C-E, length sqrt(37) = 6.083
     |     C (5,2)   width: edge C-D with farthest vertex A = 4.950
     |    /
     A---B
   (0,0) (4,0)
```

## How It Works

1. Clean the polygon: remove consecutive repeated vertices and vertices on an edge (zero cross product). If all points are collinear only the two end points remain.
2. For each edge `(i, i+1)`, advance `j` while vertex `j + 1` has a strictly larger `|cross|` with the edge than vertex `j`.
3. Diameter: compare the squared distances from `i` and `i + 1` to `j`, and also to `j + 1` when its area ties (a parallel edge).
4. Width: take `|cross(i, i+1, j)| / length(i, i+1)`, the height of `j` over the edge; the width is the smallest over all edges.
5. Return the square root of the best squared distance, or the smallest height. Fewer than three distinct corners give width 0.

The module also has `perimeter` (sum of edge lengths) and `area` (shoelace formula). These are plain sums, not caliper algorithms.

## Step-by-Step Trace

Polygon `A (0,0)`, `B (4,0)`, `C (5,2)`, `D (2,5)`, `E (-1,3)`:

| Edge | Farthest vertex j | Height of j | Candidate pairs (distance) |
|------|-------------------|-------------|----------------------------|
| A-B | D | 5.0000 | A-D 5.385, B-D 5.385 |
| B-C | E | 5.8138 | B-E 5.831, C-E 6.083 |
| C-D | A | 4.9497 | C-A 5.385, D-A 5.385 |
| D-E | B | 5.2697 | D-B 5.385, E-B 5.831 |
| E-A | C | 5.3759 | E-C 6.083, A-C 5.385 |

Diameter 6.083 (C-E), width 4.9497, perimeter 17.25, area 20.

## Complexity

| Operation | Time | Space |
|-----------|------|-------|
| `diameter`, `width` | O(n) | O(n) for the cleaned copy |
| `perimeter`, `area` | O(n) | O(1) |
| Hull first, from a point set | O(n log n) | O(n) |

The edge index goes once around the polygon and the pointer `j` moves forward at most about 2n times in total, so the sweep is linear. Computing the hull from raw points dominates.

## When to Use

- You need the farthest pair or the narrowest strip of a point set: compute the hull, then run the calipers.
- The polygon is already convex and ordered (clockwise or counterclockwise both work).
- Not for non-convex or unordered input; the answers would be meaningless.

## Rotating Calipers vs. Alternatives

| Approach | Diameter time | Notes |
|----------|---------------|-------|
| Rotating calipers on the hull | O(n) after the hull | needs convex ordered input |
| All pairs | O(n^2) | simple; can also be run on the hull vertices only |
| Minimum-area rectangle, polygon distance | calipers variants | not implemented here |

## Common Pitfalls

- Climbing on vertex-to-vertex distance can stop at a local maximum (104.96 instead of 104.98 on the fan hull in the tests). Drive the pointer with the area.
- Collinear or repeated vertices stall the area pointer; the code removes them first.
- Test both `i` and `i + 1` against `j`, and `j + 1` on a tie.
- A hull with fewer than three distinct corners has width 0, not infinity.
- The input must be a convex polygon in order; a raw point set is not accepted.

## Implementations

| Language | Folder | Main file | Notes |
|----------|--------|-----------|-------|
| Python | [Python](Python/) | `rotating_calipers.py` | `rotating_calipers_diameter` returns `(distance, p1, p2)` |
| C++ | [C++](C++/) | `rotating_calipers.cpp` | `rotatingCalipersDiameter` returns a `DiameterResult` |
| Go | [Go](Go/) | `main.go` | `rotatingCalipersDiameter` returns a `DiameterResult` |

## Practice Problems

- [Robert Hood (Kattis roberthood)](https://open.kattis.com/problems/roberthood)
- [Fossil in the Ice (SPOJ TFOSS)](https://www.spoj.com/problems/TFOSS/)
- [Fence Orthogonality (Kattis fenceortho)](https://open.kattis.com/problems/fenceortho)

## Related

- [Convex Hull](../Convex_Hull/README.md)
- [Line Intersection](../../Basic_Geometry/Line_Intersection/README.md)
- [Point Line Circle](../../Basic_Geometry/Point_Line_Circle/README.md)
- [Closest Pair of Points](../Closest_Pair_of_Points/README.md)
