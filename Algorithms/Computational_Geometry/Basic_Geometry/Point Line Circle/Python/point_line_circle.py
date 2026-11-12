"""
Point, Line, and Circle Operations

Basic geometric operations for computational geometry problems.
"""

import math


class Point:
    """Represents a 2D point with x and y coordinates."""

    def __init__(self, x: float, y: float):
        self.x = x
        self.y = y

    def __repr__(self):
        return f"Point({self.x}, {self.y})"

    def __eq__(self, other):
        """Exact coordinate equality (no tolerance), consistent with __hash__."""
        if not isinstance(other, Point):
            return False
        return self.x == other.x and self.y == other.y

    def __hash__(self):
        return hash((self.x, self.y))

    def distance_to(self, other: 'Point') -> float:
        """Calculate Euclidean distance to another point."""
        return math.sqrt((self.x - other.x) ** 2 + (self.y - other.y) ** 2)

    def distance_squared(self, other: 'Point') -> float:
        """Calculate squared distance (faster, avoids sqrt)."""
        return (self.x - other.x) ** 2 + (self.y - other.y) ** 2


class Line:
    """Represents a line segment or infinite line."""

    def __init__(self, p1: Point, p2: Point):
        self.p1 = p1
        self.p2 = p2

    def length(self) -> float:
        """Calculate length of line segment."""
        return self.p1.distance_to(self.p2)

    def length_squared(self) -> float:
        """Calculate squared length (faster)."""
        return self.p1.distance_squared(self.p2)

    def slope(self) -> float:
        """
        Calculate slope of line. Returns inf for vertical lines and nan for a zero-length
        line (it has no direction). The test is exact, so it does not depend on the scale.
        """
        if self.p1 == self.p2:
            return float('nan')
        if self.p2.x == self.p1.x:
            return float('inf')
        return (self.p2.y - self.p1.y) / (self.p2.x - self.p1.x)

    def is_vertical(self) -> bool:
        """Check if line is vertical (exactly equal x, and not a zero-length line)."""
        return self.p2.x == self.p1.x and self.p2.y != self.p1.y

    def is_horizontal(self) -> bool:
        """Check if line is horizontal (exactly equal y, and not a zero-length line)."""
        return self.p2.y == self.p1.y and self.p2.x != self.p1.x


class Circle:
    """Represents a circle with center and radius."""

    def __init__(self, center: Point, radius: float):
        if not radius >= 0:
            raise ValueError("radius must be non-negative")
        self.center = center
        self.radius = radius

    def area(self) -> float:
        """Calculate area of circle."""
        return math.pi * self.radius * self.radius

    def circumference(self) -> float:
        """Calculate circumference of circle."""
        return 2 * math.pi * self.radius

    def contains_point(self, point: Point) -> bool:
        """Check if point is inside or on the circle (exact comparison of squared distances)."""
        return self.center.distance_squared(point) <= self.radius * self.radius

    def point_on_circle(self, point: Point) -> bool:
        """Check if point is exactly on the circle boundary (exact comparison)."""
        return self.center.distance_squared(point) == self.radius * self.radius


# Geometric utility functions

def cross_product(o: Point, a: Point, b: Point) -> float:
    """
    Calculate cross product of vectors OA and OB.
    Returns positive if O->A->B is counterclockwise, negative if clockwise, 0 if collinear.
    """
    return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x)


def dot_product(o: Point, a: Point, b: Point) -> float:
    """Calculate dot product of vectors OA and OB."""
    return (a.x - o.x) * (b.x - o.x) + (a.y - o.y) * (b.y - o.y)


def orientation(p: Point, q: Point, r: Point) -> int:
    """
    Determine orientation of ordered triplet (p, q, r).
    Returns:
        0: Collinear
        1: Clockwise
        2: Counterclockwise
    The test is exact (the sign of the cross product), so it does not depend on the scale.
    """
    val = cross_product(p, q, r)
    if val == 0:
        return 0
    return 2 if val > 0 else 1


def angle_between_points(o: Point, a: Point, b: Point) -> float:
    """
    Calculate angle AOB in radians, in [0, pi]. Uses atan2(|cross|, dot), which stays
    accurate for angles near 0 and pi. Returns 0.0 if A or B coincides with O.
    """
    oa_x, oa_y = a.x - o.x, a.y - o.y
    ob_x, ob_y = b.x - o.x, b.y - o.y
    if (oa_x == 0 and oa_y == 0) or (ob_x == 0 and ob_y == 0):
        return 0.0
    cross = oa_x * ob_y - oa_y * ob_x
    dot = oa_x * ob_x + oa_y * ob_y
    return math.atan2(abs(cross), dot)


def point_in_triangle(p: Point, a: Point, b: Point, c: Point) -> bool:
    """
    Check if point p is inside triangle ABC or on its boundary (either orientation).
    A degenerate triangle (collinear or repeated vertices) contains no point.
    """
    if cross_product(a, b, c) == 0:
        return False

    d1 = cross_product(p, a, b)
    d2 = cross_product(p, b, c)
    d3 = cross_product(p, c, a)

    has_neg = (d1 < 0) or (d2 < 0) or (d3 < 0)
    has_pos = (d1 > 0) or (d2 > 0) or (d3 > 0)

    return not (has_neg and has_pos)


def main():
    """Example usage."""
    print("Point, Line, and Circle Operations Examples:")
    print()

    # Point operations
    p1 = Point(0, 0)
    p2 = Point(3, 4)
    print(f"Distance between {p1} and {p2}: {p1.distance_to(p2):.2f}")
    print()

    # Line operations
    line = Line(Point(0, 0), Point(3, 4))
    print(f"Line length: {line.length():.2f}")
    print(f"Line slope: {line.slope():.2f}")
    print()

    # Circle operations
    circle = Circle(Point(0, 0), 5.0)
    print(f"Circle area: {circle.area():.2f}")
    print(f"Circle circumference: {circle.circumference():.2f}")
    print(f"Point (3, 4) in circle: {circle.contains_point(Point(3, 4))}")
    print(f"Point (5, 0) on circle: {circle.point_on_circle(Point(5, 0))}")
    print()

    # Orientation
    p = Point(0, 0)
    q = Point(4, 4)
    r = Point(1, 2)
    orient = orientation(p, q, r)
    print(f"Orientation of ({p}, {q}, {r}): {orient} (0=collinear, 1=clockwise, 2=counterclockwise)")


if __name__ == "__main__":
    main()
