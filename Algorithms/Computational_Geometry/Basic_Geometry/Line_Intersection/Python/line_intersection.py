"""
Line Intersection

Algorithms for finding intersections between lines and line segments.
"""

from typing import Optional


class Point:
    """Represents a 2D point."""

    def __init__(self, x: float, y: float):
        self.x = x
        self.y = y

    def __repr__(self):
        return f"Point({self.x}, {self.y})"


class Line:
    """A segment from p1 to p2 (also used as the infinite line through them)."""

    def __init__(self, p1: Point, p2: Point):
        self.p1 = p1
        self.p2 = p2


def cross_product(o: Point, a: Point, b: Point) -> float:
    """Calculate cross product of vectors OA and OB."""
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)


def line_intersection(l1: Line, l2: Line) -> Optional[Point]:
    """
    Find intersection point of two infinite lines (each through the two endpoints of a Line).
    Returns None if the lines are parallel, which includes coincident lines (no single
    intersection point) and a Line whose two endpoints are equal (no direction).
    """
    x1, y1 = l1.p1.x, l1.p1.y
    x2, y2 = l1.p2.x, l1.p2.y
    x3, y3 = l2.p1.x, l2.p1.y
    x4, y4 = l2.p2.x, l2.p2.y

    denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4)
    if denom == 0:
        return None  # Lines are parallel (exact test, so it does not depend on the scale)

    t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom
    x = x1 + t * (x2 - x1)
    y = y1 + t * (y2 - y1)

    return Point(x, y)


def _sign(v: float) -> int:
    return (v > 0) - (v < 0)


def _within_box(a: Point, b: Point, p: Point) -> bool:
    """True if p lies in the bounding box of a and b (used for collinear points)."""
    return min(a.x, b.x) <= p.x <= max(a.x, b.x) and min(a.y, b.y) <= p.y <= max(a.y, b.y)


def segments_intersect(l1: Line, l2: Line) -> bool:
    """
    Check if two line segments share at least one point. Exact orientation tests: crossing,
    touching at an endpoint, T-junctions, collinear overlap and zero-length segments (points)
    all count as intersecting.
    """
    p1, p2, p3, p4 = l1.p1, l1.p2, l2.p1, l2.p2
    o1 = cross_product(p1, p2, p3)
    o2 = cross_product(p1, p2, p4)
    o3 = cross_product(p3, p4, p1)
    o4 = cross_product(p3, p4, p2)

    # Proper crossing: each segment's endpoints are strictly on opposite sides of the other
    if _sign(o1) * _sign(o2) < 0 and _sign(o3) * _sign(o4) < 0:
        return True

    # An endpoint lying on the other segment (collinear with it and inside its box)
    if o1 == 0 and _within_box(p1, p2, p3):
        return True
    if o2 == 0 and _within_box(p1, p2, p4):
        return True
    if o3 == 0 and _within_box(p3, p4, p1):
        return True
    if o4 == 0 and _within_box(p3, p4, p2):
        return True
    return False


def segment_intersection(l1: Line, l2: Line) -> Optional[Point]:
    """
    Find a common point of two line segments, or None if they do not intersect.

    Segments that cross or touch in a single point give that point (an endpoint is returned
    exactly). Collinear segments that overlap share many points; the first of them in
    (x, y) order is returned. A zero-length segment gives its own point if it lies on the
    other segment.
    """
    if not segments_intersect(l1, l2):
        return None

    p1, p2, p3, p4 = l1.p1, l1.p2, l2.p1, l2.p2
    denom = (p1.x - p2.x) * (p3.y - p4.y) - (p1.y - p2.y) * (p3.x - p4.x)

    if denom == 0:
        # Collinear overlap, touching ends or a point segment: the overlap starts at the
        # larger of the two lower ends (points on one line are ordered by (x, y))
        lo1 = min((p1.x, p1.y), (p2.x, p2.y))
        lo2 = min((p3.x, p3.y), (p4.x, p4.y))
        x, y = max(lo1, lo2)
        return Point(x, y)

    # One endpoint lies on the other segment's line: it is the intersection point
    if cross_product(p1, p2, p3) == 0:
        return p3
    if cross_product(p1, p2, p4) == 0:
        return p4
    if cross_product(p3, p4, p1) == 0:
        return p1
    if cross_product(p3, p4, p2) == 0:
        return p2

    return line_intersection(l1, l2)


def point_on_segment(p: Point, line: Line) -> bool:
    """Check if point lies on line segment (exact test; a zero-length segment is one point)."""
    if cross_product(line.p1, line.p2, p) != 0:
        return False  # Not collinear

    return _within_box(line.p1, line.p2, p)


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
