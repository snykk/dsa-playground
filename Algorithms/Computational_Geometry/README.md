# Computational Geometry

Algorithms on points, lines and polygons in the plane. Basic Geometry supplies the primitives, orientation tests and segment intersection. Advanced Geometry uses them to find a convex hull, the diameter and width of a polygon, and the closest pair of points.

## Topics

Read them in this order.

| # | Section | What it covers | Level |
|---|---------|----------------|-------|
| 1 | [Basic Geometry](Basic_Geometry/) | The primitives. Distance, cross product, orientation, angles, containment and segment intersection, with exact tests and no epsilon. | 2 topics |
| 2 | [Advanced Geometry](Advanced_Geometry/) | Algorithms on point sets. Convex hull, rotating calipers for diameter and width, and the closest pair. | 3 topics |

One rule runs through both: comparisons are exact. The code tests signs and equalities directly and uses no epsilon. With integer coordinates this is exact in Python, and in C++ and Go while the products stay below 2^53.

## How They Compare

| Sub-area | Topics | Question it answers | Typical cost |
|----------|--------|---------------------|--------------|
| Basic Geometry | Point, Line and Circle; Line Intersection | left or right, inside or outside, do two segments meet | O(1) |
| Advanced Geometry | Convex Hull; Rotating Calipers; Closest Pair of Points | outline, diameter and width, nearest two points | O(n log n), or O(n) on a given hull |

## Where to Start

1. Read Basic Geometry first. Point, Line and Circle introduces `cross_product` and `orientation`, and Line Intersection applies them.
2. In Advanced Geometry, start with Convex Hull. It uses the cross product on every step.
3. Take Rotating Calipers next, because its input is a convex hull.
4. Finish with Closest Pair of Points, which is independent of the other two and uses divide and conquer.

| If the problem says | Look at | Why |
|---------------------|---------|-----|
| which side of a line, or is this point inside | Basic Geometry | one cross product answers it |
| do these two segments cross or touch | Basic Geometry | exact orientation tests handle every degenerate case |
| the smallest polygon around the points | Advanced Geometry | the convex hull, by Graham's scan or Jarvis march |
| the farthest two points, or the narrowest strip | Advanced Geometry | convex hull, then rotating calipers |
| the two nearest points | Advanced Geometry | closest pair in O(n log n) |

## Related

- [Big O Notation](../../Complexity_Analysis/Time_Complexity/Big_O_Notation/): read first.
- [Divide and Conquer](../Divide_and_Conquer/): the method behind Closest Pair of Points.
- [Merge Sort](../Sorting/Merge_Sort/): divide and conquer on a simpler problem.
