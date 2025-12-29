"""
Line Intersection

Algorithms for finding intersections between lines and line segments.
"""

import math
from typing import Optional, Tuple


class Point:
    """Represents a 2D point."""

    def __init__(self, x: float, y: float):
        self.x = x
        self.y = y

    def __repr__(self):
        return f"Point({self.x}, {self.y})"


class Line:
    """Represents a line segment."""

    def __init__(self, p1: Point, p2: Point):
        self.p1 = p1
        self.p2 = p2


def cross_product(o: Point, a: Point, b: Point) -> float:
    """Calculate cross product of vectors OA and OB."""
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)


def line_intersection(l1: Line, l2: Line) -> Optional[Point]:
    """
    Find intersection point of two infinite lines.
    Returns None if lines are parallel.
    """
    x1, y1 = l1.p1.x, l1.p1.y
    x2, y2 = l1.p2.x, l1.p2.y
    x3, y3 = l2.p1.x, l2.p1.y
    x4, y4 = l2.p2.x, l2.p2.y

    denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
    if abs(denom) < 1e-9:
        return None  # Lines are parallel

    t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom
    x = x1 + t * (x2 - x1)
    y = y1 + t * (y2 - y1)

    return Point(x, y)


def segment_intersection(l1: Line, l2: Line) -> Optional[Point]:
    """
    Find intersection point of two line segments.
    Returns None if segments don't intersect.
    """
    x1, y1 = l1.p1.x, l1.p1.y
    x2, y2 = l1.p2.x, l1.p2.y
    x3, y3 = l2.p1.x, l2.p1.y
    x4, y4 = l2.p2.x, l2.p2.y

    denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
    if abs(denom) < 1e-9:
        return None  # Segments are parallel

    t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom
    u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom

    # Check if intersection is within both segments
    if 0 <= t <= 1 and 0 <= u <= 1:
        x = x1 + t * (x2 - x1)
        y = y1 + t * (y2 - y1)
        return Point(x, y)

    return None


def segments_intersect(l1: Line, l2: Line) -> bool:
    """Check if two line segments intersect."""
    return segment_intersection(l1, l2) is not None


def point_on_segment(p: Point, line: Line) -> bool:
    """Check if point lies on line segment."""
    if abs(cross_product(line.p1, line.p2, p)) > 1e-9:
        return False  # Not collinear

    # Check if point is within segment bounds
    min_x = min(line.p1.x, line.p2.x)
    max_x = max(line.p1.x, line.p2.x)
    min_y = min(line.p1.y, line.p2.y)
    max_y = max(line.p1.y, line.p2.y)

    return min_x - 1e-9 <= p.x <= max_x + 1e-9 and min_y - 1e-9 <= p.y <= max_y + 1e-9


def main():
    """Example usage."""
    print("Line Intersection Examples:")
    print()

    # Line intersection
    l1 = Line(Point(0, 0), Point(4, 4))
    l2 = Line(Point(0, 4), Point(4, 0))
    intersection = line_intersection(l1, l2)
    if intersection:
        print(f"Line intersection: ({intersection.x:.2f}, {intersection.y:.2f})")
    print()

    # Segment intersection
    seg1 = Line(Point(0, 0), Point(4, 4))
    seg2 = Line(Point(0, 4), Point(4, 0))
    seg_intersection = segment_intersection(seg1, seg2)
    if seg_intersection:
        print(f"Segment intersection: ({seg_intersection.x:.2f}, {seg_intersection.y:.2f})")
    print(f"Segments intersect: {segments_intersect(seg1, seg2)}")
    print()

    # Parallel lines
    l3 = Line(Point(0, 0), Point(1, 1))
    l4 = Line(Point(0, 1), Point(1, 2))
    intersection2 = line_intersection(l3, l4)
    if intersection2:
        print(f"Parallel lines intersection: {intersection2}")
    else:
        print("Lines are parallel (no intersection)")


if __name__ == "__main__":
    main()
