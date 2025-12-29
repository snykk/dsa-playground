"""
Unit tests for Rotating Calipers.
"""

import unittest
from typing import List
from rotating_calipers import (
    Point, rotating_calipers_diameter,
    rotating_calipers_width, rotating_calipers_perimeter,
    rotating_calipers_area
)


def simple_hull_square() -> List[Point]:
    """Create a simple square hull for testing."""
    return [Point(0, 0), Point(4, 0), Point(4, 3), Point(0, 3)]


class TestRotatingCalipers(unittest.TestCase):
    def test_diameter(self):
        hull = simple_hull_square()
        diameter, _, _ = rotating_calipers_diameter(hull)
        self.assertGreater(diameter, 0)
        self.assertAlmostEqual(diameter, 5.0, places=1)  # Diagonal of rectangle

    def test_width(self):
        hull = simple_hull_square()
        width = rotating_calipers_width(hull)
        self.assertGreater(width, 0)
        self.assertLess(width, 4)  # Width should be less than length

    def test_perimeter(self):
        hull = simple_hull_square()
        perimeter = rotating_calipers_perimeter(hull)
        self.assertAlmostEqual(perimeter, 14.0, places=1)  # 4+3+4+3

    def test_area(self):
        hull = simple_hull_square()
        area = rotating_calipers_area(hull)
        self.assertAlmostEqual(area, 12.0, places=1)  # 4*3


if __name__ == "__main__":
    unittest.main()
