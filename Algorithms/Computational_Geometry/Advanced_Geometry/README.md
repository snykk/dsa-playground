# Advanced Geometry

Three algorithms on point sets, built on the cross product. Convex Hull wraps a polygon around the points, Rotating Calipers measures that polygon in linear time, and Closest Pair finds the two nearest points by divide and conquer.

## Topics

Read them in this order.

| # | Topic | What it adds | Level |
|---|-------|--------------|-------|
| 1 | [Convex Hull](Convex_Hull/) | The smallest convex polygon around the points, by Graham's scan and Jarvis march. Collinear boundary points are left out. | Intermediate |
| 2 | [Rotating Calipers](Rotating_Calipers/) | Sweep two parallel lines once around a convex polygon for its diameter and width, in linear time. | Advanced |
| 3 | [Closest Pair of Points](Closest_Pair_of_Points/) | Split at a vertical line, solve both halves, then check a narrow strip. Duplicate points are legal input. | Advanced |

Convex Hull and Rotating Calipers belong together, because the hull is the input that calipers needs. Closest Pair is independent. All three compare cross products and distances exactly, with no tolerance.

## How They Compare

| Algorithm | Input | Output | Time | Extra space |
|-----------|-------|--------|------|-------------|
| Graham's scan | any points | hull vertices, counterclockwise | O(n log n) | O(n) |
| Jarvis march | any points | the same hull | O(n h), O(n^2) if every point is on the hull | O(n) |
| Rotating calipers | a convex polygon in order | diameter and width | O(n) | O(n) |
| Closest pair | any points | smallest distance and the pair | O(n log n) | O(n) |
| Brute-force closest pair | any points | the same | O(n^2) | O(1) |

`n` is the number of points and `h` the number of hull vertices. Calipers takes O(n) time on a polygon that is already a hull; computing the hull costs O(n log n). It works on a cleaned copy of the vertices, so its extra space is O(n), not O(1). Jarvis march is O(n) extra space too, not O(h).

## Choosing One

| Situation | Use | Why |
|-----------|-----|-----|
| The outer boundary of many points | Graham's scan | O(n log n) on every input |
| Few hull vertices expected | Jarvis march | O(n h) is close to linear when h is small |
| The farthest pair of a point set | Convex Hull, then Rotating Calipers | the farthest pair is a pair of hull vertices, found in O(n) after the hull |
| The narrowest strip around a point set | Convex Hull, then Rotating Calipers | width is also found by the sweep |
| The two nearest points | Closest Pair of Points | O(n log n) instead of all pairs |
| A few points only | brute force | the setup of the faster methods is not worth it |

## Common Pitfalls

- Pop on `cross <= 0`. Popping on `< 0` keeps collinear points on the hull boundary.
- Calipers needs the vertices of a convex polygon in order, not a point set. Compute the hull first.
- Drive the calipers pointer by triangle area, not by distance, which can stop at a local maximum.
- In Closest Pair, split the y-sorted list by membership, not by x value, or repeated x values go to the wrong half.
- Equal points make a zero-length hull edge, and two copies of a point are a closest pair at distance 0.

## Related

- [Point, Line and Circle](../Basic_Geometry/Point_Line_Circle/): read first.
- [Divide and Conquer](../../Divide_and_Conquer/): read first, for Closest Pair.
- [Computational Geometry](../): the parent overview of both sub-areas.
- [Basic Geometry](../Basic_Geometry/): the primitives these algorithms call.
- [Line Intersection](../Basic_Geometry/Line_Intersection/): the other use of exact orientation tests.
- [Merge Sort](../../Sorting/Merge_Sort/): divide and conquer on a simpler problem.
