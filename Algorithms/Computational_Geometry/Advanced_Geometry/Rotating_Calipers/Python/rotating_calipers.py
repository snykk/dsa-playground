"""
Rotating Calipers

Algorithm for solving various geometric problems using rotating calipers technique.
The input is the vertex list of a convex polygon in order (clockwise or counterclockwise),
for example the output of a convex hull routine. Repeated vertices and vertices lying on an
edge are allowed; they are removed first. All comparisons are exact, so integer input is
handled without tolerances.
"""

import math
from typing import List, Tuple


class Point:
    def __init__(self, x: float, y: float):
        self.x = x
        self.y = y

    def __repr__(self):
        return f"({self.x}, {self.y})"


def cross_product(o: Point, a: Point, b: Point) -> float:
    """Calculate cross product of vectors OA and OB."""
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)


def distance_squared(p1: Point, p2: Point) -> float:
    """Calculate squared distance between two points."""
    return (p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2


def clean_polygon(hull: List[Point]) -> List[Point]:
    """
    Strictly convex vertex list of a convex polygon given in order: consecutive repeated
    vertices and vertices lying on an edge are removed. If every point is collinear the
    result is the two end points (or one point). Comparisons are exact.
    """
    pts: List[Point] = []
    for p in hull:
        if not pts or (p.x, p.y) != (pts[-1].x, pts[-1].y):
            pts.append(p)
    while len(pts) > 1 and (pts[0].x, pts[0].y) == (pts[-1].x, pts[-1].y):
        pts.pop()
    if len(pts) < 3:
        return pts

    # All points on one line: keep the two end points
    if all(cross_product(pts[0], pts[1], p) == 0 for p in pts):
        return [min(pts, key=lambda p: (p.x, p.y)), max(pts, key=lambda p: (p.x, p.y))]

    # Drop vertices that lie on an edge (zero turn), including across the wrap-around
    out: List[Point] = []
    for p in pts:
        while len(out) >= 2 and cross_product(out[-2], out[-1], p) == 0:
            out.pop()
        out.append(p)
    while len(out) >= 3 and cross_product(out[-2], out[-1], out[0]) == 0:
        out.pop()
    while len(out) >= 3 and cross_product(out[-1], out[0], out[1]) == 0:
        out.pop(0)
    return out


def rotating_calipers_diameter(hull: List[Point]) -> Tuple[float, Point, Point]:
    """
    Find the diameter (maximum distance between any two points) of a convex polygon.
    Time Complexity: O(n) where n is number of hull points

    Two parallel supporting lines rotate around the polygon. For the edge (i, i+1) the
    pointer j moves to the vertex farthest from that edge, measured by triangle area,
    and the farthest pair is always one of the antipodal pairs this produces.
    """
    pts = clean_polygon(hull)
    if not pts:
        return 0.0, Point(0, 0), Point(0, 0)
    if len(pts) == 1:
        return 0.0, pts[0], pts[0]
    if len(pts) == 2:
        return math.sqrt(distance_squared(pts[0], pts[1])), pts[0], pts[1]

    n = len(pts)
    max_dist = -1.0
    p1, p2 = pts[0], pts[1]

    j = 1
    for i in range(n):
        next_i = (i + 1) % n

        # Advance j to the vertex farthest from the edge (i, i+1)
        while True:
            next_j = (j + 1) % n
            if abs(cross_product(pts[i], pts[next_i], pts[next_j])) > abs(cross_product(pts[i], pts[next_i], pts[j])):
                j = next_j
            else:
                break

        # An edge parallel to (i, i+1) has two antipodal endpoints: j and j + 1
        candidates = [j]
        next_j = (j + 1) % n
        if abs(cross_product(pts[i], pts[next_i], pts[next_j])) == abs(cross_product(pts[i], pts[next_i], pts[j])):
            candidates.append(next_j)

        for k in candidates:
            for m in (i, next_i):
                dist = distance_squared(pts[m], pts[k])
                if dist > max_dist:
                    max_dist = dist
                    p1, p2 = pts[m], pts[k]

    return math.sqrt(max_dist), p1, p2


def rotating_calipers_width(hull: List[Point]) -> float:
    """
    Find the width (minimum distance between parallel supporting lines) of a convex polygon.
    Time Complexity: O(n)

    Returns 0.0 for fewer than three distinct corners (a point, a segment or collinear points).
    """
    pts = clean_polygon(hull)
    if len(pts) < 3:
        return 0.0

    n = len(pts)
    min_width = float('inf')

    j = 1
    for i in range(n):
        next_i = (i + 1) % n

        # Advance j to the vertex farthest from the edge (i, i+1)
        while True:
            next_j = (j + 1) % n
            if abs(cross_product(pts[i], pts[next_i], pts[next_j])) > abs(cross_product(pts[i], pts[next_i], pts[j])):
                j = next_j
            else:
                break

        # Distance from vertex j to the line through i and i+1
        line_length = math.sqrt(distance_squared(pts[i], pts[next_i]))
        width = abs(cross_product(pts[i], pts[next_i], pts[j])) / line_length
        min_width = min(min_width, width)

    return min_width


def rotating_calipers_perimeter(hull: List[Point]) -> float:
    """
    Calculate perimeter of convex hull.
    Time Complexity: O(n)
    """
    if len(hull) < 2:
        return 0.0

    perimeter = 0.0
    n = len(hull)
    
    for i in range(n):
        next_i = (i + 1) % n
        dx = hull[next_i].x - hull[i].x
        dy = hull[next_i].y - hull[i].y
        perimeter += math.sqrt(dx * dx + dy * dy)
    
    return perimeter


def rotating_calipers_area(hull: List[Point]) -> float:
    """
    Calculate area of convex hull using shoelace formula.
    Time Complexity: O(n)
    """
    if len(hull) < 3:
        return 0.0

    area = 0.0
    n = len(hull)
    
    for i in range(n):
        j = (i + 1) % n
        area += hull[i].x * hull[j].y
        area -= hull[j].x * hull[i].y
    
    return abs(area) / 2.0


def main():
    """Example usage."""
    print("Rotating Calipers Examples:")
    print()

    # Create convex hull (assumed to be already computed)
    hull = [
        Point(0, 0), Point(4, 0), Point(4, 3), Point(0, 3)
    ]
    print("Convex hull:", hull)
    print()

    # Find diameter
    diameter, p1, p2 = rotating_calipers_diameter(hull)
    print(f"Diameter: {diameter:.2f}")
    print(f"Between points: {p1} and {p2}")
    print()

    # Find width
    width = rotating_calipers_width(hull)
    print(f"Width: {width:.2f}")
    print()

    # Calculate perimeter
    perimeter = rotating_calipers_perimeter(hull)
    print(f"Perimeter: {perimeter:.2f}")
    print()

    # Calculate area
    area = rotating_calipers_area(hull)
    print(f"Area: {area:.2f}")


if __name__ == "__main__":
    main()
