"""
Rotating Calipers

Algorithm for solving various geometric problems using rotating calipers technique.
Requires convex hull as input.
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


def rotating_calipers_diameter(hull: List[Point]) -> Tuple[float, Point, Point]:
    """
    Find the diameter (maximum distance between any two points) of convex hull.
    Time Complexity: O(n) where n is number of hull points
    """
    if len(hull) < 2:
        return 0.0, hull[0] if hull else Point(0, 0), hull[0] if hull else Point(0, 0)

    n = len(hull)
    max_dist = 0.0
    p1, p2 = hull[0], hull[1]

    # Find antipodal pairs using rotating calipers
    j = 1
    for i in range(n):
        # Find farthest point from edge i to i+1
        while True:
            next_j = (j + 1) % n
            # Calculate distance from point j+1 to line through i and i+1
            dist_current = distance_squared(hull[i], hull[j])
            dist_next = distance_squared(hull[i], hull[next_j])
            
            # Check if next point is farther
            if dist_next > dist_current:
                j = next_j
            else:
                break

        # Check distance between i and j
        dist = distance_squared(hull[i], hull[j])
        if dist > max_dist:
            max_dist = dist
            p1, p2 = hull[i], hull[j]

    return math.sqrt(max_dist), p1, p2


def rotating_calipers_width(hull: List[Point]) -> float:
    """
    Find the width (minimum distance between parallel supporting lines) of convex hull.
    Time Complexity: O(n)
    """
    if len(hull) < 3:
        return 0.0

    n = len(hull)
    min_width = float('inf')

    j = 1
    for i in range(n):
        next_i = (i + 1) % n
        
        # Find farthest point from edge i to i+1
        while True:
            next_j = (j + 1) % n
            
            # Calculate area of triangle (i, i+1, j+1)
            area_next = abs(cross_product(hull[i], hull[next_i], hull[next_j]))
            area_current = abs(cross_product(hull[i], hull[next_i], hull[j]))
            
            # If next point is farther from edge, move j
            if area_next > area_current:
                j = next_j
            else:
                break

        # Calculate distance from point j to line through i and i+1
        dx = hull[next_i].x - hull[i].x
        dy = hull[next_i].y - hull[i].y
        line_length = math.sqrt(dx * dx + dy * dy)
        
        if line_length > 1e-9:
            area = abs(cross_product(hull[i], hull[next_i], hull[j]))
            width = area / line_length
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
