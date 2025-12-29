"""
Convex Hull

Implementation of Graham's Scan and Jarvis March algorithms for computing convex hull.
"""

import math
from typing import List, Tuple


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


def graham_scan(points: List[Point]) -> List[Point]:
    """
    Graham's Scan algorithm for convex hull.
    Time Complexity: O(n log n)
    """
    if len(points) < 3:
        return points

    # Find bottom-most point (or leftmost in case of tie)
    bottom = min(points, key=lambda p: (p.y, p.x))

    # Sort points by polar angle with respect to bottom point
    def polar_angle(p: Point) -> Tuple[float, float]:
        dx = p.x - bottom.x
        dy = p.y - bottom.y
        angle = math.atan2(dy, dx)
        dist = distance_squared(bottom, p)
        return (angle, dist)

    sorted_points = sorted(points, key=polar_angle)

    # Remove duplicates
    unique_points = [sorted_points[0]]
    for i in range(1, len(sorted_points)):
        if sorted_points[i] != unique_points[-1]:
            unique_points.append(sorted_points[i])

    if len(unique_points) < 3:
        return unique_points

    # Build convex hull using stack
    hull = [unique_points[0], unique_points[1]]

    for i in range(2, len(unique_points)):
        while len(hull) > 1 and cross_product(hull[-2], hull[-1], unique_points[i]) <= 0:
            hull.pop()
        hull.append(unique_points[i])

    return hull


def jarvis_march(points: List[Point]) -> List[Point]:
    """
    Jarvis March (Gift Wrapping) algorithm for convex hull.
    Time Complexity: O(nh) where h is number of hull points
    """
    if len(points) < 3:
        return points

    # Find leftmost point
    leftmost = min(points, key=lambda p: (p.x, p.y))
    hull = [leftmost]

    while True:
        current = hull[-1]
        next_point = points[0]

        # Find point with smallest polar angle from current
        for point in points:
            if point == current:
                continue

            cross = cross_product(current, next_point, point)
            dist_next = distance_squared(current, next_point)
            dist_point = distance_squared(current, point)

            # If point is more counterclockwise, or same angle but farther
            if cross < 0 or (abs(cross) < 1e-9 and dist_point > dist_next):
                next_point = point

        # If we've completed the hull
        if next_point == leftmost:
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
