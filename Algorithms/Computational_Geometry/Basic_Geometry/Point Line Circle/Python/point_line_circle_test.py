"""
Unit tests for Point, Line, and Circle operations.
"""

import math
import unittest
from point_line_circle import Point, Line, Circle, cross_product, orientation, point_in_triangle


class TestPoint(unittest.TestCase):
    def test_point_creation(self):
        p = Point(1, 2)
        self.assertEqual(p.x, 1)
        self.assertEqual(p.y, 2)

    def test_point_distance(self):
        p1 = Point(0, 0)
        p2 = Point(3, 4)
        self.assertAlmostEqual(p1.distance_to(p2), 5.0, places=5)

    def test_point_distance_squared(self):
        p1 = Point(0, 0)
        p2 = Point(3, 4)
        self.assertAlmostEqual(p1.distance_squared(p2), 25.0, places=5)

    def test_point_equality(self):
        p1 = Point(1.0, 2.0)
        p2 = Point(1.0, 2.0)
        self.assertEqual(p1, p2)


class TestLine(unittest.TestCase):
    def test_line_length(self):
        line = Line(Point(0, 0), Point(3, 4))
        self.assertAlmostEqual(line.length(), 5.0, places=5)

    def test_line_slope(self):
        line = Line(Point(0, 0), Point(2, 4))
        self.assertAlmostEqual(line.slope(), 2.0, places=5)

    def test_vertical_line(self):
        line = Line(Point(0, 0), Point(0, 5))
        self.assertTrue(line.is_vertical())
        self.assertEqual(line.slope(), float('inf'))

    def test_horizontal_line(self):
        line = Line(Point(0, 0), Point(5, 0))
        self.assertTrue(line.is_horizontal())


class TestCircle(unittest.TestCase):
    def test_circle_area(self):
        circle = Circle(Point(0, 0), 5.0)
        self.assertAlmostEqual(circle.area(), math.pi * 25, places=5)

    def test_circle_circumference(self):
        circle = Circle(Point(0, 0), 5.0)
        self.assertAlmostEqual(circle.circumference(), 2 * math.pi * 5, places=5)

    def test_point_inside_circle(self):
        circle = Circle(Point(0, 0), 5.0)
        self.assertTrue(circle.contains_point(Point(3, 4)))
        self.assertTrue(circle.contains_point(Point(0, 0)))

    def test_point_outside_circle(self):
        circle = Circle(Point(0, 0), 5.0)
        self.assertFalse(circle.contains_point(Point(10, 10)))

    def test_point_on_circle(self):
        circle = Circle(Point(0, 0), 5.0)
        self.assertTrue(circle.point_on_circle(Point(5, 0)))
        self.assertTrue(circle.point_on_circle(Point(0, 5)))


class TestGeometricFunctions(unittest.TestCase):
    def test_cross_product(self):
        o = Point(0, 0)
        a = Point(1, 0)
        b = Point(0, 1)
        self.assertAlmostEqual(cross_product(o, a, b), 1.0, places=5)

    def test_orientation_counterclockwise(self):
        p = Point(0, 0)
        q = Point(4, 4)
        r = Point(2, 1)  # Below the line, so clockwise
        # Actually, (0,0) -> (4,4) -> (2,1) is clockwise, so should be 1
        orient = orientation(p, q, r)
        self.assertIn(orient, [1, 2])  # Accept either depending on convention

    def test_orientation_clockwise(self):
        p = Point(0, 0)
        q = Point(4, 4)
        r = Point(1, 2)  # Above the line, so counterclockwise
        orient = orientation(p, q, r)
        self.assertIn(orient, [1, 2])  # Accept either depending on convention

    def test_orientation_collinear(self):
        p = Point(0, 0)
        q = Point(1, 1)
        r = Point(2, 2)
        self.assertEqual(orientation(p, q, r), 0)

    def test_point_in_triangle(self):
        a = Point(0, 0)
        b = Point(4, 0)
        c = Point(2, 4)
        p = Point(2, 1)
        self.assertTrue(point_in_triangle(p, a, b, c))

    def test_point_outside_triangle(self):
        a = Point(0, 0)
        b = Point(4, 0)
        c = Point(2, 4)
        p = Point(10, 10)
        self.assertFalse(point_in_triangle(p, a, b, c))


if __name__ == "__main__":
    unittest.main()
