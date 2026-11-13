"""
Convex Hull

Implementation of Graham's Scan and Jarvis March algorithms for computing convex hull.
"""

from functools import cmp_to_key
from typing import List


class Point:
    def __init__(self, x: float, y: float):
        self.x = x
        self.y = y

    def __repr__(self):
        return f"({self.x}, {self.y})"

    def __eq__(self, other):
        return abs(self.x - other.x) < 1e-9 and abs(self.y - other.y) < 1e-9


def cross_product(o: Point, a: Point, b: Point) -> float:
    """Calculate cross product of vectors OA and OB."""
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)


def distance_squared(p1: Point, p2: Point) -> float:
    """Calculate squared distance between two points."""
    return (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2


def unique_points(points: List[Point]) -> List[Point]:
    """Distinct points (exact comparison), in order of first appearance."""
    seen = set()
    result = []
    for p in points:
        key = (p.x, p.y)
        if key not in seen:
            seen.add(key)
            result.append(p)
    return result


def graham_scan(points: List[Point]) -> List[Point]:
    """
    Graham's Scan algorithm for convex hull.
    Time Complexity: O(n log n)

    Returns the hull vertices in counterclockwise order, starting at the bottom-most
    point (leftmost on a tie). Points that lie on a hull edge are not included.
    Duplicates are removed; fewer than three distinct points are returned as they are
    (a new list). The comparisons are exact, so integer input never goes wrong.
    """
    pts = unique_points(points)
    if len(pts) < 3:
        return sorted(pts, key=lambda p: (p.y, p.x))

    # Find bottom-most point (or leftmost in case of tie)
    bottom = min(pts, key=lambda p: (p.y, p.x))
    others = [p for p in pts if p is not bottom]

    # Sort by polar angle around bottom: a comes first if b is counterclockwise of it.
    # All points lie in the upper half-plane of bottom, so this is a strict weak ordering.
    # Points on the same ray are ordered nearest first.
    def compare(a: Point, b: Point) -> int:
        cross = cross_product(bottom, a, b)
        if cross > 0:
            return -1
        if cross < 0:
            return 1
        da = distance_squared(bottom, a)
        db = distance_squared(bottom, b)
        return -1 if da < db else (1 if da > db else 0)

    sorted_points = [bottom] + sorted(others, key=cmp_to_key(compare))

    # Build convex hull using stack; drop right turns and collinear points
    hull: List[Point] = []
    for p in sorted_points:
        while len(hull) > 1 and cross_product(hull[-2], hull[-1], p) <= 0:
            hull.pop()
        hull.append(p)

    return hull


def jarvis_march(points: List[Point]) -> List[Point]:
    """
    Jarvis March (Gift Wrapping) algorithm for convex hull.
    Time Complexity: O(nh) where h is number of hull points

    Returns the hull vertices in counterclockwise order, starting at the leftmost
    point (lowest on a tie). Points that lie on a hull edge are not included.
    Duplicates are removed; fewer than three distinct points are returned as they are
    (a new list). The comparisons are exact, so integer input never goes wrong.
    """
    pts = unique_points(points)
    if len(pts) < 3:
        return sorted(pts, key=lambda p: (p.x, p.y))

    # Find leftmost point
    leftmost = min(pts, key=lambda p: (p.x, p.y))
    hull = [leftmost]

    # A hull never has more vertices than points; the bound only guards rounding trouble
    # with non-integer coordinates.
    while len(hull) <= len(pts):
        current = hull[-1]
        next_point = None

        # Find the point such that every other point is on its left (or on the line)
        for point in pts:
            if point is current:
                continue
            if next_point is None:
                next_point = point
                continue

            cross = cross_product(current, next_point, point)

            # If point is more clockwise, or on the same ray but farther
            if cross < 0 or (cross == 0 and
                             distance_squared(current, point) > distance_squared(current, next_point)):
                next_point = point

        # If we've completed the hull
        if next_point is leftmost:
            break

        hull.append(next_point)

    return hull


def main():
    """Example usage."""
    print("Convex Hull Examples:")
    print()

    # Test points
    points = [
        Point(0, 3), Point(2, 2), Point(1, 1),
        Point(2, 1), Point(3, 0), Point(0, 0),
        Point(3, 3)
    ]

    print("Points:", points)
    print()

    # Graham's Scan
    graham_hull = graham_scan(points)
    print("Graham's Scan hull:", graham_hull)
    print()

    # Jarvis March
    jarvis_hull = jarvis_march(points)
    print("Jarvis March hull:", jarvis_hull)


if __name__ == "__main__":
    main()
